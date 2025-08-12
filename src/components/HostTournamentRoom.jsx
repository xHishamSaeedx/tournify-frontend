import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import Button from "./Button";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import "./HostTournamentRoom.css";

// Participant Table Row Component
const ParticipantTableRow = ({ participant, index, formatJoinedDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPlayerName = () => {
    return (
      participant.playerDetails?.display_name ||
      participant.playerDetails?.username ||
      participant.user?.display_name ||
      participant.user?.username ||
      participant.display_name ||
      participant.username ||
      "Unknown Player"
    );
  };

  const getValorantId = () => {
    return participant.playerDetails?.valo_name &&
      participant.playerDetails?.valo_tag
      ? `${participant.playerDetails.valo_name}#${participant.playerDetails.valo_tag}`
      : participant.valo_name && participant.valo_tag
      ? `${participant.valo_name}#${participant.valo_tag}`
      : "Not set";
  };

  const getPlayerAvatar = () => {
    return (
      participant.playerDetails?.display_name?.charAt(0) ||
      participant.playerDetails?.username?.charAt(0) ||
      participant.user?.display_name?.charAt(0) ||
      participant.user?.username?.charAt(0) ||
      participant.display_name?.charAt(0) ||
      participant.username?.charAt(0) ||
      "?"
    );
  };

  const getPlayerDetails = () => {
    const details = participant.playerDetails || participant;
    return {
      username: details.username || "N/A",
      VPA: details.VPA || "Not set",
      platform: details.platform ? details.platform.toUpperCase() : "Not set",
      region: details.region ? details.region.toUpperCase() : "Not set",
      age: details.DOB
        ? `${
            new Date().getFullYear() - new Date(details.DOB).getFullYear()
          } years`
        : "Not set",
    };
  };

  return (
    <>
      <tr className="participant-row">
        <td className="participant-number">#{index + 1}</td>
        <td className="participant-info-cell">
          <div className="participant-info">
            <div className="participant-avatar-small">{getPlayerAvatar()}</div>
            <span className="participant-name">{getPlayerName()}</span>
          </div>
        </td>
        <td className="valorant-id-cell">
          <span className="valorant-id">{getValorantId()}</span>
        </td>
        <td className="joined-cell">
          <span className="joined-time">
            {formatJoinedDate(participant.joined_at)}
          </span>
        </td>
        <td className="status-cell">
          <span className="status-badge confirmed">✓ Confirmed</span>
        </td>
        <td className="details-cell">
          <button
            className="details-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="details-row">
          <td colSpan="6" className="details-content">
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Username:</span>
                <span className="detail-value">
                  {getPlayerDetails().username}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">VPA:</span>
                <span className="detail-value">{getPlayerDetails().VPA}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">
                  {getPlayerDetails().platform}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Region:</span>
                <span className="detail-value">
                  {getPlayerDetails().region}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{getPlayerDetails().age}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const HostTournamentRoom = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isHost, setIsHost] = useState(false);
  const [partyCode, setPartyCode] = useState("");
  const [updatingPartyCode, setUpdatingPartyCode] = useState(false);
  const [canEnterPartyCode, setCanEnterPartyCode] = useState(false);
  const [partyCodeTimeStatus, setPartyCodeTimeStatus] = useState("");

  useEffect(() => {
    if (user && tournamentId) {
      fetchTournamentDetails();
      fetchParticipants();
      checkHostStatus();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, tournamentId]);

  useEffect(() => {
    if (tournament?.match_start_time) {
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [tournament]);

  useEffect(() => {
    if (tournament?.party_join_time) {
      const timer = setInterval(checkPartyCodeTime, 1000);
      return () => clearInterval(timer);
    }
  }, [tournament]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getTournament(tournamentId);

      if (response.success) {
        console.log("Tournament data received:", response.data);
        console.log("Tournament fields check:", {
          name: response.data.name,
          prize_pool: response.data.prize_pool,
          capacity: response.data.capacity,
          joining_fee: response.data.joining_fee,
          region: response.data.region,
          platform: response.data.platform,
          match_map: response.data.match_map,
          host_percentage: response.data.host_percentage,
          host_contribution: response.data.host_contribution,
          party_join_time: response.data.party_join_time,
          match_result_time: response.data.match_result_time,
          created_at: response.data.created_at,
          party_code: response.data.party_code,
          prize_first_pct: response.data.prize_first_pct,
          prize_second_pct: response.data.prize_second_pct,
          prize_third_pct: response.data.prize_third_pct,
        });

        // Debug prize distribution
        console.log("Prize Distribution Debug:", {
          prize_pool: response.data.prize_pool,
          prize_first_pct: response.data.prize_first_pct,
          prize_second_pct: response.data.prize_second_pct,
          prize_third_pct: response.data.prize_third_pct,
          first_place_amount:
            response.data.prize_pool && response.data.prize_first_pct
              ? Math.floor(
                  response.data.prize_pool * response.data.prize_first_pct
                )
              : 0,
          second_place_amount:
            response.data.prize_pool && response.data.prize_second_pct
              ? Math.floor(
                  response.data.prize_pool * response.data.prize_second_pct
                )
              : 0,
          third_place_amount:
            response.data.prize_pool && response.data.prize_third_pct
              ? Math.floor(
                  response.data.prize_pool * response.data.prize_third_pct
                )
              : 0,
        });

        // Check if prize percentages are very small (indicating double division issue)
        const hasValidPercentages =
          response.data.prize_first_pct > 0.1 &&
          response.data.prize_second_pct > 0.1 &&
          response.data.prize_third_pct > 0.1;

        if (!hasValidPercentages && response.data.prize_pool) {
          console.log("Detected invalid prize percentages, using defaults");
          response.data.prize_first_pct = 0.5; // 50%
          response.data.prize_second_pct = 0.3; // 30%
          response.data.prize_third_pct = 0.2; // 20%
        }

        setTournament(response.data);
        setPartyCode(response.data.party_code || "");
      } else {
        setError("Failed to fetch tournament details");
      }
    } catch (err) {
      console.error("Error fetching tournament details:", err);
      setError("Failed to load tournament details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await api.getTournamentParticipants(tournamentId);
      if (response.success) {
        const participantsData = response.data || [];
        console.log("Raw participants data:", participantsData);

        // Fetch detailed player information for each participant
        const participantsWithDetails = await Promise.all(
          participantsData.map(async (participant) => {
            try {
              console.log("Fetching details for participant:", participant);

              // Check if participant already has user information embedded
              if (participant.user && participant.user.display_name) {
                console.log(
                  "Participant already has user info:",
                  participant.user
                );
                return {
                  ...participant,
                  playerDetails: participant.user,
                };
              }

              // Check if participant has display_name directly (might be a joined query result)
              if (participant.display_name || participant.username) {
                console.log("Participant has direct display info:", {
                  display_name: participant.display_name,
                  username: participant.username,
                });
                return {
                  ...participant,
                  playerDetails: {
                    display_name: participant.display_name,
                    username: participant.username,
                    valo_name: participant.valo_name,
                    valo_tag: participant.valo_tag,
                    VPA: participant.VPA,
                    platform: participant.platform,
                    region: participant.region,
                    DOB: participant.DOB,
                  },
                };
              }

              // Try different possible user ID fields - be more comprehensive
              let userId = null;

              // First, try to get user_id from the participant object
              if (participant.user_id) {
                userId = participant.user_id;
                console.log("Using participant.user_id:", userId);
              }
              // If not found, try to get it from nested user object
              else if (participant.user && participant.user.id) {
                userId = participant.user.id;
                console.log("Using participant.user.id:", userId);
              }
              // If not found, try to get it from the participant's id field
              else if (participant.id) {
                userId = participant.id;
                console.log("Using participant.id:", userId);
              }
              // If not found, try to get it from player_id field
              else if (participant.player_id) {
                userId = participant.player_id;
                console.log("Using participant.player_id:", userId);
              }

              console.log(
                "Final user ID to use:",
                userId,
                "for participant:",
                participant
              );

              if (!userId) {
                console.warn("No user ID found for participant:", participant);
                return {
                  ...participant,
                  playerDetails: null,
                };
              }

              // Get detailed player information
              const playerResponse = await api.getPlayer(userId);
              console.log("Player response for", userId, ":", playerResponse);
              if (playerResponse.success && playerResponse.data) {
                console.log(
                  "Successfully fetched player details:",
                  playerResponse.data
                );
                return {
                  ...participant,
                  playerDetails: playerResponse.data,
                };
              } else {
                console.warn(
                  "Failed to fetch player details for userId:",
                  userId,
                  "Response:",
                  playerResponse
                );
                return {
                  ...participant,
                  playerDetails: null,
                };
              }
            } catch (err) {
              console.error(
                `Error fetching player details for participant:`,
                err
              );
              return {
                ...participant,
                playerDetails: null,
              };
            }
          })
        );

        console.log(
          "Final participants with details:",
          participantsWithDetails
        );
        setParticipants(participantsWithDetails);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  };

  const checkHostStatus = async () => {
    try {
      // Check if current user is the host of this tournament
      const response = await api.getTournament(tournamentId);
      if (response.success) {
        const tournamentData = response.data;
        const currentUserId = user.player_id || user.id;
        // Check multiple possible host ID fields in the tournament data
        const hostId =
          tournamentData.host_id ||
          tournamentData.host?.id ||
          tournamentData.created_by;
        console.log("Checking host status:", {
          currentUserId,
          hostId,
          tournamentData: {
            host_id: tournamentData.host_id,
            host: tournamentData.host,
            created_by: tournamentData.created_by,
          },
        });
        setIsHost(currentUserId === hostId);
      }
    } catch (err) {
      console.error("Error checking host status:", err);
    }
  };

  const updateCountdown = () => {
    if (!tournament?.match_start_time) return;

    const now = new Date().getTime();
    const matchTime = new Date(tournament.match_start_time).getTime();
    const difference = matchTime - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const checkPartyCodeTime = () => {
    if (!tournament?.party_join_time) return;

    const now = new Date().getTime();
    const partyJoinTime = new Date(tournament.party_join_time).getTime();
    const difference = partyJoinTime - now;
    const oneMinuteInMs = 60 * 1000; // 1 minute in milliseconds

    if (difference > 0 && difference <= oneMinuteInMs) {
      setCanEnterPartyCode(true);
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setPartyCodeTimeStatus(
        `Party code entry available! ${minutes}:${seconds
          .toString()
          .padStart(2, "0")} remaining`
      );
    } else if (difference <= 0) {
      setCanEnterPartyCode(false);
      setPartyCodeTimeStatus("Party join time has passed");
    } else {
      setCanEnterPartyCode(false);
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setPartyCodeTimeStatus(
        `Party code entry will be available in ${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const getCountdownStatus = () => {
    const totalSeconds =
      timeLeft.days * 86400 +
      timeLeft.hours * 3600 +
      timeLeft.minutes * 60 +
      timeLeft.seconds;

    if (totalSeconds <= 0) {
      return { status: "live", message: "Tournament is LIVE!", class: "live" };
    } else if (totalSeconds <= 300) {
      // 5 minutes
      return {
        status: "starting",
        message: "Starting Soon!",
        class: "starting",
      };
    } else if (totalSeconds <= 900) {
      // 15 minutes
      return { status: "preparing", message: "Get Ready!", class: "preparing" };
    } else {
      return {
        status: "waiting",
        message: "Tournament Starting",
        class: "waiting",
      };
    }
  };

  const handleUpdatePartyCode = async () => {
    if (!partyCode.trim()) {
      alert("Please enter a valid party code");
      return;
    }

    try {
      setUpdatingPartyCode(true);
      const response = await api.updateTournament(tournamentId, {
        party_code: partyCode.trim(),
      });

      if (response.success) {
        setTournament((prev) => ({ ...prev, party_code: partyCode.trim() }));
        alert(
          "Party code updated successfully! All participants will see this code."
        );
      } else {
        alert("Failed to update party code");
      }
    } catch (err) {
      console.error("Error updating party code:", err);
      alert("Failed to update party code. Please try again.");
    } finally {
      setUpdatingPartyCode(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const formatJoinedDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="host-tournament-room-page">
          <BackButton
            destination="/host-dashboard"
            buttonText="Back to Host Dashboard"
          />
          <div className="signin-prompt-container">
            <div className="signin-hero">
              <div className="signin-icon">🎯</div>
              <h2 className="signin-title">Sign In to View Tournament Room</h2>
              <p className="signin-subtitle">
                Access tournament management and participant information
              </p>
            </div>
            <div className="signin-actions">
              <button
                className="signin-btn primary"
                onClick={() => navigate("/login")}
              >
                <span className="btn-icon">🚀</span>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="host-tournament-room-page">
          <BackButton
            destination="/host-dashboard"
            buttonText="Back to Host Dashboard"
          />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tournament room...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="host-tournament-room-page">
          <BackButton
            destination="/host-dashboard"
            buttonText="Back to Host Dashboard"
          />
          <div className="error-container">
            <h2>Error Loading Tournament Room</h2>
            <p>{error}</p>
            <Button onClick={fetchTournamentDetails} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!tournament) {
    return (
      <>
        <Navbar />
        <div className="host-tournament-room-page">
          <BackButton
            destination="/host-dashboard"
            buttonText="Back to Host Dashboard"
          />
          <div className="error-container">
            <h2>Tournament Not Found</h2>
            <p>
              The tournament you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Button
              onClick={() => navigate("/host-dashboard")}
              variant="primary"
            >
              Back to Host Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!isHost) {
    return (
      <>
        <Navbar />
        <div className="host-tournament-room-page">
          <BackButton
            destination="/host-dashboard"
            buttonText="Back to Host Dashboard"
          />
          <div className="error-container">
            <h2>Access Denied</h2>
            <p>
              You are not the host of this tournament. Only the tournament host
              can access this page.
            </p>
            <Button
              onClick={() => navigate("/host-dashboard")}
              variant="primary"
            >
              Back to Host Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  const countdownStatus = getCountdownStatus();

  return (
    <>
      <Navbar />
      <div className="host-tournament-room-page">
        <BackButton
          destination="/host-dashboard"
          buttonText="Back to Host Dashboard"
        />

        <div className="host-tournament-room-container">
          {/* Header Section */}
          <div className="host-tournament-room-header">
            <div className="header-content">
              <div className="tournament-title-section">
                <h1 className="tournament-name">{tournament.name}</h1>
                <div className="tournament-meta">
                  <span className="host-info">
                    Hosted by:{" "}
                    {tournament.host?.display_name ||
                      tournament.host?.username ||
                      "You"}
                  </span>
                  <span className="tournament-id">
                    ID: {tournament.tournament_id}
                  </span>
                </div>
              </div>
              <div className="host-status">
                <span className="status-badge host">👑 Tournament Host</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer Section */}
          <div className={`countdown-section ${countdownStatus.class}`}>
            <div className="countdown-header">
              <h2 className="countdown-title">{countdownStatus.message}</h2>
              <div className="countdown-subtitle">
                {tournament.match_start_time &&
                  formatDateTime(tournament.match_start_time)}
              </div>
            </div>

            <div className="countdown-timer">
              <div className="timer-unit">
                <span className="timer-number">{timeLeft.days}</span>
                <span className="timer-label">Days</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-unit">
                <span className="timer-number">
                  {timeLeft.hours.toString().padStart(2, "0")}
                </span>
                <span className="timer-label">Hours</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-unit">
                <span className="timer-number">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                </span>
                <span className="timer-label">Minutes</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-unit">
                <span className="timer-number">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                </span>
                <span className="timer-label">Seconds</span>
              </div>
            </div>
          </div>

          {/* Party Code Management */}
          <div className="party-code-management-section">
            <div className="section-header">
              <h3>Party Code Management</h3>
              <div className="section-icon">🎮</div>
            </div>

            <div className="party-code-management-grid">
              <div className="party-code-card">
                <div className="card-header">
                  <span className="card-icon">🔗</span>
                  <span className="card-title">Party Code</span>
                </div>
                <div className="card-content">
                  <div className="party-code-time-status">
                    <span
                      className={`status-indicator ${
                        canEnterPartyCode ? "available" : "waiting"
                      }`}
                    >
                      {canEnterPartyCode ? "🟢" : "🟡"}
                    </span>
                    <span className="status-text">{partyCodeTimeStatus}</span>
                  </div>

                  {canEnterPartyCode ? (
                    <div className="party-code-input-section">
                      <input
                        type="text"
                        value={partyCode}
                        onChange={(e) => setPartyCode(e.target.value)}
                        placeholder="Enter party code for participants"
                        className="party-code-input"
                        maxLength={10}
                      />
                      <Button
                        variant="primary"
                        onClick={handleUpdatePartyCode}
                        disabled={updatingPartyCode || !partyCode.trim()}
                        className="update-btn"
                      >
                        {updatingPartyCode
                          ? "Updating..."
                          : "Update Party Code"}
                      </Button>
                    </div>
                  ) : (
                    <div className="party-code-disabled-section">
                      <div className="disabled-message">
                        <span className="disabled-icon">⏰</span>
                        <span className="disabled-text">
                          {tournament.party_join_time &&
                          new Date(tournament.party_join_time).getTime() <=
                            new Date().getTime()
                            ? "Party code is now available for joining"
                            : "Party code entry is only available 1 minute before the party join time"}
                        </span>
                      </div>
                      {tournament.party_code && (
                        <div className="current-party-code">
                          <span className="current-code-label">
                            Current Party Code:
                          </span>
                          <span className="current-code-value">
                            {tournament.party_code}
                          </span>
                          <button
                            className="copy-btn"
                            onClick={() =>
                              copyToClipboard(tournament.party_code)
                            }
                          >
                            📋 Copy
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="party-code-status">
                    {tournament.party_code ? (
                      <span className="status-available">Party Code Set</span>
                    ) : (
                      <span className="status-pending">No Party Code Set</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="tournament-stats-card">
                <div className="card-header">
                  <span className="card-icon">📊</span>
                  <span className="card-title">Tournament Stats</span>
                </div>
                <div className="card-content">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Participants</span>
                      <span className="stat-value">
                        {participants.length} / {tournament.capacity}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Fill Rate</span>
                      <span className="stat-value">
                        {Math.round(
                          (participants.length / tournament.capacity) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Prize Pool</span>
                      <span className="stat-value">
                        {tournament.prize_pool?.toLocaleString()} credits
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Entry Fee</span>
                      <span className="stat-value">
                        {tournament.joining_fee} credits
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Map Information */}
          <div className="map-information-section">
            <div className="section-header">
              <h3>Match Map Information</h3>
              <div className="section-icon">🗺️</div>
            </div>

            <div className="map-information-grid">
              <div className="map-info-card">
                <div className="card-header">
                  <span className="card-icon">🎯</span>
                  <span className="card-title">Match Map</span>
                </div>
                <div className="card-content">
                  <div className="map-display">
                    <div className="map-name">
                      {tournament.match_map ? (
                        <span className="map-selected">
                          {tournament.match_map}
                        </span>
                      ) : (
                        <span className="map-tbd">To Be Determined</span>
                      )}
                    </div>
                    <div className="map-status">
                      {tournament.match_map ? (
                        <span className="status-available">Map Confirmed</span>
                      ) : (
                        <span className="status-pending">Map Not Set</span>
                      )}
                    </div>
                  </div>
                  <div className="map-description">
                    {tournament.match_map ? (
                      <p>
                        This tournament will be played on{" "}
                        <strong>{tournament.match_map}</strong>.
                      </p>
                    ) : (
                      <p>
                        The match map will be determined before the tournament
                        starts.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Section */}
          <div className="participants-section">
            <div className="section-header">
              <h3>Tournament Participants</h3>
              <div className="section-icon">👥</div>
              <div className="participant-count">
                {participants.length} / {tournament.capacity} Players
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="no-participants">
                <div className="no-participants-icon">👥</div>
                <h4>No Participants Yet</h4>
                <p>Players will appear here once they join your tournament.</p>
              </div>
            ) : (
              <div className="participants-table-container">
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Valorant ID</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <ParticipantTableRow
                        key={
                          participant.user_id ||
                          participant.user?.id ||
                          participant.id ||
                          index
                        }
                        participant={participant}
                        index={index}
                        formatJoinedDate={formatJoinedDate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tournament Details */}
          <div className="tournament-details-section">
            <div className="section-header">
              <h3>Tournament Details</h3>
              <div className="section-icon">🏆</div>
            </div>

            <div className="details-grid">
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>💰</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Prize Pool
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.prize_pool
                      ? `${tournament.prize_pool.toLocaleString()} credits`
                      : "Not set"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>👥</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Capacity
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.capacity
                      ? `${tournament.capacity} Players`
                      : "Not set"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🎫</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Entry Fee
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                                {tournament.joining_fee
              ? `${tournament.joining_fee} credits`
              : "Free"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🌍</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Region
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.region || "Global"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🎮</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Platform
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.platform || "Any"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🗺️</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Match Map
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.match_map ? tournament.match_map : "TBD"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>👑</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Host Percentage
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.host_percentage
                      ? `${(tournament.host_percentage * 100).toFixed(1)}%`
                      : "0%"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>💸</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Host Contribution
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    ${tournament.host_contribution || 0}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Party Join Time
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.party_join_time
                      ? formatDateTime(tournament.party_join_time)
                      : "TBD"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>⏰</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Match Result Time
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.match_result_time
                      ? formatDateTime(tournament.match_result_time)
                      : "TBD"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Created
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.created_at &&
                      new Date(tournament.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🎯</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Game Type
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    Deathmatch
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prize Distribution */}
          <div className="prize-distribution-section">
            <div className="section-header">
              <h3>Prize Distribution</h3>
              <div className="section-icon">🏅</div>
            </div>

            <div className="prize-breakdown">
              <div className="prize-item first-place">
                <div className="place-badge">🥇</div>
                <div className="prize-info">
                  <div className="place">1st Place</div>
                  <div className="prize-amount">
                    $
                    {tournament.prize_pool && tournament.prize_first_pct
                      ? Math.floor(
                          tournament.prize_pool * tournament.prize_first_pct
                        ).toLocaleString()
                      : tournament.prize_pool
                      ? Math.floor(tournament.prize_pool * 0.5).toLocaleString()
                      : "0"}
                  </div>
                  <div className="prize-percentage">
                    {tournament.prize_first_pct
                      ? `${(tournament.prize_first_pct * 100).toFixed(0)}%`
                      : tournament.prize_pool
                      ? "50%"
                      : "0%"}
                  </div>
                </div>
              </div>

              <div className="prize-item second-place">
                <div className="place-badge">🥈</div>
                <div className="prize-info">
                  <div className="place">2nd Place</div>
                  <div className="prize-amount">
                    $
                    {tournament.prize_pool && tournament.prize_second_pct
                      ? Math.floor(
                          tournament.prize_pool * tournament.prize_second_pct
                        ).toLocaleString()
                      : tournament.prize_pool
                      ? Math.floor(tournament.prize_pool * 0.3).toLocaleString()
                      : "0"}
                  </div>
                  <div className="prize-percentage">
                    {tournament.prize_second_pct
                      ? `${(tournament.prize_second_pct * 100).toFixed(0)}%`
                      : tournament.prize_pool
                      ? "30%"
                      : "0%"}
                  </div>
                </div>
              </div>

              <div className="prize-item third-place">
                <div className="place-badge">🥉</div>
                <div className="prize-info">
                  <div className="place">3rd Place</div>
                  <div className="prize-amount">
                    $
                    {tournament.prize_pool && tournament.prize_third_pct
                      ? Math.floor(
                          tournament.prize_pool * tournament.prize_third_pct
                        ).toLocaleString()
                      : tournament.prize_pool
                      ? Math.floor(tournament.prize_pool * 0.2).toLocaleString()
                      : "0"}
                  </div>
                  <div className="prize-percentage">
                    {tournament.prize_third_pct
                      ? `${(tournament.prize_third_pct * 100).toFixed(0)}%`
                      : tournament.prize_pool
                      ? "20%"
                      : "0%"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Button
              variant="secondary"
              onClick={() => navigate("/host-dashboard")}
              className="back-btn"
            >
              <span className="button-icon">←</span>
              Back to Host Dashboard
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HostTournamentRoom;
