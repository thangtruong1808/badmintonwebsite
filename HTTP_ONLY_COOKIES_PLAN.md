# HTTP-Only Cookies Migration Plan

## Goal
Move JWT storage from localStorage (XSS-vulnerable) to HTTP-only cookies. Tokens are never exposed to JavaScript; only non-sensitive user info (id, name, email, role, etc.) may remain in Redux/localStorage for UI.

## Security Notes
- **Do not store** in localStorage: payment card numbers, CVV, passwords, or JWTs.
- **OK to store** in localStorage for UI: user id, name, email, role, reward points (non-secret profile data).
- HTTP-only cookies are not readable by JavaScript and are sent automatically with `credentials: 'include'`.

---

## Backend Changes

### 1. Cookie parser and cookie names
- Add `cookie-parser` middleware so `req.cookies` is available.
- Cookie names: `accessToken`, `refreshToken` (configurable via env).

### 2. Cookie helpers
- **setAuthCookies(res, accessToken, refreshToken, refreshTokenExpiresAt)**  
  Set both cookies with: `httpOnly: true`, `secure: NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`.  
  Access cookie: short maxAge (e.g. from ACCESS_TOKEN_EXPIRY).  
  Refresh cookie: maxAge from refresh token expiry (e.g. 7d or from REFRESH_TOKEN_EXPIRY_DAYS).
- **clearAuthCookies(res)**  
  Clear both cookies (same path, maxAge: 0 or past expiry).

### 3. Auth controller
- **login**: Generate access + refresh tokens; call setAuthCookies; **do not** send tokens in body. Response body: `{ user, expiresIn }` (expiresIn for UI timer if needed).
- **register**: Same as login.
- **refresh**: Read refresh token from `req.cookies.refreshToken`. Validate and rotate (delete old, create new). Set new cookies via setAuthCookies. Response body: `{ user, expiresIn }`. On invalid/expired: clearAuthCookies, 401 with `forceLogout: true`.
- **logout** (new): clearAuthCookies, respond 200.

### 4. Auth middleware
- Read access token from `req.cookies.accessToken` first; if missing, fall back to `Authorization: Bearer <token>` (for backward compatibility during transition).
- Validate JWT as before; attach user to req.

### 5. New routes
- **GET /api/auth/me**: Protected by authenticateToken. Return current user from req.user / DB. Used by frontend on load to restore session from cookies.
- **POST /api/auth/logout**: Clear cookies, return 200.

---

## Frontend Changes

### 1. Auth slice (Redux)
- **State**: Keep only `user: User | null`. Remove `accessToken`, `refreshToken`, `expiresAt` from state and from localStorage.
- **localStorage**: Persist only `user` (non-sensitive) so navbar can show name after refresh; optional. Alternatively do not persist and rely on GET /me on load.
- **setCredentials**: Accept only `{ user: User }`; save user to state (and optionally to localStorage).
- **logout**: Clear user from state and localStorage; no tokens to clear.
- **updateUser**: Keep. Remove updateAccessToken and updateTokens (or keep for no-op compatibility).
- **selectIsAuthenticated**: `!!state.auth.user`.

### 2. API (api.ts)
- Every fetch: add `credentials: 'include'` so cookies are sent.
- Remove getValidAccessToken and Bearer header; server reads access token from cookie.
- On 401: call POST /api/auth/refresh with `credentials: 'include'` (no body). If 200, retry original request. If 401, dispatch logout and fire `auth:forceLogout`.

### 3. useTokenValidation
- Trigger: on route change and/or periodic timer (e.g. every 60s).
- Call POST /api/auth/refresh with `credentials: 'include'` (no body). If 200, update user from response (dispatch setCredentials({ user })). If 401, dispatch logout and redirect to /signin (and fire auth:forceLogout).

### 4. Login / Register pages
- Fetch with `credentials: 'include'`.
- On success: response body has `user` only; dispatch setCredentials({ user }).

### 5. Logout
- Call POST /api/auth/logout with `credentials: 'include'`.
- Dispatch logout() to clear user from state.

### 6. App load (session restore)
- On mount: call GET /api/auth/me with `credentials: 'include'`. If 200, set user in Redux (setCredentials). If 401, ensure user is null (no tokens = not logged in).

---

## File Summary

| Area | File | Changes |
|------|------|--------|
| Backend | package.json | Add cookie-parser |
| Backend | server.ts | app.use(cookieParser()) |
| Backend | utils/cookies.ts (new) | setAuthCookies, clearAuthCookies, cookie names |
| Backend | controllers/authController.ts | Set/clear cookies; logout; refresh from cookie; /me |
| Backend | middleware/auth.ts | Read token from cookie first, then header |
| Backend | routes/auth.ts | GET /me, POST /logout |
| Frontend | store/authSlice.ts | user only; setCredentials({ user }); no tokens in state/localStorage |
| Frontend | utils/api.ts | credentials: 'include'; no Bearer; refresh on 401 via cookie |
| Frontend | hooks/useTokenValidation.ts | Refresh with credentials; update user on 200 |
| Frontend | SignInPage / RegisterPage | credentials: 'include'; setCredentials({ user }) |
| Frontend | Navbar / Dashboard logout | Call POST /logout then dispatch logout() |
| Frontend | App.tsx | On load call GET /me with credentials; set user or clear |

---

## Testing
- Login → cookies set; no tokens in localStorage; user in state.
- Refresh page → GET /me restores user from cookies.
- Navigate / timer → POST /refresh with cookies refreshes; new cookies set.
- Logout → POST /logout clears cookies; user cleared.
- Expired refresh → 401 + clear cookies + forceLogout; redirect to signin.
