import React, { useState } from "react";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";

const HostDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const tabs = [
    { id: 'create', label: 'Create Tournaments', icon: '➕' },
    { id: 'my-tournaments', label: 'My Created Tournaments', icon: '🏆' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="tab-content">
            <div className="create-tournament-section">
              <div className="section-header">
                <h3>Create New Tournament</h3>
                <Button 
                  variant="primary" 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? 'Cancel' : 'Create Tournament'}
                </Button>
              </div>
              
              {showCreateForm && (
                <div className="create-form">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user) {
                      alert('Please sign in to create tournaments');
                      return;
                    }
                    
                    setIsSubmitting(true);
                    // Here you would typically save the tournament to your database
                    setTimeout(() => {
                      alert('Tournament created successfully!');
                      setShowCreateForm(false);
                      setIsSubmitting(false);
                    }, 1000);
                  }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Tournament Name</label>
                        <input type="text" placeholder="Enter tournament name" />
                      </div>
                      <div className="form-group">
                        <label>Game Type</label>
                        <select>
                          <option>Valorant</option>
                          <option>CS:GO</option>
                          <option>League of Legends</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input type="date" />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Prize Pool ($)</label>
                        <input type="number" placeholder="Enter prize pool amount" />
                      </div>
                      <div className="form-group">
                        <label>Max Players</label>
                        <select>
                          <option>8</option>
                          <option>16</option>
                          <option>32</option>
                          <option>64</option>
                          <option>128</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Tournament Description</label>
                      <textarea 
                        placeholder="Describe your tournament rules, format, and requirements..."
                        rows="4"
                      ></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Entry Fee ($)</label>
                      <input type="number" placeholder="Enter entry fee in dollars" />
                    </div>
                    
                    <div className="form-actions">
                      <Button 
                        variant="secondary" 
                        onClick={() => setShowCreateForm(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Tournament'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'my-tournaments':
        return (
          <div className="tab-content">
            <h3>My Created Tournaments</h3>
            <div className="tournaments-grid">
              <div className="tournament-card">
                <div className="tournament-header">
                  <h4>Valorant Championship 2024</h4>
                  <span className="status active">Active</span>
                </div>
                <div className="tournament-details">
                  <p><strong>Prize Pool:</strong> $10,000</p>
                  <p><strong>Players:</strong> 128/128</p>
                  <p><strong>Start Date:</strong> Dec 15, 2024</p>
                  <p><strong>Status:</strong> Registration Open</p>
                </div>
                <div className="tournament-actions">
                  <Button variant="primary">Manage Tournament</Button>
                  <Button variant="secondary">View Details</Button>
                </div>
              </div>
              
              <div className="tournament-card">
                <div className="tournament-header">
                  <h4>Weekly Valorant Cup</h4>
                  <span className="status completed">Completed</span>
                </div>
                <div className="tournament-details">
                  <p><strong>Prize Pool:</strong> $2,000</p>
                  <p><strong>Players:</strong> 64/64</p>
                  <p><strong>Start Date:</strong> Dec 1, 2024</p>
                  <p><strong>Status:</strong> Finished</p>
                </div>
                <div className="tournament-actions">
                  <Button variant="secondary">View Results</Button>
                  <Button variant="outline">Duplicate</Button>
                </div>
              </div>
              
              <div className="tournament-card">
                <div className="tournament-header">
                  <h4>Valorant Pro League</h4>
                  <span className="status draft">Draft</span>
                </div>
                <div className="tournament-details">
                  <p><strong>Prize Pool:</strong> $5,000</p>
                  <p><strong>Players:</strong> 0/32</p>
                  <p><strong>Start Date:</strong> Jan 15, 2025</p>
                  <p><strong>Status:</strong> Not Published</p>
                </div>
                <div className="tournament-actions">
                  <Button variant="primary">Publish</Button>
                  <Button variant="secondary">Edit</Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="host-dashboard">
      <div className="dashboard-header">
        <h2>Host Dashboard</h2>
        <p>Create and manage your tournaments</p>
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

export default HostDashboard;
