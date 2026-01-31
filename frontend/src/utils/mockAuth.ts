import type { User } from "../types/user";

const CURRENT_USER_KEY = "chibibadminton_current_user";
const AUTH_TOKEN_KEY = "chibibadminton_token";

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
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// Check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};
