// src/components/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setUnverifiedEmail('');

    if (!username || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        navigate('/home');
      } else if (result.emailNotVerified) {
        setUnverifiedEmail(result.email || '');
        setFormError(error || 'Email not verified');
      } else {
        setFormError(error || 'Failed to log in');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      console.error(err);
    }

    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {unverifiedEmail ? (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 space-y-2">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Your email address hasn't been verified yet. Please check your inbox.
              </p>
              <Link
                to="/verify-email-sent"
                state={{ email: unverifiedEmail }}
                className="block text-sm font-medium text-yellow-700 dark:text-yellow-400 underline"
              >
                Resend verification email &rarr;
              </Link>
            </div>
          ) : (formError || error) ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{formError || error}</div>
            </div>
          ) : null}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-zinc-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-zinc-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
          
          {/* Demo account shortcuts */}
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">Demo accounts:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('user1');
                  setPassword('password123');
                }}
                className="py-1 px-2 text-xs border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Enthusiast
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('artist1');
                  setPassword('password123');
                }}
                className="py-1 px-2 text-xs border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Artist
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('shop1');
                  setPassword('password123');
                }}
                className="py-1 px-2 text-xs border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                Shop
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;