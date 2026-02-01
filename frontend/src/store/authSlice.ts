import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/user";

const AUTH_STORAGE_KEY = "chibibadminton_auth";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** Unix ms when access token expires */
  expiresAt: number | null;
}

function loadInitialAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null, refreshToken: null, expiresAt: null };
    const data = JSON.parse(raw) as AuthState;
    return {
      user: data.user ?? null,
      accessToken: data.accessToken ?? null,
      refreshToken: data.refreshToken ?? null,
      expiresAt: data.expiresAt ?? null,
    };
  } catch {
    return { user: null, accessToken: null, refreshToken: null, expiresAt: null };
  }
}

function saveAuth(state: AuthState) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const initialState: AuthState = loadInitialAuth();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>
    ) => {
      const { user, accessToken, refreshToken, expiresIn } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.expiresAt = Date.now() + expiresIn * 1000;
      saveAuth(state);
    },
    updateAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string; expiresIn: number }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
      saveAuth(state);
    },
    /** Update both access and refresh tokens (e.g. after token rotation) */
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
        expiresIn: number;
        refreshExpiresAt?: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
      if (action.payload.refreshToken != null) {
        state.refreshToken = action.payload.refreshToken;
      }
      saveAuth(state);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresAt = null;
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // ignore
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User> | User>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveAuth(state);
      }
    },
  },
});

export const { setCredentials, updateAccessToken, updateTokens, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

/** Selectors */
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectExpiresAt = (state: { auth: AuthState }) => state.auth.expiresAt;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.user && !!state.auth.accessToken;
