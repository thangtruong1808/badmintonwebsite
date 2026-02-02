import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/user";

export interface AuthState {
  /** User in memory only; JWTs in HTTP-only cookies. No localStorage. */
  user: User | null;
  /** Refresh token expiry (ms since epoch) for client-side auto-logout timer. */
  refreshTokenExpiresAt: number | null;
}

const initialState: AuthState = { user: null, refreshTokenExpiresAt: null };

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Set user after login/register/refresh/me; tokens are in HTTP-only cookies */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; expiresIn?: number; refreshTokenExpiresAt?: number }>
    ) => {
      state.user = action.payload.user;
      if (action.payload.refreshTokenExpiresAt !== undefined) {
        state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
      }
    },
    logout: (state) => {
      state.user = null;
      state.refreshTokenExpiresAt = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User> | User>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

/** Selectors */
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.user;
export const selectRefreshTokenExpiresAt = (state: { auth: AuthState }) =>
  state.auth.refreshTokenExpiresAt;
