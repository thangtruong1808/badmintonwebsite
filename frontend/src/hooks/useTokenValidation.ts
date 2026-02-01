import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/authSlice";
import { store } from "../store";
import { setCredentials, logout } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const VALIDATION_INTERVAL_MS = 60 * 1000;

/**
 * Validates session via HTTP-only cookies: calls refresh to rotate tokens and get user.
 * On 401 (expired refresh), forces logout and redirects to signin.
 */
export function useTokenValidation() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isValidating = useRef(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => setTick((t) => t + 1), VALIDATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (!user || isValidating.current) return;

    isValidating.current = true;

    const doRefresh = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            store.dispatch(setCredentials({ user: data.user }));
            return;
          }
        }

        if (res.status === 401) {
          await res.json().catch(() => ({}));
          store.dispatch(logout());
          window.dispatchEvent(new CustomEvent("auth:forceLogout"));
          setTimeout(() => navigate("/signin", { replace: true }), 0);
        }
      } catch {
        // Network error: do not logout
      } finally {
        isValidating.current = false;
      }
    };

    doRefresh();
  }, [location.pathname, user, tick]);
}
