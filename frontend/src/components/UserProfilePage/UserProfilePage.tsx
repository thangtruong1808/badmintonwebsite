import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/mockAuth";
import {
  getUserTransactions,
  getUserEventHistory,
} from "../../utils/rewardPointsService";
import type { User, RewardPointTransaction, UserEventHistory, UserRole } from "../../types/user";
import ProfileHeader from "./ProfileHeader";
import TransactionHistory from "./TransactionHistory";
import EventHistoryList from "./EventHistoryList";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const AUTH_TOKEN_KEY = "chibibadminton_token";

interface DashboardStats {
  usersCount: number;
  eventsCount: number;
  registrationsCount: number;
  rewardTransactionsCount: number;
}

const MOCK_STATS: DashboardStats = {
  usersCount: 1,
  eventsCount: 0,
  registrationsCount: 0,
  rewardTransactionsCount: 0,
};

const isAdmin = (role?: UserRole): boolean =>
  role === "admin" || role === "super_admin";

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<RewardPointTransaction[]>([]);
  const [eventHistory, setEventHistory] = useState<UserEventHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

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

  // Fetch dashboard stats for admin/super_admin
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isAdmin(currentUser.role)) return;

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const fetchStats = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setDashboardStats(data);
            return;
          }
          setDashboardError("Could not load dashboard stats. Showing mock data.");
        } catch {
          setDashboardError("Could not reach the server. Showing mock data.");
        }
      }
      setDashboardStats(MOCK_STATS);
    };

    fetchStats().finally(() => setDashboardLoading(false));
  }, []);

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
      <div className="absolute inset-0 w-full bg-gradient-to-b from-pink-100 to-pink-200 flex items-center justify-center">
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
    <div className="absolute inset-0 w-full overflow-x-hidden bg-gradient-to-b from-pink-100 to-pink-200">
      <div className="container mx-auto px-4 pt-28 pb-6">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader user={user} />
        </div>

        {/* Dashboard (admin/super_admin only) */}
        {isAdmin(user.role) && (
          <div className="mb-8">
            <h2 className="font-huglove text-2xl md:text-3xl text-gray-800 mb-1">
              Dashboard
            </h2>
            <p className="font-calibri text-gray-600 mb-4">
              Admin overview for ChibiBadminton
            </p>
            {dashboardLoading && (
              <p className="font-calibri text-gray-600">Loading stats…</p>
            )}
            {dashboardError && (
              <p className="font-calibri text-rose-600 mb-2">{dashboardError}</p>
            )}
            {!dashboardLoading && dashboardStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
                  <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                    Total Users
                  </p>
                  <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                    {dashboardStats.usersCount}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
                  <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                    Total Events
                  </p>
                  <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                    {dashboardStats.eventsCount}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
                  <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                    Registrations
                  </p>
                  <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                    {dashboardStats.registrationsCount}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-rose-100">
                  <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                    Reward Transactions
                  </p>
                  <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                    {dashboardStats.rewardTransactionsCount}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

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
