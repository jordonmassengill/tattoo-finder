import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BAY_AREA_CITIES } from '../constants/locations';
import ArtistStylesForm, { EMPTY_ARTIST_STYLES } from './ArtistStylesForm';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    bio: '',
    location: '',
    priceRange: '',
  });
  const [artistStyles, setArtistStyles] = useState(EMPTY_ARTIST_STYLES);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!userType) { setFormError('Please select an account type'); return false; }
    setFormError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all required fields');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setFormError('Username can only contain letters, numbers, and underscores (no spaces)');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep3 = () => { setFormError(''); return true; };


  const handleNext = () => {
    let isValid = false;
    switch (step) {
      case 1: isValid = validateStep1(); break;
      case 2: isValid = validateStep2(); break;
      case 3: isValid = validateStep3(); break;
      default: isValid = true;
    }
    if (isValid) setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== totalSteps) return; // guard against accidental submission on earlier steps
    setFormError('');

    setIsLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        userType,
        profilePic: '/api/placeholder/150/150',
      };

      if (userType === 'artist' || userType === 'shop') {
        userData.bio = formData.bio;
        userData.location = formData.location;
      }

      if (userType === 'artist') {
        Object.assign(userData, {
          priceRange: formData.priceRange,
          inkSpecialty: artistStyles.inkSpecialty,
          designSpecialty: artistStyles.designSpecialty,
          foundationalStyles: artistStyles.foundationalStyles,
          foundationalStyleSpecialties: artistStyles.foundationalStyleSpecialties,
          techniques: artistStyles.techniques,
          techniqueSpecialties: artistStyles.techniqueSpecialties,
          subjects: artistStyles.subjects,
          subjectSpecialties: artistStyles.subjectSpecialties,
        });
      }

      const success = await signup(userData);

      if (success) {
        navigate('/home');
      } else {
        setFormError(error || 'Failed to create account');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Select Account Type
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Choose Account Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'enthusiast', title: 'Tattoo Enthusiast', desc: 'Follow artists, save tattoo ideas, and book appointments.' },
          { type: 'artist', title: 'Tattoo Artist', desc: 'Showcase your work, gain followers, and manage appointments.' },
          { type: 'shop', title: 'Tattoo Shop', desc: 'Manage your shop, add artists, and showcase your collective work.' },
        ].map(({ type, title, desc }) => (
          <div
            key={type}
            className={`border rounded-lg p-6 cursor-pointer hover:border-blue-500 ${userType === type ? 'border-blue-500 bg-blue-50' : ''}`}
            onClick={() => setUserType(type)}
          >
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 2: Account Credentials
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Create Your Account</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">@</span>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
        </div>
      </div>
    </div>
  );

  // Step 3: Profile Details (artist / shop)
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
      <div className="space-y-4">
        {(userType === 'artist' || userType === 'shop') && (
          <>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea id="bio" name="bio" rows={3} value={formData.bio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <select id="location" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select a Location</option>
                {BAY_AREA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            {userType === 'artist' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {['$', '$$', '$$$', '$$$$'].map(price => (
                    <button key={price} type="button" onClick={() => setFormData({ ...formData, priceRange: formData.priceRange === price ? '' : price })} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.priceRange === price ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Step 4: Artist Specialties
  const renderStep4 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-1">Your Specialties</h2>
      <p className="text-sm text-gray-500 mb-5">
        This helps enthusiasts find the right artist. Specialties don't restrict what you can do — they just highlight where you shine.
      </p>
      <ArtistStylesForm value={artistStyles} onChange={setArtistStyles} />
    </div>
  );

  const totalSteps = userType === 'artist' ? 4 : 3;
  const isLastStep = step === totalSteps;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create Your InkSpace Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">log in to your existing account</Link>
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(formError || error) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{formError || error}</div>
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && userType === 'artist' && renderStep4()}

          <div className="flex justify-between">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Back
              </button>
            )}

            <div className={step === 1 ? 'ml-auto' : ''}>
              {!isLastStep ? (
                <button type="button" onClick={handleNext} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Next
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={isLoading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
