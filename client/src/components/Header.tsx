import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/page_1.png';

const Header: React.FC = () => (
  <header className="relative z-20">
    {/* Gradient background with blur for glassy effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-blue-900/60 to-gray-900/80 backdrop-blur-md"></div>
    <div className="relative container mx-auto px-4 py-5 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
                   <img
              src={logo}
              alt="GrowCoach Logo"
              className="h-24 w-auto drop-shadow-lg" // h-24 = plus grand que h-14
            />
      </Link>
      <nav className="space-x-4 flex items-center">
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg font-medium text-gray-200 hover:text-white hover:bg-purple-700/30 transition"
        >
          Se connecter
        </Link>
<a
  href="#cta-section"
  className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:from-purple-700 hover:to-blue-600 transition"
>
  S'inscrire
</a>
      </nav>
    </div>
  </header>
);

export default Header;