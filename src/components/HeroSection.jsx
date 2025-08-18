import React, { useState, useEffect } from "react";
import { HERO_STATS, HERO_CONTENT } from "../constants/data";
import Button from "./Button";

// Import images
import valoweb from "/assets/valoweb.png";
import valoweb1 from "/assets/valoweb1.png";
import valoweb2 from "/assets/valoweb2.png";
import valoweb3 from "/assets/valoweb3.png";
import valoweb4 from "/assets/valoweb4.png";
import valoweb5 from "/assets/valoweb5.png";
import valoweb6 from "/assets/valoweb6.png";
import valoweb7 from "/assets/valoweb7.png";
import valoweb8 from "/assets/valoweb8.png";

// Hero Section Component - Single Responsibility Principle
const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    valoweb,
    valoweb1,
    valoweb2,
    valoweb3,
    valoweb4,
    valoweb5,
    valoweb6,
    valoweb7,
    valoweb8,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleBrowseGames = () => {
    const gamesSection = document.getElementById("games");
    if (gamesSection) {
      gamesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

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
        <h1 className="hero-title">{HERO_CONTENT.title}</h1>
        <p className="hero-subtitle">{HERO_CONTENT.subtitle}</p>

        <div className="hero-buttons">
          <Button variant="primary" onClick={handleBrowseGames}>
            Browse Games
          </Button>
        </div>

        <div className="hero-stats">
          {HERO_STATS.map((stat, index) => (
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

export default HeroSection;
