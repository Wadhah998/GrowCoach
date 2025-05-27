import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

interface CandidateProfileData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  terms_accepted: boolean;
  avatar: string | null;
  resume: string | null;
  created_at: string;
  updated_at: string;
  education: any[];
  experience: any[];
}

const CandidateProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<CandidateProfileData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/condidate/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          if (data.avatar) {
            setPreviewUrl(`http://localhost:5000/uploads/${data.avatar}`);
          }
        } else {
          throw new Error('Failed to fetch profile data');
        }
      } catch (error) {
        setError('Échec du chargement des données du profil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profileData) return;
    const { name, value, type } = e.target;
    setProfileData(prev => prev ? ({
      ...prev,
      [name]: type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value
    }) : null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Education handlers
  const handleEducationChange = (idx: number, field: string, value: string) => {
    if (!profileData) return;
    setProfileData(prev => prev ? ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === idx ? { ...edu, [field]: value } : edu
      )
    }) : null);
  };

  const addEducation = () => {
    if (!profileData) return;
    setProfileData(prev => prev ? ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', start_date: '', end_date: '', description: '' }
      ]
    }) : null);
  };

  const removeEducation = (idx: number) => {
    if (!profileData) return;
    setProfileData(prev => prev ? ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }) : null);
  };

  // Experience handlers
  const handleExperienceChange = (idx: number, field: string, value: string) => {
    if (!profileData) return;
    setProfileData(prev => prev ? ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === idx ? { ...exp, [field]: value } : exp
      )
    }) : null);
  };

  const addExperience = () => {
    if (!profileData) return;
    setProfileData(prev => prev ? ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', start_date: '', end_date: '', description: '' }
      ]
    }) : null);
  };

  const removeExperience = (idx: number) => {
    if (!profileData) return;
    setProfileData(prev => prev ? ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!profileData) return;

      const formData = new FormData();
      Object.entries(profileData).forEach(([key, value]) => {
        if (
          key !== 'avatar' &&
          key !== 'resume' &&
          key !== 'created_at' &&
          key !== 'updated_at' &&
          key !== 'education' &&
          key !== 'experience' &&
          value !== null
        ) {
          formData.append(key, value as string);
        }
      });

      // Append avatar file if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Append education and experience as JSON
      formData.append('education', JSON.stringify(profileData.education));
      formData.append('experience', JSON.stringify(profileData.experience));

      const response = await fetch('http://localhost:5000/condidate/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la mise à jour du profil');
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      if (updatedData.avatar) {
        setPreviewUrl(`http://localhost:5000/uploads/${updatedData.avatar}`);
      }
      setSuccessMessage('Profil mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Échec de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-600 text-white p-4 rounded-lg">
          {error || 'Aucune donnée de profil trouvée.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/candidate-dashboard')}
          className="flex items-center text-purple-400 hover:text-purple-300 mb-6"
        >
          <ArrowLeft className="mr-2" /> Retour au tableau de bord
        </button>

        <h1 className="text-3xl font-bold mb-8">Profil du Candidat</h1>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar */}
            <div className="md:col-span-2 flex items-center space-x-6 mb-6">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                  Pas d'avatar
                </div>
              )}
              <div>
                <label
                  htmlFor="avatar-upload"
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-500"
                >
                  Changer d'avatar
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                <div className="font-semibold text-lg mt-2">{profileData.first_name} {profileData.last_name}</div>
                <div className="text-gray-400">{profileData.email}</div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                name="first_name"
                value={profileData.first_name}
                onChange={handleInputChange}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                name="last_name"
                value={profileData.last_name}
                onChange={handleInputChange}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Localisation</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Biographie</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Compétences</label>
              <div className="flex flex-wrap gap-2">
                {profileData.skills && profileData.skills.length > 0 ? (
                  profileData.skills.map((skill, idx) => (
                    <span key={idx} className="bg-purple-700 px-3 py-1 rounded-full text-sm">{skill}</span>
                  ))
                ) : (
                  <span className="text-gray-500">Aucune compétence</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CV</label>
              {profileData.resume ? (
                <a
                  href={`http://localhost:5000/uploads/${profileData.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 underline"
                >
                  Télécharger le CV
                </a>
              ) : (
                <span className="text-gray-500">Aucun CV téléchargé</span>
              )}
            </div>
         
         
      
          </div>

          {/* Editable Education */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center justify-between">
              Formation
              <button
                type="button"
                onClick={addEducation}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500 text-sm"
              >
                + Ajouter
              </button>
            </h2>
            {profileData.education && profileData.education.length > 0 ? (
              <div className="space-y-4">
                {profileData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="École/Université"
                        value={edu.school}
                        onChange={e => handleEducationChange(idx, 'school', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700 mr-2"
                      />
                      <input
                        type="text"
                        placeholder="Diplôme"
                        value={edu.degree}
                        onChange={e => handleEducationChange(idx, 'degree', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        placeholder="Date de début"
                        value={edu.start_date || ''}
                        onChange={e => handleEducationChange(idx, 'start_date', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700 mr-2"
                      />
                      <input
                        type="date"
                        placeholder="Date de fin"
                        value={edu.end_date || ''}
                        onChange={e => handleEducationChange(idx, 'end_date', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={edu.description}
                      onChange={e => handleEducationChange(idx, 'description', e.target.value)}
                      className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-red-400 hover:text-red-600 text-sm mt-2"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Aucune information de formation</div>
            )}
          </div>

          {/* Editable Experience */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center justify-between">
              Expérience
              <button
                type="button"
                onClick={addExperience}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500 text-sm"
              >
                + Ajouter
              </button>
            </h2>
            {profileData.experience && profileData.experience.length > 0 ? (
              <div className="space-y-4">
                {profileData.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Poste"
                        value={exp.title}
                        onChange={e => handleExperienceChange(idx, 'title', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700 mr-2"
                      />
                      <input
                        type="text"
                        placeholder="Entreprise"
                        value={exp.company}
                        onChange={e => handleExperienceChange(idx, 'company', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        placeholder="Date de début"
                        value={exp.start_date || ''}
                        onChange={e => handleExperienceChange(idx, 'start_date', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700 mr-2"
                      />
                      <input
                        type="date"
                        placeholder="Date de fin"
                        value={exp.end_date || ''}
                        onChange={e => handleExperienceChange(idx, 'end_date', e.target.value)}
                        className="w-1/2 p-2 rounded bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={exp.description}
                      onChange={e => handleExperienceChange(idx, 'description', e.target.value)}
                      className="w-full p-2 rounded bg-gray-900 border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-red-400 hover:text-red-600 text-sm mt-2"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Aucune information d'expérience</div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium flex items-center justify-center disabled:opacity-50"
            >
              <Save className="mr-2" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateProfile;