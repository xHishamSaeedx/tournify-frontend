import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import BackButton from './BackButton';

function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <BackButton />
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {getInitials(user.email)}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {user.user_metadata?.full_name || user.email}
              </h1>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">Player</p>
            </div>
          </div>
          
          <div className="profile-actions">
            <button
              onClick={handleSignOut}
              className="signout-button"
            >
              <span className="signout-icon">🚪</span>
              <span className="signout-text">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 