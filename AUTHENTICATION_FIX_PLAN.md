# Authentication Fix Plan

## Requirements Summary

1. **Token refresh on navigation**: Access and refresh tokens should be refreshed when authenticated users navigate to different pages, and saved into the database.
2. **Expired refresh token handling**: When refresh token expires:
   - System **automatically logs the user out** (clear auth state, localStorage)
   - User is **redirected to the login page**
   - **No errors** in the server console (expected flow, not an error)

---

## Current State Analysis

### What Works
- Login/register returns access + refresh tokens
- Refresh tokens stored in DB (`refresh_tokens` table)
- `useTokenValidation` hook triggers refresh on protected route navigation
- `apiFetch` refreshes on 401 and retries
- Frontend dispatches `logout()` and redirects to `/signin` when refresh fails

### Issues Found

| Issue | Location | Impact |
|-------|----------|--------|
| **1. Refresh endpoint doesn't rotate refresh token** | `authController.ts` – `refresh` | Only returns new access token; refresh token stays the same. User wants both rotated and saved to DB. |
| **2. Frontend doesn't save new refresh token** | `authSlice.ts`, `api.ts`, `useTokenValidation.ts` | `updateAccessToken` only updates access token. No reducer for updating refresh token. |
| **3. Server logs 401 as errors** | `errorHandler.ts` – `console.error` | "Invalid or expired refresh token" is expected when session expires; shouldn't log as error. |
| **4. Expired refresh token flow** | `authController.ts` | Uses `createError` → errorHandler → `console.error`. Clean 401 response needed without server-side error log. |

---

## Implementation Plan

### Phase 1: Backend – Refresh Token Rotation

**File: `backend/src/controllers/authController.ts`**

1. In `refresh` controller, after `findRefreshToken` succeeds:
   - Call `deleteRefreshToken(token)` to invalidate the old token
   - Call `createRefreshTokenRecord(userId)` to create a new refresh token
   - Return both new `accessToken` and new `refreshToken` (plus `expiresIn`, `refreshExpiresAt`)

2. Response shape:
   ```json
   {
     "user": { ... },
     "accessToken": "...",
     "refreshToken": "...",
     "expiresIn": 120,
     "refreshExpiresAt": "2025-01-28T12:00:00.000Z"
   }
   ```

---

### Phase 2: Backend – No Server Console Errors for Expected 401s

**File: `backend/src/middleware/errorHandler.ts`**

1. Before `console.error`, add:
   - If `statusCode === 401` and message includes `refresh token` (or similar), **skip** logging
   - Optional: use a lower log level (e.g. `console.debug`) for 401 auth failures in development

2. Alternative: In `authController.refresh`, for invalid/expired token, return `res.status(401).json({ ... })` **without** throwing `createError`. That way the error handler never runs and no log is emitted. This is cleaner.

**Recommended:** Return 401 directly in refresh controller for invalid/expired token, instead of throwing `createError`.

---

### Phase 3: Frontend – Save New Refresh Token on Refresh

**File: `frontend/src/store/authSlice.ts`**

1. Add a new reducer (or extend existing):
   ```typescript
   updateTokens: (state, action: PayloadAction<{
     accessToken: string;
     refreshToken?: string;  // optional for backward compat
     expiresIn: number;
     refreshExpiresAt?: string;
   }>)
   ```
   - If `refreshToken` is provided, update it and optionally `refreshExpiresAt`
   - Always update `accessToken` and `expiresAt`

2. Alternatively, extend `updateAccessToken` to accept optional `refreshToken` and `refreshExpiresAt`.

---

**File: `frontend/src/utils/api.ts`**

3. In `getValidAccessToken`:
   - When refresh succeeds, check if response includes `refreshToken`
   - If yes, dispatch `updateTokens` (or extended `updateAccessToken`) with both tokens

---

**File: `frontend/src/hooks/useTokenValidation.ts`**

4. When refresh succeeds:
   - Check if response includes `refreshToken`
   - If yes, dispatch `updateTokens` with both tokens
   - Remove or reduce `console.log` / `console.warn` for production

---

### Phase 4: Frontend – Clean Logout on Expired Refresh Token

**File: `frontend/src/utils/api.ts`**

1. When refresh returns 401:
   - Dispatch `logout()` (already done)
   - Do **not** log errors to console (remove any `console.error` for this case)

**File: `frontend/src/hooks/useTokenValidation.ts`**

2. When refresh fails (401):
   - Dispatch `logout()` silently
   - Remove or guard `console.warn` / `console.error` so expired refresh doesn’t spam console

---

### Phase 5: Auto-Logout and Redirect When Refresh Token Expires

**Flow when refresh token expires:**
1. User navigates to protected page or makes API call
2. Frontend calls `/api/auth/refresh` with expired refresh token
3. Backend returns 401 directly (no `createError`, no server console log)
4. Frontend receives 401 → dispatches `logout()` (clears Redux, localStorage)
5. `isAuthenticated` becomes false → `ProtectedRoute`/`AdminRoute` render `<Navigate to="/signin" />`
6. User sees login page (silent, no console errors)

**Files: `ProtectedRoute.tsx`, `AdminRoute.tsx`**
- Already redirect to `/signin` when `!isAuthenticated`
- After `logout()`, state clears and redirect happens automatically

---

## File Change Summary

| File | Changes |
|------|---------|
| `backend/src/controllers/authController.ts` | Rotate refresh token in `refresh`; return 401 directly for invalid/expired token (no `createError`) |
| `backend/src/middleware/errorHandler.ts` | Optionally: skip or downgrade logging for 401 refresh-token errors |
| `frontend/src/store/authSlice.ts` | Add `updateTokens` or extend `updateAccessToken` to accept `refreshToken` |
| `frontend/src/utils/api.ts` | Use `updateTokens` when refresh returns new refresh token; avoid console errors on 401 |
| `frontend/src/hooks/useTokenValidation.ts` | Use `updateTokens` when refresh returns new refresh token; avoid console output on expected 401 |
| `backend/src/types/index.ts` | Ensure refresh response type includes optional `refreshToken`, `refreshExpiresAt` |

---

## Testing Checklist

- [ ] Login → navigate to `/profile` → access token refreshed, new refresh token stored in Redux/localStorage and DB
- [ ] Navigate between protected pages → tokens refreshed on each navigation (when near expiry)
- [ ] Wait until refresh token expires → navigate to protected page → redirect to `/signin` with **no** server console error
- [ ] Server console: no "Invalid or expired refresh token" or similar errors when session expires
- [ ] New refresh token visible in `refresh_tokens` table after each successful refresh

---

## Execution Order

1. Phase 2 (Backend error handling) – quick win, no dependencies  
2. Phase 1 (Refresh token rotation) – core logic  
3. Phase 3 (Frontend updateTokens) – depends on Phase 1  
4. Phase 4 (Clean logout / no console errors) – frontend polish  
5. Phase 5 – verify redirect behavior  
