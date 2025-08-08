import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import Button from "./Button";
import "./AdminManageHosts.css";

const AdminManageHosts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentHosts, setCurrentHosts] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  // Get game from location state or default to null
  const game = location.state?.game || null;

  // Debug: Log the game context
  console.log("🔍 AdminManageHosts - Game context:", game);
  console.log("🔍 AdminManageHosts - Location state:", location.state);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  // Get authentication token
  const getAuthToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error("No active session");
    }
    return session.access_token;
  };

  // Fetch current hosts
  const fetchCurrentHosts = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${backendUrl}/api/admin/current-hosts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        throw new Error("Failed to fetch hosts");
      }

      const result = await response.json();
      if (result.success) {
        // Filter hosts by game if game is specified
        const hosts = game
          ? result.data.filter((host) => host.game === game)
          : result.data;
        setCurrentHosts(hosts);
      } else {
        throw new Error(result.error || "Failed to fetch hosts");
      }
    } catch (error) {
      console.error("Error fetching hosts:", error);
      setError(error.message);
    }
  };

  // Fetch pending applications
  const fetchPendingApplications = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${backendUrl}/api/admin/pending-applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        throw new Error("Failed to fetch applications");
      }

      const result = await response.json();
      if (result.success) {
        // Filter applications by game if game is specified
        const applications = game
          ? result.data.filter((app) => app.game === game)
          : result.data;
        setPendingApplications(applications);
      } else {
        throw new Error(result.error || "Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(error.message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchCurrentHosts(), fetchPendingApplications()]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [game]);

  // Approve application
  const handleApproveApplication = async (applicationId) => {
    setActionLoading((prev) => ({
      ...prev,
      [`approve-${applicationId}`]: true,
    }));
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${backendUrl}/api/admin/approve-application`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationId,
            game: game, // Pass the game to the backend
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        // Refresh both lists
        await Promise.all([fetchCurrentHosts(), fetchPendingApplications()]);
        alert(`✅ Application approved for ${result.data.user_email}`);
      } else {
        throw new Error(result.error || "Failed to approve application");
      }
    } catch (error) {
      console.error("Error approving application:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`approve-${applicationId}`]: false,
      }));
    }
  };

  // Reject application
  const handleRejectApplication = async (applicationId) => {
    if (
      !confirm(
        "Are you sure you want to reject this application? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading((prev) => ({
      ...prev,
      [`reject-${applicationId}`]: true,
    }));
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${backendUrl}/api/admin/reject-application`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ applicationId }),
        }
      );

      const result = await response.json();
      if (result.success) {
        // Refresh applications list
        await fetchPendingApplications();
        alert(`❌ Application rejected for ${result.data.user_email}`);
      } else {
        throw new Error(result.error || "Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`reject-${applicationId}`]: false,
      }));
    }
  };

  // Remove host
  const handleRemoveHost = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to remove this host? They will be set back to player role."
      )
    ) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`remove-${userId}`]: true }));
    try {
      const token = await getAuthToken();
      const response = await fetch(`${backendUrl}/api/admin/remove-host`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh hosts list
        await fetchCurrentHosts();
        alert(`👤 Host removed: ${result.data.user_email}`);
      } else {
        throw new Error(result.error || "Failed to remove host");
      }
    } catch (error) {
      console.error("Error removing host:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`remove-${userId}`]: false }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get game-specific title
  const getGameTitle = () => {
    if (game === "valorant") {
      return "Valorant";
    }
    return "All Games";
  };

  if (loading) {
    return (
      <div className="admin-manage-hosts">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-manage-hosts">
        <div className="error-container">
          <h2>❌ Access Error</h2>
          <p>{error}</p>
          <p>This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-manage-hosts">
      {/* Animated Background */}
      <div className="admin-bg-animation">
        <div className="admin-floating-shapes">
          <div className="admin-shape admin-shape-1"></div>
          <div className="admin-shape admin-shape-2"></div>
          <div className="admin-shape admin-shape-3"></div>
          <div className="admin-shape admin-shape-4"></div>
        </div>
        <div className="admin-gradient-overlay"></div>
      </div>

      <div className="admin-header">
        <div className="header-top">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <h1>🏆 Admin - Manage {getGameTitle()} Hosts</h1>
        <p>
          Manage current {getGameTitle().toLowerCase()} hosts and review pending
          applications
        </p>
        {game && (
          <div className="game-indicator">
            <span className="game-badge">🎮 {getGameTitle()}</span>
          </div>
        )}
      </div>

      <div className="admin-content">
        {/* Current Hosts Section */}
        <div className="section-container">
          <div className="section-header">
            <h2>
              👥 Current {getGameTitle()} Hosts ({currentHosts.length})
            </h2>
            <Button
              variant="secondary"
              onClick={() => fetchCurrentHosts()}
              className="refresh-button"
            >
              🔄 Refresh
            </Button>
          </div>

          {currentHosts.length === 0 ? (
            <div className="empty-state">
              <p>No {getGameTitle().toLowerCase()} hosts found.</p>
            </div>
          ) : (
            <div className="hosts-table-container">
              <table className="hosts-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Game</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHosts.map((host) => (
                    <tr key={host.user_id} className="host-row">
                      <td className="host-email">{host.user_email}</td>
                      <td className="host-game">{host.game || "N/A"}</td>
                      <td className="host-actions">
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveHost(host.user_id)}
                          disabled={actionLoading[`remove-${host.user_id}`]}
                          className="remove-button"
                        >
                          {actionLoading[`remove-${host.user_id}`] ? (
                            <>
                              <span className="loading-spinner"></span>
                              Removing...
                            </>
                          ) : (
                            <>🗑️ Remove Host</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Applications Section */}
        <div className="section-container">
          <div className="section-header">
            <h2>
              📝 Pending {getGameTitle()} Applications (
              {pendingApplications.length})
            </h2>
            <Button
              variant="secondary"
              onClick={() => fetchPendingApplications()}
              className="refresh-button"
            >
              🔄 Refresh
            </Button>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="empty-state">
              <p>No pending {getGameTitle().toLowerCase()} applications.</p>
            </div>
          ) : (
            <div className="applications-table-container">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Game</th>
                    <th>Applied Date</th>
                    <th>YouTube Channel</th>
                    <th>Experience</th>
                    <th>Motivation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApplications.map((application) => (
                    <tr key={application.id} className="application-row">
                      <td className="applicant-email">
                        {application.user_email}
                      </td>
                      <td className="application-game">
                        {application.game || "N/A"}
                      </td>
                      <td className="application-date">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="application-youtube">
                        {application.youtube_channel ? (
                          <a
                            href={application.youtube_channel}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="youtube-link"
                          >
                            View Channel
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="application-experience">
                        <div className="field-content">
                          {application.experience}
                        </div>
                      </td>
                      <td className="application-motivation">
                        <div className="field-content">
                          {application.motivation}
                        </div>
                      </td>
                      <td className="application-actions">
                        <div className="action-buttons">
                          <Button
                            variant="success"
                            onClick={() =>
                              handleApproveApplication(application.id)
                            }
                            disabled={
                              actionLoading[`approve-${application.id}`]
                            }
                            className="approve-button"
                          >
                            {actionLoading[`approve-${application.id}`] ? (
                              <>
                                <span className="loading-spinner"></span>
                                Approving...
                              </>
                            ) : (
                              <>✅ Approve</>
                            )}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              handleRejectApplication(application.id)
                            }
                            disabled={actionLoading[`reject-${application.id}`]}
                            className="reject-button"
                          >
                            {actionLoading[`reject-${application.id}`] ? (
                              <>
                                <span className="loading-spinner"></span>
                                Rejecting...
                              </>
                            ) : (
                              <>❌ Reject</>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageHosts;
