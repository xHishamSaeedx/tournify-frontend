import React, { useState, useEffect } from "react";
import Button from "./Button";

// Import images
import omenImage from "/assets/yoru.avif";
import trioImage from "/assets/kj.png";
import vyseImage from "/assets/img1.webp";
import jettImage from "/assets/jett.png";
import jettImage2 from "/assets/jett.avif";

// Valorant Hero Section Component
const ValorantHeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [omenImage, trioImage, vyseImage, jettImage, jettImage2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleJoinTournaments = () => {
    // TODO: Navigate to Valorant tournaments page
    console.log("Join Valorant tournaments clicked");
  };

  const valorantStats = [
    { number: "342", label: "Active Tournaments" },
    { number: "15.2K", label: "Players Registered" },
    { number: "$45.8K", label: "Prize Pools" },
    { number: "99.2%", label: "Success Rate" },
  ];

  return (
    <section className="hero">
      {/* Diagonal cut background */}
      <div className="hero-background">
        <div className="hero-left"></div>
        <div className="hero-right">
          <div className="slideshow-container">
            {images.map((image, index) => (
              <div
                key={index}
                className={`slideshow-image ${
                  index === currentImageIndex ? "active" : ""
                }`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hero-content">
        <h1 className="hero-title">VALORANT</h1>
        <p className="hero-subtitle">
          The ultimate platform for organizing and participating in Valorant
          tournaments. Create, join, and dominate the competition with seamless
          tournament management.
        </p>

        <div className="hero-buttons">
          <Button variant="primary" onClick={handleJoinTournaments}>
            Join Tournaments
          </Button>
        </div>

        <div className="hero-stats">
          {valorantStats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValorantHeroSection;
