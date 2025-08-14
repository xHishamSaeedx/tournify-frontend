import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "./Button";
import BackButton from "./BackButton";
import { useAuth } from "../contexts/AuthContext";
import { useUserRoles } from "../contexts/UserRolesContext";
import CreateTournamentForm from "./CreateTournamentForm";
import { api } from "../utils/api";
import {
  getStatusDisplay,
  formatMatchStartTime,
} from "../utils/tournamentStatus";

const GameHostDashboard = () => {
  const { game } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole, isAdmin } = useUserRoles();

  const [activeTab, setActiveTab] = useState("my-tournaments");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hasGameAccess, setHasGameAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const tabs = [
    { id: "my-tournaments", label: "My Created Tournaments", icon: "🏆" },
  ];

  // Check if user has host access for this specific game
  useEffect(() => {
    const checkGameAccess = async () => {
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      try {
        // Admins have access to all games
        if (isAdmin) {
          setHasGameAccess(true);
          setCheckingAccess(false);
          return;
        }

        // Check if user is a host for this specific game
        const response = await api.checkHostForGame(user.id, game);
        setHasGameAccess(response.isHost);
      } catch (err) {
        console.error("Error checking game access:", err);
        setHasGameAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkGameAccess();
  }, [user, game, isAdmin]);

  // Fetch tournaments when component mounts or when user changes
  useEffect(() => {
    if (user && activeTab === "my-tournaments" && hasGameAccess) {
      fetchHostTournaments();
    }
  }, [user, activeTab, hasGameAccess]);

  const fetchHostTournaments = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const hostId = user.player_id || user.id;
      const response = await api.getHostTournaments(hostId);
      // Filter tournaments by game, but also include tournaments without game field (legacy tournaments)
      const gameTournaments = (response.data || []).filter(
        (tournament) =>
          // Include tournaments that match the current game
          tournament.game === game ||
          // Include tournaments without game field (legacy tournaments)
          !tournament.game ||
          // Include tournaments with null/undefined game field
          tournament.game === null ||
          tournament.game === undefined
      );
      setTournaments(gameTournaments);
    } catch (err) {
      console.error("Error fetching host tournaments:", err);
      setError("Failed to load tournaments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (tournament) => {
    // Navigate to host tournament room page
    window.location.href = `/host/tournament/${tournament.tournament_id}`;
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTournament(null);
  };

  // If still checking access, show loading
  if (checkingAccess) {
    return (
      <div className="host-dashboard">
        <BackButton
          destination={`/${game}`}
          buttonText={`Back to ${
            game.charAt(0).toUpperCase() + game.slice(1)
          } Page`}
        />
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h2>Host Dashboard</h2>
              <p>Checking access...</p>
            </div>
          </div>
        </div>
        <div className="loading-message">
          <p>Verifying your access to {game} host dashboard...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have access, show access denied
  if (!hasGameAccess) {
    return (
      <div className="host-dashboard">
        <BackButton
          destination={`/${game}`}
          buttonText={`Back to ${
            game.charAt(0).toUpperCase() + game.slice(1)
          } Page`}
        />
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h2>Access Denied</h2>
              <p>You don't have host privileges for {game}</p>
            </div>
          </div>
        </div>
        <div className="access-denied-message">
          <p>
            You need to be granted host privileges for {game} to access this
            dashboard.
          </p>
          <p>
            Please contact an administrator if you believe this is an error.
          </p>
          <Button variant="primary" onClick={() => navigate(`/${game}`)}>
            Back to {game.charAt(0).toUpperCase() + game.slice(1)} Page
          </Button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    return (
      <div className="tab-content">
        <div className="section-header">
          <h3>My Created Tournaments</h3>
          <div className="section-actions">
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
              className="create-tournament-btn"
            >
              <span className="btn-icon">➕</span>
              Create Tournament
            </Button>
            <Button
              variant="secondary"
              onClick={fetchHostTournaments}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="loading-message">
            <p>Loading tournaments...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="empty-state">
            <p>No tournaments created yet.</p>
          </div>
        ) : (
          <div className="tournaments-grid">
            {tournaments.map((tournament) => {
              const statusDisplay = getStatusDisplay(
                tournament.match_start_time
              );
              return (
                <div key={tournament.tournament_id} className="tournament-card">
                  <div className="tournament-header">
                    <h4>{tournament.name}</h4>
                    <span className={statusDisplay.className}>
                      {statusDisplay.text}
                    </span>
                  </div>
                  <div className="tournament-details">
                    <p>
                      <strong>Prize Pool:</strong>{" "}
                      {tournament.prize_pool
                        ? `${tournament.prize_pool} credits`
                        : "TBD"}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {tournament.capacity || "N/A"}
                    </p>
                    <p>
                      <strong>Start Time:</strong>{" "}
                      {formatMatchStartTime(tournament.match_start_time)}
                    </p>
                    <p>
                      <strong>Platform:</strong> {tournament.platform || "N/A"}
                    </p>
                    <p>
                      <strong>Region:</strong> {tournament.region || "N/A"}
                    </p>
                    <p>
                      <strong>Joining Fee:</strong>{" "}
                      {tournament.joining_fee
                        ? `${tournament.joining_fee} credits`
                        : "Free"}
                    </p>
                  </div>
                  <div className="tournament-actions">
                    <Button
                      variant="secondary"
                      onClick={() => handleViewDetails(tournament)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="host-dashboard">
      <BackButton
        destination={`/${game}`}
        buttonText={`Back to ${
          game.charAt(0).toUpperCase() + game.slice(1)
        } Page`}
      />
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h2>
              {game.charAt(0).toUpperCase() + game.slice(1)} Host Dashboard
            </h2>
            <p>Create and manage your {game} tournaments</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">{renderTabContent()}</div>

      {/* Create Tournament Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div
            className="modal-content create-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateTournamentForm
              game={game}
              onClose={() => setShowCreateForm(false)}
              onSuccess={(tournament) => {
                console.log("Tournament created:", tournament);
                setShowCreateForm(false);
                // Refresh tournaments list
                fetchHostTournaments();
              }}
            />
          </div>
        </div>
      )}

      {/* Tournament Details Modal */}
      {showDetailsModal && selectedTournament && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tournament Details</h3>
              <button className="modal-close" onClick={closeDetailsModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="tournament-details-grid">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedTournament.name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span
                      className={
                        getStatusDisplay(selectedTournament.match_start_time)
                          .className
                      }
                    >
                      {
                        getStatusDisplay(selectedTournament.match_start_time)
                          .text
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">
                      {selectedTournament.capacity || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Platform:</span>
                    <span className="detail-value">
                      {selectedTournament.platform || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Region:</span>
                    <span className="detail-value">
                      {selectedTournament.region || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Timing</h4>
                  <div className="detail-item">
                    <span className="detail-label">Match Start Time:</span>
                    <span className="detail-value">
                      {formatMatchStartTime(
                        selectedTournament.match_start_time
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Party Join Time:</span>
                    <span className="detail-value">
                      {formatMatchStartTime(selectedTournament.party_join_time)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Match Result Time:</span>
                    <span className="detail-value">
                      {formatMatchStartTime(
                        selectedTournament.match_result_time
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Financial Details</h4>
                  <div className="detail-item">
                    <span className="detail-label">Joining Fee:</span>
                    <span className="detail-value">
                      {selectedTournament.joining_fee
                        ? `${selectedTournament.joining_fee} credits`
                        : "Free"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Prize Pool:</span>
                    <span className="detail-value">
                      {selectedTournament.prize_pool
                        ? `${selectedTournament.prize_pool} credits`
                        : "TBD"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Host Percentage:</span>
                    <span className="detail-value">
                      {(
                        (selectedTournament.host_percentage || 0) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Prize Distribution</h4>
                  <div className="detail-item">
                    <span className="detail-label">1st Place:</span>
                    <span className="detail-value">
                      {(
                        (selectedTournament.prize_first_pct || 0) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">2nd Place:</span>
                    <span className="detail-value">
                      {(
                        (selectedTournament.prize_second_pct || 0) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">3rd Place:</span>
                    <span className="detail-value">
                      {(
                        (selectedTournament.prize_third_pct || 0) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>System Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Tournament ID:</span>
                    <span className="detail-value">
                      {selectedTournament.tournament_id}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Host ID:</span>
                    <span className="detail-value">
                      {selectedTournament.host_id}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created At:</span>
                    <span className="detail-value">
                      {formatMatchStartTime(selectedTournament.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={closeDetailsModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHostDashboard;
