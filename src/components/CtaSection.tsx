import React from 'react';
import { User, Briefcase, ExternalLink } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="py-20 bg-gray-900 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-gradient-to-tr from-gray-800 to-gray-800/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-700 overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Perfect Match</span>?
              </h2>
              <p className="text-xl text-gray-300">
                Join thousands of candidates and companies already benefiting from our AI-powered matching platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mb-6">
                    <User className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">For Candidates</h3>
                  <p className="text-gray-400 mb-6">
                    Create your profile, showcase your skills, and get matched with your ideal job opportunities.
                  </p>
                  <a 
                    href="#" 
                    className="group flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg font-medium shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Create Candidate Profile
                    <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
              
              <div className="bg-gray-900/70 p-8 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mb-6">
                    <Briefcase className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">For Companies</h3>
                  <p className="text-gray-400 mb-6">
                    Post job opportunities and find pre-screened candidates that match your exact requirements.
                  </p>
                  <a 
                    href="#" 
                    className="group flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-medium shadow-lg shadow-blue-700/20 hover:shadow-blue-700/40 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Create Company Profile
                    <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;