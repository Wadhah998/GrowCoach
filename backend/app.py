from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bleach import clean
import os
from models import Candidate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import (
    get_jwt_identity, jwt_required, JWTManager, create_access_token,
    set_access_cookies, unset_jwt_cookies, get_jwt, verify_jwt_in_request
)
from functools import wraps
from datetime import datetime, timedelta
from pymongo.errors import PyMongoError
from bson import ObjectId
from pathlib import Path
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, 
     supports_credentials=True)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', './uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', str(16 * 1024 * 1024))) 
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'pdf'}
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/'
app.config['JWT_CSRF_CHECK_FORM'] = True

# Rate limiting with Redis storage
app.config['RATELIMIT_STORAGE_URL'] = os.getenv('REDIS_URL', 'memory://')
app.config['RATELIMIT_STRATEGY'] = 'fixed-window'
app.config['UPLOAD_FOLDER'] = str(Path(__file__).parent / 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize JWT Manager
jwt = JWTManager(app)

# Database setup
mongo = PyMongo(app)
candidate_model = Candidate(mongo)

# JWT Token Blacklist Check
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = mongo.db.token_blacklist.find_one({"jti": jti})
    return token is not None

# Helper functions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def sanitize_input(data):
    """Sanitize all string inputs to prevent XSS"""
    if isinstance(data, dict):
        return {k: clean(v) if isinstance(v, str) else v for k, v in data.items()}
    elif isinstance(data, str):
        return clean(data)
    return data

# Error handlers
@app.errorhandler(401)
def unauthorized(error):
    return jsonify({
        "success": False,
        "error": "Unauthorized",
        "message": "Authentication required"
    }), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({
        "success": False, 
        "error": "Forbidden",
        "message": "You don't have permission"
    }), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Not Found",
        "message": "Resource not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal Server Error",
        "message": "An unexpected error occurred"
    }), 500

# Routes
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Flask backend!"})

@app.route('/routes')
def list_routes():
    return jsonify({
        'routes': [str(rule) for rule in app.url_map.iter_rules()]
    })

