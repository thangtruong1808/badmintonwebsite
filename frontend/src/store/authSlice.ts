import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/user";

const AUTH_STORAGE_KEY = "chibibadminton_auth_user";

export interface AuthState {
  /** Only non-sensitive user info for UI; JWTs are in HTTP-only cookies */
  user: User | null;
}

function loadInitialAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null };
    const user = JSON.parse(raw) as User;
    return { user };
  } catch {
    return { user: null };
  }
}

function saveUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

const initialState: AuthState = loadInitialAuth();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Set user after login/register/refresh; tokens are in HTTP-only cookies */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; expiresIn?: number }>
    ) => {
      state.user = action.payload.user;
      saveUser(state.user);
    },
    logout: (state) => {
      state.user = null;
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("chibibadminton_auth"); // legacy key (tokens); do not leave in storage
      } catch {
        // ignore
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User> | User>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveUser(state.user);
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
