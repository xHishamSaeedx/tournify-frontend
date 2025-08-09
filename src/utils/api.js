import supabase from "../supabaseClient";

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  try {
    const headers = await getAuthHeaders();

    console.log("🚀 Making API call to:", `${API_BASE_URL}${endpoint}`);
    console.log("📋 Headers being sent:", headers);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

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
  getHostTournaments: (hostId) => authenticatedApiCall(`/api/tournaments/host/${hostId}`),
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
