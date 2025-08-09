import React, { useState } from "react";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

const CreateTournamentForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    match_start_time: "",
    joining_fee: "",
    prize_first_pct: "50", // Default 50%
    prize_second_pct: "30", // Default 30%
    prize_third_pct: "20", // Default 20%
    party_join_time: "",
    capacity: "16", // Default 16 participants
    host_percentage: "5", // Default 5% for host
    platform: "pc", // Default to PC
    region: "eu", // Default to EU
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [userTimezone, setUserTimezone] = useState("");
  const { user } = useAuth();

  // Detect user's timezone on component mount
  React.useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
  }, []);

  // Check and clear match start time if it becomes invalid (less than 15 minutes from now)
  React.useEffect(() => {
    if (!formData.match_start_time) return;

    const checkTimeValidity = () => {
      const selectedTime = new Date(formData.match_start_time);
      const currentTime = new Date();
      const minTime = new Date(currentTime.getTime() + 15 * 60 * 1000); // 15 minutes from now

      if (selectedTime < minTime) {
        // Clear the match start time and party join time if it's now invalid
        setFormData((prev) => ({
          ...prev,
          match_start_time: "",
          party_join_time: "",
        }));

        // Show a warning to the user
        setErrors((prev) => ({
          ...prev,
          match_start_time:
            "Selected time has passed. Please select a new time at least 15 minutes from now.",
        }));
      }
    };

    // Check immediately
    checkTimeValidity();

    // Set up interval to check every minute
    const interval = setInterval(checkTimeValidity, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [formData.match_start_time]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent host percentage from exceeding 15
    if (name === "host_percentage") {
      const numValue = parseFloat(value);
      if (numValue > 15) {
        return; // Don't update the value if it exceeds 15
      }
    }

    // Prevent match start time from being less than 15 minutes from now
    if (name === "match_start_time" && value) {
      const selectedTime = new Date(value);
      const minTime = new Date(Date.now() + 15 * 60 * 1000);
      if (selectedTime < minTime) {
        return; // Don't update the value if it's too early
      }
    }

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Automatically calculate party join time when match start time changes
      if (name === "match_start_time" && value) {
        const matchStartTime = new Date(value);
        const partyJoinTime = new Date(
          matchStartTime.getTime() - 10 * 60 * 1000
        ); // 10 minutes before

        // Format the date properly for datetime-local input (YYYY-MM-DDTHH:MM)
        const year = partyJoinTime.getFullYear();
        const month = String(partyJoinTime.getMonth() + 1).padStart(2, "0");
        const day = String(partyJoinTime.getDate()).padStart(2, "0");
        const hours = String(partyJoinTime.getHours()).padStart(2, "0");
        const minutes = String(partyJoinTime.getMinutes()).padStart(2, "0");

        newData.party_join_time = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      return newData;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Calculate remaining percentage for dynamic validation
  const getRemainingPercentage = (excludeField) => {
    const { prize_first_pct, prize_second_pct, prize_third_pct } = formData;
    let total = 0;

    if (excludeField !== "prize_first_pct" && prize_first_pct) {
      total += parseFloat(prize_first_pct);
    }
    if (excludeField !== "prize_second_pct" && prize_second_pct) {
      total += parseFloat(prize_second_pct);
    }
    if (excludeField !== "prize_third_pct" && prize_third_pct) {
      total += parseFloat(prize_third_pct);
    }

    return Math.max(0, 100 - total);
  };

  // Get max value for each percentage field
  const getMaxPercentage = (fieldName) => {
    const remaining = getRemainingPercentage(fieldName);
    const currentValue = parseFloat(formData[fieldName] || 0);
    return remaining + currentValue;
  };

  // Get available percentage for each field (what you can still add)
  const getAvailablePercentage = (fieldName) => {
    const total = getTotalPercentage();
    const currentValue = parseFloat(formData[fieldName] || 0);

    // If total is already 100%, no more available
    if (total >= 100) {
      return 0;
    }

    // Available is the remaining percentage
    return 100 - total + currentValue;
  };

  // Get available host percentage (max 15%)
  const getAvailableHostPercentage = () => {
    const currentValue = parseFloat(formData.host_percentage || 0);
    return Math.max(0, 15 - currentValue);
  };

  // Get minimum allowed time (15 minutes from now)
  const getMinTime = () => {
    const minTime = new Date(Date.now() + 15 * 60 * 1000);
    return minTime.toISOString().slice(0, 16);
  };

  // Calculate total percentage
  const getTotalPercentage = () => {
    const { prize_first_pct, prize_second_pct, prize_third_pct } = formData;
    return (
      parseFloat(prize_first_pct || 0) +
      parseFloat(prize_second_pct || 0) +
      parseFloat(prize_third_pct || 0)
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Tournament name is required";
    }

    if (!formData.match_start_time) {
      newErrors.match_start_time = "Match start time is required";
    } else {
      // Check if match start time is at least 15 minutes from now
      const matchStartTime = new Date(formData.match_start_time);
      const currentTime = new Date();
      const minTime = new Date(currentTime.getTime() + 15 * 60 * 1000); // 15 minutes from now

      if (matchStartTime < minTime) {
        newErrors.match_start_time =
          "Match start time must be at least 15 minutes from now";
      }
    }

    if (!formData.joining_fee || formData.joining_fee < 0) {
      newErrors.joining_fee = "Valid joining fee is required";
    }

    if (
      !formData.prize_first_pct ||
      formData.prize_first_pct < 0 ||
      formData.prize_first_pct > 100
    ) {
      newErrors.prize_first_pct =
        "First prize percentage must be between 0 and 100";
    }

    if (
      !formData.prize_second_pct ||
      formData.prize_second_pct < 0 ||
      formData.prize_second_pct > 100
    ) {
      newErrors.prize_second_pct =
        "Second prize percentage must be between 0 and 100";
    }

    if (
      !formData.prize_third_pct ||
      formData.prize_third_pct < 0 ||
      formData.prize_third_pct > 100
    ) {
      newErrors.prize_third_pct =
        "Third prize percentage must be between 0 and 100";
    }

    if (!formData.capacity || formData.capacity < 2) {
      newErrors.capacity = "Capacity must be at least 2 participants";
    }

    if (
      !formData.host_percentage ||
      formData.host_percentage < 0 ||
      formData.host_percentage > 15
    ) {
      newErrors.host_percentage = "Host percentage must be between 0 and 15";
    }

    if (!formData.platform) {
      newErrors.platform = "Platform is required";
    }

    if (!formData.region) {
      newErrors.region = "Region is required";
    }

    // Check if prize percentages sum to 100 or less
    const totalPercentage =
      parseFloat(formData.prize_first_pct || 0) +
      parseFloat(formData.prize_second_pct || 0) +
      parseFloat(formData.prize_third_pct || 0);

    if (totalPercentage > 100) {
      newErrors.prize_percentages =
        "Total prize percentages cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to create tournaments");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert string values to appropriate types and map to backend fields
      const tournamentData = {
        // Map our form fields to backend expected fields
        name: formData.name.trim(),

        // Map to correct Supabase column names
        capacity: parseInt(formData.capacity) || 16,
        joining_fee: parseFloat(formData.joining_fee) || 0,
        prize_first_pct: parseFloat(formData.prize_first_pct) || 50,
        prize_second_pct: parseFloat(formData.prize_second_pct) || 30,
        prize_third_pct: parseFloat(formData.prize_third_pct) || 20,
        host_percentage: parseFloat(formData.host_percentage) || 5,
        match_start_time: new Date(formData.match_start_time).toISOString(),
        party_join_time: new Date(formData.party_join_time).toISOString(),
        platform: formData.platform,
        region: formData.region,

        // Add host ID (user ID)
        host_id: user.id,
      };

      console.log("Creating tournament with data:", tournamentData);

      const response = await api.createTournament(tournamentData);

      alert("Tournament created successfully!");
      if (onSuccess) {
        onSuccess(response);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert(`Failed to create tournament: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-tournament-form">
      <div className="form-header">
        <h3>Create New Tournament</h3>
        <Button variant="secondary" onClick={onClose} type="button">
          ✕
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Tournament Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter tournament name"
              maxLength="100"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>
        </div>

        <div className="prize-pool-info">
          <div className="info-note">
            <h4>💰 Prize Pool Distribution</h4>
            <p>
              <strong>
                Participants are entitled to 70% of the prize pool
              </strong>{" "}
              from the joining fees. The winning percentages you set below are
              calculated from that 70% portion.
            </p>
            <ul>
              <li>
                🏆 <strong>70%</strong> - Distributed to winners based on your
                percentages
              </li>
              <li>
                🌐 <strong>15%</strong> - Platform fee (fixed)
              </li>
              <li>
                👑 <strong>Host percentage</strong> - Your cut (0-15%,
                adjustable)
              </li>
            </ul>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="match_start_time">Match Start Time *</label>
            <input
              type="datetime-local"
              id="match_start_time"
              name="match_start_time"
              value={formData.match_start_time}
              onChange={handleInputChange}
              min={getMinTime()}
            />
            {errors.match_start_time && (
              <span className="error-message">{errors.match_start_time}</span>
            )}
            {userTimezone && (
              <div className="timezone-info">Your timezone: {userTimezone}</div>
            )}
            <div className="input-hint">
              ⏰ Select a time at least 15 minutes from now
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="party_join_time">
              Party Join Time (Auto-calculated)
            </label>
            <input
              type="datetime-local"
              id="party_join_time"
              name="party_join_time"
              value={formData.party_join_time}
              disabled
              className="disabled-input"
            />
            <div className="input-hint">
              Automatically set to 10 minutes before match start
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="joining_fee">Joining Fee (Credits) *</label>
            <input
              type="number"
              id="joining_fee"
              name="joining_fee"
              value={formData.joining_fee}
              onChange={handleInputChange}
              placeholder="0"
              step="1"
              min="0"
            />
            {errors.joining_fee && (
              <span className="error-message">{errors.joining_fee}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="host_percentage">Host Percentage (%) *</label>
            <input
              type="number"
              id="host_percentage"
              name="host_percentage"
              value={formData.host_percentage}
              onChange={handleInputChange}
              placeholder="5"
              min="0"
              max="15"
              step="0.01"
            />

            {errors.host_percentage && (
              <span className="error-message">{errors.host_percentage}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prize_first_pct">
              First Prize Percentage (%) *
            </label>
            <input
              type="number"
              id="prize_first_pct"
              name="prize_first_pct"
              value={formData.prize_first_pct}
              onChange={handleInputChange}
              placeholder="50"
              min="0"
              max={getMaxPercentage("prize_first_pct")}
              step="0.01"
            />

            {errors.prize_first_pct && (
              <span className="error-message">{errors.prize_first_pct}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="prize_second_pct">
              Second Prize Percentage (%) *
            </label>
            <input
              type="number"
              id="prize_second_pct"
              name="prize_second_pct"
              value={formData.prize_second_pct}
              onChange={handleInputChange}
              placeholder="30"
              min="0"
              max={getMaxPercentage("prize_second_pct")}
              step="0.01"
            />

            {errors.prize_second_pct && (
              <span className="error-message">{errors.prize_second_pct}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prize_third_pct">
              Third Prize Percentage (%) *
            </label>
            <input
              type="number"
              id="prize_third_pct"
              name="prize_third_pct"
              value={formData.prize_third_pct}
              onChange={handleInputChange}
              placeholder="20"
              min="0"
              max={getMaxPercentage("prize_third_pct")}
              step="0.01"
            />

            {errors.prize_third_pct && (
              <span className="error-message">{errors.prize_third_pct}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Tournament Capacity *</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="16"
              min="2"
              max="128"
            />
            {errors.capacity && (
              <span className="error-message">{errors.capacity}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="platform">Platform *</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
            >
              <option value="pc">PC</option>
              <option value="console">Console</option>
            </select>
            {errors.platform && (
              <span className="error-message">{errors.platform}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="region">Region *</label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
            >
              <option value="eu">Europe (EU)</option>
              <option value="na">North America (NA)</option>
              <option value="latam">Latin America (LATAM)</option>
              <option value="br">Brazil (BR)</option>
              <option value="ap">Asia Pacific (AP)</option>
              <option value="kr">Korea (KR)</option>
            </select>
            {errors.region && (
              <span className="error-message">{errors.region}</span>
            )}
          </div>
        </div>

        <div className="total-percentage-display">
          <div className="total-info">
            <span className="total-label">Total Prize Percentages:</span>
            <span
              className={`total-value ${
                getTotalPercentage() > 100 ? "exceeded" : ""
              }`}
            >
              {getTotalPercentage().toFixed(1)}%
            </span>
            {getTotalPercentage() > 100 && (
              <span className="total-warning">⚠ Exceeds 100%</span>
            )}
          </div>
        </div>

        {errors.prize_percentages && (
          <div className="error-message global-error">
            {errors.prize_percentages}
          </div>
        )}

        <div className="form-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Tournament"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournamentForm;
