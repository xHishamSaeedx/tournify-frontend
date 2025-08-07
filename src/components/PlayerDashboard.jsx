import React, { useState, useEffect } from "react";
import Button from "./Button";
import { setUserRole } from "../utils/userRoles";
import { useAuth } from "../contexts/AuthContext";

const PlayerDashboard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const { user } = useAuth();

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
    console.log("Browse tournaments clicked");
  };

  const handleJoinedTournaments = () => {
    console.log("Joined tournaments clicked");
  };

  const handleClaimMoney = () => {
    console.log("Claim money clicked");
  };

  const handleApplyForHost = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to apply for host role");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await setUserRole(user.id, user.email, "host");
      if (result.success) {
        alert(
          "Application submitted successfully! An admin will review your application."
        );
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } catch (error) {
      alert("Error submitting application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowCredits = () => {
    console.log("Show credits clicked");
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
                <div className="card-icon">🏆</div>
                <div className="card-title">Tournament Champion</div>
                <div className="card-value">$2,500</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-content">
                <div className="card-icon">⚡</div>
                <div className="card-title">Win Streak</div>
                <div className="card-value">7 Games</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Sections */}
      <div className="dashboard-sections-container">
        {/* Claim Money Section */}
        <section
          className="dashboard-section-ultra-modern claim-section"
          data-section="claim"
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
              <div className="section-text">
                <h2 className="section-title">Claim Your Winnings</h2>
                <p className="section-description">
                  Collect your tournament earnings instantly with secure payment
                  processing
                </p>
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
                <h2 className="section-title">Become a Host</h2>
                <p className="section-description">
                  Create and manage your own tournaments with professional tools
                </p>
              </div>
            </div>
            <div className="form-container-modern">
              <form onSubmit={handleApplyForHost} className="modern-form-ultra">
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label className="form-label">Experience Level</label>
                    <div className="select-wrapper">
                      <select required className="form-select">
                        <option value="">Select your experience</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                      </select>
                      <div className="select-arrow">▼</div>
                    </div>
                  </div>
                  <div className="form-group-modern">
                    <label className="form-label">Tournament Experience</label>
                    <textarea
                      placeholder="Describe your experience organizing tournaments..."
                      required
                      rows="4"
                      className="form-textarea"
                    ></textarea>
                  </div>
                </div>
                <div className="form-group-modern">
                  <label className="form-label">Motivation</label>
                  <textarea
                    placeholder="Why do you want to become a host?"
                    required
                    rows="4"
                    className="form-textarea"
                  ></textarea>
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-button-modern"
                >
                  <span className="button-text">
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </span>
                  <span className="button-icon">
                    {isSubmitting ? "⏳" : "📤"}
                  </span>
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Credits Section */}
        <section
          className="dashboard-section-ultra-modern credits-section"
          data-section="credits"
        >
          <div className="section-background-modern">
            <div className="section-pattern"></div>
            <div className="section-glow"></div>
          </div>
          <div className="section-content-modern">
            <div className="section-header-modern">
              <div className="section-icon-modern">
                <div className="icon-bg">💎</div>
              </div>
              <div className="section-text">
                <h2 className="section-title">Account Credits</h2>
                <p className="section-description">
                  Manage your credits and unlock premium tournament features
                </p>
              </div>
            </div>
            <div className="credits-preview-modern">
              <div className="credits-card-modern">
                <div className="credits-header">
                  <div className="credits-icon">💎</div>
                  <div className="credits-title">Current Balance</div>
                </div>
                <div className="credits-amount-modern">1,250</div>
                <div className="credits-label">Credits</div>
                <div className="credits-description">
                  Use credits to join premium tournaments and unlock special
                  features
                </div>
                <div className="credits-actions">
                  <Button
                    variant="primary"
                    onClick={handleShowCredits}
                    className="credits-button"
                  >
                    <span className="button-text">Manage Credits</span>
                    <span className="button-icon">⚙️</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlayerDashboard;
