import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import BackButton from "./BackButton";

// Import images for background
import jettImage from "/assets/jett.avif";
import kjImage from "/assets/kj.png";

// Global cache to prevent duplicate API calls across component instances
const playerCheckCache = new Map();

const PlayerForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [existingPlayer, setExistingPlayer] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    DOB: "",
    valo_id: "",
    VPA: "",
  });

  const backgroundImages = [jettImage, kjImage];

  // Background image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Check if player already exists when user is authenticated
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const checkExistingPlayer = async () => {
      if (user && isMounted) {
        const userId = user.id;
        
        // Check if we've already made a request for this user
        if (playerCheckCache.has(userId)) {
          console.log("🔄 Using cached player check for user:", userId);
          const cachedResult = playerCheckCache.get(userId);
          if (isMounted) {
            setExistingPlayer(cachedResult);
            if (cachedResult) {
              setFormData({
                display_name: cachedResult.display_name || "",
                username: cachedResult.username || "",
                DOB: cachedResult.DOB || "",
                valo_id: cachedResult.valo_id || "",
                VPA: cachedResult.VPA || "",
              });
            }
          }
          return;
        }

        // Mark that we're checking this user
        playerCheckCache.set(userId, null);
        
        try {
          console.log("🔍 Checking for existing player for user:", userId);
          const response = await api.getPlayer(userId);

          if (response.success && response.data && isMounted) {
            console.log("✅ Found existing player:", response.data.display_name);
            playerCheckCache.set(userId, response.data);
            setExistingPlayer(response.data);
            setFormData({
              display_name: response.data.display_name || "",
              username: response.data.username || "",
              DOB: response.data.DOB || "",
              valo_id: response.data.valo_id || "",
              VPA: response.data.VPA || "",
            });
          } else if (isMounted) {
            // Cache the null result to prevent future calls
            playerCheckCache.set(userId, null);
          }
        } catch (error) {
          // Player not found or other error - this is expected for new users
          console.log("No existing player found or error:", error.message);
          if (isMounted) {
            // Cache the null result to prevent future calls
            playerCheckCache.set(userId, null);
          }
        }
      }
    };

    // Add a small delay to handle React Strict Mode
    if (user) {
      setExistingPlayer(null);
      
      timeoutId = setTimeout(() => {
        if (isMounted) {
          checkExistingPlayer();
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please log in to submit player information");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const playerData = {
        player_id: user.id,
        display_name: formData.display_name.trim(),
        username: formData.username.trim(),
        DOB: formData.DOB,
        valo_id: formData.valo_id.trim(),
        VPA: formData.VPA.trim(),
      };

      let result;

      if (existingPlayer) {
        // Update existing player
        const response = await api.updatePlayer(user.id, playerData);

        if (!response.success) {
          throw new Error(response.error || "Failed to update player");
        }

        result = response.data;
        setMessage("Player information updated successfully!");
      } else {
        // Insert new player
        const response = await api.createPlayer(playerData);

        if (!response.success) {
          throw new Error(response.error || "Failed to create player");
        }

        result = response.data;
        setExistingPlayer(result);
        setMessage("Player information saved successfully!");
      }

      // Update form data with the returned data
      setFormData({
        display_name: result.display_name,
        username: result.username,
        DOB: result.DOB,
        valo_id: result.valo_id,
        VPA: result.VPA,
      });
    } catch (error) {
      console.error("Error saving player data:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="player-form-section">
        <div className="player-form-background">
          <div className="player-form-left"></div>
          <div className="player-form-right">
            <div className="slideshow-container">
              {backgroundImages.map((image, index) => (
                <div
                  key={index}
                  className={`slideshow-image ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  style={{ backgroundImage: `url(${image})` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="player-form-content">
          <div className="player-form-container">
            <BackButton />
            <div className="player-form-header">
              <h1 className="player-form-title">Player Registration</h1>
              <p className="player-form-subtitle">
                Please log in to register as a player and join the competitive
                Valorant community.
              </p>
            </div>
            <div className="player-form-cta">
              <button
                onClick={() => (window.location.href = "/login")}
                className="player-form-button primary"
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="player-form-section">
      <div className="player-form-background">
        <div className="player-form-left"></div>
        <div className="player-form-right">
          <div className="slideshow-container">
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className={`slideshow-image ${
                  index === currentImageIndex ? "active" : ""
                }`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="player-form-content">
        <div className="player-form-container">
          <BackButton />
          <div className="player-form-header">
            <h1 className="player-form-title">
              {existingPlayer
                ? "Update Player Profile"
                : "Join the Competition"}
            </h1>
            <p className="player-form-subtitle">
              {existingPlayer
                ? "Update your player information to keep your profile current."
                : "Complete your player registration to participate in Valorant tournaments."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="player-form">
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
                <label htmlFor="valo_id" className="form-label">
                  Valorant ID *
                </label>
                <input
                  type="text"
                  id="valo_id"
                  name="valo_id"
                  value={formData.valo_id}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Username#Tag"
                />
              </div>

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

            <button
              type="submit"
              disabled={loading}
              className="player-form-submit"
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Saving...
                </span>
              ) : existingPlayer ? (
                "Update Profile"
              ) : (
                "Register Player"
              )}
            </button>
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

          {existingPlayer && (
            <div className="existing-player-notice">
              <div className="notice-icon">✓</div>
              <div className="notice-content">
                <h3>Profile Found</h3>
                <p>
                  You already have a player profile. You can update your
                  information above.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PlayerForm;
