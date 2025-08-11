import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ValorantHeroSection from "./ValorantHeroSection";
import BackButton from "./BackButton";
import PlayerDashboard from "./PlayerDashboard";
import HostDashboard from "./HostDashboard";
import AdminDashboard from "./AdminDashboard";
import CreateTournamentForm from "./CreateTournamentForm";
import { useUserRoles } from "../contexts/UserRolesContext";
import { useAuth } from "../contexts/AuthContext";

const ValorantPage = () => {
  const { loading, isPlayer, isAdmin } = useUserRoles();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

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
        <ValorantHeroSection onShowCreateForm={() => setShowCreateForm(true)} />

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

      {/* Create Tournament Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div
            className="modal-content create-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateTournamentForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={(tournament) => {
                console.log("Tournament created:", tournament);
                setShowCreateForm(false);
                // Optionally refresh or redirect
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Debug: Log when ValorantPage renders with admin
console.log("🔍 ValorantPage - Rendering admin dashboard with game: valorant");

export default ValorantPage;
