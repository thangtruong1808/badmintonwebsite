import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectRefreshTokenExpiresAt } from "../store/authSlice";
import { store } from "../store";
import { setCredentials, logout } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function logoutUser() {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // ignore network errors
  }
  store.dispatch(logout());
  window.dispatchEvent(new CustomEvent("auth:forceLogout"));
}

/**
 * Custom event dispatched when Dashboard section changes (no pathname change).
 * useTokenValidation listens and refreshes token for all authenticated navigation.
 */
export const AUTH_REQUEST_REFRESH = "auth:requestRefresh";

/**
 * Validates session: refresh on navigation (pathname change) OR on auth:requestRefresh (e.g. Dashboard section change).
 * Schedules auto-logout via setTimeout at refreshTokenExpiresAt.
 * On tab visible: if already past expiry, logout; else re-schedule for remaining time.
 * On 401 from refresh, forces logout and redirects to signin.
 */
export function useTokenValidation() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const refreshTokenExpiresAt = useSelector(selectRefreshTokenExpiresAt);
  const prevPathnameRef = useRef<string | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current != null) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const scheduleAutoLogout = (expiresAtMs: number) => {
    clearLogoutTimer();
    const remaining = expiresAtMs - Date.now();
    if (remaining <= 0) {
      logoutUser();
      setTimeout(() => navigate("/signin", { replace: true }), 0);
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      logoutTimerRef.current = null;
      logoutUser();
      setTimeout(() => navigate("/signin", { replace: true }), 0);
    }, remaining);
  };

  const doRefresh = async () => {
    try {
      if (refreshTokenExpiresAt != null && Date.now() >= refreshTokenExpiresAt) {
        clearLogoutTimer();
        logoutUser();
        setTimeout(() => navigate("/signin", { replace: true }), 0);
        return;
      }
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          store.dispatch(setCredentials({
            user: data.user,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
          }));
          if (data.refreshTokenExpiresAt != null) {
            scheduleAutoLogout(data.refreshTokenExpiresAt);
          }
        }
      } else if (res.status === 401) {
        await res.json().catch(() => ({}));
        clearLogoutTimer();
        logoutUser();
        setTimeout(() => navigate("/signin", { replace: true }), 0);
      }
    } catch {
      // Network error: do not logout
    }
  };

  useEffect(() => {
    if (!user) {
      prevPathnameRef.current = null;
      clearLogoutTimer();
      return;
    }

    const pathname = location.pathname;

    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      if (refreshTokenExpiresAt != null) scheduleAutoLogout(refreshTokenExpiresAt);
      return;
    }

    if (prevPathnameRef.current === pathname) return;

    prevPathnameRef.current = pathname;
    doRefresh();
  }, [user, location.pathname, navigate, refreshTokenExpiresAt]);

  useEffect(() => {
    if (!user) return;

    const handleRequestRefresh = () => doRefresh();

    window.addEventListener(AUTH_REQUEST_REFRESH, handleRequestRefresh);
    return () => window.removeEventListener(AUTH_REQUEST_REFRESH, handleRequestRefresh);
  }, [user, navigate]);

  useEffect(() => {
    if (!user || refreshTokenExpiresAt == null) return;

    scheduleAutoLogout(refreshTokenExpiresAt);

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now >= refreshTokenExpiresAt) {
        clearLogoutTimer();
        logoutUser();
        setTimeout(() => navigate("/signin", { replace: true }), 0);
      } else {
        scheduleAutoLogout(refreshTokenExpiresAt);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearLogoutTimer();
    };
  }, [user, refreshTokenExpiresAt, navigate]);
}
