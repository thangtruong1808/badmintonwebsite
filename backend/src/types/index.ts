// User types
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string; // Hashed password, should not be returned in responses
  role: UserRole;
  rewardPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  memberSince: string; // ISO date string
  avatar?: string;
  isBlocked?: boolean;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  rewardPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  memberSince: string;
  avatar?: string;
  isBlocked?: boolean;
}

// Event types
export interface SocialEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  dayOfWeek: string;
  location: string;
  description: string;
  maxCapacity: number;
  currentAttendees: number;
  price?: number;
  imageUrl?: string;
  status: "available" | "full" | "completed" | "cancelled";
  category: "regular" | "tournament";
  recurring?: boolean;
}

// Registration types
export interface Registration {
  id?: string;
  eventId: number;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: "pending" | "confirmed" | "cancelled" | "pending_payment";
  attendanceStatus?: "attended" | "no-show" | "cancelled" | "upcoming";
  pointsEarned?: number;
  pointsClaimed?: boolean;
  paymentMethod?: "stripe" | "points" | "mixed";
  pointsUsed?: number;
  guestCount?: number;
  pendingPaymentExpiresAt?: string;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
}

// Reward Point types
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

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresAt?: string;
}
