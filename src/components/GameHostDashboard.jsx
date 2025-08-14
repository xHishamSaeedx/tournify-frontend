import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "./Button";
import BackButton from "./BackButton";
import { useAuth } from "../contexts/AuthContext";
import { useUserRoles } from "../contexts/UserRolesContext";
import CreateTournamentForm from "./CreateTournamentForm";
import ConfirmationModal from "./ConfirmationModal";
import { api } from "../utils/api";
import {
  getStatusDisplay,
  formatMatchStartTime,
  getTournamentStatus,
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
  const [participationStatus, setParticipationStatus] = useState({});
  const [joiningTournament, setJoiningTournament] = useState(null);
  const [loadingParticipation, setLoadingParticipation] = useState(false);
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [pendingTournamentId, setPendingTournamentId] = useState(null);
  const [pendingLeaveTournament, setPendingLeaveTournament] = useState(null);

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

  // Check participation status for tournaments
  useEffect(() => {
    if (tournaments.length > 0 && user) {
      fetchParticipationStatus();
    }
  }, [tournaments, user]);

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

  const handleViewDetails = (tournament) => {
    // Navigate to host tournament room page
    window.location.href = `/host/tournament/${tournament.tournament_id}`;
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
          errorMessage = "This tournament is no longer accepting participants.";
        } else if (error.message.includes("already registered")) {
          errorMessage = "You are already registered for this tournament.";
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setJoiningTournament(null);
      setShowJoinConfirmation(false);
      setPendingTournamentId(null);
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
      alert("Cannot leave tournament within 15 minutes of match start time.");
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
      setShowLeaveConfirmation(false);
      setPendingLeaveTournament(null);
    }
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
    switch (activeTab) {
      case "my-tournaments":
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
                    <div
                      key={tournament.tournament_id}
                      className="tournament-card"
                    >
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
                          <strong>Capacity:</strong>{" "}
                          {tournament.capacity || "N/A"}
                        </p>
                        <p>
                          <strong>Start Time:</strong>{" "}
                          {formatMatchStartTime(tournament.match_start_time)}
                        </p>
                        <p>
                          <strong>Platform:</strong>{" "}
                          {tournament.platform || "N/A"}
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
                        {(() => {
                          const isJoined =
                            participationStatus[tournament.tournament_id];
                          const isCompleted =
                            getTournamentStatus(tournament.match_start_time) ===
                            "done";
                          const isJoining =
                            joiningTournament === tournament.tournament_id;

                          if (isCompleted) {
                            return (
                              <Button variant="disabled" disabled>
                                Tournament Completed
                              </Button>
                            );
                          } else if (isJoined) {
                            return (
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleLeaveTournament(
                                    tournament.tournament_id
                                  )
                                }
                                disabled={isJoining}
                              >
                                {isJoining ? "Leaving..." : "Leave Tournament"}
                              </Button>
                            );
                          } else {
                            return (
                              <Button
                                variant="primary"
                                onClick={() =>
                                  handleJoinTournament(tournament.tournament_id)
                                }
                                disabled={isJoining || loadingParticipation}
                              >
                                {isJoining ? "Joining..." : "Join Tournament"}
                              </Button>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
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

      <div className="dashboard-content">
        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>

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

      {/* Join Tournament Confirmation Modal */}
      <ConfirmationModal
        isOpen={showJoinConfirmation}
        onClose={() => {
          setShowJoinConfirmation(false);
          setPendingTournamentId(null);
        }}
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
        onClose={() => {
          setShowLeaveConfirmation(false);
          setPendingLeaveTournament(null);
        }}
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
    </div>
  );
};

export default GameHostDashboard;
