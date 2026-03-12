import React from 'react';
import { Link } from 'react-router-dom';

const ArtistShopContact = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            Artist & Shop Accounts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Artist and shop accounts are created by invitation only.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            To request an artist or shop account, please send an email to:
          </p>
          <a
            href="mailto:jordonkindred@gmail.com"
            className="block text-xl font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            jordonkindred@gmail.com
          </a>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Include your name, portfolio link, and a brief description of your work. Once approved, you'll receive a private sign-up link.
          </p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Looking to explore tattoo art?{' '}
          <Link to="/signup" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
            Sign up as an enthusiast
          </Link>{' '}
          or{' '}
          <Link to="/search" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
            browse artists
          </Link>
          .
        </div>
      </div>
    </div>
  );
};

export default ArtistShopContact;
