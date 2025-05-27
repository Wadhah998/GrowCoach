import React, { useState } from 'react';
import { Search, User, LogOut, Briefcase, Settings, List, FileText, BookOpen } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface Candidate {
  id: number;
  firstName: string;
  skills: string[];
  education: string;
  experience: string;
}

interface JobPost {
  id: number;
  title: string;
  salary: string;
  profile: string;
  experience: string;
  skills: string;
  status: 'active' | 'draft';
}

const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: 'Alice',
    skills: ['React', 'TypeScript', 'TailwindCSS'],
    education: 'B.Sc. in Computer Science',
    experience: '2 years at Webify Inc.',
  },
  {
    id: 2,
    firstName: 'Bob',
    skills: ['Vue', 'JavaScript', 'SASS'],
    education: 'B.Eng. in Software Engineering',
    experience: '3 years at CodeWorks',
  },
];

const mockJobListings: JobPost[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    salary: '$90,000 - $120,000',
    profile: 'Experienced React developer',
    experience: '5+ years',
    skills: 'React, TypeScript, Redux',
    status: 'active'
  },
  {
    id: 2,
    title: 'UX Designer',
    salary: '$80,000 - $100,000',
    profile: 'Creative designer with Figma experience',
    experience: '3+ years',
    skills: 'Figma, UI/UX, Prototyping',
    status: 'active'
  }
];

const CompanyDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [jobPost, setJobPost] = useState<Omit<JobPost, 'id' | 'status'>>({
    title: '',
    salary: '',
    profile: '',
    experience: '',
    skills: '',
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');
  const [jobListings, setJobListings] = useState<JobPost[]>(mockJobListings);

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Logout failed');
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      
      navigate('/login', { 
        replace: true,
        state: { 
          logoutSuccess: true,
          message: 'You have been successfully logged out'
        }
      });

    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      setLogoutError(error instanceof Error ? error.message : 'Logout failed');
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobPost(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: JobPost = {
      id: jobListings.length + 1,
      ...jobPost,
      status: 'active'
    };
    setJobListings([...jobListings, newJob]);
    setJobPost({
      title: '',
      salary: '',
      profile: '',
      experience: '',
      skills: '',
    });
  };

  const filteredCandidates = mockCandidates.filter(candidate =>
    candidate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredJobs = jobListings.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold">GrowCoach</span>
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
                aria-label="Profile menu"
                aria-expanded={showProfileMenu}
              >
                <img
                  src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=100"
                  alt="Company Logo"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden md:inline">Admin</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/company/profile');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/company/settings');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
                  >
                    <Settings className="h-4 w-4" /> Settings
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

          {/* Tab Navigation with Search */}
          <div className="mt-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'candidates' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <User className="h-4 w-4" />
                Candidate Profiles
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'jobs' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
                My Job Listings
              </button>
            </div>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'candidates' 
                  ? "Search candidates..." 
                  : "Search jobs..."}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'candidates' ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Candidate List */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Available Candidates</h2>
                <span className="text-gray-400">
                  {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} found
                </span>
              </div>
              
              {filteredCandidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition transform hover:-translate-y-1">
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
                          {candidate.firstName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{candidate.firstName}</h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-400">
                              <span className="font-medium text-white">Education:</span> {candidate.education}
                            </p>
                            <p className="text-gray-400">
                              <span className="font-medium text-white">Experience:</span> {candidate.experience}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {candidate.skills.map((skill, idx) => (
                              <span 
                                key={idx} 
                                className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-500 transition"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition w-full">
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <p className="text-gray-400">No candidates found matching your search.</p>
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats Panel */}
            <div className="lg:w-1/3">
              <div className="bg-gray-800 p-6 rounded-lg shadow sticky top-32">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="mr-2" /> Quick Stats
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium">Total Candidates</h3>
                    <p className="text-2xl font-bold text-purple-500">{mockCandidates.length}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium">Active Job Listings</h3>
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
            {/* Job Listings */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Job Listings</h2>
                <span className="text-gray-400">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                </span>
              </div>
              
              {filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="bg-gray-800 p-6 rounded-lg shadow hover:bg-gray-700 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <p className="text-purple-400">{job.salary}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          job.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-gray-400">
                          <span className="font-medium text-white">Looking for:</span> {job.profile}
                        </p>
                        <p className="text-gray-400">
                          <span className="font-medium text-white">Experience:</span> {job.experience}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.skills.split(',').map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition">
                          Edit
                        </button>
                        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                          View Applicants
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <p className="text-gray-400">No job listings found matching your search.</p>
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="mt-4 px-4 py-2 text-purple-500 hover:text-purple-400"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Job Post Form */}
            <div className="lg:w-1/3">
              <div className="bg-gray-800 p-6 rounded-lg shadow sticky top-32">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Briefcase className="mr-2" /> Post a New Job
                </h2>
                <form onSubmit={handlePostJob}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-1">Job Title</label>
                      <input
                        id="title"
                        type="text"
                        name="title"
                        placeholder="e.g. Frontend Developer"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.title}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="salary" className="block text-sm font-medium mb-1">Salary Range</label>
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
                      <label htmlFor="profile" className="block text-sm font-medium mb-1">Profile Description</label>
                      <input
                        id="profile"
                        type="text"
                        name="profile"
                        placeholder="What type of candidate are you looking for?"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.profile}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium mb-1">Experience Level</label>
                      <input
                        id="experience"
                        type="text"
                        name="experience"
                        placeholder="e.g. 3+ years of experience"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.experience}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium mb-1">Required Skills</label>
                      <textarea
                        id="skills"
                        name="skills"
                        rows={3}
                        placeholder="List required skills separated by commas"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={jobPost.skills}
                        onChange={handleJobInputChange}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-medium transition flex items-center justify-center"
                    >
                      Post Job Opening
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyDashboard;