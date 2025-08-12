import supabase from "../supabaseClient";

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Request deduplication cache
const pendingRequests = new Map();

// Get authenticated headers for API calls
export const getAuthHeaders = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.log("❌ No authentication token available");
      throw new Error("No authentication token available");
    }

    console.log(
      "🔐 Token available:",
      `${session.access_token.substring(0, 20)}...`
    );

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    throw error;
  }
};

// Generic authenticated API call function
export const authenticatedApiCall = async (endpoint, options = {}) => {
  // Create a unique key for this request
  const requestKey = `${endpoint}-${JSON.stringify(options)}`;

  // Check if there's already a pending request for this endpoint
  if (pendingRequests.has(requestKey)) {
    console.log("🔄 Reusing pending request for:", endpoint);
    return pendingRequests.get(requestKey);
  }

  try {
    const headers = await getAuthHeaders();

    console.log("🚀 Making API call to:", `${API_BASE_URL}${endpoint}`);
    console.log("📋 Headers being sent:", headers);

    // Create the promise for this request
    const requestPromise = fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    }).then(async (response) => {
      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API call failed:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ API call successful:", data);
      return data;
    });

    // Store the promise in the cache
    pendingRequests.set(requestKey, requestPromise);

    // Remove from cache when resolved or rejected
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });

    return requestPromise;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Specific API functions for your endpoints
export const api = {
  // Tournament endpoints
  getTournaments: () => authenticatedApiCall("/api/tournaments"),
  getTournament: (id) => authenticatedApiCall(`/api/tournaments/${id}`),
  getHostTournaments: (hostId) =>
    authenticatedApiCall(`/api/tournaments/host/${hostId}`),
  createTournament: (data) =>
    authenticatedApiCall("/api/tournaments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTournament: (id, data) =>
    authenticatedApiCall(`/api/tournaments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTournament: (id) =>
    authenticatedApiCall(`/api/tournaments/${id}`, {
      method: "DELETE",
    }),

  // Tournament participation endpoints
  joinTournament: (id) =>
    authenticatedApiCall(`/api/tournaments/${id}/join`, {
      method: "POST",
    }),
  leaveTournament: (id) =>
    authenticatedApiCall(`/api/tournaments/${id}/leave`, {
      method: "POST",
    }),
  getTournamentParticipants: (id) =>
    authenticatedApiCall(`/api/tournaments/${id}/participants`),
  getParticipationStatus: (id) =>
    authenticatedApiCall(`/api/tournaments/${id}/participation`),
  getJoinedTournaments: () =>
    authenticatedApiCall(`/api/tournaments/joined/me`),

  // User endpoints
  getUsers: () => authenticatedApiCall("/api/users"),
  getUser: (id) => authenticatedApiCall(`/api/users/${id}`),
  createUser: (data) =>
    authenticatedApiCall("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id, data) =>
    authenticatedApiCall(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id) =>
    authenticatedApiCall(`/api/users/${id}`, {
      method: "DELETE",
    }),

  // Match endpoints
  getMatches: () => authenticatedApiCall("/api/matches"),
  getMatchesByTournament: (tournamentId) =>
    authenticatedApiCall(`/api/matches/tournament/${tournamentId}`),
  getMatch: (id) => authenticatedApiCall(`/api/matches/${id}`),
  createMatch: (data) =>
    authenticatedApiCall("/api/matches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMatch: (id, data) =>
    authenticatedApiCall(`/api/matches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateMatchResult: (id, data) =>
    authenticatedApiCall(`/api/matches/${id}/result`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMatch: (id) =>
    authenticatedApiCall(`/api/matches/${id}`, {
      method: "DELETE",
    }),

  // Player endpoints
  getPlayers: () => authenticatedApiCall("/api/players"),
  getPlayer: (id) => authenticatedApiCall(`/api/players/${id}`),
  createPlayer: (data) =>
    authenticatedApiCall("/api/players", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePlayer: (id, data) =>
    authenticatedApiCall(`/api/players/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePlayer: (id) =>
    authenticatedApiCall(`/api/players/${id}`, {
      method: "DELETE",
    }),
};

export default api;
