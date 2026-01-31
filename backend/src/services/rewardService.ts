import type { RewardPointTransaction, UserEventHistory } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import { getUserById, updateUserPoints } from './userService.js';
import { getRegistrationByEventAndUser, getRegistrationById } from './registrationService.js';
import { getEventById } from './eventService.js';

// In-memory storage (replace with database later)
let transactions: RewardPointTransaction[] = [];
let eventHistory: UserEventHistory[] = [];

export const getUserRewardPoints = async (userId: string): Promise<number> => {
  const user = await getUserById(userId);
  return user?.rewardPoints || 0;
};

export const getUserTransactions = async (
  userId: string
): Promise<RewardPointTransaction[]> => {
  return transactions.filter((tx) => tx.userId === userId);
};

export const getRewardTransactionsCount = async (): Promise<number> => {
  return transactions.length;
};

export const getUserEventHistory = async (userId: string): Promise<UserEventHistory[]> => {
  return eventHistory.filter((h) => {
    // Match by userId if available, or check through registrations
    // For now, we'll need to enhance this when we link history to registrations
    return true; // Placeholder - needs proper implementation
  });
};

export const getUnclaimedPointsCount = async (userId: string): Promise<number> => {
  const history = await getUserEventHistory(userId);
  return history.filter(
    (h) => h.attendanceStatus === 'attended' && !h.pointsClaimed
  ).length;
};

export const claimPointsForEvent = async (
  userId: string,
  eventId: number
): Promise<boolean> => {
  const history = await getUserEventHistory(userId);
  const eventHistoryItem = history.find((h) => h.eventId === eventId);

  if (
    !eventHistoryItem ||
    eventHistoryItem.pointsClaimed ||
    eventHistoryItem.attendanceStatus !== 'attended'
  ) {
    return false;
  }

  // Update history
  eventHistoryItem.pointsClaimed = true;
  const historyIndex = eventHistory.findIndex((h) => h.eventId === eventId);
  if (historyIndex !== -1) {
    eventHistory[historyIndex] = eventHistoryItem;
  }

  // Create transaction
  const transaction: RewardPointTransaction = {
    id: `tx-${Date.now()}`,
    userId,
    eventId,
    eventTitle: eventHistoryItem.eventTitle,
    points: eventHistoryItem.pointsEarned,
    type: 'earned',
    description: `Claimed points for ${eventHistoryItem.eventTitle}`,
    date: new Date().toISOString(),
    status: 'completed',
  };
  transactions.push(transaction);

  // Update user points
  await updateUserPoints(userId, eventHistoryItem.pointsEarned, 'earned');

  return true;
};

export const usePointsForBooking = async (
  userId: string,
  eventId: number,
  points: number
): Promise<boolean> => {
  const user = await getUserById(userId);
  if (!user || user.rewardPoints < points) {
    return false;
  }

  // Update user points
  await updateUserPoints(userId, points, 'spent');

  // Get event for transaction
  const event = await getEventById(eventId);

  // Create transaction
  const transaction: RewardPointTransaction = {
    id: `tx-${Date.now()}`,
    userId,
    eventId,
    eventTitle: event?.title || `Event ${eventId}`,
    points: -points,
    type: 'spent',
    description: `Used ${points} points to book ${event?.title || `Event ${eventId}`}`,
    date: new Date().toISOString(),
    status: 'completed',
  };
  transactions.push(transaction);

  return true;
};

// Helper to create event history from registration
export const createEventHistoryFromRegistration = async (
  registrationId: string,
  attendanceStatus: 'attended' | 'no-show' | 'cancelled',
  pointsEarned: number
): Promise<UserEventHistory | null> => {
  const registration = await getRegistrationById(registrationId);
  if (!registration || !registration.userId) {
    return null;
  }

  const event = await getEventById(registration.eventId);
  if (!event) {
    return null;
  }

  const historyItem: UserEventHistory = {
    eventId: registration.eventId,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    location: event.location,
    category: event.category,
    registrationDate: registration.registrationDate,
    attendanceStatus,
    pointsEarned,
    pointsClaimed: false,
    pricePaid: event.price || 0,
    paymentMethod: registration.paymentMethod || 'stripe',
    pointsUsed: registration.pointsUsed,
  };

  eventHistory.push(historyItem);
  return historyItem;
};
