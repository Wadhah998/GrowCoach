import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'For Candidates', href: '#for-candidates' },
    { name: 'For Companies', href: '#for-companies' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/95 shadow-lg backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">GrowCoach</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="relative text-gray-300 hover:text-white transition-colors after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-purple-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 rounded-md text-white hover:text-purple-200 transition-colors">
                Sign In
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors">
                Sign Up
              </button>
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-gray-800 rounded-lg">
            <ul className="flex flex-col space-y-4 px-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 px-4 pt-4 border-t border-gray-700 flex flex-col space-y-3">
              <button className="w-full py-2 text-center text-white hover:text-purple-200 transition-colors">
                Sign In
              </button>
              <button className="w-full py-2 text-center bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;