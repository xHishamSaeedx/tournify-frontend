import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const GamesSection = () => {
  const navigate = useNavigate();
  const [hoveredGame, setHoveredGame] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("games");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const handleJoinTournaments = (gameName) => {
    if (gameName === "Valorant") {
      navigate("/valorant");
    }
  };

  const games = [
    {
      id: 1,
      name: "Valorant",
      tagline: "Tactical Precision",
      description:
        "Strategic 5v5 tactical shooter where precise aim meets calculated strategy",
      status: "Active",
      players: "15.2K",
      tournaments: "342",
      color: "#ff4655",
      gradient: "linear-gradient(135deg, #ff4655, #ff6b7a)",
      icon: "🎯",
      features: ["5v5 Tactical", "Agent Abilities", "Strategic Gameplay"],
    },
    {
      id: 2,
      name: "Free Fire",
      tagline: "Mobile Battle Royale",
      description:
        "Fast-paced mobile battle royale with intense 50-player matches",
      status: "Coming Soon",
      players: "8.7K",
      tournaments: "156",
      color: "#ff8c00",
      gradient: "linear-gradient(135deg, #ff8c00, #ffa726)",
      icon: "🔥",
      features: ["50 Players", "Mobile Optimized", "Quick Matches"],
    },
    {
      id: 3,
      name: "PUBG Mobile",
      tagline: "Battle Royale Elite",
      description:
        "The ultimate mobile battle royale experience with realistic combat",
      status: "Coming Soon",
      players: "12.1K",
      tournaments: "203",
      color: "#00f0ff",
      gradient: "linear-gradient(135deg, #00f0ff, #4fc3f7)",
      icon: "🎮",
      features: ["100 Players", "Realistic Combat", "Squad Play"],
    },
    {
      id: 4,
      name: "CS:GO",
      tagline: "Classic Tactical",
      description:
        "The legendary tactical shooter that defined competitive gaming",
      status: "Coming Soon",
      players: "9.8K",
      tournaments: "178",
      color: "#7cfc00",
      gradient: "linear-gradient(135deg, #7cfc00, #8bc34a)",
      icon: "🔫",
      features: ["5v5 Classic", "Bomb Defusal", "Tactical Maps"],
    },
  ];

  return (
    <section
      className={`games-section ${isVisible ? "visible" : ""}`}
      id="games"
    >
      <div className="games-background">
        <div className="games-grid-pattern"></div>
        <div className="games-glow-effect"></div>
      </div>

      <div className="games-container">
        <div className="games-header">
          <div className="section-badge">
            <span className="badge-icon">⚡</span>
            <span className="badge-text">Available Games</span>
          </div>
          <h2 className="games-title">
            Choose Your
            <span className="title-accent"> Battlefield</span>
          </h2>
          <p className="games-subtitle">
            Join competitive tournaments across multiple gaming universes
          </p>
        </div>

        <div className="games-showcase">
          {games.map((game, index) => (
            <div
              key={game.id}
              className={`game-card ${
                hoveredGame === game.id ? "hovered" : ""
              } ${game.status === "Active" ? "active" : "inactive"}`}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              style={{
                "--game-color": game.color,
                "--game-gradient": game.gradient,
                "--animation-delay": `${index * 0.1}s`,
              }}
            >
              <div className="game-card-background">
                <div className="game-card-glow"></div>
                <div className="game-card-pattern"></div>
              </div>

              <div className="game-content">
                <div className="game-header">
                  <div className="game-icon-container">
                    <div
                      className="game-icon"
                      style={{ background: game.gradient }}
                    >
                      {game.icon}
                    </div>
                    <div className="game-icon-glow"></div>
                  </div>

                  <div className="game-info">
                    <h3 className="game-name">{game.name}</h3>
                    <p className="game-tagline">{game.tagline}</p>
                    <div className="game-status-badge">
                      <span
                        className={`status-dot ${game.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      ></span>
                      <span className="status-text">{game.status}</span>
                    </div>
                  </div>
                </div>

                <p className="game-description">{game.description}</p>

                <div className="game-features">
                  {game.features.map((feature, idx) => (
                    <span key={idx} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="game-stats">
                  <div className="stat-item">
                    <span className="stat-value">{game.players}</span>
                    <span className="stat-label">Active Players</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-value">{game.tournaments}</span>
                    <span className="stat-label">Tournaments</span>
                  </div>
                </div>

                <Button
                  variant={game.status === "Active" ? "primary" : "secondary"}
                  className="game-action-button"
                  disabled={game.status !== "Active"}
                  onClick={() => handleJoinTournaments(game.name)}
                >
                  <span className="button-text">
                    {game.status === "Active" ? "Join Now" : "Coming Soon"}
                  </span>
                  {game.status === "Active" && (
                    <span className="button-arrow">→</span>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
