import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialsSection from './components/TestimonialsSection';
import StatsSection from './components/StatsSection';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import CandidateSignup from './components/Candidate/CandidateSignup';
import CompanySignup from './components/Company/CompanySignup';
import Login from './components/Login';
import CandidateDashboard from './components/Candidate/CandidateDashboard';
import CandidateProfile from './components/Candidate/CandidateProfile';
import CompanyDashboard from './components/Company/CompanyDashboard';
import CompanyProfile from './components/Company/CompanyProfile';
import AdminDashboard from './components/Admin/AdminDashboard';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<CandidateSignup />} />
          <Route path="/company-signup" element={<CompanySignup />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/condidate-profile" element={<CandidateProfile />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
