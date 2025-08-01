import supabase from '../supabaseClient';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get authenticated headers for API calls
export const getAuthHeaders = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    throw error;
  }
};

// Generic authenticated API call function
export const authenticatedApiCall = async (endpoint, options = {}) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Specific API functions for your endpoints
export const api = {
  // Tournament endpoints
  getTournaments: () => authenticatedApiCall('/api/tournaments'),
  getTournament: (id) => authenticatedApiCall(`/api/tournaments/${id}`),
  createTournament: (data) => authenticatedApiCall('/api/tournaments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTournament: (id, data) => authenticatedApiCall(`/api/tournaments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTournament: (id) => authenticatedApiCall(`/api/tournaments/${id}`, {
    method: 'DELETE',
  }),

  // User endpoints
  getUsers: () => authenticatedApiCall('/api/users'),
  getUser: (id) => authenticatedApiCall(`/api/users/${id}`),
  createUser: (data) => authenticatedApiCall('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id, data) => authenticatedApiCall(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => authenticatedApiCall(`/api/users/${id}`, {
    method: 'DELETE',
  }),

  // Match endpoints
  getMatches: () => authenticatedApiCall('/api/matches'),
  getMatchesByTournament: (tournamentId) => authenticatedApiCall(`/api/matches/tournament/${tournamentId}`),
  getMatch: (id) => authenticatedApiCall(`/api/matches/${id}`),
  createMatch: (data) => authenticatedApiCall('/api/matches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateMatch: (id, data) => authenticatedApiCall(`/api/matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateMatchResult: (id, data) => authenticatedApiCall(`/api/matches/${id}/result`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteMatch: (id) => authenticatedApiCall(`/api/matches/${id}`, {
    method: 'DELETE',
  }),
};

export default api; 