import React, { useState, useRef } from "react";
import { FaEnvelope, FaPhone, FaCalendarAlt, FaCamera, FaSpinner } from "react-icons/fa";
import type { User } from "../../types/user";
import RewardPointsCard from "./RewardPointsCard";
import { apiFetch } from "../../utils/api";
import { setCredentials } from "../../store/authSlice";
import { useDispatch } from "react-redux";

interface ProfileHeaderProps {
  user: User;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onAvatarUpdate }) => {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('avatar', file);

      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to upload image');
      }

      const uploadData = await uploadRes.json();
      const avatarUrl = uploadData.url;

      // Update user profile with new avatar URL
      const updateRes = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await updateRes.json();

      // Update Redux store with new user data
      dispatch(setCredentials({
        user: updatedUser,
        refreshTokenExpiresAt: undefined,
      }));

      // Notify parent component
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarUrl);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl p-6 md:p-8 shadow-lg">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0 relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-rose-500 flex items-center justify-center text-white text-4xl md:text-5xl font-medium relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.firstName.charAt(0).toUpperCase()}</span>
            )}

            {/* Upload overlay */}
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
              title="Change avatar"
            >
              {uploading ? (
                <FaSpinner className="text-white text-2xl animate-spin" />
              ) : (
                <FaCamera className="text-white text-2xl" />
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {/* Upload hint text */}
          <p className="text-xs text-center mt-2 text-gray-600 font-calibri">
            {uploading ? 'Uploading...' : 'Click to change'}
          </p>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 mb-2 font-huglove">
            {user.firstName} {user.lastName}
          </h1>

          {/* Upload error message */}
          {uploadError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm font-calibri">
              {uploadError}
            </div>
          )}

          <div className="space-y-2 text-gray-700 font-calibri">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <FaEnvelope className="text-rose-500" size={16} />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <FaPhone className="text-rose-500" size={16} />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2">
              <FaCalendarAlt className="text-rose-500" size={16} />
              <span>Member since {formatDate(user.memberSince)}</span>
            </div>
          </div>
        </div>

        {/* Reward Points Card */}
        <div className="w-full md:w-auto">
          <RewardPointsCard user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
