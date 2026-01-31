export type UserRole = "user" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  rewardPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  memberSince: string; // ISO date string
  avatar?: string;
}

export interface RewardPointTransaction {
  id: string;
  userId: string;
  eventId: number;
  eventTitle: string;
  points: number; // Positive for earned, negative for spent
  type: "earned" | "spent" | "bonus" | "refund";
  description: string;
  date: string; // ISO date string
  status: "completed" | "pending" | "cancelled";
}

export interface UserEventHistory {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  category: "regular" | "tournament";
  registrationDate: string;
  attendanceStatus: "attended" | "no-show" | "cancelled" | "upcoming";
  pointsEarned: number;
  pointsClaimed: boolean;
  pricePaid: number;
  paymentMethod: "stripe" | "points" | "mixed";
  pointsUsed?: number;
}
