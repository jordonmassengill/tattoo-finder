import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileImage from './ProfileImage';

const RequestsPage = () => {
  const { currentUser, userType } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.getPendingAffiliationRequests();
        setRequests(res.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const incomingRequests = requests.filter(
    r => r.to._id === currentUser?.id || r.to === currentUser?.id
  );
  const outgoingRequests = requests.filter(
    r => r.from._id === currentUser?.id || r.from === currentUser?.id
  );

  // Max affiliation logic
  // Artists: max 2 shops. Shops: max 12 artists.
  const currentCount = userType === 'artist'
    ? (currentUser?.shop ? (Array.isArray(currentUser.shop) ? currentUser.shop.length : 1) : 0)
    : (currentUser?.artists?.length || 0);
  const maxAffiliations = userType === 'artist' ? 2 : 12;
  const atMax = currentCount >= maxAffiliations;

  const profileLink = (user) => {
    if (user.userType === 'artist') return `/artist/${user.username}`;
    if (user.userType === 'shop') return `/shop/${user.username}`;
    return '/';
  };

  const handleAccept = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.acceptAffiliationRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      alert(error.response?.data?.message || 'Could not accept. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.declineAffiliationRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      alert(error.response?.data?.message || 'Could not decline. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.declineAffiliationRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      alert(error.response?.data?.message || 'Could not cancel. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="max-w-screen-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-3">Requests</h1>
        <p className="text-gray-500">You have no pending requests.</p>
      </div>
    );
  }

  const RequestCard = ({ req, isIncoming }) => {
    const otherUser = isIncoming
      ? (req.from._id === currentUser?.id ? req.to : req.from)
      : (req.to._id === currentUser?.id ? req.from : req.to);
    const isLoading = actionLoading === req._id;

    return (
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
        <Link to={profileLink(otherUser)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <ProfileImage user={otherUser} size="md" />
          </div>
          <div>
            <p className="font-medium">{otherUser.username}</p>
            <p className="text-xs text-gray-500 capitalize">{otherUser.userType}</p>
          </div>
        </Link>
        <div className="flex gap-2">
          {isIncoming ? (
            <>
              <button
                onClick={() => handleAccept(req._id)}
                disabled={isLoading || atMax}
                title={atMax ? `You've reached the max of ${maxAffiliations}` : undefined}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  atMax
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                }`}
              >
                {isLoading ? '...' : 'Accept'}
              </button>
              <button
                onClick={() => handleDecline(req._id)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoading ? '...' : 'Decline'}
              </button>
            </>
          ) : (
            <button
              onClick={() => handleCancel(req._id)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-screen-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Requests</h1>

      {incomingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-1 border-b">Requests for You</h2>
          <div className="flex flex-col gap-3">
            {incomingRequests.map(req => (
              <RequestCard key={req._id} req={req} isIncoming={true} />
            ))}
          </div>
          {atMax && (
            <p className="text-xs text-orange-600 mt-3">
              You're at the max ({maxAffiliations} {userType === 'artist' ? 'shops' : 'artists'}) — accept buttons are disabled until you remove an existing affiliation.
            </p>
          )}
        </section>
      )}

      {outgoingRequests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-1 border-b">Requests You Sent</h2>
          <div className="flex flex-col gap-3">
            {outgoingRequests.map(req => (
              <RequestCard key={req._id} req={req} isIncoming={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RequestsPage;
