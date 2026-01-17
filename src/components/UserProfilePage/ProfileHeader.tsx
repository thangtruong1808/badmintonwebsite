import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";
import type { User } from "../../types/user";
import RewardPointsCard from "./RewardPointsCard";

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-r from-rose-100 to-pink-200 rounded-xl p-6 md:p-8 shadow-lg">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-rose-500 rounded-full flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-huglove">
            {user.name}
          </h1>
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
