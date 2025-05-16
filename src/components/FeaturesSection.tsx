import React from 'react';
import { Sparkles, FileSearch, BarChart3, Zap, Users, Shield, TrendingUp, Lightbulb } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="group bg-gray-800/50 hover:bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-purple-900/50 group-hover:bg-purple-900 rounded-lg flex items-center justify-center mb-5 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-purple-400" />,
      title: 'AI Matching Algorithm',
      description: 'Our advanced matching system connects candidates to jobs based on skills, experience, and workplace preferences.'
    },
    {
      icon: <FileSearch className="h-6 w-6 text-purple-400" />,
      title: 'Skill Assessment',
      description: 'Evaluate your skills with our comprehensive assessment tools to improve job matching accuracy.'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
      title: 'Analytics Dashboard',
      description: 'Get detailed insights about application performance and improvement opportunities.'
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-400" />,
      title: 'Quick Apply',
      description: 'Apply to matched jobs with just one click, streamlining the application process.'
    },
    {
      icon: <Users className="h-6 w-6 text-purple-400" />,
      title: 'Talent Pool',
      description: 'Companies can build a pool of pre-screened candidates for future job openings.'
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-400" />,
      title: 'Privacy Controls',
      description: 'Control who sees your profile and what information is shared with employers.'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-400" />,
      title: 'Career Growth Path',
      description: 'Get personalized recommendations for skills to develop for your dream career.'
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-purple-400" />,
      title: 'Smart Recommendations',
      description: 'Receive job recommendations that align with your career goals and aspirations.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Everything You Need For Career Success
          </h2>
          <p className="text-xl text-gray-400">
            GrowCoach provides powerful features for both candidates and companies, creating perfect matches based on skills, experience, and culture fit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;