import React, { useState } from "react";
import Button from "./Button";
import { setUserRole, getAllHosts } from "../utils/userRoles";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [showCreateHostForm, setShowCreateHostForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const tabs = [
    { id: "browse", label: "Browse All Tournaments", icon: "🏆" },
    { id: "create-hosts", label: "Create Hosts", icon: "👑" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "browse":
        return (
          <div className="tab-content">
            <div className="admin-controls">
              <h3>All Tournaments</h3>
              <div className="filters">
                <select placeholder="Filter by status">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Draft</option>
                </select>
                <select placeholder="Filter by game">
                  <option>All Games</option>
                  <option>Valorant</option>
                  <option>CS:GO</option>
                  <option>League of Legends</option>
                </select>
                <Button variant="secondary">Apply Filters</Button>
              </div>
            </div>

            <div className="tournaments-grid">
              <div className="tournament-card">
                <div className="tournament-header">
                  <h4>Valorant Championship 2024</h4>
                  <span className="status active">Active</span>
                </div>
                <div className="tournament-details">
                  <p>
                    <strong>Host:</strong> John Doe
                  </p>
                  <p>
                    <strong>Prize Pool:</strong> $10,000
                  </p>
                  <p>
                    <strong>Players:</strong> 128/128
                  </p>
                  <p>
                    <strong>Start Date:</strong> Dec 15, 2024
                  </p>
                </div>
                <div className="tournament-actions">
                  <Button variant="primary">View Details</Button>
                  <Button variant="secondary">Edit</Button>
                  <Button variant="outline">Suspend</Button>
                </div>
              </div>

              <div className="tournament-card">
                <div className="tournament-header">
                  <h4>Weekly Valorant Cup</h4>
                  <span className="status completed">Completed</span>
                </div>
                <div className="tournament-details">
                  <p>
                    <strong>Host:</strong> Jane Smith
                  </p>
                  <p>
                    <strong>Prize Pool:</strong> $2,000
                  </p>
                  <p>
                    <strong>Players:</strong> 64/64
                  </p>
                  <p>
                    <strong>Start Date:</strong> Dec 1, 2024
                  </p>
                </div>
                <div className="tournament-actions">
                  <Button variant="primary">View Results</Button>
                  <Button variant="secondary">Analytics</Button>
                </div>
              </div>

              <div className="tournament-card">
                <div className="tournament-header">
                  <h4>Valorant Pro League</h4>
                  <span className="status draft">Draft</span>
                </div>
                <div className="tournament-details">
                  <p>
                    <strong>Host:</strong> Mike Johnson
                  </p>
                  <p>
                    <strong>Prize Pool:</strong> $5,000
                  </p>
                  <p>
                    <strong>Players:</strong> 0/32
                  </p>
                  <p>
                    <strong>Start Date:</strong> Jan 15, 2025
                  </p>
                </div>
                <div className="tournament-actions">
                  <Button variant="primary">Review</Button>
                  <Button variant="secondary">Approve</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "create-hosts":
        return (
          <div className="tab-content">
            <div className="create-host-section">
              <div className="section-header">
                <h3>Manage Hosts</h3>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateHostForm(!showCreateHostForm)}
                >
                  {showCreateHostForm ? "Cancel" : "Create New Host"}
                </Button>
              </div>

              {showCreateHostForm && (
                <div className="create-host-form">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user) {
                        alert("Please sign in to create hosts");
                        return;
                      }

                      setIsSubmitting(true);
                      try {
                        // Here you would typically create the host role
                        // For now, we'll just show a success message
                        setTimeout(() => {
                          alert("Host created successfully!");
                          setShowCreateHostForm(false);
                          setIsSubmitting(false);
                        }, 1000);
                      } catch (error) {
                        alert("Error creating host. Please try again.");
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label>User Email</label>
                        <input type="email" placeholder="Enter user email" />
                      </div>
                      <div className="form-group">
                        <label>User ID</label>
                        <input type="text" placeholder="Enter user ID" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Role</label>
                      <select>
                        <option value="host">Host</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Reason for Promotion</label>
                      <textarea
                        placeholder="Explain why this user should be promoted..."
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <Button
                        variant="secondary"
                        onClick={() => setShowCreateHostForm(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Create Host"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="hosts-list">
                <h4>Current Hosts</h4>
                <div className="hosts-grid">
                  <div className="host-card">
                    <div className="host-info">
                      <h5>John Doe</h5>
                      <p>john.doe@example.com</p>
                      <span className="role host">Host</span>
                    </div>
                    <div className="host-stats">
                      <p>
                        <strong>Tournaments Created:</strong> 5
                      </p>
                      <p>
                        <strong>Active Tournaments:</strong> 2
                      </p>
                    </div>
                    <div className="host-actions">
                      <Button variant="secondary">View Profile</Button>
                      <Button variant="outline">Remove Host</Button>
                    </div>
                  </div>

                  <div className="host-card">
                    <div className="host-info">
                      <h5>Jane Smith</h5>
                      <p>jane.smith@example.com</p>
                      <span className="role host">Host</span>
                    </div>
                    <div className="host-stats">
                      <p>
                        <strong>Tournaments Created:</strong> 3
                      </p>
                      <p>
                        <strong>Active Tournaments:</strong> 1
                      </p>
                    </div>
                    <div className="host-actions">
                      <Button variant="secondary">View Profile</Button>
                      <Button variant="outline">Remove Host</Button>
                    </div>
                  </div>

                  <div className="host-card">
                    <div className="host-info">
                      <h5>Mike Johnson</h5>
                      <p>mike.johnson@example.com</p>
                      <span className="role admin">Admin</span>
                    </div>
                    <div className="host-stats">
                      <p>
                        <strong>Tournaments Created:</strong> 8
                      </p>
                      <p>
                        <strong>Active Tournaments:</strong> 3
                      </p>
                    </div>
                    <div className="host-actions">
                      <Button variant="secondary">View Profile</Button>
                      <Button variant="outline">Remove Admin</Button>
                    </div>
                  </div>
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
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Manage tournaments and user roles</p>
      </div>

      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">{renderTabContent()}</div>
    </div>
  );
};

export default AdminDashboard;
