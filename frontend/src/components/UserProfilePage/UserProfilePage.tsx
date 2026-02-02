import React, { useState, useEffect } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<RewardPointTransaction[]>([]);
  const [eventHistory, setEventHistory] = useState<UserEventHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "ChibiBadminton - My Profile";

    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      Promise.all([
        getUserTransactions(currentUser.id),
        getUserEventHistory(currentUser.id),
      ]).then(([txs, history]) => {
        setTransactions(txs);
        setEventHistory(history);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handlePointsClaimed = async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const [txs, history] = await Promise.all([
        getUserTransactions(currentUser.id),
        getUserEventHistory(currentUser.id),
      ]);
      setTransactions(txs);
      setEventHistory(history);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // Update local user state with new avatar
    if (user) {
      setUser({ ...user, avatar: newAvatarUrl });
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 w-full bg-gradient-to-b from-pink-100 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-calibri">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="absolute inset-0 w-full bg-gradient-to-b from-pink-100 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-calibri">No user data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full overflow-x-hidden bg-gradient-to-b from-rose-50 to-rose-100">
      <div className="container mx-auto px-4 pt-28 pb-6">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader user={user} onAvatarUpdate={handleAvatarUpdate} />
        </div>

        {/* Transaction History and Event History Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
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
