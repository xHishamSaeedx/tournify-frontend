import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import Button from "./Button";
import ConfirmationModal from "./ConfirmationModal";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import {
  isValorantProfileComplete,
  getProfileCompletionMessage,
} from "../utils/profileValidation";

const TournamentBrowser = ({ game = "valorant", embedded = false }) => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("match_start_time");
  const [participationStatus, setParticipationStatus] = useState({});
  const [joiningTournament, setJoiningTournament] = useState(null);
  const [loadingParticipation, setLoadingParticipation] = useState(false);
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showPenaltyWarning, setShowPenaltyWarning] = useState(false);
  const [pendingTournamentId, setPendingTournamentId] = useState(null);
  const [pendingLeaveTournament, setPendingLeaveTournament] = useState(null);
  const [penaltyTournament, setPenaltyTournament] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (user && tournaments.length > 0) {
      fetchParticipationStatus();
    }
  }, [user, tournaments]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortTournaments();
  }, [tournaments, searchTerm, sortBy]);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await api.getPlayer(user.id);
      if (response.success) {
        console.log("User profile loaded:", response.data);
        console.log("Profile validation check:", {
          isBasicComplete: isValorantProfileComplete(response.data),
          hasValorantData:
            !!response.data.valorant_users &&
            response.data.valorant_users.length > 0,
          valorantFields: {
            valorant_name: response.data.valorant_users?.[0]?.valorant_name,
            valorant_tag: response.data.valorant_users?.[0]?.valorant_tag,
            platform: response.data.valorant_users?.[0]?.platform,
            region: response.data.valorant_users?.[0]?.region,
          },
        });
        setUserProfile(response.data);
      } else {
        console.log("No user profile found, user needs to complete profile");
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Don't set error state for profile fetch, just log it
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.getTournaments(game);

      if (response.success) {
        console.log("Tournaments data:", response.data);
        if (response.data && response.data.length > 0) {
          console.log("First tournament keys:", Object.keys(response.data[0]));
          console.log("First tournament full object:", response.data[0]);
          console.log("Tournament ID field:", response.data[0].tournament_id);
        }
        // Add game field to tournaments for filtering
        const tournamentsWithGame = (response.data || []).map((tournament) => ({
          ...tournament,
          game: game,
        }));
        setTournaments(tournamentsWithGame);
      } else {
        setError("Failed to fetch tournaments");
      }
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      setError("Failed to load tournaments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipationStatus = async () => {
    try {
      setLoadingParticipation(true);
      const statusPromises = tournaments.map(async (tournament) => {
        const tournamentId = tournament.tournament_id;
        if (!tournamentId) {
          console.warn("Tournament missing tournament_id:", tournament);
          return {
            tournamentId: null,
            isParticipant: false,
          };
        }
        try {
          const response = await api.getParticipationStatus(tournamentId);
          return {
            tournamentId: tournamentId,
            isParticipant: response.success
              ? response.data.isParticipant
              : false,
          };
        } catch (error) {
          console.error(
            `Error fetching participation status for tournament ${tournamentId}:`,
            error
          );
          return {
            tournamentId: tournamentId,
            isParticipant: false,
          };
        }
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap = {};
      statuses.forEach((status) => {
        statusMap[status.tournamentId] = status.isParticipant;
      });
      setParticipationStatus(statusMap);
    } catch (error) {
      console.error("Error fetching participation statuses:", error);
    } finally {
      setLoadingParticipation(false);
    }
  };

  const filterAndSortTournaments = () => {
    let filtered = [...tournaments];

    // Filter by game first
    filtered = filtered.filter((tournament) => {
      return tournament.game === game;
    });

    // Filter tournaments that are at least 5 minutes from match_start_time
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    filtered = filtered.filter((tournament) => {
      const matchStartTime = new Date(tournament.match_start_time);
      return matchStartTime > fiveMinutesFromNow;
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tournament) =>
          tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tournament.platform
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          tournament.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "match_start_time":
          return new Date(a.match_start_time) - new Date(b.match_start_time);
        case "prize_pool":
          return b.prize_pool - a.prize_pool;
        case "joining_fee":
          return a.joining_fee - b.joining_fee;
        case "capacity":
          return b.capacity - a.capacity;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTournaments(filtered);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const formatTimeUntil = (dateTimeString) => {
    const now = new Date();
    const matchTime = new Date(dateTimeString);
    const diffMs = matchTime - now;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} from now`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} from now`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} from now`;
    } else {
      return "Starting now";
    }
  };

  const handleJoinTournament = async (tournamentId) => {
    if (!user) {
      alert("Please sign in to join tournaments");
      return;
    }

    if (!tournamentId) {
      alert("Invalid tournament ID");
      return;
    }

    // Check if user profile is complete for Valorant tournaments
    console.log("Profile check on join:", {
      hasUserProfile: !!userProfile,
      isComplete: isValorantProfileComplete(userProfile),
      profileData: userProfile,
    });

    if (!userProfile || !isValorantProfileComplete(userProfile)) {
      console.log("Profile incomplete, showing modal");
      setShowProfileModal(true);
      return;
    }

    // Show confirmation modal first
    setPendingTournamentId(tournamentId);
    setShowJoinConfirmation(true);
  };

  const handleConfirmJoinTournament = async () => {
    const tournamentId = pendingTournamentId;
    const tournament = tournaments.find(
      (t) => t.tournament_id === tournamentId
    );

    if (!tournament) {
      alert("Tournament not found");
      return;
    }

    try {
      setJoiningTournament(tournamentId);

      // First, process the tournament entry fee through wallet
      if (tournament.joining_fee && tournament.joining_fee > 0) {
        const userId = user.player_id || user.id;
        const walletResponse = await api.processTournamentEntry({
          user_id: userId,
          tournament_id: tournamentId,
          entry_fee: tournament.joining_fee,
        });

        if (!walletResponse.success) {
          if (walletResponse.error === "Insufficient balance") {
            alert(
              `Insufficient credits! You need ${tournament.joining_fee} credits but don't have enough. Please add credits to your wallet.`
            );
          } else {
            alert(walletResponse.message || "Failed to process entry fee");
          }
          return;
        }
      }

      // Then join the tournament
      const response = await api.joinTournament(tournamentId);

      if (response.success) {
        // Update participation status
        setParticipationStatus((prev) => ({
          ...prev,
          [tournamentId]: true,
        }));

        // Update tournament current_players count
        setTournaments((prev) =>
          prev.map((tournament) =>
            tournament.tournament_id === tournamentId
              ? {
                  ...tournament,
                  current_players: (tournament.current_players || 0) + 1,
                }
              : tournament
          )
        );

        // Ask other parts of the app to refresh balances/transactions after entry fee deduction
        if (tournament.joining_fee && tournament.joining_fee > 0) {
          window.dispatchEvent(new Event("wallet:updated"));
        }

        const feeMessage =
          tournament.joining_fee && tournament.joining_fee > 0
            ? ` Entry fee of ${tournament.joining_fee} credits has been deducted from your wallet.`
            : "";

        alert(`Successfully joined tournament!${feeMessage}`);
      } else {
        alert(response.message || "Failed to join tournament");
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      let errorMessage = "Failed to join tournament";

      if (error.message) {
        if (error.message.includes("Profile incomplete")) {
          errorMessage =
            "Please complete your profile before joining tournaments. Go to Settings and fill in your username, Valorant ID, and VPA.";
        } else if (error.message.includes("Tournament closed")) {
          errorMessage =
            "Tournament registration is closed. It starts in less than 5 minutes.";
        } else if (error.message.includes("Already joined")) {
          errorMessage = "You are already registered for this tournament.";
        } else if (error.message.includes("Tournament full")) {
          errorMessage = "This tournament is already full.";
        } else if (error.message.includes("Insufficient balance")) {
          errorMessage = `Insufficient credits! You need ${tournament.joining_fee} credits to join this tournament.`;
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setJoiningTournament(null);
    }
  };

  const handleLeaveTournament = async (tournamentId) => {
    if (!user) {
      alert("Please sign in to leave tournaments");
      return;
    }

    // Find the tournament to check match start time
    const tournament = tournaments.find(
      (t) => t.tournament_id === tournamentId
    );
    if (!tournament) {
      alert("Tournament not found");
      return;
    }

    // Check if match starts within 15 minutes
    const matchStartTime = new Date(tournament.match_start_time);
    const currentTime = new Date();
    const timeDifference = matchStartTime.getTime() - currentTime.getTime();
    const minutesUntilMatch = Math.floor(timeDifference / (1000 * 60));

    if (minutesUntilMatch <= 15) {
      setPenaltyTournament(tournament);
      setShowPenaltyWarning(true);
      return;
    }

    // Show confirmation modal
    setPendingLeaveTournament(tournament);
    setShowLeaveConfirmation(true);
  };

  const handleConfirmLeaveTournament = async () => {
    const tournament = pendingLeaveTournament;
    if (!tournament) return;

    try {
      setJoiningTournament(tournament.tournament_id);
      const response = await api.leaveTournament(tournament.tournament_id);

      if (response.success) {
        // Update participation status
        setParticipationStatus((prev) => ({
          ...prev,
          [tournament.tournament_id]: false,
        }));

        // Update tournament current_players count
        setTournaments((prev) =>
          prev.map((t) =>
            t.tournament_id === tournament.tournament_id
              ? {
                  ...t,
                  current_players: Math.max(0, (t.current_players || 0) - 1),
                }
              : t
          )
        );

        // Ask other parts of the app (Navbar, Wallet page) to refresh balances/transactions
        window.dispatchEvent(new Event("wallet:updated"));
        alert(response.message || "Successfully left tournament!");
      } else {
        alert(response.message || "Failed to leave tournament");
      }
    } catch (error) {
      console.error("Error leaving tournament:", error);
      let errorMessage = "Failed to leave tournament";

      if (error.message) {
        if (error.message.includes("Not a participant")) {
          errorMessage = "You are not registered for this tournament.";
        } else if (
          error.message.includes("Cannot leave tournament within 15 minutes")
        ) {
          errorMessage =
            "Cannot leave tournament within 15 minutes of match start time.";
        } else if (error.message.includes("Tournament not found")) {
          errorMessage = "Tournament not found.";
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setJoiningTournament(null);
    }
  };

  const handleViewDetails = (tournamentId) => {
    // Navigate to tournament room page
    window.location.href = `/tournament/${tournamentId}`;
  };

  if (loading) {
    return (
      <>
        {!embedded && <Navbar />}
        <div
          className={
            embedded ? "embedded-tournament-browser" : "tournament-browser-page"
          }
        >
          {!embedded && (
            <BackButton
              destination="/valorant"
              buttonText="Back to Valorant Page"
            />
          )}
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tournaments...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {!embedded && <Navbar />}
        <div
          className={
            embedded ? "embedded-tournament-browser" : "tournament-browser-page"
          }
        >
          {!embedded && (
            <BackButton
              destination="/valorant"
              buttonText="Back to Valorant Page"
            />
          )}
          <div className="error-container">
            <h2>Error Loading Tournaments</h2>
            <p>{error}</p>
            <Button onClick={fetchTournaments} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {!embedded && <Navbar />}
      <div
        className={
          embedded ? "embedded-tournament-browser" : "tournament-browser-page"
        }
      >
        {!embedded && (
          <BackButton
            destination={`/${game}`}
            buttonText={`Back to ${
              game.charAt(0).toUpperCase() + game.slice(1)
            } Page`}
          />
        )}

        <div className="tournament-browser-container">
          <div className="tournament-browser-header">
            <div className="header-content">
              <div className="header-text">
                <h1>Browse Tournaments</h1>
                <p>
                  {user
                    ? `Find and join exciting ${
                        game.charAt(0).toUpperCase() + game.slice(1)
                      } tournaments`
                    : `Browse exciting ${
                        game.charAt(0).toUpperCase() + game.slice(1)
                      } tournaments - Sign in to join!`}
                </p>
              </div>
              <div className="header-actions">
                {user ? (
                  <Button
                    variant="primary"
                    onClick={() =>
                      (window.location.href = `/${game}/my-tournaments`)
                    }
                    className="my-tournaments-btn-prominent"
                  >
                    <span className="button-icon">🏆</span>
                    <span className="button-text">My Tournaments</span>
                    <span className="button-arrow">→</span>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => (window.location.href = "/login")}
                    className="my-tournaments-btn-prominent"
                  >
                    <span className="button-icon">🔐</span>
                    <span className="button-text">Sign In</span>
                    <span className="button-arrow">→</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {!user && (
            <div className="signin-notice">
              <div className="notice-content">
                <span className="notice-icon">ℹ️</span>
                <span className="notice-text">
                  You can browse all tournaments. Sign in to join tournaments
                  and access your tournament history.
                </span>
                <Button
                  variant="primary"
                  onClick={() => (window.location.href = "/login")}
                  className="notice-signin-btn"
                >
                  Sign In
                </Button>
              </div>
            </div>
          )}

          <div className="tournament-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="sort-container">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="match_start_time">Start Time</option>
                <option value="prize_pool">Prize Pool</option>
                <option value="joining_fee">Entry Fee</option>
                <option value="capacity">Capacity</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <div className="tournament-stats">
            <div className="stat-card">
              <span className="stat-number">{filteredTournaments.length}</span>
              <span className="stat-label">Available Tournaments</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                $
                {filteredTournaments
                  .reduce((sum, t) => sum + t.prize_pool, 0)
                  .toLocaleString()}
              </span>
              <span className="stat-label">Total Prize Pool</span>
            </div>
          </div>

          {filteredTournaments.length === 0 ? (
            <div className="no-tournaments">
              <div className="no-tournaments-icon">🏆</div>
              <h3>No tournaments available</h3>
              <p>
                {searchTerm
                  ? "No tournaments match your search criteria."
                  : "Check back later for new tournaments!"}
              </p>
            </div>
          ) : (
            <div className="tournaments-list">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.tournament_id || tournament.name}
                  className="tournament-row-card"
                >
                  <div className="tournament-main-info">
                    <div className="tournament-name-host">
                      <h3 className="tournament-name">{tournament.name}</h3>
                      <div className="host-info">
                        <div className="host-avatar">
                          {tournament.host?.avatar_url ? (
                            <img
                              src={tournament.host.avatar_url}
                              alt={`${
                                tournament.host?.display_name ||
                                tournament.host?.username ||
                                "Host"
                              } avatar`}
                              className="host-avatar-img"
                            />
                          ) : (
                            <div className="host-avatar-placeholder">
                              {tournament.host?.display_name?.charAt(0) ||
                                tournament.host?.username?.charAt(0) ||
                                "?"}
                            </div>
                          )}
                        </div>
                        <div className="host-details">
                          <span className="host-label">Hosted by:</span>
                          <span className="host-name">
                            {tournament.host?.display_name ||
                              tournament.host?.username ||
                              "Unknown Host"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="tournament-status">
                      <span className="status-badge upcoming">Upcoming</span>
                      {participationStatus[tournament.tournament_id] && (
                        <span className="status-badge joined">✓ Joined</span>
                      )}
                    </div>
                  </div>

                  <div className="tournament-details-container">
                    {/* Prize Pool - Hero Section */}
                    <div className="prize-hero-section">
                      <div className="prize-main">
                        <div className="prize-amount">
                          <span className="currency">$</span>
                          <span className="amount">
                            {tournament.prize_pool?.toLocaleString()}
                          </span>
                        </div>
                        <div className="prize-label">Prize Pool</div>
                      </div>

                      <div className="payout-breakdown">
                        <div className="payout-item">
                          <span className="place">1st</span>
                          <span className="percentage">
                            {(tournament.prize_first_pct * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="payout-item">
                          <span className="place">2nd</span>
                          <span className="percentage">
                            {(tournament.prize_second_pct * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="payout-item">
                          <span className="place">3rd</span>
                          <span className="percentage">
                            {(tournament.prize_third_pct * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="entry-fee">
                        <span className="fee-label">Entry Fee</span>
                        <span className="fee-amount">
                          {tournament.joining_fee} credits
                        </span>
                      </div>
                    </div>

                    {/* Tournament Info Grid */}
                    <div className="tournament-info-grid">
                      <div className="info-item time-info">
                        <div className="info-icon">⏰</div>
                        <div className="info-content">
                          <div className="info-label">Start Time</div>
                          <div className="info-value">
                            {formatDateTime(tournament.match_start_time)}
                          </div>
                          <div className="info-subtitle">
                            {formatTimeUntil(tournament.match_start_time)}
                          </div>
                        </div>
                      </div>

                      <div className="info-item players-info">
                        <div className="info-icon">👥</div>
                        <div className="info-content">
                          <div className="info-label">Players</div>
                          <div className="info-value">
                            <span className="current">
                              {tournament.current_players || 0}
                            </span>
                            <span className="separator">/</span>
                            <span className="capacity">
                              {tournament.capacity}
                            </span>
                          </div>
                          <div className="info-subtitle">
                            {tournament.capacity -
                              (tournament.current_players || 0)}{" "}
                            spots left
                          </div>
                        </div>
                      </div>

                      <div className="info-item platform-info">
                        <div className="info-icon">🎮</div>
                        <div className="info-content">
                          <div className="info-label">Platform</div>
                          <div className="info-value">
                            {tournament.platform || "Any"}
                          </div>
                        </div>
                      </div>

                      <div className="info-item region-info">
                        <div className="info-icon">🌍</div>
                        <div className="info-content">
                          <div className="info-label">Region</div>
                          <div className="info-value">
                            {tournament.region || "Global"}
                          </div>
                        </div>
                      </div>

                      <div className="info-item gametype-info">
                        <div className="info-icon">🎯</div>
                        <div className="info-content">
                          <div className="info-label">Game Type</div>
                          <div className="info-value">Deathmatch</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tournament-actions">
                    {!user ? (
                      <Button
                        variant="primary"
                        onClick={() => (window.location.href = "/login")}
                        className="join-btn"
                      >
                        Sign In to Join
                      </Button>
                    ) : loadingParticipation ? (
                      <Button variant="primary" className="join-btn" disabled>
                        Loading...
                      </Button>
                    ) : participationStatus[tournament.tournament_id] ? (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleLeaveTournament(tournament.tournament_id)
                        }
                        className="leave-btn"
                        disabled={
                          joiningTournament === tournament.tournament_id
                        }
                      >
                        {joiningTournament === tournament.tournament_id
                          ? "Leaving..."
                          : "Leave Tournament"}
                      </Button>
                    ) : profileLoading ? (
                      <Button variant="primary" className="join-btn" disabled>
                        Loading...
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleJoinTournament(tournament.tournament_id)
                        }
                        className="join-btn"
                        disabled={
                          joiningTournament === tournament.tournament_id
                        }
                      >
                        {joiningTournament === tournament.tournament_id
                          ? "Joining..."
                          : "Join Tournament"}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleViewDetails(tournament.tournament_id)
                      }
                      className="details-btn"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for My Tournaments - only show when not embedded */}
      {user && !embedded && (
        <div className="floating-my-tournaments">
          <Button
            variant="primary"
            onClick={() => (window.location.href = `/${game}/my-tournaments`)}
            className="floating-my-tournaments-btn"
            title="My Tournaments"
          >
            <span className="floating-icon">🏆</span>
          </Button>
        </div>
      )}

      {/* Join Tournament Confirmation Modal */}
      <ConfirmationModal
        isOpen={showJoinConfirmation}
        onClose={() => setShowJoinConfirmation(false)}
        onConfirm={handleConfirmJoinTournament}
        title="Confirm Tournament Registration"
        message="⚠️ Important: By joining this tournament, you agree to the following terms:

• If you leave the tournament, there will be a 50% cancellation fee
• You will only receive half of your credits back upon cancellation
• No cancellations are allowed within 15 minutes of the match start time

Are you sure you want to join this tournament?"
        confirmText="Join Tournament"
        cancelText="Cancel"
        confirmButtonClass="confirm-btn"
        cancelButtonClass="cancel-btn"
      />

      {/* Leave Tournament Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLeaveConfirmation}
        onClose={() => setShowLeaveConfirmation(false)}
        onConfirm={handleConfirmLeaveTournament}
        title="Confirm Tournament Cancellation"
        message={
          pendingLeaveTournament
            ? `⚠️ Are you sure you want to leave "${
                pendingLeaveTournament.name
              }"?

• You will be refunded only 50% of your joining fee (${Math.floor(
                (pendingLeaveTournament.joining_fee || 0) * 0.5
              )} credits)
• This action cannot be undone
• You will lose your tournament spot

Are you sure you want to proceed?`
            : ""
        }
        confirmText="Leave Tournament"
        cancelText="Stay in Tournament"
        confirmButtonClass="confirm-btn"
        cancelButtonClass="cancel-btn"
      />

      {/* Penalty Warning Modal */}
      <ConfirmationModal
        isOpen={showPenaltyWarning}
        onClose={() => setShowPenaltyWarning(false)}
        onConfirm={() => setShowPenaltyWarning(false)}
        title="⚠️ Tournament Locked"
        message={
          penaltyTournament
            ? `You cannot leave "${penaltyTournament.name}" at this time.

The tournament starts in ${Math.max(
                0,
                Math.floor(
                  (new Date(penaltyTournament.match_start_time).getTime() -
                    new Date().getTime()) /
                    (1000 * 60)
                )
              )} minutes.

🚨 **IMPORTANT**: If you are found not joining the match, you will be issued a penalty that may affect your future tournament participation.

Please ensure you are ready to participate in the tournament.`
            : ""
        }
        confirmText="I Understand"
        cancelText=""
        confirmButtonClass="confirm-btn"
        cancelButtonClass="cancel-btn"
      />

      {/* Profile Completion Modal */}
      <ConfirmationModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onConfirm={() => {
          setShowProfileModal(false);
          window.location.href = "/settings";
        }}
        title="⚠️ Profile Incomplete"
        message={
          userProfile
            ? `To join Valorant tournaments, you need to complete your profile.

${getProfileCompletionMessage(userProfile)}

Please complete your profile to continue.`
            : `To join Valorant tournaments, you need to complete your profile.

Please fill in your basic information and Valorant details to continue.`
        }
        confirmText="Complete Profile"
        cancelText="Cancel"
        confirmButtonClass="confirm-btn"
        cancelButtonClass="cancel-btn"
      />
    </>
  );
};

export default TournamentBrowser;
