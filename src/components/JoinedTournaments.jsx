import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import Button from "./Button";
import ConfirmationModal from "./ConfirmationModal";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const JoinedTournaments = ({ game = "valorant", embedded = false }) => {
  const { user } = useAuth();
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("joined_at");
  const [leavingTournament, setLeavingTournament] = useState(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showPenaltyWarning, setShowPenaltyWarning] = useState(false);
  const [pendingLeaveTournament, setPendingLeaveTournament] = useState(null);
  const [penaltyTournament, setPenaltyTournament] = useState(null);

  useEffect(() => {
    if (user) {
      fetchJoinedTournaments();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterAndSortTournaments();
  }, [joinedTournaments, searchTerm, sortBy]);

  const fetchJoinedTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.getJoinedTournaments(game);

      if (response.success) {
        console.log("Joined tournaments data:", response.data);
        // Add game field to tournaments for filtering
        const tournamentsWithGame = (response.data || []).map((tournament) => ({
          ...tournament,
          game: game,
        }));
        setJoinedTournaments(tournamentsWithGame);
      } else {
        setError("Failed to fetch joined tournaments");
      }
    } catch (err) {
      console.error("Error fetching joined tournaments:", err);
      setError("Failed to load joined tournaments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTournaments = () => {
    let filtered = [...joinedTournaments];

    // Filter by game first
    filtered = filtered.filter((tournament) => {
      return tournament.game === game;
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
        case "joined_at":
          return new Date(b.joined_at) - new Date(a.joined_at);
        case "match_start_time":
          return new Date(a.match_start_time) - new Date(b.match_start_time);
        case "prize_pool":
          return b.prize_pool - a.prize_pool;
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

    if (diffMs < 0) {
      return "Tournament ended";
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} from now`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} from now`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} from now`;
    } else {
      return "Starting now";
    }
  };

  const formatJoinedDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLeaveTournament = async (tournamentId) => {
    if (!user) {
      alert("Please sign in to leave tournaments");
      return;
    }

    // Find the tournament to check match start time
    const tournament = joinedTournaments.find(
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
      setLeavingTournament(tournament.tournament_id);
      const response = await api.leaveTournament(tournament.tournament_id);

      if (response.success) {
        // Remove tournament from joined tournaments list
        setJoinedTournaments((prev) =>
          prev.filter((t) => t.tournament_id !== tournament.tournament_id)
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
      setLeavingTournament(null);
    }
  };

  const handleViewDetails = (tournamentId) => {
    // Navigate to tournament room page
    window.location.href = `/tournament/${tournamentId}`;
  };

  if (!user) {
    return (
      <>
        {!embedded && <Navbar />}
        <div
          className={
            embedded ? "embedded-joined-tournaments" : "joined-tournaments-page"
          }
        >
          {!embedded && (
            <BackButton
              destination="/valorant"
              buttonText="Back to Valorant Page"
            />
          )}
          <div className="signin-prompt-container">
            <div className="signin-hero">
              <div className="signin-icon">🎯</div>
              <h2 className="signin-title">
                Sign In to View Joined Tournaments
              </h2>
              <p className="signin-subtitle">
                Access your tournament history and manage your participations
              </p>
            </div>

            <div className="signin-actions">
              <button
                className="signin-btn primary"
                onClick={() => (window.location.href = "/login")}
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
        {!embedded && <Navbar />}
        <div
          className={
            embedded ? "embedded-joined-tournaments" : "joined-tournaments-page"
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
            <p>Loading your joined tournaments...</p>
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
            embedded ? "embedded-joined-tournaments" : "joined-tournaments-page"
          }
        >
          {!embedded && (
            <BackButton
              destination="/valorant"
              buttonText="Back to Valorant Page"
            />
          )}
          <div className="error-container">
            <h2>Error Loading Joined Tournaments</h2>
            <p>{error}</p>
            <Button onClick={fetchJoinedTournaments} variant="primary">
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
      <div className={embedded ? "embedded-joined-tournaments" : "joined-tournaments-page"}>
        {!embedded && (
          <BackButton
            destination={`/${game}`}
            buttonText={`Back to ${
              game.charAt(0).toUpperCase() + game.slice(1)
            } Page`}
          />
        )}

        <div className="joined-tournaments-container">
          <div className="joined-tournaments-header">
            <div className="header-content">
              <div className="header-text">
                <h1>My Joined Tournaments</h1>
                <p>Track your tournament participations and progress</p>
              </div>
              <div className="header-actions">
                <Button
                  variant="primary"
                  onClick={() =>
                    (window.location.href = `/${game}/browse-tournaments`)
                  }
                  className="browse-tournaments-btn-prominent"
                >
                  <span className="button-icon">🔍</span>
                  <span className="button-text">Browse Tournaments</span>
                  <span className="button-arrow">→</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="tournament-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search joined tournaments..."
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
                <option value="joined_at">Join Date</option>
                <option value="match_start_time">Start Time</option>
                <option value="prize_pool">Prize Pool</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <div className="tournament-stats">
            <div className="stat-card">
              <span className="stat-number">{filteredTournaments.length}</span>
              <span className="stat-label">Joined Tournaments</span>
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
            <div className="stat-card">
              <span className="stat-number">
                {
                  filteredTournaments.filter((t) => {
                    const matchTime = new Date(t.match_start_time);
                    return matchTime > new Date();
                  }).length
                }
              </span>
              <span className="stat-label">Upcoming Tournaments</span>
            </div>
          </div>

          {filteredTournaments.length === 0 ? (
            <div className="no-tournaments">
              <div className="no-tournaments-icon">🏆</div>
              <h3>No joined tournaments</h3>
              <p>
                {searchTerm
                  ? "No joined tournaments match your search criteria."
                  : "You haven't joined any tournaments yet. Browse tournaments to get started!"}
              </p>
            </div>
          ) : (
            <div className="tournaments-list">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.tournament_id || tournament.name}
                  className="tournament-row-card joined"
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
                      <div className="joined-info">
                        <span className="joined-label">Joined:</span>
                        <span className="joined-date">
                          {formatJoinedDate(tournament.joined_at)}
                        </span>
                      </div>
                    </div>
                    <div className="tournament-status">
                      <span className="status-badge joined">✓ Joined</span>
                      {new Date(tournament.match_start_time) > new Date() ? (
                        <span className="status-badge upcoming">Upcoming</span>
                      ) : (
                        <span className="status-badge ended">Ended</span>
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
                          <span className="percentage">60%</span>
                        </div>
                        <div className="payout-item">
                          <span className="place">2nd</span>
                          <span className="percentage">30%</span>
                        </div>
                        <div className="payout-item">
                          <span className="place">3rd</span>
                          <span className="percentage">10%</span>
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
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleLeaveTournament(tournament.tournament_id)
                      }
                      className="leave-btn"
                      disabled={leavingTournament === tournament.tournament_id}
                    >
                      {leavingTournament === tournament.tournament_id
                        ? "Leaving..."
                        : "Leave Tournament"}
                    </Button>
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
    </>
  );
};

export default JoinedTournaments;
