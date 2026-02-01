import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken, selectExpiresAt, selectRefreshToken } from "../store/authSlice";
import { store } from "../store";
import { updateTokens, logout } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const VALIDATION_INTERVAL_MS = 60 * 1000; // Re-check every 60 seconds when user stays on page

/**
 * Hook to validate and refresh access token on page navigation and periodically.
 * Proactively refreshes token if it expires within 1 minute.
 * When refresh token expires, logs user out and redirects to signin.
 */
export function useTokenValidation() {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);
  const expiresAt = useSelector(selectExpiresAt);
  const isValidating = useRef(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!accessToken && !refreshToken) return;
    const id = setInterval(() => setTick((t) => t + 1), VALIDATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (!accessToken || isValidating.current) return;

    const now = Date.now();
    const bufferMs = 60 * 1000; // 1 minute buffer

    if (expiresAt && expiresAt > now + bufferMs) return;

    if (!refreshToken) {
      store.dispatch(logout());
      navigate("/signin", { replace: true });
      return;
    }

    isValidating.current = true;

    const doRefresh = async () => {
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
        navigate("/signin", { replace: true });
      } catch {
        store.dispatch(logout());
        navigate("/signin", { replace: true });
      } finally {
        isValidating.current = false;
      }
    };

    doRefresh();
  }, [location.pathname, accessToken, refreshToken, expiresAt, tick]);
}
