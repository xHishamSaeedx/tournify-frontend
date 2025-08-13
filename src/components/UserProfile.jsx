import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import BackButton from "./BackButton";
import ProfilePictureUpload from "./ProfilePictureUpload";
import api from "../utils/api";

function UserProfile() {
  const { user, signOut } = useAuth();
  const [playerData, setPlayerData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch player data
          const playerResponse = await api.getPlayer(user.id);
          if (playerResponse.success) {
            setPlayerData(playerResponse.data);
          }

          // Fetch user data for avatar
          const userResponse = await api.getUser(user.id);
          if (userResponse.success) {
            setUserData(userResponse.data);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const handleProfilePictureUpdate = (newAvatarUrl) => {
    setUserData(prev => ({
      ...prev,
      avatar_url: newAvatarUrl
    }));
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <BackButton />
          <div className="profile-card">
            <div className="loading-spinner">
              <span className="spinner"></span>
              Loading profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <BackButton />
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {userData?.avatar_url ? (
                <img 
                  src={userData.avatar_url} 
                  alt="Profile picture" 
                  className="profile-avatar-image"
                />
              ) : (
                getInitials(user.email)
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {playerData?.display_name ||
                  user.user_metadata?.full_name ||
                  user.email}
              </h1>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">Player</p>
            </div>
          </div>

          {/* Profile Picture Upload Section */}
          <ProfilePictureUpload 
            onUploadSuccess={handleProfilePictureUpdate}
            currentAvatarUrl={userData?.avatar_url}
            userId={user.id}
          />

          {playerData && (
            <div className="profile-details">
              <div className="profile-detail-item">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{playerData.username}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Valorant ID:</span>
                <span className="detail-value">
                  {playerData.valo_name && playerData.valo_tag
                    ? `${playerData.valo_name}#${playerData.valo_tag}`
                    : "Not set"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">VPA:</span>
                <span className="detail-value">
                  {playerData.VPA || "Not set"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">
                  {playerData.platform
                    ? playerData.platform.toUpperCase()
                    : "Not set"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Region:</span>
                <span className="detail-value">
                  {playerData.region
                    ? playerData.region.toUpperCase()
                    : "Not set"}
                </span>
              </div>
            </div>
          )}

          <div className="profile-actions">
            <button onClick={handleSignOut} className="signout-button">
              <span className="signout-icon">🚪</span>
              <span className="signout-text">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
