import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const VerifyEmailSent = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  const emailSent = location.state?.emailSent !== false;

  const [resendStatus, setResendStatus] = useState('idle'); // idle | loading | success | error
  const [resendMessage, setResendMessage] = useState('');

  const handleResend = async () => {
    if (!email) return;
    setResendStatus('loading');
    setResendMessage('');
    try {
      const res = await api.resendVerification(email);
      setResendStatus('success');
      setResendMessage(res.data.message || 'Verification email resent!');
    } catch (err) {
      setResendStatus('error');
      setResendMessage(err.response?.data?.message || 'Failed to resend. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Envelope icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Check your email</h1>
          {email ? (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We sent a verification link to{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{email}</span>
            </p>
          ) : (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              A verification link has been sent to your email address.
            </p>
          )}
          {!emailSent && (
            <p className="mt-2 text-yellow-600 dark:text-yellow-400 text-sm">
              There was an issue sending the email. Please use the resend button below.
            </p>
          )}
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>
        </div>

        {/* Resend section */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Didn't receive it? Check your spam folder or resend.</p>

          {resendMessage && (
            <p className={`text-sm ${resendStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {resendMessage}
            </p>
          )}

          <button
            onClick={handleResend}
            disabled={resendStatus === 'loading' || resendStatus === 'success' || !email}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white rounded-md text-sm font-medium transition-colors"
          >
            {resendStatus === 'loading' ? 'Sending...' : resendStatus === 'success' ? 'Email sent!' : 'Resend verification email'}
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-500">
          <Link to="/login" className="text-blue-600 hover:text-blue-500">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailSent;
