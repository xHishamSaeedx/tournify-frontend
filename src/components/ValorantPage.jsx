import React from "react";
import Navbar from "./Navbar";
import ValorantHeroSection from "./ValorantHeroSection";
import BackButton from "./BackButton";
import PlayerDashboard from "./PlayerDashboard";
import HostDashboard from "./HostDashboard";
import AdminDashboard from "./AdminDashboard";
import { useUserRoles } from "../contexts/UserRolesContext";
import { useAuth } from "../contexts/AuthContext";

const ValorantPage = () => {
  const { userRole, loading, isPlayer, isHost, isAdmin } = useUserRoles();
  const { user } = useAuth();

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
              <div className="dashboard-header">
                <h2>Welcome to Valorant Tournaments</h2>
                <p>Sign in to access your personalized dashboard</p>
              </div>
              <PlayerDashboard />
            </div>
          ) : isAdmin ? (
            <AdminDashboard />
          ) : isPlayer ? (
            <PlayerDashboard />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ValorantPage;
