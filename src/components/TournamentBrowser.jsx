import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import Button from "./Button";
import { api } from "../utils/api";

const TournamentBrowser = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("match_start_time");

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    filterAndSortTournaments();
  }, [tournaments, searchTerm, sortBy]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await api.getTournaments();

      if (response.success) {
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

  const handleJoinTournament = (tournamentId) => {
    // TODO: Implement join tournament functionality
    console.log("Join tournament:", tournamentId);
    alert("Join tournament functionality coming soon!");
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
          <BackButton />
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
          <BackButton />
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
        <BackButton />

        <div className="tournament-browser-container">
          <div className="tournament-browser-header">
            <h1>Browse Tournaments</h1>
            <p>Find and join exciting Valorant tournaments</p>
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
                <div key={tournament.id} className="tournament-row-card">
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
                    <Button
                      variant="primary"
                      onClick={() => handleJoinTournament(tournament.id)}
                      className="join-btn"
                    >
                      Join Tournament
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleViewDetails(tournament.id)}
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
    </>
  );
};

export default TournamentBrowser;
