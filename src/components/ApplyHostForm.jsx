import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabaseClient';
import Button from './Button';
import './ApplyHostForm.css';

const ApplyHostForm = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    youtube_channel: '',
    experience: '',
    motivation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Get the current session and token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError('Authentication error. Please try logging in again.');
        return;
      }

      if (!session) {
        setError('No active session. Please log in again.');
        return;
      }

      const token = session.access_token;

      // Use the correct backend URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/apply-host`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(result.data);
        }
        // Clear form after successful submission
        setTimeout(() => {
          setFormData({
            youtube_channel: '',
            experience: '',
            motivation: ''
          });
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        setError(result.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Host application error:', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the backend is running on http://localhost:3001');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleReset = () => {
    setFormData({
      youtube_channel: '',
      experience: '',
      motivation: ''
    });
    setError('');
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="apply-host-modal">
        <div className="modal-overlay" onClick={handleClose}></div>
        <div className="modal-content success-content">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Application Submitted Successfully!</h2>
          <p className="success-message">
            Thank you for your interest in becoming a host. We'll review your application 
            and get back to you within 3-5 business days.
          </p>
          <div className="success-details">
            <div className="detail-item">
              <span className="detail-label">Application ID:</span>
              <span className="detail-value">{formData.id || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted:</span>
              <span className="detail-value">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="success-actions">
            <Button
              variant="primary"
              onClick={handleClose}
              className="close-button"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-host-modal">
      <div className="modal-overlay" onClick={handleClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Apply to Become a Host</h2>
          <button 
            className="close-button-icon" 
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="apply-host-form">
          <div className="form-section">
            <h3 className="section-title">Tell us about yourself</h3>
            
            <div className="form-group">
              <label htmlFor="youtube_channel" className="form-label">
                YouTube Channel (Optional)
              </label>
              <input
                type="url"
                id="youtube_channel"
                name="youtube_channel"
                value={formData.youtube_channel}
                onChange={handleInputChange}
                placeholder="https://youtube.com/@yourchannel"
                className="form-input"
              />
              <small className="form-help">
                If you have a YouTube channel where you stream or create content
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="experience" className="form-label required">
                Hosting Experience *
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Describe your experience hosting tournaments, managing events, or organizing gaming communities..."
                className="form-textarea"
                rows="4"
                required
              />
              <small className="form-help">
                Tell us about your experience with tournament hosting, event management, or community building
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="motivation" className="form-label required">
                Why do you want to become a host? *
              </label>
              <textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                placeholder="Share your motivation for becoming a tournament host and your vision for the community..."
                className="form-textarea"
                rows="4"
                required
              />
              <small className="form-help">
                Explain your goals, what you hope to achieve, and how you plan to contribute to the community
              </small>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isSubmitting}
              className="reset-button"
            >
              Reset Form
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.experience || !formData.motivation}
              className="submit-button"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="submit-icon">📝</span>
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyHostForm;
