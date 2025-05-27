import React, { useState } from 'react';
import { User, Briefcase, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'companies'>('candidates');

  const candidateSteps = [
    {
      title: 'Create Your Profile',
      description: 'Sign up and build your professional profile with your skills, experience, and career preferences.',
      image: 'https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Skill Assessment',
      description: 'Take our tailored assessments to verify your skills and stand out to potential employers.',
      image: 'https://images.pexels.com/photos/8867431/pexels-photo-8867431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Receive Matches',
      description: 'Our AI algorithm will match you with jobs that align with your skills and career goals.',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Apply & Connect',
      description: 'Apply with one click and connect directly with companies interested in your profile.',
      image: 'https://images.pexels.com/photos/3205570/pexels-photo-3205570.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  const companySteps = [
    {
      title: 'Create Company Profile',
      description: 'Build your company profile highlighting your culture, benefits, and what makes you unique.',
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Post Job Opportunities',
      description: 'Create detailed job listings with required skills, experience, and other preferences.',
      image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Review Matched Candidates',
      description: 'Browse through pre-screened candidates that match your job requirements.',
      image: 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      title: 'Connect & Hire',
      description: 'Reach out to candidates, schedule interviews, and make hiring decisions with confidence.',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  const activeSteps = activeTab === 'candidates' ? candidateSteps : companySteps;

  return (
    <section id="how-it-works" className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple Process, Powerful Results
          </h2>
          <p className="text-xl text-gray-400">
            Our platform makes it easy for both candidates and companies to find their perfect match.
          </p>
          
          <div className="mt-8 inline-flex p-1 bg-gray-800 rounded-lg">
            <button
              className={`flex items-center px-5 py-2 rounded-md transition-all ${
                activeTab === 'candidates' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('candidates')}
            >
              <User className="h-5 w-5 mr-2" />
              For Candidates
            </button>
            <button
              className={`flex items-center px-5 py-2 rounded-md transition-all ${
                activeTab === 'companies' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('companies')}
            >
              <Briefcase className="h-5 w-5 mr-2" />
              For Companies
            </button>
          </div>
        </div>

        <div className="space-y-16 mt-8">
          {activeSteps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
            >
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </div>
                  <ArrowRight className="h-5 w-5 mx-3 text-purple-400" />
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                <p className="text-lg text-gray-400 mb-6">{step.description}</p>
              </div>
              
              <div className="flex-1 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-xl translate-x-2 translate-y-2"></div>
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="relative z-10 w-full h-64 md:h-80 object-cover rounded-xl shadow-xl shadow-purple-900/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;