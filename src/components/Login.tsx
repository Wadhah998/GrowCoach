import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface LoginResponse {
  error: string;
  message: string;
  token: string;
  user_id: string;
  user_type: 'candidate' | 'company' | 'admin';
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userType', data.user_type);
          localStorage.setItem('userId', data.user_id);

          if (data.user_type === 'candidate') {
            localStorage.setItem('userName', `${data.first_name} ${data.last_name}`);
          } else if (data.user_type === 'company') {
            localStorage.setItem('userName', data.company_name || '');
          }
        }

        if (data.user_type === 'admin') {
          navigate('/admin-dashboard');
        } else if (data.user_type === 'candidate') {
          navigate('/candidate-dashboard');
        } else {
          navigate('/company-dashboard');
        }
      } else {
        setErrors({ form: data.error || 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      setErrors({ form: 'An error occurred during login. Please try again.' });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSelect = (type: 'candidate' | 'company') => {
    setShowDropdown(false);
    navigate(type === 'company' ? '/company-signup' : '/signup');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BookOpen className="h-12 w-12 text-purple-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold">Connectez-vous à votre compte</h2>
        <div className="mt-2 text-center text-sm text-gray-400 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Créer un nouveau compte
          </button>
          {showDropdown && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
                onClick={() => handleAccountSelect('candidate')}
              >
                En tant que candidat
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
                onClick={() => handleAccountSelect('company')}
              >
                En tant qu'entreprise
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
          {errors.form && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm">
              {errors.form}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Adresse email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.email ? 'border border-red-500' : ''}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-gray-700 rounded-lg ${errors.password ? 'border border-red-500' : ''}`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Remember me & forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm">Souviens-toi de moi</label>
              </div>

              <Link to="/forgot-password" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                Mot de passe oublié?
              </Link>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Ou continuez avec</span>
              </div>
            </div>

            {/* GitHub and Twitter Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Twitter */}
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </button>

              {/* GitHub */}
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.086 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.762-1.605-2.665-.304-5.467-1.332-5.467-5.932 0-1.31.469-2.381 1.236-3.221-.124-.304-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404 11.52 11.52 0 013.003.404c2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.872.119 3.176.77.84 1.234 1.911 1.234 3.221 0 4.61-2.807 5.625-5.479 5.922.43.371.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;