import React, { useEffect } from "react";
import Navbar from "./Navbar";
import ValorantHeroSection from "./ValorantHeroSection";
import BackButton from "./BackButton";
import PlayerDashboard from "./PlayerDashboard";
import HostDashboard from "./HostDashboard";
import AdminDashboard from "./AdminDashboard";
import { useUserRoles } from "../contexts/UserRolesContext";
import { useAuth } from "../contexts/AuthContext";

const ValorantPage = () => {
  const { loading, isPlayer, isAdmin } = useUserRoles();
  const { user } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="valorant-page">
          <BackButton />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="valorant-page">
        <BackButton />
        <ValorantHeroSection />

        {/* Role-based dashboard */}
        <div className="dashboard-section">
          {!user ? (
            <div className="guest-dashboard">
              <div className="signin-prompt-container">
                <div className="signin-hero">
                  <div className="signin-icon">🎯</div>
                  <h2 className="signin-title">Sign In to Play</h2>
                  <p className="signin-subtitle">
                    Join tournaments and compete with players worldwide
                  </p>
                </div>

                <div className="signin-actions">
                  <button
                    className="signin-btn primary"
                    onClick={() => (window.location.href = "/login")}
                  >
                    <span className="btn-icon">🚀</span>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          ) : isAdmin ? (
            <AdminDashboard game="valorant" />
          ) : isPlayer ? (
            <PlayerDashboard game="valorant" />
          ) : null}
        </div>
      </div>
    </>
  );
};

// Debug: Log when ValorantPage renders with admin
console.log("🔍 ValorantPage - Rendering admin dashboard with game: valorant");

export default ValorantPage;
