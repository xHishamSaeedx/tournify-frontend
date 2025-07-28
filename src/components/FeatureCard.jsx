import React from "react";

// Feature Card Component - Single Responsibility Principle
// Interface Segregation Principle - Only receives the props it needs
const FeatureCard = ({ feature }) => {
  const { icon, title, description } = feature;

  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

export default FeatureCard; 