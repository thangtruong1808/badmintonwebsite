import { store } from "../store";
import { updateTokens, logout } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/** Get current access token; optionally refresh if expired or about to expire (1 min buffer) */
async function getValidAccessToken(): Promise<string | null> {
  const state = store.getState();
  const accessToken = state.auth.accessToken;
  const refreshToken = state.auth.refreshToken;
  const expiresAt = state.auth.expiresAt;

  const now = Date.now();
  const bufferMs = 60 * 1000; // 1 min
  if (accessToken && expiresAt && expiresAt > now + bufferMs) {
    return accessToken;
  }

  if (!refreshToken) {
    store.dispatch(logout());
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.accessToken && typeof data.expiresIn === "number") {
      store.dispatch(updateTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }));
      return data.accessToken;
    }
  } catch {
    // network error
  }
  store.dispatch(logout());
  return null;
}

export interface ApiOptions extends RequestInit {
  /** If true, do not attach Authorization or attempt refresh (default false) */
  skipAuth?: boolean;
}

/**
 * Fetch with auth: adds Bearer token and refreshes on 401.
 * Use for API calls that require authentication.
 */
export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const { skipAuth, ...init } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const token = skipAuth ? null : await getValidAccessToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  let res = await fetch(url, { ...init, headers });

  if (!skipAuth && res.status === 401) {
    const state = store.getState();
    const refreshToken = state.auth.refreshToken;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshData = await refreshRes.json().catch(() => ({}));
        if (refreshRes.ok && refreshData.accessToken && typeof refreshData.expiresIn === "number") {
          store.dispatch(
            updateTokens({
              accessToken: refreshData.accessToken,
              refreshToken: refreshData.refreshToken,
              expiresIn: refreshData.expiresIn,
            })
          );
          headers.set("Authorization", `Bearer ${refreshData.accessToken}`);
          res = await fetch(url, { ...init, headers });
        }
      } catch {
        store.dispatch(logout());
      }
    } else {
      store.dispatch(logout());
    }
  }

  return res;
}

export { API_BASE };
