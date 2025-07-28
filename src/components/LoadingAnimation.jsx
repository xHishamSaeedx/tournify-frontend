import React, { useEffect, useState } from "react";

const LoadingAnimation = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the animation after a short delay
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const strips = [
    { color: "#ff4655", delay: "0s" }, // Primary red
    { color: "#e63946", delay: "0.05s" }, // Slightly darker red
    { color: "#ff6b6b", delay: "0.1s" }, // Lighter red
    { color: "#d62828", delay: "0.15s" }, // Darker red
    { color: "#ff8a8a", delay: "0.2s" }, // Very light red
    { color: "#b91c1c", delay: "0.25s" }, // Deep red
  ];

  return (
    <div className="loading-animation">
      {strips.map((strip, index) => (
        <div
          key={index}
          className="loading-strip"
          style={{
            backgroundColor: strip.color,
            animationDelay: strip.delay,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingAnimation;
