import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.getTournaments();
      setTournaments(response.data || []);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err.message || 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (tournamentData) => {
    try {
      const response = await api.createTournament(tournamentData);
      console.log('Tournament created:', response.data);
      
      // Refresh the list
      await fetchTournaments();
      
      return response.data;
    } catch (err) {
      console.error('Error creating tournament:', err);
      throw err;
    }
  };

  const deleteTournament = async (tournamentId) => {
    try {
      await api.deleteTournament(tournamentId);
      console.log('Tournament deleted successfully');
      
      // Refresh the list
      await fetchTournaments();
    } catch (err) {
      console.error('Error deleting tournament:', err);
      throw err;
    }
  };

  if (!user) {
    return (
      <div className="tournament-list">
        <h2>Tournaments</h2>
        <p>Please log in to view tournaments.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tournament-list">
        <h2>Tournaments</h2>
        <p>Loading tournaments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournament-list">
        <h2>Tournaments</h2>
        <p className="error">Error: {error}</p>
        <button onClick={fetchTournaments}>Retry</button>
      </div>
    );
  }

  return (
    <div className="tournament-list">
      <h2>Tournaments</h2>
      
      {tournaments.length === 0 ? (
        <p>No tournaments found.</p>
      ) : (
        <div className="tournaments-grid">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="tournament-card">
              <h3>{tournament.name}</h3>
              <p>{tournament.description}</p>
              <div className="tournament-meta">
                <span>Status: {tournament.status}</span>
                <span>Type: {tournament.tournament_type}</span>
                {tournament.max_participants && (
                  <span>Max: {tournament.max_participants}</span>
                )}
                <span>Host: {tournament.host?.display_name || tournament.host?.username || "Unknown Host"}</span>
              </div>
              
              {/* Only show delete button if user is the creator */}
              {tournament.created_by === user.id && (
                <button 
                  onClick={() => deleteTournament(tournament.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TournamentList; 