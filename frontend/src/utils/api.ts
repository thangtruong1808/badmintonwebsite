import { store } from "../store";
import { setCredentials, logout } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const defaultInit: RequestInit = {
  credentials: "include",
};

/**
 * Fetch with auth: cookies (access token) sent automatically via credentials: 'include'.
 * On 401, tries refresh (POST /api/auth/refresh with cookies); retries request on success.
 * On refresh 401, forces logout and dispatches auth:forceLogout.
 */
export async function apiFetch(path: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<Response> {
  const { skipAuth, ...init } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  let res = await fetch(url, { ...defaultInit, ...init, headers });

  if (!skipAuth && res.status === 401) {
    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const refreshData = await refreshRes.json().catch(() => ({}));
      if (refreshRes.ok && refreshData.user) {
        store.dispatch(setCredentials({
          user: refreshData.user,
          refreshTokenExpiresAt: refreshData.refreshTokenExpiresAt,
        }));
        res = await fetch(url, { ...defaultInit, ...init, headers });
      } else if (refreshRes.status === 401) {
        try {
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          // ignore
        }
        store.dispatch(logout());
        window.dispatchEvent(new CustomEvent("auth:forceLogout"));
      }
    } catch {
      // network error: do not logout
    }
  }

  return res;
}

export interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export { API_BASE };
