import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyAndLogin } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.verifyEmail(token);
        verifyAndLogin(res.data.token, res.data.user);
        setStatus('success');
        setMessage(res.data.message || 'Email verified!');
        // Redirect to home after a brief moment
        setTimeout(() => navigate('/home'), 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Verifying your email…</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email verified!</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Redirecting you to your feed…</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verification failed</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            </div>
            <div className="space-y-2">
              <Link
                to="/verify-email-sent"
                className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Request a new link
              </Link>
              <Link
                to="/login"
                className="block text-sm text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
