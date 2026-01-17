import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/mockAuth";
import {
  getUserTransactions,
  getUserEventHistory,
} from "../../utils/rewardPointsService";
import type { User, RewardPointTransaction, UserEventHistory } from "../../types/user";
import ProfileHeader from "./ProfileHeader";
import TransactionHistory from "./TransactionHistory";
import EventHistoryList from "./EventHistoryList";

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<RewardPointTransaction[]>([]);
  const [eventHistory, setEventHistory] = useState<UserEventHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "ChibiBadminton - My Profile";

    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Redirect to sign-in if not logged in
      navigate("/signin");
      return;
    }

    setUser(currentUser);
    setTransactions(getUserTransactions(currentUser.id));
    setEventHistory(getUserEventHistory(currentUser.id));
    setLoading(false);
  }, [navigate]);

  const handlePointsClaimed = () => {
    // Refresh user data and transactions
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setTransactions(getUserTransactions(currentUser.id));
      setEventHistory(getUserEventHistory(currentUser.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-calibri">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader user={user} />
        </div>

        {/* Transaction History and Event History Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transaction History */}
          <div>
            <TransactionHistory transactions={transactions} />
          </div>

          {/* Event History */}
          <div>
            <EventHistoryList
              history={eventHistory}
              onPointsClaimed={handlePointsClaimed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
