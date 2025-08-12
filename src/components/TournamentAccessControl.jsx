import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUserRoles } from "../contexts/UserRolesContext";
import { api } from "../utils/api";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import Button from "./Button";

const TournamentAccessControl = ({ children }) => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole, isAdmin, isHost, loading: rolesLoading } = useUserRoles();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isTournamentHost, setIsTournamentHost] = useState(false);
  const [error, setError] = useState(null);
  const checkAccessRef = useRef(null);

  useEffect(() => {
    console.log("TournamentAccessControl useEffect triggered:", {
      user: !!user,
      tournamentId,
      userRole,
      isAdmin,
      isHost,
    });

    if (user && tournamentId && !rolesLoading) {
      // Clear any existing timeout
      if (checkAccessRef.current) {
        clearTimeout(checkAccessRef.current);
      }

      // Add a small delay to prevent rapid successive calls
      checkAccessRef.current = setTimeout(() => {
        console.log("Starting access check for tournament:", tournamentId);
        checkAccess();
      }, 100);
    } else if (!user) {
      setLoading(false);
    } else if (rolesLoading) {
      console.log("Waiting for user roles to load...");
    }

    // Cleanup timeout on unmount
    return () => {
      if (checkAccessRef.current) {
        clearTimeout(checkAccessRef.current);
      }
    };
  }, [user, tournamentId, userRole, rolesLoading]); // Added rolesLoading to ensure admin check works

  const checkAccess = async () => {
    try {
      setLoading(true);

      console.log("Starting access check with user roles:", {
        userRole,
        isAdmin,
        isHost,
        userId: user?.id,
        rolesLoading
      });
      
      // Debug: Check if admin role is correctly identified
      console.log("Admin check details:", {
        userRole,
        isAdmin: userRole === 'admin',
        isAdminFromContext: isAdmin
      });

      // Check if user is admin first (no API call needed)
      if (isAdmin) {
        console.log("✅ User is admin, granting access immediately");
        setHasAccess(true);
        return;
      }
      
      // Double-check admin role if there's any doubt
      if (userRole === 'admin') {
        console.log("✅ User role is 'admin', granting access immediately");
        setHasAccess(true);
        return;
      }

      // Fetch tournament details to check if user is the host
      const tournamentResponse = await api.getTournament(tournamentId);
      if (tournamentResponse.success) {
        setTournament(tournamentResponse.data);
        const isHost = tournamentResponse.data.host?.player_id === user.id;
        setIsTournamentHost(isHost);

        // If user is the host, grant access immediately
        if (isHost) {
          console.log("User is tournament host, granting access");
          setHasAccess(true);
          return;
        }
      } else {
        console.error(
          "Failed to fetch tournament details:",
          tournamentResponse
        );
        setHasAccess(false);
        return;
      }

      // Only check participation if user is not admin and not host
      const participationResponse = await api.getParticipationStatus(
        tournamentId
      );
      if (participationResponse.success) {
        const isParticipant = participationResponse.data.isParticipant;
        setIsParticipant(isParticipant);

        console.log("Tournament Access Check:", {
          tournamentId,
          userId: user.id,
          userRole,
          isAdmin,
          isTournamentHost: isHost,
          isParticipant,
          hasAccessToTournament: isParticipant,
          tournamentHostId: tournamentResponse.data.host?.player_id,
        });

        setHasAccess(isParticipant);
      } else {
        console.error(
          "Failed to check participation status:",
          participationResponse
        );
        setIsParticipant(false);
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error checking tournament access:", error);

      // Handle rate limiting specifically
      if (error.message && error.message.includes("429")) {
        console.warn("Rate limited - showing access denied as fallback");
        setError("Rate limited - please try again in a moment");
        setHasAccess(false);
      } else {
        setError("Failed to check access - please try again");
        setHasAccess(false);
      }
    } finally {
      setLoading(false);
    }
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

  if (loading || rolesLoading) {
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
            <p>{rolesLoading ? "Loading user roles..." : "Checking tournament access..."}</p>
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
          <div className="access-denied-container">
            <div className="access-denied-content">
              <div className="access-denied-icon">⚠️</div>
              <h2 className="access-denied-title error">Temporary Error</h2>
              <p className="access-denied-message">{error}</p>
              <div className="access-denied-actions">
                <Button
                  variant="primary"
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    checkAccess();
                  }}
                  className="browse-btn"
                >
                  <span className="button-icon">🔄</span>
                  Retry
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/my-tournaments")}
                  className="my-tournaments-btn"
                >
                  <span className="button-icon">🏆</span>
                  My Tournaments
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <Navbar />
        <div className="tournament-room-page">
          <BackButton
            destination="/my-tournaments"
            buttonText="Back to My Tournaments"
          />
          <div className="access-denied-container">
            <div className="access-denied-content">
              <div className="access-denied-icon">🚫</div>
              <h2 className="access-denied-title">Access Denied</h2>
              <p className="access-denied-message">
                You don't have permission to view this tournament room. Only
                participants, the tournament host, and administrators can access
                this page.
              </p>
              <div className="access-denied-actions">
                <Button
                  variant="primary"
                  onClick={() => navigate("/browse-tournaments")}
                  className="browse-btn"
                >
                  <span className="button-icon">🔍</span>
                  Browse Tournaments
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/my-tournaments")}
                  className="my-tournaments-btn"
                >
                  <span className="button-icon">🏆</span>
                  My Tournaments
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If user has access, render the children (TournamentRoom component)
  return children;
};

export default TournamentAccessControl;
