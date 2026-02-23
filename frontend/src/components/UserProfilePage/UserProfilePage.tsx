import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setCredentials } from "../../store/authSlice";
import { apiFetch } from "../../utils/api";
import {
  getUserTransactions,
  getUserEventHistory,
} from "../../utils/rewardPointsService";
import { getUserRegistrations, getMyPendingPayments } from "../../utils/registrationService";
import type { User, RewardPointTransaction, UserEventHistory } from "../../types/user";
import type { RegistrationWithEventDetails } from "../../types/socialEvent";
import ProfileHeader from "./ProfileHeader";
import TransactionHistory from "./TransactionHistory";
import EventHistoryList from "./EventHistoryList";

/** Normalize API user to frontend User (handles camelCase from backend). */
function normalizeUser(data: Record<string, unknown>): User {
  return {
    id: String(data.id ?? ""),
    firstName: String(data.firstName ?? data.first_name ?? ""),
    lastName: String(data.lastName ?? data.last_name ?? ""),
    email: String(data.email ?? ""),
    phone: data.phone != null ? String(data.phone) : undefined,
    role: (data.role as User["role"]) ?? undefined,
    rewardPoints: Number(data.rewardPoints ?? data.reward_points ?? 0),
    totalPointsEarned: Number(data.totalPointsEarned ?? data.total_points_earned ?? 0),
    totalPointsSpent: Number(data.totalPointsSpent ?? data.total_points_spent ?? 0),
    memberSince: String(data.memberSince ?? data.member_since ?? ""),
    avatar: data.avatar != null ? String(data.avatar) : undefined,
  };
}

const UserProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<RewardPointTransaction[]>([]);
  const [eventHistory, setEventHistory] = useState<UserEventHistory[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationWithEventDetails[]>([]);
  const [pendingPayments, setPendingPayments] = useState<RegistrationWithEventDetails[]>([]);
  const [includeCancelled, setIncludeCancelled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/users/me");
      if (!res.ok) {
        setUser(null);
        if (res.status === 401) {
          setError("Please sign in to view your profile.");
        } else {
          setError("Could not load profile.");
        }
        return;
      }
      const data = await res.json().catch(() => ({}));
      const profileUser = normalizeUser(data);
      setUser(profileUser);
      dispatch(setCredentials({ user: profileUser }));

      const [txs, history, regs, pending] = await Promise.all([
        getUserTransactions(profileUser.id),
        getUserEventHistory(profileUser.id),
        getUserRegistrations(profileUser.id, { includeCancelled: true }),
        getMyPendingPayments(profileUser.id),
      ]);
      setTransactions(txs);
      setEventHistory(history);
      setRegistrations(regs);
      setPendingPayments(pending);
    } catch {
      setUser(null);
      setError("Could not load profile.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    document.title = "ChibiBadminton - My Profile";
    fetchProfile();
  }, [fetchProfile]);

  const handlePointsClaimed = async () => {
    await fetchProfile();
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // Update local user state with new avatar
    if (user) {
      setUser({ ...user, avatar: newAvatarUrl });
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 w-full bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-calibri">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="absolute inset-0 w-full bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 font-calibri">
            {error || "No user data available."}
          </p>
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

        {pendingPayments.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-500 rounded-xl">
            <p className="font-semibold text-amber-800 font-calibri mb-2">
              You have {pendingPayments.length} reserved spot{pendingPayments.length > 1 ? "s" : ""} – pay within 24 hours
            </p>
            <ul className="space-y-1 mb-3">
              {pendingPayments.map((r) => (
                <li key={r.id} className="text-amber-800 font-calibri">
                  {r.eventTitle} – {r.eventDate} {r.eventTime ?? ""}
                </li>
              ))}
            </ul>
            <Link
              to={`/play/payment?pending=${pendingPayments[0]?.id}`}
              className="inline-block py-2 px-4 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors font-calibri"
            >
              Pay now
            </Link>
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
              registrations={registrations}
              includeCancelled={includeCancelled}
              onToggleIncludeCancelled={() => setIncludeCancelled((v) => !v)}
              onRefetch={fetchProfile}
              onPointsClaimed={handlePointsClaimed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
