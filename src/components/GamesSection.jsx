import React from "react";
import Button from "./Button";

const GamesSection = () => {
  const games = [
    {
      id: 1,
      name: "Valorant",
      icon: "🎯",
      description: "Tactical shooter tournaments with strategic gameplay",
      status: "Active",
      players: "15.2K",
      tournaments: "342"
    },
    {
      id: 2,
      name: "Free Fire",
      icon: "🔥",
      description: "Battle royale tournaments for mobile gamers",
      status: "Coming Soon",
      players: "8.7K",
      tournaments: "156"
    },
    {
      id: 3,
      name: "PUBG Mobile",
      icon: "🎮",
      description: "Mobile battle royale competitive events",
      status: "Coming Soon",
      players: "12.1K",
      tournaments: "203"
    },
    {
      id: 4,
      name: "CS:GO",
      icon: "🔫",
      description: "Classic tactical shooter tournaments",
      status: "Coming Soon",
      players: "9.8K",
      tournaments: "178"
    }
  ];

  return (
    <section className="games-section" id="games">
      <div className="games-container">
        <div className="games-header">
          <h2 className="games-title">Available Games</h2>
          <p className="games-subtitle">
            Join tournaments across multiple popular games and compete with players worldwide
          </p>
        </div>

        <div className="games-grid">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-header">
                <div className="game-icon">{game.icon}</div>
                <div className="game-info">
                  <h3 className="game-name">{game.name}</h3>
                  <span className={`game-status ${game.status.toLowerCase().replace(' ', '-')}`}>
                    {game.status}
                  </span>
                </div>
              </div>
              
              <p className="game-description">{game.description}</p>
              
              <div className="game-stats">
                <div className="game-stat">
                  <span className="stat-label">Players</span>
                  <span className="stat-value">{game.players}</span>
                </div>
                <div className="game-stat">
                  <span className="stat-label">Tournaments</span>
                  <span className="stat-value">{game.tournaments}</span>
                </div>
              </div>

              <Button 
                variant={game.status === "Active" ? "primary" : "secondary"}
                className="game-button"
                disabled={game.status !== "Active"}
              >
                {game.status === "Active" ? "Join Tournaments" : "Coming Soon"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
