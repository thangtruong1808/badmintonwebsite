import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../store/authSlice";
import { store } from "../store";
import { setCredentials, logout } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Validates session: calls refresh ONLY when the user navigates (pathname changes), not on initial load after login.
 * Refresh extends the refresh token expiry in DB so active users stay logged in.
 * If user does nothing (no navigation, no app activity), token is not extended — e.g. running SELECT in MySQL does nothing.
 * On 401 (expired refresh), forces logout and redirects to signin.
 */
export function useTokenValidation() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      prevPathnameRef.current = null;
      return;
    }

    const pathname = location.pathname;

    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    if (prevPathnameRef.current === pathname) return;

    prevPathnameRef.current = pathname;

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
          }
        } else if (res.status === 401) {
          await res.json().catch(() => ({}));
          store.dispatch(logout());
          window.dispatchEvent(new CustomEvent("auth:forceLogout"));
          setTimeout(() => navigate("/signin", { replace: true }), 0);
        }
      } catch {
        // Network error: do not logout
      }
    };

    doRefresh();
  }, [user, location.pathname, navigate]);
}
