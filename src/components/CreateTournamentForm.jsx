import React, { useState } from "react";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

const CreateTournamentForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    match_start_time: "",
    joining_fee: "",
    first_prize_percentage: "",
    second_prize_percentage: "",
    third_prize_percentage: "",
    party_join_time: "",
    capacity: "",
    host_percentage: "5", // Default 5% for host
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
    const {
      first_prize_percentage,
      second_prize_percentage,
      third_prize_percentage,
    } = formData;
    let total = 0;

    if (excludeField !== "first_prize_percentage" && first_prize_percentage) {
      total += parseFloat(first_prize_percentage);
    }
    if (excludeField !== "second_prize_percentage" && second_prize_percentage) {
      total += parseFloat(second_prize_percentage);
    }
    if (excludeField !== "third_prize_percentage" && third_prize_percentage) {
      total += parseFloat(third_prize_percentage);
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
    const {
      first_prize_percentage,
      second_prize_percentage,
      third_prize_percentage,
    } = formData;
    return (
      parseFloat(first_prize_percentage || 0) +
      parseFloat(second_prize_percentage || 0) +
      parseFloat(third_prize_percentage || 0)
    );
  };

  const validateForm = () => {
    const newErrors = {};

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
      !formData.first_prize_percentage ||
      formData.first_prize_percentage < 0 ||
      formData.first_prize_percentage > 100
    ) {
      newErrors.first_prize_percentage =
        "First prize percentage must be between 0 and 100";
    }

    if (
      !formData.second_prize_percentage ||
      formData.second_prize_percentage < 0 ||
      formData.second_prize_percentage > 100
    ) {
      newErrors.second_prize_percentage =
        "Second prize percentage must be between 0 and 100";
    }

    if (
      !formData.third_prize_percentage ||
      formData.third_prize_percentage < 0 ||
      formData.third_prize_percentage > 100
    ) {
      newErrors.third_prize_percentage =
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

    // Check if prize percentages sum to 100 or less
    const totalPercentage =
      parseFloat(formData.first_prize_percentage || 0) +
      parseFloat(formData.second_prize_percentage || 0) +
      parseFloat(formData.third_prize_percentage || 0);

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
        name: `Tournament ${new Date().toISOString().slice(0, 10)}`, // Generate a name
        description: `Tournament with ${formData.capacity} participants, $${formData.joining_fee} entry fee`,
        start_date: new Date(formData.match_start_time).toISOString(),
        end_date: new Date(formData.party_join_time).toISOString(), // Using party_join_time as end_date for now
        max_participants: parseInt(formData.capacity),
        tournament_type: "valorant", // Default to valorant for now

        // Additional fields for our specific requirements
        joining_fee: parseFloat(formData.joining_fee),
        first_prize_percentage: parseFloat(formData.first_prize_percentage),
        second_prize_percentage: parseFloat(formData.second_prize_percentage),
        third_prize_percentage: parseFloat(formData.third_prize_percentage),
        host_percentage: parseFloat(formData.host_percentage),
        match_start_time: new Date(formData.match_start_time).toISOString(),
        party_join_time: new Date(formData.party_join_time).toISOString(),
        timezone: userTimezone, // Add timezone information

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
            <label htmlFor="first_prize_percentage">
              First Prize Percentage (%) *
            </label>
            <input
              type="number"
              id="first_prize_percentage"
              name="first_prize_percentage"
              value={formData.first_prize_percentage}
              onChange={handleInputChange}
              placeholder="50"
              min="0"
              max={getMaxPercentage("first_prize_percentage")}
              step="0.01"
            />

            {errors.first_prize_percentage && (
              <span className="error-message">
                {errors.first_prize_percentage}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="second_prize_percentage">
              Second Prize Percentage (%) *
            </label>
            <input
              type="number"
              id="second_prize_percentage"
              name="second_prize_percentage"
              value={formData.second_prize_percentage}
              onChange={handleInputChange}
              placeholder="30"
              min="0"
              max={getMaxPercentage("second_prize_percentage")}
              step="0.01"
            />

            {errors.second_prize_percentage && (
              <span className="error-message">
                {errors.second_prize_percentage}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="third_prize_percentage">
              Third Prize Percentage (%) *
            </label>
            <input
              type="number"
              id="third_prize_percentage"
              name="third_prize_percentage"
              value={formData.third_prize_percentage}
              onChange={handleInputChange}
              placeholder="20"
              min="0"
              max={getMaxPercentage("third_prize_percentage")}
              step="0.01"
            />

            {errors.third_prize_percentage && (
              <span className="error-message">
                {errors.third_prize_percentage}
              </span>
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
