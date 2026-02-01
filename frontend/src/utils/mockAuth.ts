import type { User } from "../types/user";
import { store } from "../store";
import { logout, updateUser } from "../store/authSlice";

/** Get current user from Redux store (replaces React Context) */
export const getCurrentUser = (): User | null => {
  return store.getState().auth.user;
};

/** Update current user in store (e.g. after claiming points). Use setCredentials after login/register. */
export const setCurrentUser = (user: User): void => {
  store.dispatch(updateUser(user));
};

/** Clear auth state (logout) */
export const clearCurrentUser = (): void => {
  store.dispatch(logout());
};

/** Check if user is logged in */
export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};
