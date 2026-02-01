import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken, selectExpiresAt, selectRefreshToken } from "../store/authSlice";
import { store } from "../store";
import { updateTokens, logout } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Hook to validate and refresh access token on page navigation.
 * Proactively refreshes token if it expires within 1 minute.
 */
export function useTokenValidation() {
  const location = useLocation();
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);
  const expiresAt = useSelector(selectExpiresAt);
  const isValidating = useRef(false);

  useEffect(() => {
    // Skip validation if no access token or already validating
    if (!accessToken || isValidating.current) return;

    const now = Date.now();
    const bufferMs = 60 * 1000; // 1 minute buffer

    // Check if token is expired or will expire soon
    if (expiresAt && expiresAt > now + bufferMs) {
      // Token is still valid
      return;
    }

    // Token expired or expiring soon - try to refresh
    if (!refreshToken) {
      store.dispatch(logout());
      return;
    }

    isValidating.current = true;

    const refreshAccessToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.accessToken && typeof data.expiresIn === "number") {
            store.dispatch(
              updateTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
              })
            );
            return;
          }
        }

        store.dispatch(logout());
      } catch {
        store.dispatch(logout());
      } finally {
        isValidating.current = false;
      }
    };

    refreshAccessToken();
  }, [location.pathname, accessToken, refreshToken, expiresAt]);
}
