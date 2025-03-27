import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Hero Background Image */}
        <div className="absolute inset-0 bg-black">
          <img 
            src="/api/placeholder/1920/1080" 
            alt="Tattoo artwork showcase" 
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center">
            Find Your Perfect Tattoo Artist
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-12">
            Connect with talented tattoo artists, explore their work, and book your next tattoo session all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="bg-white text-black py-3 px-8 rounded-full font-semibold text-lg hover:bg-gray-200 transition duration-300 text-center">
              Log In
            </Link>
            <Link to="/signup" className="bg-transparent border-2 border-white py-3 px-8 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition duration-300 text-center">
              Sign Up
            </Link>
            <Link to="/search" className="bg-transparent border-2 border-white py-3 px-8 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition duration-300 text-center">
              Explore Artists
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-black text-white py-6 text-center">
        <p>© 2025 InkSpace - Find your perfect tattoo artist</p>
      </footer>
    </div>
  );
};

export default LandingPage;
