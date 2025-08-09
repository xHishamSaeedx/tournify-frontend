import React, { useState } from "react";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";
import CreateTournamentForm from "./CreateTournamentForm";

const HostDashboard = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();

  const tabs = [
    { id: "create", label: "Create Tournaments", icon: "➕" },
    { id: "my-tournaments", label: "My Created Tournaments", icon: "🏆" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "create":
        return (
          <div className="tab-content">
            <div className="create-tournament-section">
              <div className="section-header">
                <h3>Create New Tournament</h3>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? "Cancel" : "Create Tournament"}
                </Button>
              </div>

              {showCreateForm && (
                <CreateTournamentForm
                  onClose={() => setShowCreateForm(false)}
                  onSuccess={(tournament) => {
                    console.log("Tournament created:", tournament);
                    setShowCreateForm(false);
                  }}
                />
              )}
            </div>
          </div>
        );

      case "my-tournaments":
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
                  <p>
                    <strong>Prize Pool:</strong> $10,000
                  </p>
                  <p>
                    <strong>Players:</strong> 128/128
                  </p>
                  <p>
                    <strong>Start Date:</strong> Dec 15, 2024
                  </p>
                  <p>
                    <strong>Status:</strong> Registration Open
                  </p>
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
                  <p>
                    <strong>Prize Pool:</strong> $2,000
                  </p>
                  <p>
                    <strong>Players:</strong> 64/64
                  </p>
                  <p>
                    <strong>Start Date:</strong> Dec 1, 2024
                  </p>
                  <p>
                    <strong>Status:</strong> Finished
                  </p>
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
                  <p>
                    <strong>Prize Pool:</strong> $5,000
                  </p>
                  <p>
                    <strong>Players:</strong> 0/32
                  </p>
                  <p>
                    <strong>Start Date:</strong> Jan 15, 2025
                  </p>
                  <p>
                    <strong>Status:</strong> Not Published
                  </p>
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

export default HostDashboard;