@app.route('/candidate/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/candidate/signup', methods=['POST'])
def candidate_signup():
    try:
        # Check if files are present
        if 'avatar' not in request.files or 'resume' not in request.files:
            return jsonify({"error": "Avatar and resume files are required"}), 400
        avatar = request.files['avatar']
        resume = request.files['resume']

        # Validate files
        if avatar.filename == '' or resume.filename == '':
            return jsonify({"error": "No selected file"}), 400
        if not (allowed_file(avatar.filename) and allowed_file(resume.filename)):
            return jsonify({"error": "Invalid file type"}), 400

        # Process file uploads
        avatar_filename = secure_filename(f"avatar_{datetime.now().strftime('%Y%m%d%H%M%S')}_{avatar.filename}")
        resume_filename = secure_filename(f"resume_{datetime.now().strftime('%Y%m%d%H%M%S')}_{resume.filename}")
        avatar.save(os.path.join(app.config['UPLOAD_FOLDER'], avatar_filename))
        resume.save(os.path.join(app.config['UPLOAD_FOLDER'], resume_filename))

        # Get form data
        data = request.form

        # Create candidate document with status field
        candidate = {
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': data['email'],
            'password': generate_password_hash(data['password']),
            'phone': data.get('phone', ''),
            'location': data.get('location', ''),
            'bio': data.get('bio', ''),
            'skills': data.get('skills', '').split(','),
            'terms_accepted': True,
            'avatar': avatar_filename,
            'resume': resume_filename,
            'status': 'pending',
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        

        # Handle GrowCoach formation fields
        has_growcoach_formation = data.get('has_growcoach_formation', 'false').lower() == 'true'
        growcoach_formations = request.form.getlist('growcoach_formation') if has_growcoach_formation else []

        candidate['has_growcoach_formation'] = has_growcoach_formation
        if has_growcoach_formation and growcoach_formations:
            candidate['growcoach_formation'] = growcoach_formations

        # Process education
        education = []
        education_count = int(data.get('education_count', 0))
        for i in range(education_count):
            edu = {
                'school': data[f'education[{i}][school]'],
                'degree': data[f'education[{i}][degree]'],
                'start_date': data[f'education[{i}][start_date]'],
                'end_date': data.get(f'education[{i}][end_date]'),
                'description': data.get(f'education[{i}][description]', '')
            }
            education.append(edu)
        candidate['education'] = education

        # Process experience
        experience = []
        experience_count = int(data.get('experience_count', 0))
        for i in range(experience_count):
            exp = {
                'title': data[f'experience[{i}][title]'],
                'company': data[f'experience[{i}][company]'],
                'start_date': data[f'experience[{i}][start_date]'],
                'end_date': data.get(f'experience[{i}][end_date]'),
                'description': data.get(f'experience[{i}][description]', '')
            }
            experience.append(exp)
        candidate['experience'] = experience

        # Insert into database
        result = mongo.db.candidates.insert_one(candidate)

        notification = {
            "text": f"New candidate registration: {candidate['first_name']} {candidate['last_name']}",
            "time": datetime.utcnow().isoformat(),
            "unread": True,
            "type": "new_candidate",
            "candidate_id": str(result.inserted_id),
            "candidate_name": f"{candidate['first_name']} {candidate['last_name']}"
        }
        mongo.db.admin_notifications.insert_one(notification)

        return jsonify({
            "success": True,
            "message": "Candidate created successfully. Your account is pending approval.",
            "status": "pending",
            "avatar_url": f"/uploads/{avatar_filename}",
            "resume_url": f"/uploads/{resume_filename}"
        }), 201

    except Exception as e:
        app.logger.error(f"Error in candidate_signup: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/company/signup', methods=['POST'])
def company_signup():
    try:
        # Check if logo file is present
        logo = None
        logo_filename = None
        if 'logo' in request.files:
            logo = request.files['logo']
            if logo.filename != '':
                if not allowed_file(logo.filename):
                    return jsonify({"error": "Invalid file type for logo"}), 400
                
                logo_filename = secure_filename(f"logo_{datetime.now().strftime('%Y%m%d%H%M%S')}_{logo.filename}")
                logo.save(os.path.join(app.config['UPLOAD_FOLDER'], logo_filename))

        # Get form data
        data = request.form
        
        # Validate required fields
        required_fields = ['company_name', 'email', 'password', 'industry']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field.replace('_', ' ').title()} is required"}), 400
        
        # Check if email already exists
        if mongo.db.companies.find_one({'email': data['email']}) or mongo.db.candidates.find_one({'email': data['email']}):
            return jsonify({"error": "Email already registered"}), 400
        
        # Check password match
        if 'confirm_password' in data and data['password'] != data['confirm_password']:
            return jsonify({"error": "Passwords do not match"}), 400
        
        # Create company document
        company = {
            'company_name': data['company_name'],
            'email': data['email'],
            'password': generate_password_hash(data['password']),
            'phone': data.get('phone', ''),
            'location': data.get('location', ''),
            'website': data.get('website', ''),
            'description': data.get('description', ''),
            'industry': data['industry'],
            'company_size': data.get('company_size', ''),
            'founded_year': data.get('founded_year', ''),
            'terms_accepted': True if data.get('terms_accepted', '').lower() == 'true' else False,
            'logo': logo_filename,
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'jobs_posted': [],
            'verified': False
        }
        
        # Insert into database
        result = mongo.db.companies.insert_one(company)
        
        response_data = {
            "success": True,
            "message": "Company registered successfully",
            "company_id": str(result.inserted_id)
        }
        
        if logo_filename:
            response_data["logo_url"] = f"/uploads/{logo_filename}"
        
        return jsonify(response_data), 201
        
    except Exception as e:
        app.logger.error(f"Error in company_signup: {str(e)}")
        return jsonify({"error": "An unexpected error occurred during registration"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logging.info(f"Received login request with data: {data}")

        if not data.get('email') or not data.get('password'):
            logging.warning("Login failed: Email or password missing in request.")
            return jsonify({"error": "Email and password are required"}), 400

        email = data['email']
        password = data['password']

        # Check in candidates collection (ONLY MODIFIED THIS SECTION)
        candidate = mongo.db.candidates.find_one({'email': email})
        if candidate:
            logging.info(f"Found candidate with email: {email}, checking password...")
            if check_password_hash(candidate['password'], password):
                # NEW STATUS CHECK FOR CANDIDATES ONLY
                if candidate.get('status') != 'active':
                    return jsonify({
                        "error": "Your candidate account is not yet approved",
                        "account_status": candidate.get('status', 'pending')
                    }), 403
                
                access_token = create_access_token(identity=str(candidate['_id']))
                return jsonify({
                    "message": "Login successful",
                    "token": access_token,
                    "user_id": str(candidate['_id']),
                    "first_name": candidate['first_name'],
                    "last_name": candidate['last_name'],
                    "email": candidate['email'],
                    "user_type": "candidate"
                }), 200
            else:
                logging.warning(f"Login failed for candidate: {email}, incorrect password.")
        else:
            logging.info(f"No candidate found with email: {email}")

        # KEEP COMPANY LOGIN EXACTLY AS IS
        company = mongo.db.companies.find_one({'email': email})
        if company:
            logging.info(f"Found company with email: {email}, checking password...")
            if check_password_hash(company['password'], password):
                access_token = create_access_token(identity=str(company['_id']))
                logging.info(f"Login successful for company: {email}, user_id: {company['_id']}")
                return jsonify({
                    "message": "Login successful",
                    "token": access_token,
                    "user_id": str(company['_id']),
                    "company_name": company['company_name'],
                    "email": company['email'],
                    "user_type": "company"
                }), 200
            else:
                logging.warning(f"Login failed for company: {email}, incorrect password.")
        else:
            logging.info(f"No company found with email: {email}")

        # KEEP ADMIN LOGIN EXACTLY AS IS
        admin_user = mongo.db.admin.find_one({'email': email})
        if admin_user:
            logging.info(f"Found admin with email: {email}, checking password...")
            if check_password_hash(admin_user['password'], password):
                access_token = create_access_token(identity=str(admin_user['_id']),
                                                   additional_claims={"user_type": "admin"})
                logging.info(f"Login successful for admin: {email}, user_id: {admin_user['_id']}, role: {admin_user.get('role')}")
                return jsonify({
                    "message": "Login successful",
                    "token": access_token,
                    "user_id": str(admin_user['_id']),
                    "email": admin_user['email'],
                    "user_type": "admin"
                }), 200
            else:
                logging.warning(f"Login failed for admin: {email}, incorrect password.")
        else:
            logging.info(f"No admin found with email: {email}")

        logging.warning(f"Login failed for email: {email}, invalid credentials.")
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({"error": str(e)}), 500
@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jwt_data = get_jwt()
        
        if not all(key in jwt_data for key in ['jti', 'exp']):
            app.logger.error("Missing required JWT claims")
            return jsonify({
                "success": False,
                "error": "Invalid token structure"
            }), 400

        # Blacklist the token for all user types
        result = mongo.db.token_blacklist.insert_one({
            'jti': jwt_data['jti'],
            'exp': datetime.fromtimestamp(jwt_data['exp']),
            'created_at': datetime.utcnow(),
            'user_id': get_jwt_identity(),
            'user_type': jwt_data.get('user_type', 'unknown')  # Store user type
        })

        if not result.inserted_id:
            app.logger.error("Failed to blacklist token")
            return jsonify({
                "success": False,
                "error": "Failed to process logout"
            }), 500

        response = jsonify({
            "success": True,
            "message": "Logout successful"
        })
        
        unset_jwt_cookies(response)
        # Add security headers
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.delete_cookie('session', path='/')
        
        return response, 200

    except PyMongoError as e:
        app.logger.error(f"MongoDB error during logout: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Database error during logout"
        }), 500
        
    except Exception as e:
        app.logger.error(f"Unexpected logout error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500

# Add this new endpoint to check auth status
@app.route('/check-auth', methods=['GET'])
@jwt_required(optional=True)
def check_auth():
    current_user = get_jwt_identity()
    if current_user:
        jwt_data = get_jwt()
        return jsonify({
            "authenticated": True,
            "user_type": jwt_data.get('user_type', 'unknown')
        }), 200
    return jsonify({"authenticated": False}), 200  

@app.route('/company/profile', methods=['GET'])
@jwt_required()
def get_company_profile():
    try:
        current_user_id = get_jwt_identity()
        
        company = mongo.db.companies.find_one({'_id': ObjectId(current_user_id)})
        if not company:
            return jsonify({"error": "Company not found"}), 404
        
        profile_data = {
            'company_name': company.get('company_name'),
            'email': company.get('email'),
            'phone': company.get('phone', ''),
            'location': company.get('location', ''),
            'website': company.get('website', ''),
            'description': company.get('description', ''),
            'industry': company.get('industry', ''),
            'company_size': company.get('company_size', ''),
            'founded_year': company.get('founded_year', ''),
            'verified': company.get('verified', False),
            'logo_url': f"http://localhost:5000/uploads/{company.get('logo')}" if company.get('logo') else None
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        app.logger.error(f"Error fetching company profile: {str(e)}")
        return jsonify({"error": "An error occurred while fetching profile"}), 500

@app.route('/company/update', methods=['PUT'])
@jwt_required()
def update_company_profile():
    try:
        current_user_id = get_jwt_identity()
        company = mongo.db.companies.find_one({'_id': ObjectId(current_user_id)})
        if not company:
            return jsonify({"error": "Company not found"}), 404
        
        update_data = {}
        logo_filename = company.get('logo')
        
        # Handle file upload
        if 'logo' in request.files:
            logo = request.files['logo']
            if logo.filename != '':
                if not allowed_file(logo.filename):
                    return jsonify({"error": "Invalid file type for logo"}), 400
                
                if logo_filename:
                    try:
                        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], logo_filename))
                    except OSError:
                        pass
                
                logo_filename = secure_filename(f"logo_{current_user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{logo.filename}")
                logo.save(os.path.join(app.config['UPLOAD_FOLDER'], logo_filename))
                update_data['logo'] = logo_filename
        
        # Update fields from form data
        form_fields = ['company_name', 'email', 'phone', 'location', 'website', 
                     'description', 'industry', 'company_size', 'founded_year']
        
        for field in form_fields:
            if field in request.form:
                update_data[field] = request.form[field]
        
        # Validate required fields
        if 'company_name' in update_data and not update_data['company_name']:
            return jsonify({"error": "Company name is required"}), 400
        if 'email' in update_data and not update_data['email']:
            return jsonify({"error": "Email is required"}), 400
        
        update_data['updated_at'] = datetime.now()
        
        mongo.db.companies.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': update_data}
        )
        
        updated_company = mongo.db.companies.find_one({'_id': ObjectId(current_user_id)})
        response_data = {
            'company_name': updated_company.get('company_name'),
            'email': updated_company.get('email'),
            'phone': updated_company.get('phone', ''),
            'location': updated_company.get('location', ''),
            'website': updated_company.get('website', ''),
            'description': updated_company.get('description', ''),
            'industry': updated_company.get('industry', ''),
            'company_size': updated_company.get('company_size', ''),
            'founded_year': updated_company.get('founded_year', ''),
            'verified': updated_company.get('verified', False),
            'logo_url': f"http://localhost:5000/uploads/{updated_company.get('logo')}" if updated_company.get('logo') else None
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        app.logger.error(f"Error updating company profile: {str(e)}")
        return jsonify({"error": "An error occurred while updating profile"}), 500

@app.route('/company/jobs', methods=['GET'])
@jwt_required()
def get_all_jobs():
    try:
        current_user_id = get_jwt_identity()

        jobs_cursor = mongo.db.jobs.find({
            'company_id': ObjectId(current_user_id),
            'status': {'$in': ['active', 'closed']}  # Only these two statuses
        }).sort('created_at', -1)

        jobs = []
        for job in jobs_cursor:
            jobs.append({
                '_id': str(job.get('_id')),
                'job_title': job.get('job_title', ''),
                'salary': job.get('salary', ''),
                'looking_for_profile': job.get('looking_for_profile', ''),
                'required_experience': job.get('required_experience', ''),
                'required_skills': job.get('required_skills', []),
                'status': job.get('status', 'active'),  # Default to active if missing
                'created_at': job.get('created_at').strftime('%Y-%m-%d') if job.get('created_at') else '',
                'applicants': job.get('applicants', [])
            })

        return jsonify(jobs), 200

    except Exception as e:
        app.logger.error(f"Error in get_all_jobs: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    except Exception as e:
        app.logger.error(f"Error in get_all_jobs: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/company/addJob', methods=['POST'])
@jwt_required()
def add_job():
    try:
        current_user_id = get_jwt_identity()
        data = request.json or {}

        required_fields = ['job_title', 'salary', 'looking_for_profile', 'required_experience']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field.replace('_', ' ')} is required"}), 400

        required_skills = []
        if 'required_skills' in data:
            if isinstance(data['required_skills'], str):
                required_skills = [skill.strip().lower() for skill in data['required_skills'].split(',') if skill.strip()]
            elif isinstance(data['required_skills'], list):
                required_skills = [skill.lower() for skill in data['required_skills']]

        job = {
            'company_id': ObjectId(current_user_id),
            'job_title': data['job_title'].lower(),
            'salary': data['salary'],
            'looking_for_profile': data['looking_for_profile'].lower(),
            'required_experience': data['required_experience'],
            'required_skills': required_skills,
            'status': 'active',  # Default status
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'applicants': []
        }

        result = mongo.db.jobs.insert_one(job)
        
        return jsonify({
            "success": True,
            "message": "Job added successfully",
            "job_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        app.logger.error(f"Error in add_job: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/company/editJob/<job_id>', methods=['PUT'])
@jwt_required()
def edit_job(job_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.json or {}

        # Verify job belongs to company
        job = mongo.db.jobs.find_one({
            '_id': ObjectId(job_id),
            'company_id': ObjectId(current_user_id)
        })
        
        if not job:
            return jsonify({"error": "Job not found"}), 404

        update_data = {
            'job_title': data.get('job_title', job['job_title']).lower(),
            'salary': data.get('salary', job['salary']),
            'looking_for_profile': data.get('looking_for_profile', job['looking_for_profile']).lower(),
            'required_experience': data.get('required_experience', job['required_experience']),
            'updated_at': datetime.now()
        }

        # Handle skills update
        if 'required_skills' in data:
            if isinstance(data['required_skills'], str):
                update_data['required_skills'] = [skill.strip().lower() for skill in data['required_skills'].split(',') if skill.strip()]
            elif isinstance(data['required_skills'], list):
                update_data['required_skills'] = [skill.lower() for skill in data['required_skills']]

        mongo.db.jobs.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': update_data}
        )

        return jsonify({
            "success": True,
            "message": "Job updated successfully"
        }), 200

    except Exception as e:
        app.logger.error(f"Error in edit_job: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Move this route and function to the top level (not nested inside edit_job)
@app.route('/company/jobs/<job_id>/status', methods=['PATCH'])
@jwt_required()
def update_job_status(job_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        if 'status' not in data or data['status'] not in ['active', 'closed']:
            return jsonify({"error": "Invalid status"}), 400

        # Verify job belongs to company
        job = mongo.db.jobs.find_one({
            '_id': ObjectId(job_id),
            'company_id': ObjectId(current_user_id)
        })

        if not job:
            return jsonify({"error": "Job not found"}), 404

        mongo.db.jobs.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': {'status': data['status'], 'updated_at': datetime.now()}}
        )

        return jsonify({
            "success": True,
            "message": "Job status updated successfully"
        }), 200

    except Exception as e:
        app.logger.error(f"Error in update_job_status: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/company/candidates', methods=['GET'])
@jwt_required()
def get_candidates_for_company():
    try:
        # Fetch all candidates from the database
        candidates_cursor = mongo.db.candidates.find({}, {
            'first_name': 1,
            'last_name': 1,
            'email': 1,
            'skills': 1,
            'education': 1,
            'experience': 1,
            'resume': 1 ,
            'adminCV': 1
        })

        candidates = []
        for candidate in candidates_cursor:
            latest_education = candidate.get('education', [{}])[-1] if candidate.get('education') else {}
            latest_experience = candidate.get('experience', [{}])[-1] if candidate.get('experience') else {}

            candidates.append({
                'id': str(candidate.get('_id')),
                'firstName': candidate.get('first_name'),
                'lastName': candidate.get('last_name'),
                'email': candidate.get('email'),
                'skills': candidate.get('skills', []),
                'education': latest_education,
                'experience': latest_experience,
                'resume_url': f"http://localhost:5000/uploads/{candidate.get('resume')}" if candidate.get('resume') else None ,
                'adminCV': f"http://localhost:5000/uploads/{candidate.get('adminCV')}" if candidate.get('adminCV') else None 
            })

        return jsonify(candidates), 200

    except Exception as e:
        app.logger.error(f"Error fetching candidates: {str(e)}")
        return jsonify({"error": "An error occurred while fetching candidates"}), 500

@app.route('/company/candidates/<string:candidate_id>', methods=['GET'])
@jwt_required()
def get_candidate_details(candidate_id):
    try:
        candidate = mongo.db.candidates.find_one({'_id': ObjectId(candidate_id)})
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        return jsonify({
            'id': str(candidate.get('_id')),
            'firstName': candidate.get('first_name'),
            'lastName': candidate.get('last_name'),
            'email': candidate.get('email'),
            'phone': candidate.get('phone', ''),
            'location': candidate.get('location', ''),
            'skills': candidate.get('skills', []),
            'educations': candidate.get('education', []),
            'experiences': candidate.get('experience', []),
            'resume_url': f"/uploads/{candidate.get('resume')}" if candidate.get('resume') else None,
            'bio': candidate.get('bio', '')
        }), 200

    except Exception as e:
        app.logger.error(f"Error fetching candidate details: {str(e)}")
        return jsonify({"error": "An error occurred while fetching candidate details"}), 500    
    
@app.route('/admin/users', methods=['GET'])
def get_all_users():
    try:
        # Récupérer les paramètres de filtre depuis la requête
        filter_type = request.args.get('type')  # 'candidate' ou 'company'
        status_filter = request.args.get('status')
        name_filter = request.args.get('name', '').lower()
        sort_order = request.args.get('sort_order', 'desc')  # 'asc' ou 'desc'
        has_growcoach_formation = request.args.get('has_growcoach_formation')
        candidates_query = {}
        if has_growcoach_formation == 'true':
            candidates_query['has_growcoach_formation'] = True
        elif has_growcoach_formation == 'false':
            candidates_query['$or'] = [
                {'has_growcoach_formation': False},
                {'has_growcoach_formation': {'$exists': False}}
            ]

        candidates = mongo.db.candidates.find(candidates_query)
        users = []

        # Process candidates
        for candidate in candidates:
            full_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}".strip()
            created_at = candidate.get('created_at')
            formatted_date = created_at.strftime('%d/%m/%Y') if created_at else None

            users.append({
                '_id': str(candidate.get('_id')),
                'name': full_name,
                'email': candidate.get('email'),
                'type': 'candidate',
                'status': candidate.get('status'),
                'created_at': formatted_date,
                '_created_at_obj': created_at,  # pour tri interne
                'CV': f"http://localhost:5000/uploads/{candidate.get('resume')}" if candidate.get('resume') else None,
                'adminCV': f"http://localhost:5000/uploads/{candidate.get('adminCV')}" if candidate.get('adminCV') else None ,
                'formation_name': ', '.join(candidate.get('growcoach_formation', [])) if isinstance(candidate.get('growcoach_formation', []), list) else candidate.get('growcoach_formation', '')
            })

        # N'ajouter les companies que si on ne filtre PAS sur la formation
        if not has_growcoach_formation:
            companies = mongo.db.companies.find()
            for company in companies:
                created_at = company.get('created_at')
                formatted_date = created_at.strftime('%d/%m/%Y') if created_at else None

                users.append({
                    '_id': str(company.get('_id')),
                    'name': company.get('company_name'),
                    'email': company.get('email'),
                    'type': 'company',
                    'status': company.get('status'),
                    'created_at': formatted_date,
                    '_created_at_obj': created_at,  # pour tri interne
                    'CV': '',
                    'verified': company.get('verified', False)
                })

        # Appliquer les filtres
        if filter_type in ['candidate', 'company']:
            users = [u for u in users if u['type'] == filter_type]

        if status_filter in ['approved', 'pending', 'blocked']:
            users = [u for u in users if u['status'] == status_filter]

        if name_filter:
            users = [u for u in users if name_filter in u['name'].lower()]

        # Tri par created_at
        reverse_sort = True if sort_order == 'desc' else False
        users.sort(key=lambda x: x.get('_created_at_obj') or datetime.min, reverse=reverse_sort)

        # Supprimer les objets internes avant de retourner
        for u in users:
            u.pop('_created_at_obj', None)

        return jsonify(users), 200

    except Exception as e:
        app.logger.error(f"Error in get_all_users: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    
@app.route('/admin/candidates/<candidate_id>/status', methods=['PUT'])
def manage_candidate_status(candidate_id):
    try:
        data = request.get_json()
        
        # Vérifier si l'admin est authentifié
        """if not validate_admin_token(request.headers.get('Authorization')):
            return jsonify({"error": "Unauthorized"}), 401"""
        
        # Vérifier que l'action est valide
        if 'action' not in data or data['action'] not in ['block', 'unblock']:
            return jsonify({"error": "Invalid action. Use 'block' or 'unblock'"}), 400
        
        # Trouver le candidat
        candidate = mongo.db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404
        
        # Mettre à jour le statut
        new_status = "blocked" if data['action'] == 'block' else "active"
        
        mongo.db.candidates.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": {"status": new_status, "updated_at": datetime.now()}}
        )
        
        return jsonify({
            "success": True,
            "message": f"Candidate {new_status} successfully",
            "candidate_id": candidate_id,
            "status": new_status
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error in manage_candidate_status: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
  

@app.route('/admin/companies/<company_id>/status', methods=['PUT'])
def manage_company_status(company_id):
    try:
        data = request.get_json()
        
        # Vérifier si l'admin est authentifié
        """if not validate_admin_token(request.headers.get('Authorization')):
            return jsonify({"error": "Unauthorized"}), 401"""
        
        # Vérifier que l'action est valide
        valid_actions = ['verify', 'unverify', 'block', 'unblock']
        if 'action' not in data or data['action'] not in valid_actions:
            return jsonify({
                "error": f"Invalid action. Use one of: {', '.join(valid_actions)}"
            }), 400
        
        # Trouver l'entreprise
        company = mongo.db.companies.find_one({"_id": ObjectId(company_id)})
        if not company:
            return jsonify({"error": "Company not found"}), 404
        
        # Déterminer le nouveau statut
        status_map = {
            'verify': {'verified': True, 'status': 'active'},
            'unverify': {'verified': False, 'status': 'active'},
            'block': {'status': 'blocked'},
            'unblock': {'status': 'active'}
        }
        
        update_data = status_map[data['action']]
        update_data['updated_at'] = datetime.now()
        
        # Mettre à jour l'entreprise
        mongo.db.companies.update_one(
            {"_id": ObjectId(company_id)},
            {"$set": update_data}
        )
        
        return jsonify({
            "success": True,
            "message": f"Company {data['action']}ed successfully",
            "company_id": company_id,
            "status": update_data.get('status', company.get('status')),
            "verified": update_data.get('verified', company.get('verified', False))
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error in manage_company_status: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    
@app.route('/condidate/profile', methods=['GET'])
@jwt_required()
def get_conditate_profile():
    try:
        current_user_id = get_jwt_identity()
        
        condidate = mongo.db.candidates.find_one({'_id': ObjectId(current_user_id)})
        if not condidate:
            return jsonify({"error": "condidate not found"}), 404
        
        profile_data = {
            'first_name': condidate.get('first_name'),
            'last_name': condidate.get('last_name'),
            'email': condidate.get('email'),
            'password': condidate.get('password'),
            'phone': condidate.get('phone', ''),
            'location': condidate.get('location', ''),
            'bio': condidate.get('bio', ''),
            'skills': condidate.get('skills', []),
            'terms_accepted': condidate.get('terms_accepted', False),
            'avatar': condidate.get('avatar'),
            'resume': condidate.get('resume'),
            'created_at': condidate.get('created_at'),
            'updated_at': condidate.get('updated_at'),
            'education': condidate.get('education', []),
            'experience': condidate.get('experience', [])
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        app.logger.error(f"Error fetching company profile: {str(e)}")
        return jsonify({"error": "An error occurred while fetching profile"}), 500
    
@app.route('/condidate/update', methods=['PUT'])
@jwt_required()
def update_candidate_profile():
    try:
        current_user_id = get_jwt_identity()
        candidate = mongo.db.candidates.find_one({'_id': ObjectId(current_user_id)})
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        update_data = {}
        avatar_filename = candidate.get('avatar')

        # Handle avatar upload
        if 'avatar' in request.files:
            avatar = request.files['avatar']
            if avatar.filename != '':
                if not allowed_file(avatar.filename):
                    return jsonify({"error": "Invalid file type for avatar"}), 400

                # Remove old avatar if exists
                if avatar_filename:
                    try:
                        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], avatar_filename))
                    except OSError:
                        pass

                avatar_filename = secure_filename(f"avatar_{current_user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{avatar.filename}")
                avatar.save(os.path.join(app.config['UPLOAD_FOLDER'], avatar_filename))
                update_data['avatar'] = avatar_filename

        # Update fields from form data
        form_fields = [
            'first_name', 'last_name', 'email', 'phone', 'location',
            'bio', 'terms_accepted'
        ]
        for field in form_fields:
            if field in request.form:
                update_data[field] = request.form[field]

        # Handle skills (as comma separated string or JSON array)
        if 'skills' in request.form:
            try:
                import json
                skills = request.form['skills']
                if skills.strip().startswith('['):
                    update_data['skills'] = json.loads(skills)
                else:
                    update_data['skills'] = [s.strip() for s in skills.split(',') if s.strip()]
            except Exception:
                update_data['skills'] = []

        # Handle education and experience (as JSON)
        import json
        if 'education' in request.form:
            try:
                update_data['education'] = json.loads(request.form['education'])
            except Exception:
                update_data['education'] = []
        if 'experience' in request.form:
            try:
                update_data['experience'] = json.loads(request.form['experience'])
            except Exception:
                update_data['experience'] = []

        update_data['updated_at'] = datetime.now()

        mongo.db.candidates.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': update_data}
        )

        updated_candidate = mongo.db.candidates.find_one({'_id': ObjectId(current_user_id)})
        response_data = {
            'first_name': updated_candidate.get('first_name'),
            'last_name': updated_candidate.get('last_name'),
            'email': updated_candidate.get('email'),
            'password': updated_candidate.get('password'),
            'phone': updated_candidate.get('phone', ''),
            'location': updated_candidate.get('location', ''),
            'bio': updated_candidate.get('bio', ''),
            'skills': updated_candidate.get('skills', []),
            'terms_accepted': updated_candidate.get('terms_accepted', False),
            'avatar': updated_candidate.get('avatar'),
            'resume': updated_candidate.get('resume'),
            'created_at': updated_candidate.get('created_at'),
            'updated_at': updated_candidate.get('updated_at'),
            'education': updated_candidate.get('education', []),
            'experience': updated_candidate.get('experience', [])
        }

        return jsonify(response_data), 200

    except Exception as e:
        app.logger.error(f"Error updating candidate profile: {str(e)}")
        return jsonify({"error": "An error occurred while updating profile"}), 500
    
@app.route('/jobs', methods=['GET'])
def get_all_jobs_public():
    try:
        jobs_cursor = mongo.db.jobs.find().sort('created_at', -1)
        jobs = []
        for job in jobs_cursor:
            company_data = {}
            if job.get('company_id'):
                company = mongo.db.companies.find_one({'_id': ObjectId(job['company_id'])})
                if company:
                    company_data = {
                        'company_name': company.get('company_name', ''),
                        'company_logo': company.get('logo', ''),
                        'company_location': company.get('location', '')
                    }
            
            jobs.append({
                '_id': str(job.get('_id')),
                'job_title': job.get('job_title', ''),
                'salary': job.get('salary', ''),
                'looking_for_profile': job.get('looking_for_profile', ''),
                'required_experience': job.get('required_experience', ''),
                'required_skills': job.get('required_skills', []),
                'status': job.get('status', 'draft'),
                'created_at': job.get('created_at').strftime('%Y-%m-%d') if job.get('created_at') else '',
                'company_id': str(job.get('company_id')) if job.get('company_id') else '',
                'applicants': job.get('applicants', []),
                **company_data  # This spreads the company data into the job object
            })
        return jsonify(jobs), 200
    except Exception as e:
        app.logger.error(f"Error in get_all_jobs_public: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    
@app.route('/jobs/<job_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_job(job_id):
    try:
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        if not candidate_id:
            return jsonify({'error': 'Missing candidate_id'}), 400
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        # Prevent duplicate applications
        if candidate_id in job.get('applicants', []):
            return jsonify({'error': 'Already applied'}), 400
        mongo.db.jobs.update_one(
            {'_id': ObjectId(job_id)},
            {'$addToSet': {'applicants': candidate_id}}
        )
        return jsonify({'message': 'Applied successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/request-verification', methods=['POST'])
@jwt_required()
def request_verification():
    try:
        user_id = get_jwt_identity()
        jwt_data = get_jwt()
        

        

        company = mongo.db.companies.find_one({'_id': ObjectId(user_id)})
        if not company:
            return jsonify({"error": "Company not found"}), 404

        # Créer la notification pour l’admin
        notification = {
            "text": f"{company['company_name']} has made a verification request",
            "time": datetime.utcnow().isoformat(),
            "unread": True,
            "type": "verification_request",
            "company_id": str(company['_id']),
            "company_name": company['company_name']
        }
        mongo.db.admin_notifications.insert_one(notification)

        return jsonify({"success": True, "message": "Verification request sent"}), 200

    except Exception as e:
        app.logger.error(f"Verification request error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    


@app.route('/api/admin/notifications', methods=['GET'])
@jwt_required()
def get_admin_notifications():
    jwt_data = get_jwt()
    if jwt_data.get('user_type') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    notifications = list(mongo.db.admin_notifications.find().sort("time", -1))
    for n in notifications:
        n['id'] = str(n['_id'])
        n.pop('_id', None)
    return jsonify(notifications), 200    


@app.route('/api/company/verification-status', methods=['GET'])
@jwt_required()
def company_verification_status():
    user_id = get_jwt_identity()
    notif = mongo.db.admin_notifications.find_one({
        "company_id": str(user_id),
        "type": "verification_request",
        "unread": True
    })
    return jsonify({"pending": bool(notif)}), 200


@app.route('/api/admin/notifications/<notif_id>', methods=['DELETE'])
@jwt_required()
def delete_admin_notification(notif_id):
    jwt_data = get_jwt()

    mongo.db.admin_notifications.delete_one({'_id': ObjectId(notif_id)})
    return jsonify({"success": True}), 200

@app.route('/company/jobs/<job_id>/applicants', methods=['GET'])
@jwt_required()
def get_job_applicants(job_id):
    try:
        # Get the job to verify it belongs to the company
        job = mongo.db.jobs.find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        # Get all applicants for this job
        applicants = []
        for applicant_id in job.get('applicants', []):
            candidate = mongo.db.candidates.find_one({'_id': ObjectId(applicant_id)})
            if candidate:
                applicants.append({
                    'id': str(candidate['_id']),
                    'firstName': candidate.get('first_name', ''), # Corrected key
                    'lastName': candidate.get('last_name', ''),   # Corrected key
                    'email': candidate.get('email', ''),
                    'resume_url': f"http://localhost:5000/uploads/{candidate.get('resume')}" if candidate.get('resume') else None # Corrected URL construction
                })

        return jsonify(applicants)
    except Exception as e:
        app.logger.error(f"Error fetching job applicants: {str(e)}") # Added logging
        return jsonify({'error': 'An unexpected error occurred'}), 500 # Generic error for safety


@app.route('/candidate/save-job/<job_id>', methods=['POST'])
@jwt_required()
def save_job(job_id):
    user_id = get_jwt_identity()
    candidate = mongo.db.candidates.find_one({'_id': ObjectId(user_id)})
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404

    action = request.json.get('action', 'save')  # 'save' ou 'unsave'
    if action == 'save':
        mongo.db.candidates.update_one(
            {'_id': ObjectId(user_id)},
            {'$addToSet': {'saved_jobs': job_id}}
        )
    else:
        mongo.db.candidates.update_one(
            {'_id': ObjectId(user_id)},
            {'$pull': {'saved_jobs': job_id}}
        )
    return jsonify({'success': True}), 200

@app.route('/candidate/saved-jobs', methods=['GET'])
@jwt_required()
def get_saved_jobs():
    user_id = get_jwt_identity()
    candidate = mongo.db.candidates.find_one({'_id': ObjectId(user_id)})
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    saved_jobs = candidate.get('saved_jobs', [])
    return jsonify({'saved_jobs': saved_jobs}), 200


@app.route('/admin/candidates/<candidate_id>/admin-cv', methods=['POST'])
def upload_admin_cv(candidate_id):
    try:
        # Vérifier si un fichier est présent
        if 'adminCV' not in request.files:
            return jsonify({"error": "Aucun fichier reçu"}), 400
        file = request.files['adminCV']

        # Vérifier le type de fichier
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({"error": "Type de fichier non autorisé"}), 400

        # Générer un nom de fichier sécurisé et unique
        filename = secure_filename(f"admincv_{candidate_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Mettre à jour le champ adminCV du candidat
        mongo.db.candidates.update_one(
            {"_id": ObjectId(candidate_id)},
            {"$set": {"adminCV": filename, "updated_at": datetime.now()}}
        )

        return jsonify({
            "success": True,
            "adminCV": f"http://localhost:5000/uploads/{filename}"
        }), 200

    except Exception as e:
        app.logger.error(f"Erreur lors de l'upload du CV admin: {str(e)}")
        return jsonify({"error": "Erreur lors de l'upload du CV"}), 500

@app.route('/admin/candidates/<candidate_id>/approve', methods=['POST'])
@jwt_required()
def approve_candidate(candidate_id):
    try:
        # Verify admin authentication
        jwt_data = get_jwt()
        if jwt_data.get('user_type') != 'admin':
            return jsonify({"error": "Unauthorized"}), 401

        # Update candidate status
        result = mongo.db.candidates.update_one(
            {'_id': ObjectId(candidate_id)},
            {'$set': {'status': 'active', 'updated_at': datetime.now()}}
        )

        if result.modified_count == 0:
            return jsonify({"error": "Candidate not found"}), 404

        # Mark notification as read
        mongo.db.admin_notifications.delete_many(
            {'candidate_id': candidate_id, 'type': 'new_candidate'}
        )

        return jsonify({"success": True, "message": "Candidate approved successfully"}), 200

    except Exception as e:
        app.logger.error(f"Error approving candidate: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)