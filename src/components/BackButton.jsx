import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleBack}
      className={`back-button ${className}`}
      aria-label="Go back to home page"
    >
      <span className="back-icon">←</span>
      <span className="back-text">Back to Home</span>
    </button>
  );
};

export default BackButton; 