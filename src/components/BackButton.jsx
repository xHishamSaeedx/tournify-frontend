import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = '', destination = '/', buttonText = 'Back to Home' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(destination);
  };

  return (
    <button
      onClick={handleBack}
      className={`back-button ${className}`}
      aria-label={`Go back to ${buttonText.toLowerCase()}`}
    >
      <span className="back-icon">←</span>
      <span className="back-text">{buttonText}</span>
    </button>
  );
};

export default BackButton; 