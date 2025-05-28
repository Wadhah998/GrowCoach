import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, User, Briefcase, Building2, ChevronRight, Star, BookOpen, FileText, List, X, Bookmark, BookmarkCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface Profile {
  _id: string;
  avatar?: string;
  first_name: string;
  last_name: string;
  bio?: string;
  skills?: string[];
  education?: {
    degree: string;
    field_of_study: string;
    school: string;
    start_date: string;
    end_date: string;
  };
  experience?: {
    position: string;
    company: string;
    start_date: string;
    end_date: string;
  };
}

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

type Job = {
  _id: string;
  job_title?: string;
  looking_for_profile?: string;
  required_skills?: string[];
  company_logo?: string;
  company?: string;
  company_name?: string;
  company_id?: string;
  company_location?: string;
  matchPercentage?: number;
  location?: string;
  posted?: string;
  created_at?: string;
  applicants?: string[];
  salary?: string;
  required_experience?: string;
};

const CandidateDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'saved'>('jobs');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const navigate = useNavigate();

  // Add to your state
const [lastAppliedJob, setLastAppliedJob] = useState<{
  job_title: string;
  company_name: string;
  company_logo: string;
  company_bio: string;
  required_skills: string[];
  application_date: string;
  status: string;
  matchPercentage: number;
} | null>(null);

