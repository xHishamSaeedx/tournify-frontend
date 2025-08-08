import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import Button from './Button';
import './AdminManageHosts.css';

const AdminManageHosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentHosts, setCurrentHosts] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Get authentication token
  const getAuthToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('No active session');
    }
    return session.access_token;
  };

  // Fetch current hosts
  const fetchCurrentHosts = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${backendUrl}/api/admin/current-hosts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error('Failed to fetch hosts');
      }

      const result = await response.json();
      if (result.success) {
        setCurrentHosts(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch hosts');
      }
    } catch (error) {
      console.error('Error fetching hosts:', error);
      setError(error.message);
    }
  };

  // Fetch pending applications
  const fetchPendingApplications = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${backendUrl}/api/admin/pending-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error('Failed to fetch applications');
      }

      const result = await response.json();
      if (result.success) {
        setPendingApplications(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error.message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([fetchCurrentHosts(), fetchPendingApplications()]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Approve application
  const handleApproveApplication = async (applicationId) => {
    setActionLoading(prev => ({ ...prev, [`approve-${applicationId}`]: true }));
    try {
      const token = await getAuthToken();
      const response = await fetch(`${backendUrl}/api/admin/approve-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId })
      });

      const result = await response.json();
      if (result.success) {
        // Refresh both lists
        await Promise.all([fetchCurrentHosts(), fetchPendingApplications()]);
        alert(`✅ Application approved for ${result.data.user_email}`);
      } else {
        throw new Error(result.error || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`approve-${applicationId}`]: false }));
    }
  };

  // Reject application
  const handleRejectApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to reject this application? This action cannot be undone.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [`reject-${applicationId}`]: true }));
    try {
      const token = await getAuthToken();
      const response = await fetch(`${backendUrl}/api/admin/reject-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId })
      });

      const result = await response.json();
      if (result.success) {
        // Refresh applications list
        await fetchPendingApplications();
        alert(`❌ Application rejected for ${result.data.user_email}`);
      } else {
        throw new Error(result.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`reject-${applicationId}`]: false }));
    }
  };

  // Remove host
  const handleRemoveHost = async (userId) => {
    if (!confirm('Are you sure you want to remove this host? They will be set back to player role.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [`remove-${userId}`]: true }));
    try {
      const token = await getAuthToken();
      const response = await fetch(`${backendUrl}/api/admin/remove-host`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      if (result.success) {
        // Refresh hosts list
        await fetchCurrentHosts();
        alert(`👤 Host removed: ${result.data.user_email}`);
      } else {
        throw new Error(result.error || 'Failed to remove host');
      }
    } catch (error) {
      console.error('Error removing host:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`remove-${userId}`]: false }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-manage-hosts">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-manage-hosts">
        <div className="error-container">
          <h2>❌ Access Error</h2>
          <p>{error}</p>
          <p>This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-manage-hosts">
      <div className="admin-header">
        <div className="header-top">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <h1>🏆 Admin - Manage Hosts</h1>
        <p>Manage current hosts and review pending applications</p>
      </div>

      <div className="admin-content">
        {/* Current Hosts Section */}
        <div className="section-container">
          <div className="section-header">
            <h2>👥 Current Hosts ({currentHosts.length})</h2>
            <Button
              variant="secondary"
              onClick={() => fetchCurrentHosts()}
              className="refresh-button"
            >
              🔄 Refresh
            </Button>
          </div>

          {currentHosts.length === 0 ? (
            <div className="empty-state">
              <p>No hosts found.</p>
            </div>
          ) : (
            <div className="hosts-grid">
              {currentHosts.map((host) => (
                <div key={host.user_id} className="host-card">
                  <div className="host-info">
                    <div className="host-email">{host.user_email}</div>
                    <div className="host-date">
                      Host since: {formatDate(host.created_at)}
                    </div>
                  </div>
                  <div className="host-actions">
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveHost(host.user_id)}
                      disabled={actionLoading[`remove-${host.user_id}`]}
                      className="remove-button"
                    >
                      {actionLoading[`remove-${host.user_id}`] ? (
                        <>
                          <span className="loading-spinner"></span>
                          Removing...
                        </>
                      ) : (
                        <>
                          🗑️ Remove Host
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Applications Section */}
        <div className="section-container">
          <div className="section-header">
            <h2>📝 Pending Applications ({pendingApplications.length})</h2>
            <Button
              variant="secondary"
              onClick={() => fetchPendingApplications()}
              className="refresh-button"
            >
              🔄 Refresh
            </Button>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="empty-state">
              <p>No pending applications.</p>
            </div>
          ) : (
            <div className="applications-grid">
              {pendingApplications.map((application) => (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <div className="applicant-email">{application.user_email}</div>
                    <div className="application-date">
                      Applied: {formatDate(application.created_at)}
                    </div>
                  </div>

                  <div className="application-content">
                    {application.youtube_channel && (
                      <div className="application-field">
                        <label>YouTube Channel:</label>
                        <a 
                          href={application.youtube_channel} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="youtube-link"
                        >
                          {application.youtube_channel}
                        </a>
                      </div>
                    )}

                    <div className="application-field">
                      <label>Experience:</label>
                      <div className="field-content">{application.experience}</div>
                    </div>

                    <div className="application-field">
                      <label>Motivation:</label>
                      <div className="field-content">{application.motivation}</div>
                    </div>
                  </div>

                  <div className="application-actions">
                    <Button
                      variant="success"
                      onClick={() => handleApproveApplication(application.id)}
                      disabled={actionLoading[`approve-${application.id}`]}
                      className="approve-button"
                    >
                      {actionLoading[`approve-${application.id}`] ? (
                        <>
                          <span className="loading-spinner"></span>
                          Approving...
                        </>
                      ) : (
                        <>
                          ✅ Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleRejectApplication(application.id)}
                      disabled={actionLoading[`reject-${application.id}`]}
                      className="reject-button"
                    >
                      {actionLoading[`reject-${application.id}`] ? (
                        <>
                          <span className="loading-spinner"></span>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          ❌ Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageHosts;
