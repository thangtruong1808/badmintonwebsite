import type { RewardPointTransaction, UserEventHistory } from "../types/user";
import { getCurrentUser, setCurrentUser } from "./mockAuth";
import { mockRewardTransactions, mockUserEventHistory } from "../data/mockUserData";

const TRANSACTIONS_STORAGE_KEY = "chibibadminton_reward_transactions";
const EVENT_HISTORY_STORAGE_KEY = "chibibadminton_user_event_history";

// Initialize sample data if not exists
const initializeSampleData = (userId: string): void => {
  const transactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  if (!transactions) {
    const userTransactions = mockRewardTransactions.filter(tx => tx.userId === userId);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(userTransactions));
  }

  const history = localStorage.getItem(EVENT_HISTORY_STORAGE_KEY);
  if (!history) {
    const userHistory = mockUserEventHistory.filter(h => h.eventId); // All sample history
    localStorage.setItem(EVENT_HISTORY_STORAGE_KEY, JSON.stringify(userHistory));
  }
};

// Get user's reward points
export const getUserRewardPoints = (userId: string): number => {
  const user = getCurrentUser();
  if (user && user.id === userId) {
    return user.rewardPoints;
  }
  return 0;
};

// Get user's transactions
export const getUserTransactions = (userId: string): RewardPointTransaction[] => {
  initializeSampleData(userId);
  try {
    const transactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (transactions) {
      const allTransactions: RewardPointTransaction[] = JSON.parse(transactions);
      return allTransactions.filter(tx => tx.userId === userId);
    }
  } catch (error) {
    console.error("Error getting transactions:", error);
  }
  return mockRewardTransactions.filter(tx => tx.userId === userId);
};

// Get user's event history
export const getUserEventHistory = (userId: string): UserEventHistory[] => {
  initializeSampleData(userId);
  try {
    const history = localStorage.getItem(EVENT_HISTORY_STORAGE_KEY);
    if (history) {
      return JSON.parse(history);
    }
  } catch (error) {
    console.error("Error getting event history:", error);
  }
  return mockUserEventHistory;
};

// Claim points for an attended event
export const claimPointsForEvent = (userId: string, eventId: number): boolean => {
  const history = getUserEventHistory(userId);
  const eventHistory = history.find(h => h.eventId === eventId);
  
  if (!eventHistory || eventHistory.pointsClaimed || eventHistory.attendanceStatus !== "attended") {
    return false;
  }

  // Update history
  eventHistory.pointsClaimed = true;
  const updatedHistory = history.map(h => h.eventId === eventId ? eventHistory : h);
  localStorage.setItem(EVENT_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

  // Add transaction
  const transactions = getUserTransactions(userId);
  const newTransaction: RewardPointTransaction = {
    id: `tx-${Date.now()}`,
    userId,
    eventId,
    eventTitle: eventHistory.eventTitle,
    points: eventHistory.pointsEarned,
    type: "earned",
    description: `Claimed points for ${eventHistory.eventTitle}`,
    date: new Date().toISOString(),
    status: "completed",
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));

  // Update user points
  const user = getCurrentUser();
  if (user) {
    user.rewardPoints += eventHistory.pointsEarned;
    user.totalPointsEarned += eventHistory.pointsEarned;
    setCurrentUser(user);
  }

  return true;
};

// Check if user can claim points for an event
export const canClaimPoints = (userId: string, eventId: number): boolean => {
  const history = getUserEventHistory(userId);
  const eventHistory = history.find(h => h.eventId === eventId);
  return eventHistory !== undefined && 
         !eventHistory.pointsClaimed && 
         eventHistory.attendanceStatus === "attended";
};

// Use points for booking
export const usePointsForBooking = (userId: string, eventId: number, points: number): boolean => {
  const user = getCurrentUser();
  if (!user || user.rewardPoints < points) {
    return false;
  }

  // Update user points
  user.rewardPoints -= points;
  user.totalPointsSpent += points;
  setCurrentUser(user);

  // Add transaction
  const transactions = getUserTransactions(userId);
  const history = getUserEventHistory(userId);
  const eventHistory = history.find(h => h.eventId === eventId);
  
  const newTransaction: RewardPointTransaction = {
    id: `tx-${Date.now()}`,
    userId,
    eventId,
    eventTitle: eventHistory?.eventTitle || `Event ${eventId}`,
    points: -points,
    type: "spent",
    description: `Used ${points} points to book ${eventHistory?.eventTitle || `Event ${eventId}`}`,
    date: new Date().toISOString(),
    status: "completed",
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));

  return true;
};

// Calculate available points
export const calculateAvailablePoints = (userId: string): number => {
  const user = getCurrentUser();
  return user && user.id === userId ? user.rewardPoints : 0;
};

// Get unclaimed points count
export const getUnclaimedPointsCount = (userId: string): number => {
  const history = getUserEventHistory(userId);
  return history.filter(h => 
    h.attendanceStatus === "attended" && 
    !h.pointsClaimed
  ).length;
};