// Add this helper function
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return formatDate(dateString);
};

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
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (e) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
  const fetchSavedJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/candidate/saved-jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.saved_jobs || []);
      }
    } catch (e) {
      setSavedJobs([]);
    }
  };
  fetchSavedJobs();
}, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setJobsError('');
      try {
        const response = await fetch('http://localhost:5000/jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        const jobsWithMatch = data.map((job: Job) => {
          const matchPercentage = profile ? calculateMatchPercentage(job.required_skills, profile.skills) : 0;
          return {
            ...job,
            matchPercentage,
            company_logo: job.company_logo ? `http://localhost:5000/uploads/${job.company_logo}` : "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100"
          };
        });
        setJobs(jobsWithMatch);
      } catch (error) {
        setJobsError(error instanceof Error ? error.message : 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [profile]);

  const calculateMatchPercentage = (requiredSkills: string[] = [], userSkills: string[] = []) => {
    if (!requiredSkills?.length || !userSkills?.length) return 0;
    const matchedSkills = requiredSkills.filter(skill =>
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
  };
 

  
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.job_title?.toLowerCase().includes(searchLower) ||
      job.looking_for_profile?.toLowerCase().includes(searchLower) ||
      (job.required_skills && job.required_skills.some(skill => skill.toLowerCase().includes(searchLower))) ||
      job.company_name?.toLowerCase().includes(searchLower)
    );
  });

  const displayedJobs = activeTab === 'saved'
  ? jobs.filter(job => savedJobs.includes(job._id))
  : filteredJobs;

  const notifications: Notification[] = [
    { id: 1, text: 'New job match found!', time: '1h ago', unread: true },
    { id: 2, text: 'Your application was viewed', time: '2h ago', unread: true },
    { id: 3, text: 'Interview scheduled', time: '1d ago', unread: false }
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    return `${years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : ''} ${
      months > 0 ? `${months} ${months === 1 ? 'month' : 'months'}` : ''
    }`.trim();
  };

  const handleApply = async (jobId: string, currentApplicants: string[] = []) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setAlertMessage('You must be logged in to apply.');
        setAlertType('error');
        setShowAlert(true);
        return;
      }

      const response = await fetch(`http://localhost:5000/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ candidate_id: userId })
      });

      if (response.ok) {
        setAlertMessage('Application submitted successfully!');
        setAlertType('success');
        setShowAlert(true);
        const updatedApplicants = [...currentApplicants, userId];
        setJobs(jobs.map(j => j._id === jobId ? { ...j, applicants: updatedApplicants } : j));
      } else {
        const data = await response.json();
        setAlertMessage(data.error || 'Failed to apply.');
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (e) {
      setAlertMessage('Failed to apply. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handleToggleSaveJob = async (jobId: string) => {
  const isSaved = savedJobs.includes(jobId);
  setSavedJobs(prev =>
    isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]
  );
  try {
    await fetch(`http://localhost:5000/candidate/save-job/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ action: isSaved ? 'unsave' : 'save' }),
    });
  } catch (e) {
    // Optionnel : rollback du state si erreur
  }
};

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold">GrowCoach</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
                aria-label="Profile menu"
                aria-expanded={showProfileMenu}
              >
                {profile?.avatar ? (
                  <img
                    src={`http://localhost:5000/uploads/${profile.avatar}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {profile?.first_name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden md:inline">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/condidate-profile');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                  >
                    <User className="h-4 w-4" /> Profil
                  </button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'jobs' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <Briefcase className="h-4 w-4" />
                Correspondances
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'saved' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <BookOpen className="h-4 w-4" />
                Offres sauvegardées
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="flex items-center">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or company..."
                className="w-full pl-12 pr-6 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {activeTab === 'jobs' ? 'Recommended Jobs' : 'Saved Jobs'}
              </h2>
              <span className="text-gray-400">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} trouvé
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : jobsError ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-red-400">{jobsError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {displayedJobs.map((job) => {
                  const matchPercentage = profile ? calculateMatchPercentage(job.required_skills, profile.skills) : 0;
                  return (
                    <div key={job._id} className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition transform hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <img
                          src={job.company_logo}
                          alt={job.company_name || "Company"}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100";
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold">{job.job_title}</h3>
                              <p className="text-purple-400">{job.company_name}</p>
                            </div>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                              {matchPercentage}% Correspondance
                            </span>
                          </div>

                          <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.company_location || job.location}
                            </span>
                            <span>{job.salary || 'Salary not specified'}</span>
                            <span>{job.posted || job.created_at ? formatDate(job.posted || job.created_at!) : ''}</span>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-medium text-white mb-2">En recherche de :</h4>
                            <p className="text-gray-400">{job.looking_for_profile}</p>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-medium text-white mb-2">Compétences requises</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.required_skills?.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-500 transition"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between gap-2">
                            <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                              Learn More
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleSaveJob(job._id)}
                                className="p-2 rounded-full hover:bg-purple-900/30 transition"
                                aria-label={savedJobs.includes(job._id) ? "Unsave job" : "Save job"}
                                title={savedJobs.includes(job._id) ? "Unsave job" : "Save job"}
                                type="button"
                              >
                                {savedJobs.includes(job._id) ? (
                                  <BookmarkCheck className="h-5 w-5 text-purple-400" />
                                ) : (
                                  <Bookmark className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                              {job.applicants && job.applicants.includes(localStorage.getItem('userId') || '') ? (
                                <button
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg cursor-default"
                                  disabled
                                >
                                  Candidature envoyée
                                </button>
                              ) : (
                                <button
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                                  onClick={() => handleApply(job._id, job.applicants)}
                                >
                                  Postuler maintenant
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-400">Aucun emploi ne correspond à votre recherche.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                >
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>

<div className="lg:w-1/3 space-y-6">
  {/* Last Applied Job Card with Neon Animation */}
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500 blur-md animate-pulse"></div>
    <div className="relative bg-gray-800/90 p-6 rounded-lg border border-gray-700 group-hover:border-purple-400 transition-all duration-300 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-200">
          Dernière candidature
        </h3>
        <span className="px-2 py-1 text-xs bg-purple-900/50 text-purple-100 rounded-full border border-purple-700/50">
          Status: {lastAppliedJob?.status || 'Pending'}
        </span>
      </div>
      
      {lastAppliedJob ? (
        <>
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={lastAppliedJob.company_logo || "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"}
                alt={lastAppliedJob.company_name}
                className="w-14 h-14 rounded-lg object-cover border border-purple-500/30"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">{lastAppliedJob.job_title}</h4>
              <p className="text-purple-300">{lastAppliedJob.company_name}</p>
              <p className="text-sm text-gray-400 mt-1">
                Candidature envoyée {formatRelativeDate(lastAppliedJob.application_date)}
              </p>
            </div>
          </div>

          <div className="mt-4 bg-gray-700/40 p-3 rounded-lg border border-gray-600/30">
            <div className="flex items-center gap-2 text-sm text-purple-300 mb-1">
              <Building2 className="h-4 w-4" />
              <span>À propos {lastAppliedJob.company_name.split(' ')[0]}</span>
            </div>
            <p className="text-sm text-gray-300 line-clamp-3">
              {lastAppliedJob.company_bio || 'No company description available'}
            </p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Score de correspondance</span>
              <span className="text-sm font-medium text-purple-300">
                {lastAppliedJob.matchPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-400 h-2 rounded-full" 
                style={{ width: `${lastAppliedJob.matchPercentage}%` }}
              ></div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <Briefcase className="w-8 h-8 mx-auto text-gray-500 mb-2" />
          <p className="text-gray-400">Aucune candidature récente</p>
          <button 
            className="mt-3 px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg text-purple-300 transition-colors"
            onClick={() => navigate('/jobs')}
          >
            Parcourir les offres
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Profile Card with Enhanced Design */}
  <div className="bg-gray-800/90 p-6 rounded-lg shadow-lg border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm">
    <div className="flex items-center gap-4 mb-6">
      <div className="relative">
        {profile?.avatar ? (
          <img
            src={`http://localhost:5000/uploads/${profile.avatar}`}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30 hover:border-purple-500/70 transition-all"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-2xl text-white">
            {profile?.first_name?.charAt(0) || 'U'}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-300 to-blue-200 bg-clip-text text-transparent">
          {profile ? `${profile.first_name} ${profile.last_name}` : '...'}
        </h3>
        <p className="text-gray-400">
          {profile?.bio || 'Your position'}
        </p>
      </div>
    </div>

    <div className="space-y-6">
      {profile?.education && Array.isArray(profile.education) && profile.education.length > 0 && (
  <div>
    <h4 className="font-medium text-white flex items-center gap-2 mb-2">
      <BookOpen className="h-4 w-4 text-purple-300" /> Formation
    </h4>
    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30">
      <p className="font-medium text-white">{profile.education[profile.education.length - 1].degree}</p>
      <p className="text-purple-200">{profile.education[profile.education.length - 1].school}</p>
      <p className="text-gray-400 text-sm mt-1">
        {formatDate(profile.education[profile.education.length - 1].start_date)} -{' '}
        {profile.education[profile.education.length - 1].end_date
          ? formatDate(profile.education[profile.education.length - 1].end_date)
          : 'Present'}
      </p>
    </div>
  </div>
)}

{profile?.experience && Array.isArray(profile.experience) && profile.experience.length > 0 && (
  <div>
    <h4 className="font-medium text-white flex items-center gap-2 mb-2">
      <Briefcase className="h-4 w-4 text-purple-300" /> Expérience
    </h4>
    {profile.experience.map((exp, idx) => (
      <div key={idx} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30 mb-2">
        <p className="font-medium text-white">{exp.position || exp.title}</p>
        <p className="text-purple-200">{exp.company}</p>
        <p className="text-gray-400 text-sm mt-1">
          {exp.start_date ? formatDate(exp.start_date) : 'N/A'} -{' '}
          {exp.end_date ? formatDate(exp.end_date) : 'Present'}
        </p>
      </div>
    ))}
  </div>
)}

      <div>
        <h4 className="font-medium text-white mb-2">Compétences clés</h4>
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.slice(0, 6).map((skill, idx) => (
            <span 
              key={idx} 
              className="px-2.5 py-1 bg-purple-900/50 text-purple-100 text-xs rounded-full border border-purple-700/50 hover:bg-purple-800/70 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <button
        className="mt-6 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
        onClick={() => navigate('/condidate-profile')}
      >
        <User className="h-4 w-4" />
        Modifier le profil
      </button>
    </div>
  </div>
</div>
        </div>
      </main>

      {/* Alert Popup */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-300">
                {alertType === 'success' ? 'Success' : 'Error'}
              </h3>
              <button
                onClick={() => setShowAlert(false)}
                className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className={alertType === 'success' ? 'text-green-400' : 'text-red-400'}>
                {alertMessage}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAlert(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
              >
                D’accord
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;