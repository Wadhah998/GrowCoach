import React from 'react';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const links = {
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Our Team', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
    ],
    platform: [
      { name: 'For Candidates', href: '#' },
      { name: 'For Companies', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Success Stories', href: '#' },
    ],
    resources: [
      { name: 'Blog', href: '#' },
      { name: 'Career Guides', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'Help Center', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR Compliance', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold text-white">GrowCoach</span>
            </a>
            <p className="mb-6 max-w-md">
              The intelligent career platform that connects candidates with their ideal jobs and companies with the perfect talent, using AI-powered matching.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-purple-500" />
                <a href="mailto:contact@growcoach.com" className="hover:text-white transition-colors">
                  contact@growcoach.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-purple-500" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-purple-500 flex-shrink-0 mt-1" />
                <address className="not-italic">
                  123 Innovation Drive, San Francisco, CA 94103, USA
                </address>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
            <ul className="space-y-4">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Platform</h3>
            <ul className="space-y-4">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Resources</h3>
            <ul className="space-y-4">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {currentYear} GrowCoach. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;