import React, { useState, useRef } from "react";
import api from "../utils/api";
import "./ProfilePictureUpload.css";

const ProfilePictureUpload = ({ onUploadSuccess, currentAvatarUrl, userId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await api.uploadProfilePicture(selectedFile);
      
      if (response.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.avatar_url);
        }
      } else {
        setError(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await api.deleteProfilePicture();
      
      if (response.success) {
        if (onUploadSuccess) {
          onUploadSuccess(null);
        }
      } else {
        setError(response.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="profile-picture-upload">
      <div className="upload-section">
        <h3>Profile Picture</h3>
        
        {/* Current avatar display */}
        <div className="current-avatar">
          {currentAvatarUrl ? (
            <img 
              src={currentAvatarUrl} 
              alt="Current profile picture" 
              className="avatar-preview"
            />
          ) : (
            <div className="avatar-placeholder">
              <span>No profile picture</span>
            </div>
          )}
        </div>

        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Upload buttons */}
        <div className="upload-buttons">
          <button 
            type="button" 
            onClick={triggerFileSelect}
            className="select-file-btn"
            disabled={isUploading || isDeleting}
          >
            Select Image
          </button>
          
          {currentAvatarUrl && (
            <button 
              type="button" 
              onClick={handleDelete}
              className="delete-btn"
              disabled={isUploading || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Current'}
            </button>
          )}
        </div>

        {/* Preview and upload */}
        {selectedFile && (
          <div className="upload-preview">
            <h4>Preview:</h4>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="preview-image"
            />
            <div className="preview-actions">
              <button 
                type="button" 
                onClick={handleUpload}
                className="upload-btn"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="cancel-btn"
                disabled={isUploading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Upload info */}
        <div className="upload-info">
          <p>Supported formats: JPG, PNG, GIF</p>
          <p>Maximum file size: 5MB</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
