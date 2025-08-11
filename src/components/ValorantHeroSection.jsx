import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { useUserRoles } from "../contexts/UserRolesContext";

// Import images
import omenImage from "/assets/yoru.avif";
import trioImage from "/assets/kj.png";
import vyseImage from "/assets/img1.webp";
import jettImage from "/assets/jett.png";
import jettImage2 from "/assets/jett.avif";

// Valorant Hero Section Component
const ValorantHeroSection = ({ onShowCreateForm }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isPlayer, isHost, isAdmin } = useUserRoles();
  const navigate = useNavigate();

  const images = [omenImage, trioImage, vyseImage, jettImage, jettImage2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const valorantStats = [
    { number: "342", label: "Active Tournaments" },
    { number: "15.2K", label: "Players Registered" },
    { number: "$45.8K", label: "Prize Pools" },
    { number: "99.2%", label: "Success Rate" },
  ];

  const handleBrowseTournaments = () => {
    navigate("/browse-tournaments");
  };

  const handleMyTournaments = () => {
    navigate("/my-tournaments");
  };

  const handleCreateTournament = () => {
    if (onShowCreateForm) {
      onShowCreateForm();
    } else {
      navigate("/host-dashboard");
    }
  };

  const handleMyCreatedTournaments = () => {
    navigate("/host-dashboard");
  };

  const handleCreateHosts = () => {
    navigate("/admin/manage-hosts");
  };

  const handleBrowseAllTournaments = () => {
    navigate("/browse-tournaments");
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
        <h1 className="hero-title">VALORANT</h1>
        <p className="hero-subtitle">
          The ultimate platform for organizing and participating in Valorant
          tournaments. Create, join, and dominate the competition with seamless
          tournament management.
        </p>

        {isPlayer && (
          <div className="hero-actions animate-fade-in-up">
            <Button
              variant="primary"
              onClick={handleBrowseTournaments}
              className="hero-button primary animate-slide-in-left"
            >
              <span className="button-text">Browse Tournaments</span>
              <span className="button-icon">🏆</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleMyTournaments}
              className="hero-button secondary animate-slide-in-right"
            >
              <span className="button-text">My Tournaments</span>
              <span className="button-icon">🎮</span>
            </Button>
          </div>
        )}

        {isHost && (
          <div className="hero-actions animate-fade-in-up">
            <Button
              variant="primary"
              onClick={handleCreateTournament}
              className="hero-button primary animate-slide-in-left"
            >
              <span className="button-text">Create Tournament</span>
              <span className="button-icon">⚡</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleMyCreatedTournaments}
              className="hero-button secondary animate-slide-in-right"
            >
              <span className="button-text">My Created Tournaments</span>
              <span className="button-icon">🏗️</span>
            </Button>
          </div>
        )}

        {isAdmin && (
          <div className="hero-actions animate-fade-in-up">
            <Button
              variant="primary"
              onClick={handleCreateHosts}
              className="hero-button primary animate-slide-in-left"
            >
              <span className="button-text">Create Hosts</span>
              <span className="button-icon">👑</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleBrowseAllTournaments}
              className="hero-button secondary animate-slide-in-right"
            >
              <span className="button-text">Browse All Tournaments</span>
              <span className="button-icon">📊</span>
            </Button>
          </div>
        )}

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
