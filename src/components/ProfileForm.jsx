import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfilePictureUpload from "./ProfilePictureUpload";
import api from "../utils/api";
import "./ProfileForm.css";

const ProfileForm = ({ mode = "edit", onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    DOB: "",
    selected_game: "",
    valo_name: "",
    valo_tag: "",
    VPA: "",
    platform: "",
    region: "",
  });

  useEffect(() => {
    if (user && mode === "edit") {
      fetchData();
    }
  }, [user, mode]);

  const fetchData = async () => {
    try {
      // Fetch player data
      const playerResponse = await api.getPlayer(user.id);
      if (playerResponse.success) {
        setPlayerData(playerResponse.data);

        // Get Valorant data from the valorant_users array
        const valorantData =
          playerResponse.data.valorant_users &&
          playerResponse.data.valorant_users.length > 0
            ? playerResponse.data.valorant_users[0]
            : null;

        setFormData({
          display_name: playerResponse.data.display_name || "",
          username: playerResponse.data.username || "",
          DOB: playerResponse.data.DOB || "",
          selected_game: valorantData ? "valorant" : "",
          valo_name: valorantData?.valorant_name || "",
          valo_tag: valorantData?.valorant_tag || "",
          VPA: playerResponse.data.VPA || "",
          platform: valorantData?.platform || "",
          region: valorantData?.region || "",
        });
      }

      // Fetch user data for avatar
      const userResponse = await api.getUser(user.id);
      if (userResponse.success) {
        setUserData(userResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error loading profile data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureUpdate = (newAvatarUrl) => {
    setUserData(prev => ({
      ...prev,
      avatar_url: newAvatarUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const playerData = {
        player_id: user.id,
        display_name: formData.display_name.trim(),
        username: formData.username.trim(),
        DOB: formData.DOB,
        VPA: formData.VPA.trim(),
      };

      // Only include Valorant data if Valorant is selected and all fields are filled
      if (
        formData.selected_game === "valorant" &&
        formData.valo_name &&
        formData.valo_tag &&
        formData.platform &&
        formData.region
      ) {
        playerData.valo_name = formData.valo_name.trim();
        playerData.valo_tag = formData.valo_tag.trim();
        playerData.platform = formData.platform;
        playerData.region = formData.region;
      }

      let response;
      if (mode === "create") {
        response = await api.createPlayer(playerData);
      } else {
        response = await api.updatePlayer(user.id, playerData);
      }

      if (!response.success) {
        throw new Error(response.error || `Failed to ${mode} profile`);
      }

      setMessage(`${mode === "create" ? "Profile created" : "Profile updated"} successfully!`);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error(`Error ${mode}ing profile:`, error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-form-page">
      <div className="profile-form-container">
        <div className="profile-form-header">
          <div className="profile-form-avatar">
            {userData?.avatar_url ? (
              <img 
                src={userData.avatar_url} 
                alt="Profile picture" 
                className="profile-form-avatar-image"
              />
            ) : (
              getInitials(user?.email)
            )}
          </div>
          <div className="profile-form-info">
            <h1 className="profile-form-title">
              {mode === "create" ? "Create Profile" : "Edit Profile"}
            </h1>
            <p className="profile-form-subtitle">
              {mode === "create" 
                ? "Set up your gaming profile to get started" 
                : "Update your personal information and game details"
              }
            </p>
          </div>
        </div>

        <div className="profile-form-content">
          {/* Profile Picture Upload Section */}
          <ProfilePictureUpload 
            onUploadSuccess={handleProfilePictureUpdate}
            currentAvatarUrl={userData?.avatar_url}
            userId={user?.id}
          />

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="display_name" className="form-label">
                  Display Name *
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter your display name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="DOB" className="form-label">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="DOB"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="selected_game" className="form-label">
                  Select Game
                </label>
                <select
                  id="selected_game"
                  name="selected_game"
                  value={formData.selected_game}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select a game (optional)</option>
                  <option value="valorant">Valorant</option>
                </select>
              </div>

              {formData.selected_game === "valorant" && (
                <>
                  <div className="form-group">
                    <label htmlFor="valo_name" className="form-label">
                      Valorant Username *
                    </label>
                    <input
                      type="text"
                      id="valo_name"
                      name="valo_name"
                      value={formData.valo_name}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your Valorant username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="valo_tag" className="form-label">
                      Valorant Tag *
                    </label>
                    <input
                      type="text"
                      id="valo_tag"
                      name="valo_tag"
                      value={formData.valo_tag}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your Valorant tag (e.g., #NA1)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="platform" className="form-label">
                      Platform *
                    </label>
                    <select
                      id="platform"
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select Platform</option>
                      <option value="pc">PC</option>
                      <option value="console">Console</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="region" className="form-label">
                      Region *
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select Region</option>
                      <option value="eu">EU</option>
                      <option value="na">NA</option>
                      <option value="latam">LATAM</option>
                      <option value="br">BR</option>
                      <option value="ap">AP</option>
                      <option value="kr">KR</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group full-width">
                <label htmlFor="VPA" className="form-label">
                  VPA *
                </label>
                <input
                  type="text"
                  id="VPA"
                  name="VPA"
                  value={formData.VPA}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter your VPA"
                />
              </div>
            </div>

            <div className="form-actions">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </span>
                ) : (
                  mode === "create" ? "Create Profile" : "Update Profile"
                )}
              </button>
            </div>
          </form>

          {message && (
            <div
              className={`message ${
                message.includes("Error") ? "error" : "success"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
