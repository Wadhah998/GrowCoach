import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Education, Experience, CandidateSignupData } from '../../types';

const CandidateSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CandidateSignupData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    terms_accepted: false,
    education: [],
    experience: [],
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [hasGrowCoach, setHasGrowCoach] = useState<boolean | null>(null);
 const [selectedFormations, setSelectedFormations] = useState<string[]>([]);
 const [otherFormation, setOtherFormation] = useState('');

  const formationsList = [
    'Full Stack Developer',
    'UX/UI Designer',
    'Data Scientist',
    'DevOps Engineer',
    'Digital Marketing Specialist',
    'Project Manager',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!formData.terms_accepted) newErrors.terms_accepted = 'You must accept the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const { name } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: e.target.files![0]
      }));
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        school: '',
        degree: '',
        start_date: '',
        end_date: '',
        description: ''
      }]
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: newEducation
      };
    });
  };

  const removeEducation = (index: number) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation.splice(index, 1);
      return {
        ...prev,
        education: newEducation
      };
    });
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: ''
      }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = {
        ...newExperience[index],
        [field]: value
      };
      return {
        ...prev,
        experience: newExperience
      };
    });
  };

  const removeExperience = (index: number) => {
    setFormData(prev => {
      const newExperience = [...prev.experience];
      newExperience.splice(index, 1);
      return {
        ...prev,
        experience: newExperience
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setShowModal(true);
  };

  const submitFinalForm = async (hasFormation: boolean) => {
    setShowModal(false);
    setHasGrowCoach(hasFormation);
    setIsSubmitting(true);
  
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('confirm_password', formData.confirm_password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('terms_accepted', formData.terms_accepted.toString());
      formDataToSend.append('skills', formData.skills.join(','));
      formDataToSend.append('has_growcoach_formation', String(hasFormation));

let formationsToSend = selectedFormations;
if (formationsToSend.includes('Other') && otherFormation.trim()) {
  formationsToSend = formationsToSend.map(f =>
    f === 'Other' ? otherFormation.trim() : f
  );
}
if (hasFormation && formationsToSend.length > 0) {
  formationsToSend.forEach(f => formDataToSend.append('growcoach_formation', f));
}
      
      if (formData.avatar && formData.avatar instanceof File) {
        formDataToSend.append('avatar', formData.avatar, formData.avatar.name);
      }
      if (formData.resume && formData.resume instanceof File) {
        formDataToSend.append('resume', formData.resume, formData.resume.name);
      }
      
      formData.education.forEach((edu, index) => {
        formDataToSend.append(`education[${index}][school]`, edu.school);
        formDataToSend.append(`education[${index}][degree]`, edu.degree);
        formDataToSend.append(`education[${index}][start_date]`, edu.start_date);
        if (edu.end_date) {
          formDataToSend.append(`education[${index}][end_date]`, edu.end_date);
        }
        formDataToSend.append(`education[${index}][description]`, edu.description || '');
      });
      formDataToSend.append('education_count', formData.education.length.toString());
      
      formData.experience.forEach((exp, index) => {
        formDataToSend.append(`experience[${index}][title]`, exp.title);
        formDataToSend.append(`experience[${index}][company]`, exp.company);
        formDataToSend.append(`experience[${index}][start_date]`, exp.start_date);
        if (exp.end_date) {
          formDataToSend.append(`experience[${index}][end_date]`, exp.end_date);
        }
        formDataToSend.append(`experience[${index}][description]`, exp.description || '');
      });
      formDataToSend.append('experience_count', formData.experience.length.toString());
      
      const response = await fetch('http://localhost:5000/candidate/signup', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      navigate('/login', { state: { successMessage: 'Registration successful!' } });
      
    } catch (error) {
      setErrors({ 
        form: error instanceof Error ? error.message : 'Signup failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-900 text-gray-100 px-4">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">Inscription des candidats</h1>
          
          {errors.form && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Informations de base</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">Prénom *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.first_name ? 'border border-red-500' : ''}`}
                  />
                  {errors.first_name && <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>}
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium">Nom de famille *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.last_name ? 'border border-red-500' : ''}`}
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.email ? 'border border-red-500' : ''}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.password ? 'border border-red-500' : ''}`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium">Confirmez le mot de passe *</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.confirm_password ? 'border border-red-500' : ''}`}
                  />
                  {errors.confirm_password && <p className="mt-1 text-sm text-red-400">{errors.confirm_password}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium">Emplacement</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Avatar</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Biographie</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Compétences</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <div key={skill} className="flex items-center bg-gray-700 px-3 py-1 rounded-full">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="text-xl font-semibold">Éducation</h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Ajouter une éducation
                </button>
              </div>
              
              {formData.education.map((edu, index) => (
                <div key={index} className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">École *</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Degré *</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Date de début *</label>
                      <input
                        type="date"
                        value={edu.start_date}
                        onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Date de fin *</label>
                      <input
                        type="date"
                        value={edu.end_date || ''}
                        onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium">Description</label>
                    <textarea
                      value={edu.description}
                      onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Supprimer l'éducation
                  </button>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="text-xl font-semibold">Expérience professionnelle</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Ajouter de l'expérience
                </button>
              </div>
              
              {formData.experience.map((exp, index) => (
                <div key={index} className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Titre *</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Entreprise *</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Date de début *</label>
                      <input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Date de fin *</label>
                      <input
                        type="date"
                        value={exp.end_date || ''}
                        onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Supprimer l'expérience
                  </button>
                </div>
              ))}
            </div>

            {/* Resume */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Cv</h2>
              <div>
                <label className="block mb-2 text-sm font-medium">Télécharger le CV (PDF)</label>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="pt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    required
                  />
                </div>
                <label className="ml-2 text-sm">
                  J'accepte les{' '}
                  <a href="#" className="text-purple-400 hover:underline">
                    termes et conditions
                  </a>
                </label>
              </div>
              {errors.terms_accepted && (
                <p className="mt-1 text-sm text-red-400">{errors.terms_accepted}</p>
              )}
            </div>
              
            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Processing...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* GrowCoach Formation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-purple-400 mb-4 text-center">GrowCoach Formation</h2>
            <p className="text-gray-300 mb-6 text-center">Avez-vous suivi une formation chez GrowCoach ?</p>
            
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setHasGrowCoach(true)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-500 rounded-lg text-black font-medium transition-colors"
              >
                Oui
              </button>
              <button
                onClick={() => submitFinalForm(false)}
                className="px-6 py-2 bg-purple-500 hover:bg-purple- rounded-lg text-black font-medium transition-colors"
              >
                Non
              </button>
            </div>

            {hasGrowCoach === true && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Choisissez votre formation</label>
                  {formationsList.map((formation, idx) => (
                    <div key={idx}>
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={formation}
                          checked={selectedFormations.includes(formation)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedFormations(prev => [...prev, formation]);
                            } else {
                              setSelectedFormations(prev => prev.filter(f => f !== formation));
                              if (formation === 'Other') setOtherFormation('');
                            }
                          }}
                          className="accent-purple-500"
                        />
                        <span>{formation}</span>
                      </label>
                      {formation === 'Other' && selectedFormations.includes('Other') && (
                        <input
                          type="text"
                          value={otherFormation}
                          onChange={e => setOtherFormation(e.target.value)}
                          placeholder="Veuillez préciser votre formation"
                          className="mt-1 mb-2 px-3 py-2 bg-gray-700 rounded-lg w-full text-gray-100 border border-gray-600"
                          autoFocus
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => submitFinalForm(true)}
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors mt-4"
                >
                  Confirmer et soumettre
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSignup;