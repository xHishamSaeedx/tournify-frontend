import React from "react";

// Button Component - Open/Closed Principle & Interface Segregation Principle
const Button = ({ 
  children, 
  variant = "primary", 
  onClick, 
  className = "", 
  type = "button",
  disabled = false 
}) => {
  const baseClass = "btn";
  const variantClass = `btn-${variant}`;
  const combinedClass = `${baseClass} ${variantClass} ${className}`.trim();

  return (
    <button
      className={combinedClass}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button; 