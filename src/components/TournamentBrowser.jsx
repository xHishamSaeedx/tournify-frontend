import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import Button from "./Button";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const TournamentBrowser = () => {
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

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (user && tournaments.length > 0) {
      fetchParticipationStatus();
    }
  }, [user, tournaments]);

  useEffect(() => {
    filterAndSortTournaments();
  }, [tournaments, searchTerm, sortBy]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.getTournaments();

      if (response.success) {
        console.log("Tournaments data:", response.data);
        if (response.data && response.data.length > 0) {
          console.log("First tournament keys:", Object.keys(response.data[0]));
          console.log("First tournament full object:", response.data[0]);
          console.log("Tournament ID field:", response.data[0].tournament_id);
        }
        setTournaments(response.data || []);
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

    try {
      setJoiningTournament(tournamentId);
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

        alert("Successfully joined tournament!");
      } else {
        alert(response.message || "Failed to join tournament");
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      let errorMessage = "Failed to join tournament";

      if (error.message) {
        if (error.message.includes("Profile incomplete")) {
          errorMessage =
            "Please complete your profile before joining tournaments. Go to your profile and fill in your username, Valorant ID, and VPA.";
        } else if (error.message.includes("Tournament closed")) {
          errorMessage =
            "Tournament registration is closed. It starts in less than 5 minutes.";
        } else if (error.message.includes("Already joined")) {
          errorMessage = "You are already registered for this tournament.";
        } else if (error.message.includes("Tournament full")) {
          errorMessage = "This tournament is already full.";
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

    if (!confirm("Are you sure you want to leave this tournament?")) {
      return;
    }

    try {
      setJoiningTournament(tournamentId);
      const response = await api.leaveTournament(tournamentId);

      if (response.success) {
        // Update participation status
        setParticipationStatus((prev) => ({
          ...prev,
          [tournamentId]: false,
        }));

        // Update tournament current_players count
        setTournaments((prev) =>
          prev.map((tournament) =>
            tournament.tournament_id === tournamentId
              ? {
                  ...tournament,
                  current_players: Math.max(
                    0,
                    (tournament.current_players || 0) - 1
                  ),
                }
              : tournament
          )
        );

        alert("Successfully left tournament!");
      } else {
        alert(response.message || "Failed to leave tournament");
      }
    } catch (error) {
      console.error("Error leaving tournament:", error);
      let errorMessage = "Failed to leave tournament";

      if (error.message) {
        if (error.message.includes("Not a participant")) {
          errorMessage = "You are not registered for this tournament.";
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
    // TODO: Navigate to tournament details page
    console.log("View tournament details:", tournamentId);
    alert("Tournament details page coming soon!");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="tournament-browser-page">
          <BackButton
            destination="/valorant"
            buttonText="Back to Valorant Page"
          />
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
        <Navbar />
        <div className="tournament-browser-page">
          <BackButton
            destination="/valorant"
            buttonText="Back to Valorant Page"
          />
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
      <Navbar />
      <div className="tournament-browser-page">
        <BackButton
          destination="/valorant"
          buttonText="Back to Valorant Page"
        />

        <div className="tournament-browser-container">
          <div className="tournament-browser-header">
            <div className="header-content">
              <div className="header-text">
                <h1>Browse Tournaments</h1>
                <p>Find and join exciting Valorant tournaments</p>
              </div>
              <div className="header-actions">
                <Button
                  variant="primary"
                  onClick={() => (window.location.href = "/my-tournaments")}
                  className="my-tournaments-btn-prominent"
                >
                  <span className="button-icon">🏆</span>
                  <span className="button-text">My Tournaments</span>
                  <span className="button-arrow">→</span>
                </Button>
              </div>
            </div>
          </div>

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
                        <span className="host-label">Hosted by:</span>
                        <span className="host-name">
                          {tournament.host?.display_name ||
                            tournament.host?.username ||
                            "Unknown Host"}
                        </span>
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
                          ${tournament.joining_fee}
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
                        onClick={() =>
                          alert("Please sign in to join tournaments")
                        }
                        className="join-btn"
                        disabled
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

      {/* Floating Action Button for My Tournaments */}
      <div className="floating-my-tournaments">
        <Button
          variant="primary"
          onClick={() => (window.location.href = "/my-tournaments")}
          className="floating-my-tournaments-btn"
          title="My Tournaments"
        >
          <span className="floating-icon">🏆</span>
        </Button>
      </div>
    </>
  );
};

export default TournamentBrowser;
