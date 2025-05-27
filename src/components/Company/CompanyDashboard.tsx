import React, { useState, useEffect } from 'react';
import { Search, User, LogOut, Briefcase, List, FileText, BookOpen, Edit, Users, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { JobPost, CompanyInfo, SimpleCandidate, JobFormData } from '../../types';

const ResumeViewer = ({ resumeUrl, companyVerified, verificationPending , adminCV, }: { 
  resumeUrl: string, 
  companyVerified: boolean,
  verificationPending: boolean ,
  adminCV?: string,
}) => {
  const [showVerificationRequest, setShowVerificationRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

const handleViewResume = () => {
  if (companyVerified) {
    if (adminCV) {
      window.alert("Remarque : Le CV de ce candidat a été anonymisé par GrowCoach.");
      window.open(adminCV, '_blank');
    } else {
      window.open(resumeUrl, '_blank');
    }
  } else {
    setShowVerificationRequest(true);
  }
};

  const handleSendVerificationRequest = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setRequestSent(true);
        setTimeout(() => setShowVerificationRequest(false), 2000);
      }
    } catch (error) {
      console.error('Error sending verification request:', error);
    }
  };

  return (
    <>
      <button
        onClick={handleViewResume}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition w-full flex items-center justify-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Voir le CV
      </button>

      {showVerificationRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-300">
                Vérification du compte requise

              </h3>
              <button 
                onClick={() => setShowVerificationRequest(false)}
                className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              {(verificationPending || requestSent) ? (
                <p className="text-green-400">Demande de vérification envoyée avec succès !
</p>
              ) : (
                <p className="text-gray-300">
                  Votre compte entreprise doit être vérifié avant que vous puissiez consulter les CV.
Souhaitez-vous demander une vérification auprès de l’administrateur ?

                </p>
              )}
            </div>
            {!(verificationPending || requestSent) && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowVerificationRequest(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Annuler

                </button>
                <button
                  onClick={handleSendVerificationRequest}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
                >
                  Demander une vérification
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const ApplicantsModal = ({ 
  applicants, 
  companyVerified, 
  verificationPending,
  onClose 
}: { 
  applicants: SimpleCandidate[],
  companyVerified: boolean,
  verificationPending: boolean,
  onClose: () => void
}) => {
  const [showVerificationRequest, setShowVerificationRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendVerificationRequest = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setRequestSent(true);
        setTimeout(() => setShowVerificationRequest(false), 2000);
      }
    } catch (error) {
      console.error('Error sending verification request:', error);
    }
  };

  useEffect(() => {
    if (!companyVerified) {
      setShowVerificationRequest(true);
    }
  }, [companyVerified]);

  if (showVerificationRequest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-300">
              Vérification du compte requise

            </h3>
            <button 
              onClick={onClose}
              className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-6">
            {(verificationPending || requestSent) ? (
              <p className="text-green-400">Demande de vérification envoyée avec succès !
</p>
            ) : (
              <p className="text-gray-300">
                Votre compte entreprise doit être vérifié avant que vous puissiez consulter les candidatures.
Souhaitez-vous demander une vérification auprès de l’administrateur ?
              </p>
            )}
          </div>
          {!(verificationPending || requestSent) && (
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Annuler

              </button>
              <button
                onClick={handleSendVerificationRequest}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
              >
                Demander une vérification
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="relative bg-gray-800 rounded-lg border-2 border-purple-400 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 py-2">
          <h3 className="text-xl font-bold text-purple-300">
            Candidats pour ce poste
          </h3>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {applicants.length > 0 ? (
            applicants.map((applicant) => (
              <div key={applicant.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                      {applicant.firstName?.charAt(0).toUpperCase()}
                      {typeof applicant.lastName === 'string' ? applicant.lastName.charAt(0).toUpperCase() : ''}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                      {applicant.firstName} {applicant.lastName}
                      </h4>
                      {/* Email is not available on SimpleCandidate */}
                    </div>
                  </div>
                  {applicant.resume_url && (
                    <ResumeViewer 
                      resumeUrl={applicant.resume_url}
                      adminCV={applicant.adminCV}
                      companyVerified={companyVerified}
                      verificationPending={verificationPending}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">Aucun candidat pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
};

const CompanyDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState('');
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [postJobError, setPostJobError] = useState('');
  const [postJobSuccess, setPostJobSuccess] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [showEditJobForm, setShowEditJobForm] = useState(false);
  const [candidates, setCandidates] = useState<SimpleCandidate[]>([]);
  const [verificationPending, setVerificationPending] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState<SimpleCandidate[]>([]);

  const defaultJobPost: JobFormData = {
    job_title: '',
    salary: '',
    looking_for_profile: '',
    required_experience: '',
    required_skills: [],
    required_skills_input: '',
    status: 'active'
  };

  const [jobPost, setJobPost] = useState<JobFormData>(defaultJobPost);
  const [jobListings, setJobListings] = useState<JobPost[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const navigate = useNavigate();

  const fetchCandidates = async () => {
    if (activeTab !== 'candidates') return;
    
    setLoadingCandidates(true);
    setCandidatesError('');
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/company/candidates', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidatesError(error instanceof Error ? error.message : 'Failed to fetch candidates');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (startDate?: string, endDate?: string | null) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    let result = '';
    if (years > 0) result += `${years} an${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (result) result += ' ';
      result += `${months} mois`;
    }
    return result || 'Moins de 1 mois';
  };

  const fetchCompanyProfile = async () => {
    setLoadingProfile(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/company/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.logo) {
        setCompanyInfo({ ...data, logo_url: `http://localhost:5000/uploads/${data.logo}` });
      } else {
        setCompanyInfo(data);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/refresh-token', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const fetchJobListings = async () => {
    if (activeTab !== 'jobs') return;

    setLoadingJobs(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/company/jobs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobListings(data);
    } catch (error) {
      console.error('Error fetching job listings:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la déconnexion');
      }

      ['authToken', 'userType', 'userId', 'userName'].forEach(key => localStorage.removeItem(key));
      navigate('/login', { replace: true, state: { logoutSuccess: true } });
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError(error instanceof Error ? error.message : 'Échec de la déconnexion');
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobPost(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPostingJob(true);
    setPostJobError('');
    setPostJobSuccess(false);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = isEditingJob && editingJobId 
        ? `http://localhost:5000/company/editJob/${editingJobId}`
        : 'http://localhost:5000/company/addJob';

      const body = {
        ...jobPost,
        required_skills: typeof jobPost.required_skills === 'string'
          ? (jobPost.required_skills as string)
              .split(',')
              .map(skill => skill.trim())
              .filter(skill => skill !== '')
          : jobPost.required_skills
      };

      const response = await fetch(endpoint, {
        method: isEditingJob ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la publication de l\'offre');
      }

      const updatedJob = await response.json();
      
      await fetchJobListings();
      
      setJobPost(defaultJobPost);
      setPostJobSuccess(true);
      setTimeout(() => setPostJobSuccess(false), 3000);
      
      if (isEditingJob) {
        setIsEditingJob(false);
        setEditingJobId(null);
      }
    } catch (error) {
      console.error('Job posting error:', error);
      setPostJobError(error instanceof Error ? error.message : 'Échec de la publication de l\'offre');
    } finally {
      setIsPostingJob(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: 'active' | 'closed') => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      const response = await fetch(`http://localhost:5000/company/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      await fetchJobListings();
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleEditJob = (job: JobPost) => {
    setEditingJobId(job._id ?? null);
    setJobPost({
      job_title: job.job_title,
      salary: job.salary,
      looking_for_profile: job.looking_for_profile,
      required_experience: job.required_experience,
      required_skills: job.required_skills,
      required_skills_input: job.required_skills.join(', '),
      status: job.status || 'active'
    });
    setIsEditingJob(true);
    setShowEditJobForm(true);
  };

const handleViewApplicants = async (job: JobPost) => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    const response = await fetch(`http://localhost:5000/company/jobs/${job._id}/applicants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      setSelectedJobApplicants(data);
      setShowApplicantsModal(true);
    } else {
      console.error('Failed to fetch applicants');
    }
  } catch (error) {
    console.error('Error fetching applicants:', error);
  }
};
  const filteredJobs = jobListings.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.job_title?.toLowerCase().includes(searchLower) ||
      job.looking_for_profile?.toLowerCase().includes(searchLower) ||
      job.required_skills?.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchQuery.toLowerCase();
    return (
      candidate.firstName?.toLowerCase().includes(searchLower) ||
      (typeof candidate.lastName === 'string' && candidate.lastName.toLowerCase().includes(searchLower)) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      (candidate.education?.degree && candidate.education.degree.toLowerCase().includes(searchLower)) ||
      (candidate.education?.institution && candidate.education.institution.toLowerCase().includes(searchLower)) ||
      (candidate.experience?.position && candidate.experience.position.toLowerCase().includes(searchLower)) ||
      (candidate.experience?.company && candidate.experience.company.toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => { 
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates();
    } else {
      fetchJobListings();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;
      try {
        const response = await fetch('http://localhost:5000/api/company/verification-status', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setVerificationPending(data.pending);
        }
      } catch (e) {
        setVerificationPending(false);
      }
    };
    fetchVerificationStatus();
  }, []);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold">GrowCoach</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
                aria-label="Profile menu"
                aria-expanded={showProfileMenu}
              >
                {companyInfo?.logo_url ? (
                  <img
                    src={companyInfo.logo_url}
                    alt="Company Logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {companyInfo?.company_name?.charAt(0) || 'C'}
                  </div>
                )}
                <span className="hidden md:inline">
                  {companyInfo?.company_name || 'Company'}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/company-profile');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                  >
                    <User className="h-4 w-4" /> Profil
                  </button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left text-red-400 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                  {logoutError && (
                    <div className="px-4 py-2 text-xs text-red-400">
                      {logoutError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'candidates' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <User className="h-4 w-4" />
                Profils des candidats
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'jobs' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
                Mes offres d’emploi
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
                placeholder={activeTab === 'candidates'
                  ? "Search candidates by name, skills, or education..."
                  : "Search jobs by title, profile, or skills..."}
                className="w-full pl-12 pr-6 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {activeTab === 'candidates' ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Candidats disponibles</h2>
                <span className="text-gray-400">
                  {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} trouvé
                </span>
              </div>

              {loadingCandidates ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : candidatesError ? (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <p className="text-red-400">{candidatesError}</p>
                  <button
                    onClick={fetchCandidates}
                    className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                  >
                    Réessayer
                  </button>
                </div>
              ) : filteredCandidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition transform hover:-translate-y-1">
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center animate-pulse hover:animate-none">
                          {candidate.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                          
                          {candidate.education && (
                            <div className="mt-3">
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Education
                              </h4>
                              <div className="ml-6 mt-1">
                                <p className="text-gray-200">
                                  {candidate.education.degree || 'Not specified'}
                                  {candidate.education.field_of_study && ` in ${candidate.education.field_of_study}`}
                                </p>
                                <p className="text-gray-400">
                                  {candidate.education.school || candidate.education.institution || 'Unknown school'}
                                </p>
                                {candidate.education.start_date && (
                                  <p className="text-gray-500 text-sm mt-1">
                                    {formatDate(candidate.education.start_date)} - {candidate.education.end_date ? formatDate(candidate.education.end_date) : 'Present'}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {candidate.experience && (
                            <div className="mt-3">
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> Expérience
                              </h4>
                              <div className="ml-6 mt-1">
                                <p className="text-gray-200">
                                  {candidate.experience.position || 'No position specified'}
                                </p>
                                <p className="text-gray-400">
                                  {candidate.experience.company || 'Unknown company'}
                                </p>
                                {candidate.experience.start_date && (
                                  <div className="text-gray-500 text-sm mt-1">
                                    <p className="text-gray-500 text-sm mt-1">
                                      {formatDate(candidate.experience.start_date)} - {candidate.experience.end_date ? formatDate(candidate.experience.end_date) : 'Present'}
                                      {candidate.experience.start_date && (
                                        <span className="block text-gray-400 mt-1">
                                          Years of Experience: {calculateDuration(candidate.experience.start_date, candidate.experience.end_date)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-4">
                            <h4 className="font-medium text-white mb-2">Compétences</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills?.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-500 transition"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {candidate.resume_url && (
                            <ResumeViewer
                              resumeUrl={candidate.resume_url}
                              adminCV={candidate.adminCV}
                              companyVerified={!!companyInfo?.verified}
                              verificationPending={verificationPending}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <p className="text-gray-400">Aucun candidat ne correspond à vos critères.</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            <div className="lg:w-1/3">
              <div className="bg-gray-800 p-6 rounded-lg shadow sticky top-32">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="mr-2" /> Statistiques rapides
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium">Nombre total de candidats</h3>
                    <p className="text-2xl font-bold text-purple-500">{candidates.length}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium">Offres d’emploi actives</h3>
                    <p className="text-2xl font-bold text-purple-500">
                      {jobListings.filter(job => job.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Mes offres d poste</h2>
                <span className="text-gray-400">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                </span>
              </div>

              {loadingJobs ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job._id} className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">{job.job_title}</h3>
                          <p className="text-purple-400">{job.salary}</p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full cursor-pointer ${job.status === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-700 text-white'
                            }`}
                          onClick={() =>
                            job._id &&
                            (job.status === 'active' || job.status === 'closed') &&
                            handleToggleJobStatus(job._id, job.status)
                          }
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-gray-400">
                          <span className="font-medium text-white">Recherche :</span> {job.looking_for_profile}
                        </p>
                        <p className="text-gray-400">
                          <span className="font-medium text-white">Expérience :</span> {job.required_experience}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.required_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-400">
                          <span className="font-medium text-white">Candidats :</span> 
                          {Array.isArray(job.applicants) ? job.applicants.length : job.applicants || 0}
                        </p>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleViewApplicants(job)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-1"
                        >
                          <Users className="h-4 w-4" />
                          Voir les candidats
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <p className="text-gray-400">Aucune offre d’emploi ne correspond à votre recherche.</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                  >
                    Effacer la recherche
                  </button>
                </div>
              )}
            </div>

            <div className="lg:w-1/3">
              <div className="bg-gray-800 p-6 rounded-lg shadow sticky top-32">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Briefcase className="mr-2" /> {isEditingJob ? 'Edit Job' : 'Post a New Job'}
                </h2>
                <form onSubmit={handlePostJob}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="job_title" className="block text-sm font-medium mb-1">Intitulé du poste</label>
                      <input
                        id="job_title"
                        type="text"
                        name="job_title"
                        placeholder="e.g. Frontend Developer"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.job_title}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="salary" className="block text-sm font-medium mb-1">Fourchette salariale</label>
                      <input
                        id="salary"
                        type="text"
                        name="salary"
                        placeholder="e.g. $70,000 - $90,000"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.salary}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="looking_for_profile" className="block text-sm font-medium mb-1">Description du profil</label>
                      <input
                        id="looking_for_profile"
                        type="text"
                        name="looking_for_profile"
                        placeholder="What type of candidate are you looking for?"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.looking_for_profile}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="required_experience" className="block text-sm font-medium mb-1">Experience Level</label>
                      <input
                        id="required_experience"
                        type="text"
                        name="required_experience"
                        placeholder="e.g. 3+ years of experience"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.required_experience}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="required_skills" className="block text-sm font-medium mb-1">Compétences requises</label>
                      <textarea
                        id="required_skills"
                        name="required_skills"
                        rows={3}
                        placeholder="List required skills separated by commas"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.required_skills}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>

                    {isPostingJob && (
                      <div className="text-purple-400 text-sm mb-2">Publication de l’offre d’emploi...</div>
                    )}
                    {postJobError && (
                      <div className="text-red-400 text-sm mb-2">{postJobError}</div>
                    )}
                    {postJobSuccess && (
                      <div className="text-green-400 text-sm mb-2">
                        Job {isEditingJob ? 'updated' : 'posted'} avec succès !
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPostingJob}
                      className={`w-full px-4 py-2 rounded text-white font-medium transition flex items-center justify-center ${isPostingJob
                        ? 'bg-purple-700 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500'
                        }`}
                    >
                      {isPostingJob ? 'Posting...' : isEditingJob ? 'Update Job' : 'Post Job Opening'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showApplicantsModal && (
          <ApplicantsModal
            applicants={selectedJobApplicants}
            companyVerified={!!companyInfo?.verified}
            verificationPending={verificationPending}
            onClose={() => setShowApplicantsModal(false)}
          />
        )}
      </main>
    </div>
  );
}

export default CompanyDashboard;