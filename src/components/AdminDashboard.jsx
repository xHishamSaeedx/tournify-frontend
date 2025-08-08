import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const AdminDashboard = () => {
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

  const handleManageHosts = () => {
    navigate('/admin/manage-hosts');
  };

  const handleManageTournaments = () => {
    console.log("Manage tournaments clicked");
  };

  return (
    <div className="admin-dashboard-ultra-modern">
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
              <span className="badge-icon">👑</span>
              <span className="badge-text">Admin Dashboard</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line">Platform</span>
              <span className="title-highlight">Administration</span>
            </h1>
            <p className="hero-subtitle">
              Manage hosts, tournaments, and platform operations with
              comprehensive administrative tools
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">15</span>
                <span className="stat-label">Active Hosts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">342</span>
                <span className="stat-label">Total Tournaments</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.8%</span>
                <span className="stat-label">Platform Uptime</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-content">
                <div className="card-icon">👑</div>
                <div className="card-title">Admin Control</div>
                <div className="card-value">Full Access</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-content">
                <div className="card-icon">⚡</div>
                <div className="card-title">Platform Stats</div>
                <div className="card-value">15.2K Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Sections */}
      <div className="dashboard-sections-container">
        {/* Manage Hosts Section */}
        <section
          className="dashboard-section-ultra-modern"
          data-section="hosts"
        >
          <div className="section-background-modern">
            <div className="section-pattern"></div>
            <div className="section-glow"></div>
          </div>
          <div className="section-content-modern">
            <div className="section-header-modern">
              <div className="section-icon-modern">
                <div className="icon-bg">👑</div>
              </div>
              <div className="section-content-wrapper">
                <div className="section-text">
                  <h2 className="section-title">Manage Hosts</h2>
                  <p className="section-description">
                    Create new hosts, manage existing host accounts, and oversee
                    tournament creation permissions
                  </p>
                </div>
                <div className="section-action">
                  <Button
                    variant="primary"
                    onClick={handleManageHosts}
                    className="section-button"
                  >
                    <span className="button-text">Manage Hosts</span>
                    <span className="button-icon">👑</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="section-features-modern">
              <div className="features-grid">
                <div className="feature-card-modern">
                  <div className="feature-icon-modern">
                    <div className="icon-bg">➕</div>
                  </div>
                  <div className="feature-content">
                    <h3>Create New Hosts</h3>
                    <p>
                      Promote users to host role with full tournament creation
                      privileges
                    </p>
                  </div>
                </div>
                <div className="feature-card-modern">
                  <div className="feature-icon-modern">
                    <div className="icon-bg">📊</div>
                  </div>
                  <div className="feature-content">
                    <h3>Host Analytics</h3>
                    <p>
                      Monitor host performance, tournament success rates, and
                      activity metrics
                    </p>
                  </div>
                </div>
                <div className="feature-card-modern">
                  <div className="feature-icon-modern">
                    <div className="icon-bg">🛡️</div>
                  </div>
                  <div className="feature-content">
                    <h3>Role Management</h3>
                    <p>Review, approve, or revoke host permissions as needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Manage Tournaments Section */}
        <section
          className="dashboard-section-ultra-modern"
          data-section="tournaments"
        >
          <div className="section-background-modern">
            <div className="section-pattern"></div>
            <div className="section-glow"></div>
          </div>
          <div className="section-content-modern">
            <div className="section-header-modern">
              <div className="section-icon-modern">
                <div className="icon-bg">🏆</div>
              </div>
              <div className="section-content-wrapper">
                <div className="section-text">
                  <h2 className="section-title">Manage Tournaments</h2>
                  <p className="section-description">
                    Oversee all tournaments, review submissions, and ensure
                    platform quality standards
                  </p>
                </div>
                <div className="section-action">
                  <Button
                    variant="primary"
                    onClick={handleManageTournaments}
                    className="section-button"
                  >
                    <span className="button-text">Manage Tournaments</span>
                    <span className="button-icon">🏆</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="section-features-modern">
              <div className="features-grid">
                <div className="feature-card-modern">
                  <div className="feature-icon-modern">
                    <div className="icon-bg">📋</div>
                  </div>
                  <div className="feature-content">
                    <h3>Tournament Review</h3>
                    <p>
                      Review and approve new tournament submissions from hosts
                    </p>
                  </div>
                </div>
                <div className="feature-card-modern">
                  <div className="feature-icon-modern">
                    <div className="icon-bg">📈</div>
                  </div>
                  <div className="feature-content">
                    <h3>Platform Analytics</h3>
                    <p>
                      Monitor tournament performance, user engagement, and
                      success metrics
                    </p>
                  </div>
                </div>
                <div className="feature-card-modern">
                  <div className="feature-icon-modern">
                    <div className="icon-bg">⚙️</div>
                  </div>
                  <div className="feature-content">
                    <h3>Quality Control</h3>
                    <p>
                      Ensure tournaments meet platform standards and guidelines
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
