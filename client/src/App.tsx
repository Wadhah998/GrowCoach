import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CandidateSignup from './components/Candidate/CandidateSignup';
import CompanySignup from './components/Company/CompanySignup';
import Login from './components/Login';
import CandidateDashboard from './components/Candidate/CandidateDashboard';
import CandidateProfile from './components/Candidate/CandidateProfile';
import CompanyDashboard from './components/Company/CompanyDashboard';
import CompanyProfile from './components/Company/CompanyProfile';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<CandidateSignup />} />
          <Route path="/company-signup" element={<CompanySignup />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/condidate-profile" element={<CandidateProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
