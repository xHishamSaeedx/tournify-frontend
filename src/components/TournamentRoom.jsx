import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import Button from "./Button";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import "./TournamentRoom.css";

const TournamentRoom = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isParticipant, setIsParticipant] = useState(false);
  const [partyCodeTimeStatus, setPartyCodeTimeStatus] = useState("");
  const [canSeePartyCode, setCanSeePartyCode] = useState(false);

  useEffect(() => {
    if (user && tournamentId) {
      fetchTournamentDetails();
      checkParticipationStatus();
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
        });
        setTournament(response.data);
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

  const checkParticipationStatus = async () => {
    try {
      const response = await api.getParticipationStatus(tournamentId);
      if (response.success) {
        setIsParticipant(response.data.isParticipant);
      }
    } catch (err) {
      console.error("Error checking participation status:", err);
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

    if (difference <= 0) {
      // Party join time has passed - show party code
      setCanSeePartyCode(true);
      setPartyCodeTimeStatus("Party code is now available!");
    } else if (difference <= oneMinuteInMs) {
      // Within 1 minute of party join time - show countdown but don't reveal code yet
      setCanSeePartyCode(false);
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setPartyCodeTimeStatus(
        `Party code will be available in ${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    } else {
      // More than 1 minute away - show countdown
      setCanSeePartyCode(false);
      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setPartyCodeTimeStatus(
        `Party code will be available in ${minutes}:${seconds
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    alert("Copied to clipboard!");
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="tournament-room-page">
          <BackButton
            destination="/my-tournaments"
            buttonText="Back to My Tournaments"
          />
          <div className="signin-prompt-container">
            <div className="signin-hero">
              <div className="signin-icon">🎯</div>
              <h2 className="signin-title">Sign In to View Tournament Room</h2>
              <p className="signin-subtitle">
                Access tournament details and match information
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
        <div className="tournament-room-page">
          <BackButton
            destination="/my-tournaments"
            buttonText="Back to My Tournaments"
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
        <div className="tournament-room-page">
          <BackButton
            destination="/my-tournaments"
            buttonText="Back to My Tournaments"
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
        <div className="tournament-room-page">
          <BackButton
            destination="/my-tournaments"
            buttonText="Back to My Tournaments"
          />
          <div className="error-container">
            <h2>Tournament Not Found</h2>
            <p>
              The tournament you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Button
              onClick={() => navigate("/my-tournaments")}
              variant="primary"
            >
              Back to My Tournaments
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
      <div className="tournament-room-page">
        <BackButton
          destination="/my-tournaments"
          buttonText="Back to My Tournaments"
        />

        <div className="tournament-room-container">
          {/* Header Section */}
          <div className="tournament-room-header">
            <div className="header-content">
              <div className="tournament-title-section">
                <h1 className="tournament-name">{tournament.name}</h1>
                <div className="tournament-meta">
                  <span className="host-info">
                    Hosted by:{" "}
                    {tournament.host?.display_name ||
                      tournament.host?.username ||
                      "Unknown Host"}
                  </span>
                  <span className="tournament-id">
                    ID: {tournament.tournament_id}
                  </span>
                </div>
              </div>
              <div className="participation-status">
                {isParticipant ? (
                  <span className="status-badge participant">
                    ✓ Participant
                  </span>
                ) : (
                  <span className="status-badge not-participant">
                    Not Participating
                  </span>
                )}
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

          {/* Match Room Information */}
          <div className="match-room-section">
            <div className="section-header">
              <h3>Match Room Information</h3>
              <div className="section-icon">🎮</div>
            </div>

            <div className="match-room-grid">
              <div className="match-room-card">
                <div className="card-header">
                  <span className="card-icon">🔗</span>
                  <span className="card-title">Party Code</span>
                </div>
                <div className="card-content">
                  <div className="party-code-time-status">
                    <span
                      className={`status-indicator ${
                        canSeePartyCode ? "available" : "waiting"
                      }`}
                    >
                      {canSeePartyCode ? "🟢" : "🟡"}
                    </span>
                    <span className="status-text">{partyCodeTimeStatus}</span>
                  </div>

                  <div className="room-id-display">
                    <span className="room-id">
                      {canSeePartyCode && tournament.party_code
                        ? tournament.party_code
                        : "TBD"}
                    </span>
                    {canSeePartyCode && tournament.party_code && (
                      <Button
                        variant="secondary"
                        onClick={() => copyToClipboard(tournament.party_code)}
                        className="copy-btn"
                      >
                        Copy
                      </Button>
                    )}
                  </div>
                  <div className="room-status">
                    {canSeePartyCode && tournament.party_code ? (
                      <span className="status-available">
                        Party Code Available
                      </span>
                    ) : canSeePartyCode ? (
                      <span className="status-pending">
                        Host will provide party code soon
                      </span>
                    ) : (
                      <span className="status-pending">Party Code Pending</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="match-room-card">
                <div className="card-header">
                  <span className="card-icon">🎯</span>
                  <span className="card-title">Game Type</span>
                </div>
                <div className="card-content">
                  <div className="game-type">Deathmatch</div>
                  <div className="game-details">5v5 Competitive</div>
                </div>
              </div>

              <div className="match-room-card">
                <div className="card-header">
                  <span className="card-icon">🌍</span>
                  <span className="card-title">Server Region</span>
                </div>
                <div className="card-content">
                  <div className="server-region">
                    {tournament.region || "Global"}
                  </div>
                  <div className="server-details">
                    Best connection for {tournament.region || "all"} players
                  </div>
                </div>
              </div>

              <div className="match-room-card">
                <div className="card-header">
                  <span className="card-icon">🎮</span>
                  <span className="card-title">Platform</span>
                </div>
                <div className="card-content">
                  <div className="platform">{tournament.platform || "Any"}</div>
                  <div className="platform-details">
                    Cross-platform supported
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
                        <span className="map-selected">{tournament.match_map}</span>
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
                      <p>This tournament will be played on <strong>{tournament.match_map}</strong>.</p>
                    ) : (
                      <p>The match map will be determined before the tournament starts.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
                      ? `$${tournament.prize_pool.toLocaleString()}`
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
                    Participants
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.current_players || 0} /{" "}
                    {tournament.capacity || "Not set"}
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
                      ? `$${tournament.joining_fee}`
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
                <div style={{ fontSize: "2rem" }}>⚡</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#b0b0b0",
                      fontSize: "0.9rem",
                      marginBottom: "5px",
                    }}
                  >
                    Match Format
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                    }}
                  >
                    5v5 Competitive
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
                    {Math.floor(
                      tournament.prize_pool * (tournament.prize_first_pct || 0)
                    ).toLocaleString()}
                  </div>
                  <div className="prize-percentage">
                    {((tournament.prize_first_pct || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="prize-item second-place">
                <div className="place-badge">🥈</div>
                <div className="prize-info">
                  <div className="place">2nd Place</div>
                  <div className="prize-amount">
                    $
                    {Math.floor(
                      tournament.prize_pool * (tournament.prize_second_pct || 0)
                    ).toLocaleString()}
                  </div>
                  <div className="prize-percentage">
                    {((tournament.prize_second_pct || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="prize-item third-place">
                <div className="place-badge">🥉</div>
                <div className="prize-info">
                  <div className="place">3rd Place</div>
                  <div className="prize-amount">
                    $
                    {Math.floor(
                      tournament.prize_pool * (tournament.prize_third_pct || 0)
                    ).toLocaleString()}
                  </div>
                  <div className="prize-percentage">
                    {((tournament.prize_third_pct || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {isParticipant ? (
              <Button
                variant="secondary"
                onClick={() => navigate("/my-tournaments")}
                className="back-btn"
              >
                <span className="button-icon">←</span>
                Back to My Tournaments
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate("/browse-tournaments")}
                className="browse-btn"
              >
                <span className="button-icon">🔍</span>
                Browse Tournaments
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TournamentRoom;
