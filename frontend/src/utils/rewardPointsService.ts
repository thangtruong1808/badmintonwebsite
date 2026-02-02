import type { RewardPointTransaction, UserEventHistory } from "../types/user";
import { getCurrentUser } from "./mockAuth";
import { apiFetch } from "./api";

/**
 * Get user's current reward points from API (requires auth).
 */
export async function getUserRewardPoints(_userId: string): Promise<number> {
  try {
    const res = await apiFetch("/api/rewards/points");
    if (res.ok) {
      const data = await res.json();
      return typeof data.points === "number" ? data.points : 0;
    }
  } catch {
    // ignore
  }
  const user = getCurrentUser();
  return user && user.id === _userId ? (user.rewardPoints ?? 0) : 0;
}

/**
 * Get user's reward point transactions from API (requires auth).
 */
export async function getUserTransactions(_userId: string): Promise<RewardPointTransaction[]> {
  try {
    const res = await apiFetch("/api/rewards/transactions");
    if (res.ok) {
      const list = await res.json();
      return Array.isArray(list) ? list : [];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Get user's event history from API (requires auth).
 */
export async function getUserEventHistory(_userId: string): Promise<UserEventHistory[]> {
  try {
    const res = await apiFetch("/api/rewards/event-history");
    if (res.ok) {
      const list = await res.json();
      return Array.isArray(list) ? list : [];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Claim points for an attended event via API (requires auth).
 */
export async function claimPointsForEvent(_userId: string, eventId: number): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/rewards/claim/${eventId}`, { method: "POST" });
    if (res.ok) return true;
  } catch {
    // ignore
  }
  return false;
}

/**
 * Check if user can claim points for an event (requires auth).
 * Uses event-history from API.
 */
export async function canClaimPoints(userId: string, eventId: number): Promise<boolean> {
  const history = await getUserEventHistory(userId);
  const eventHistory = history.find((h) => h.eventId === eventId);
  return (
    eventHistory !== undefined &&
    !eventHistory.pointsClaimed &&
    eventHistory.attendanceStatus === "attended"
  );
}

/**
 * Use points for booking via API (requires auth).
 */
export async function usePointsForBooking(
  _userId: string,
  eventId: number,
  points: number
): Promise<boolean> {
  try {
    const res = await apiFetch("/api/rewards/use-points", {
      method: "POST",
      body: JSON.stringify({ eventId, points }),
    });
    if (res.ok) return true;
  } catch {
    // ignore
  }
  return false;
}

/**
 * Calculate available points (from current user or API).
 */
export function calculateAvailablePoints(userId: string): number {
  const user = getCurrentUser();
  return user && user.id === userId ? (user.rewardPoints ?? 0) : 0;
}

/**
 * Get unclaimed points count from API (requires auth).
 */
export async function getUnclaimedPointsCount(_userId: string): Promise<number> {
  try {
    const res = await apiFetch("/api/rewards/unclaimed-count");
    if (res.ok) {
      const data = await res.json();
      return typeof data.count === "number" ? data.count : 0;
    }
  } catch {
    // ignore
  }
  return 0;
}
