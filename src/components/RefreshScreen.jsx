import React, { useEffect, useState } from "react";

const RefreshScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Start the sleek animation sequence
    const animationSequence = [
      () => setAnimationPhase(1), // Fade in
      () => setAnimationPhase(2), // Scale up
      () => setAnimationPhase(3), // Glow effect
      () => setAnimationPhase(4), // Final state
    ];

    let currentStep = 0;
    const animationInterval = setInterval(() => {
      if (currentStep < animationSequence.length) {
        animationSequence[currentStep]();
        currentStep++;
      } else {
        clearInterval(animationInterval);
        // Start fade out after animations complete
        setTimeout(() => {
          setIsVisible(false);
        }, 800);
      }
    }, 400);

    return () => clearInterval(animationInterval);
  }, []);

  if (!isVisible) return null;

  const getAnimationStyle = () => {
    switch (animationPhase) {
      case 1: // Fade in
        return {
          opacity: 1,
          transform: "scale(1)",
          textShadow: "0 0 20px rgba(255, 70, 85, 0.6)",
        };
      case 2: // Scale up
        return {
          opacity: 1,
          transform: "scale(1.1)",
          textShadow: "0 0 30px rgba(255, 70, 85, 0.8)",
        };
      case 3: // Glow effect
        return {
          opacity: 1,
          transform: "scale(1.05)",
          textShadow:
            "0 0 40px rgba(255, 70, 85, 1), 0 0 60px rgba(255, 70, 85, 0.4)",
        };
      case 4: // Final state
        return {
          opacity: 1,
          transform: "scale(1)",
          textShadow: "0 0 25px rgba(255, 70, 85, 0.7)",
        };
      default:
        return {
          opacity: 0,
          transform: "scale(0.8)",
        };
    }
  };

  return (
    <div className="refresh-screen">
      <div className="refresh-content">
        <h1 className="refresh-title" style={getAnimationStyle()}>
          TOURNIFY
        </h1>
      </div>
    </div>
  );
};

export default RefreshScreen;
