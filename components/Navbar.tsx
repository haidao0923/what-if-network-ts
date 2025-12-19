import React from 'react';
import { BookOpen, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isContact = location.pathname === '/contact';

  return (
    <nav className="sticky top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link
            to="/"
            className="flex items-center cursor-pointer group"
          >
            <img
              src="../images/logo.png"
              alt="What If Network Logo"
              className="h-12 w-12 rounded-full border-2 border-primary mr-2 object-cover"
            />
            <span className="font-serif font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
              <span className="text-primary">W</span>hat <span className="text-primary">I</span>f <span className="text-primary">N</span>etwork
            </span>
          </Link>

          <div className="flex space-x-2">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isHome
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              Stories
            </Link>

            <Link
              to="/contact"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isContact
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="h-4 w-4 mr-1.5" />
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;