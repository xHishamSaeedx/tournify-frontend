import React, { useState, useRef, useCallback } from "react";
import api from "../utils/api";
import "./ProfilePictureUpload.css";

const ProfilePictureUpload = ({
  onUploadSuccess,
  currentAvatarUrl,
  userId,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview and show cropper
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
        setShowCropper(true);
        // Reset crop area to center
        setTimeout(() => {
          if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height) * 0.8;
            setCropArea({
              x: (rect.width - size) / 2,
              y: (rect.height - size) / 2,
              size: size,
            });
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = useCallback(
    (e) => {
      if (!showCropper) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if click is within crop area
      if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.size &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.size
      ) {
        setIsDragging(true);
        setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
      }
    },
    [showCropper, cropArea]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !showCropper) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragStart.x;
      const y = e.clientY - rect.top - dragStart.y;

      // Constrain to image bounds
      const maxX = rect.width - cropArea.size;
      const maxY = rect.height - cropArea.size;

      setCropArea((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      }));
    },
    [isDragging, showCropper, dragStart, cropArea.size]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const cropImage = () => {
    if (!imageRef.current || !selectedFile) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const rect = imageRef.current.getBoundingClientRect();
      const scaleX = img.width / rect.width;
      const scaleY = img.height / rect.height;

      const cropSize = cropArea.size * scaleX;
      const cropX = cropArea.x * scaleX;
      const cropY = cropArea.y * scaleY;

      canvas.width = cropSize;
      canvas.height = cropSize;

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        cropSize,
        cropSize
      );

      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], selectedFile.name, {
          type: selectedFile.type,
          lastModified: Date.now(),
        });
        setSelectedFile(croppedFile);
        setPreviewUrl(canvas.toDataURL());
        setShowCropper(false);
      }, selectedFile.type);
    };

    img.src = previewUrl;
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
        setShowCropper(false);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.avatar_url);
        }
      } else {
        setError(response.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Upload failed");
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
        setError(response.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowCropper(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          style={{ display: "none" }}
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
              {isDeleting ? "Deleting..." : "Delete Current"}
            </button>
          )}
        </div>

        {/* Cropper */}
        {showCropper && (
          <div className="cropper-container">
            <h4>Crop your profile picture:</h4>
            <p className="cropper-instructions">
              Drag the circular selection to choose which part of the image to
              use
            </p>
            <div
              className="image-container"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Crop preview"
                className="crop-image"
                draggable={false}
              />
              <div
                className="crop-area"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.size,
                  height: cropArea.size,
                }}
              />
            </div>
            <div className="cropper-actions">
              <button
                type="button"
                onClick={cropImage}
                className="crop-btn"
                disabled={isUploading}
              >
                Crop & Continue
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

        {/* Preview and upload */}
        {selectedFile && !showCropper && (
          <div className="upload-preview">
            <h4>Preview:</h4>
            <img src={previewUrl} alt="Preview" className="preview-image" />
            <div className="preview-actions">
              <button
                type="button"
                onClick={handleUpload}
                className="upload-btn"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
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
        {error && <div className="error-message">{error}</div>}

        {/* Upload info */}
        <div className="upload-info">
          <p>Supported formats: JPG, PNG, GIF</p>
          <p>Maximum file size: 5MB</p>
          <p>Drag the circular selection to crop your image</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
