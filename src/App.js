import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import SearchPage from './components/SearchPage';
import './styles.css';

function App() {
  return (
    <>
      <div className="test-style">
        This should be styled with blue background and white text
      </div>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<div className="p-8 text-center">Login page coming soon</div>} />
          <Route path="/signup" element={<div className="p-8 text-center">Signup page coming soon</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;