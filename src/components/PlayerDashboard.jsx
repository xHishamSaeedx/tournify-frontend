import React, { useState } from "react";
import Button from "./Button";
import { setUserRole } from "../utils/userRoles";
import { useAuth } from "../contexts/AuthContext";

const PlayerDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const tabs = [
    { id: 'browse', label: 'Browse Tournaments', icon: '🏆' },
    { id: 'joined', label: 'Joined Tournaments', icon: '🎮' },
    { id: 'claim', label: 'Claim Match Win Money', icon: '💰' },
    { id: 'apply', label: 'Apply for Host', icon: '📝' },
    { id: 'credits', label: 'Show Credits', icon: '💎' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'browse':
        return (
          <div className="tab-content">
            <h3>Available Tournaments</h3>
            <div className="tournament-grid">
              {/* Placeholder tournament cards */}
              <div className="tournament-card">
                <h4>Valorant Championship 2024</h4>
                <p>Prize Pool: $10,000</p>
                <p>Players: 128/128</p>
                <Button variant="primary">Join Tournament</Button>
              </div>
              <div className="tournament-card">
                <h4>Weekly Valorant Cup</h4>
                <p>Prize Pool: $2,000</p>
                <p>Players: 64/64</p>
                <Button variant="primary">Join Tournament</Button>
              </div>
            </div>
          </div>
        );
      
      case 'joined':
        return (
          <div className="tab-content">
            <h3>Your Active Tournaments</h3>
            <div className="tournament-list">
              <div className="tournament-item">
                <h4>Valorant Championship 2024</h4>
                <p>Status: In Progress</p>
                <p>Next Match: Tomorrow 8:00 PM</p>
                <Button variant="secondary">View Details</Button>
              </div>
            </div>
          </div>
        );
      
      case 'claim':
        return (
          <div className="tab-content">
            <h3>Claim Your Winnings</h3>
            <div className="claim-section">
              <div className="claim-card">
                <h4>Tournament Victory</h4>
                <p>Tournament: Weekly Valorant Cup</p>
                <p>Amount: $500</p>
                <Button variant="primary">Claim Now</Button>
              </div>
            </div>
          </div>
        );
      
      case 'apply':
        return (
          <div className="tab-content">
            <h3>Apply for Host Role</h3>
            <div className="apply-form">
              <p>To become a tournament host, please fill out the application form below:</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user) {
                  alert('Please sign in to apply for host role');
                  return;
                }
                
                setIsSubmitting(true);
                try {
                  const result = await setUserRole(user.id, user.email, 'host');
                  if (result.success) {
                    alert('Application submitted successfully! An admin will review your application.');
                  } else {
                    alert('Failed to submit application. Please try again.');
                  }
                } catch (error) {
                  alert('Error submitting application. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                <div className="form-group">
                  <label>Experience Level</label>
                  <select required>
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Previous Tournament Experience</label>
                  <textarea 
                    placeholder="Describe your experience organizing tournaments..." 
                    required
                    rows="4"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Why do you want to become a host?</label>
                  <textarea 
                    placeholder="Explain your motivation..." 
                    required
                    rows="4"
                  ></textarea>
                </div>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </div>
          </div>
        );
      
      case 'credits':
        return (
          <div className="tab-content">
            <h3>Your Credits</h3>
            <div className="credits-display">
              <div className="credits-card">
                <h4>Current Balance</h4>
                <div className="credits-amount">1,250 Credits</div>
                <p>Use credits to join premium tournaments and unlock special features.</p>
                <Button variant="primary">Buy More Credits</Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="player-dashboard">
      <div className="dashboard-header">
        <h2>Player Dashboard</h2>
        <p>Manage your tournaments and account</p>
      </div>
      
      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PlayerDashboard;
