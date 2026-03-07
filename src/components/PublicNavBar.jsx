import React from 'react';
import { Link } from 'react-router-dom';

const PublicNavBar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div>
            <Link to="/" className="text-xl font-bold dark:text-white">InkSpace</Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex space-x-4">
            <Link to="/login" className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Log In
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavBar;