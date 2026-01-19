import type { User } from "../types/user";
import { mockCurrentUser } from "../data/mockUserData";

const CURRENT_USER_KEY = "chibibadminton_current_user";

// Simulate login - in real app, this would call an API
export const mockLogin = (email: string, password: string): User | null => {
  // Simple mock: accept any email/password for demo
  // In production, this would validate against backend
  if (email && password && password.length >= 6) {
    const user = { ...mockCurrentUser, email };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

// Get current logged-in user
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  return null;
};

// Set current user
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Clear current user (logout)
export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};
