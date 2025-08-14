import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { setUserRole } from "../utils/userRoles";
import { useAuth } from "../contexts/AuthContext";
import ApplyHostForm from "./ApplyHostForm";

const PlayerDashboard = ({ game }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showHostForm, setShowHostForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Animated background effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;

      document.documentElement.style.setProperty("--mouse-x", `${x}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleBrowseTournaments = () => {
    navigate(`/${game}/browse-tournaments`);
  };

  const handleJoinedTournaments = () => {
    console.log(
      `My Tournaments button clicked - navigating to /${game}/my-tournaments`
    );
    console.log("Current user:", user);
    navigate(`/${game}/my-tournaments`);
  };

  const handleClaimMoney = () => {
    console.log("Claim money clicked");
  };

  const handleApplyForHost = () => {
    if (!user) {
      alert("Please sign in to apply for host role");
      return;
    }

    setShowHostForm(true);
  };

  const handleHostFormClose = () => {
    setShowHostForm(false);
  };

  const handleHostFormSuccess = (applicationData) => {
    console.log("Host application submitted:", applicationData);
    // You can add additional logic here, like showing a toast notification
  };

  // Get game-specific title
  const getGameTitle = () => {
    if (game === "valorant") {
      return "Valorant";
    }
    return "Tournament";
  };

  return (
    <div className="player-dashboard-ultra-modern">
      {/* Animated Background */}
      <div className="dashboard-bg-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Hero Section */}
      <section className="dashboard-hero-modern">
        <div className="hero-container">
          <div className="hero-content-modern">
            <div className="hero-badge">
              <span className="badge-icon">🎮</span>
              <span className="badge-text">Player Dashboard</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line">Your Gateway to</span>
              <span className="title-highlight">Tournament Excellence</span>
            </h1>
            <p className="hero-subtitle">
              Dominate the competition with cutting-edge tools and seamless
              tournament management
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">24</span>
                <span className="stat-label">Active Tournaments</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">$12.5K</span>
                <span className="stat-label">Total Winnings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">89%</span>
                <span className="stat-label">Win Rate</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-content">
                <div className="card-icon">🎯</div>
                <div className="card-title">Tournament Stats</div>
                <div className="card-value">24 Active</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-content">
                <div className="card-icon">💰</div>
                <div className="card-title">Total Earnings</div>
                <div className="card-value">$12.5K</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Sections */}
      <div className="dashboard-sections-container">
        {/* Quick Actions Section */}
        <section
          className="dashboard-section-ultra-modern"
          data-section="actions"
        >
          <div className="section-background-modern">
            <div className="section-pattern"></div>
            <div className="section-glow"></div>
          </div>
          <div className="section-content-modern">
            <div className="section-header-modern">
              <div className="section-icon-modern">
                <div className="icon-bg">⚡</div>
              </div>
              <div className="section-content-wrapper">
                <div className="section-text">
                  <h2 className="section-title">Quick Actions</h2>
                  <p className="section-description">
                    Access your most important features and tournament
                    management tools
                  </p>
                </div>
              </div>
            </div>
            <div className="actions-grid-modern">
              <div className="action-card-modern">
                <div className="action-icon-modern">
                  <div className="icon-bg">🔍</div>
                </div>
                <div className="action-content">
                  <h3>Browse Tournaments</h3>
                  <p>Find and join tournaments that match your skills</p>
                  <Button
                    variant="primary"
                    onClick={handleBrowseTournaments}
                    className="action-button"
                  >
                    <span className="button-text">Browse</span>
                    <span className="button-icon">🔍</span>
                  </Button>
                </div>
              </div>
              <div className="action-card-modern">
                <div className="action-icon-modern">
                  <div className="icon-bg">📋</div>
                </div>
                <div className="action-content">
                  <h3>My Tournaments</h3>
                  <p>View your joined tournaments and track progress</p>
                  <Button
                    variant="primary"
                    onClick={handleJoinedTournaments}
                    className="action-button"
                  >
                    <span className="button-text">View</span>
                    <span className="button-icon">📋</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Section */}
        <section
          className="dashboard-section-ultra-modern"
          data-section="earnings"
        >
          <div className="section-background-modern">
            <div className="section-pattern"></div>
            <div className="section-glow"></div>
          </div>
          <div className="section-content-modern">
            <div className="section-header-modern">
              <div className="section-icon-modern">
                <div className="icon-bg">💰</div>
              </div>
              <div className="section-content-wrapper">
                <div className="section-text">
                  <h2 className="section-title">Tournament Earnings</h2>
                  <p className="section-description">
                    Collect your tournament earnings instantly with secure
                    payment processing
                  </p>
                </div>
              </div>
            </div>
            <div className="claim-preview-modern">
              <div className="claim-card-modern">
                <div className="claim-header">
                  <div className="claim-icon">🏆</div>
                  <div className="claim-title">Tournament Victory</div>
                </div>
                <div className="claim-details">
                  <div className="claim-tournament">Weekly Valorant Cup</div>
                  <div className="claim-amount">$500</div>
                  <div className="claim-status">Ready to Claim</div>
                </div>
                <div className="claim-actions">
                  <Button
                    variant="primary"
                    onClick={handleClaimMoney}
                    className="claim-button"
                  >
                    <span className="button-text">Claim Now</span>
                    <span className="button-icon">💎</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Apply for Host Section */}
        <section
          className="dashboard-section-ultra-modern form-section"
          data-section="host"
        >
          <div className="section-background-modern">
            <div className="section-pattern"></div>
            <div className="section-glow"></div>
          </div>
          <div className="section-content-modern">
            <div className="section-header-modern">
              <div className="section-icon-modern">
                <div className="icon-bg">📝</div>
              </div>
              <div className="section-text">
                <h2 className="section-title">
                  Become a {getGameTitle()} Host
                </h2>
                <p className="section-description">
                  Create and manage your own {getGameTitle().toLowerCase()}{" "}
                  tournaments with professional tools
                </p>
              </div>
            </div>
            <div className="host-info-container-modern">
              <div className="host-benefits-simple">
                <div className="benefit-simple">
                  <span className="benefit-icon-simple">🎯</span>
                  <span>Create Tournaments</span>
                </div>
                <div className="benefit-simple">
                  <span className="benefit-icon-simple">💼</span>
                  <span>Earn Revenue</span>
                </div>
                <div className="benefit-simple">
                  <span className="benefit-icon-simple">👥</span>
                  <span>Build Community</span>
                </div>
              </div>
              <div className="host-cta-simple">
                <Button
                  variant="primary"
                  onClick={handleApplyForHost}
                  disabled={isSubmitting}
                  className="apply-button-modern"
                >
                  <span className="button-text">
                    {isSubmitting
                      ? "Redirecting..."
                      : `Apply to Become ${getGameTitle()} Host`}
                  </span>
                  <span className="button-icon">
                    {isSubmitting ? "⏳" : "🚀"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Host Application Form Modal */}
      {showHostForm && (
        <ApplyHostForm
          onClose={handleHostFormClose}
          onSuccess={handleHostFormSuccess}
          game={game}
        />
      )}
    </div>
  );
};

export default PlayerDashboard;
