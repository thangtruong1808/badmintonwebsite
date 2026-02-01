# Token Refresh Testing Guide

## Overview
This guide explains how to test the JWT access token and refresh token flow with short expiry times.

## Current Configuration (Testing Mode)

### Backend `.env` Settings:
```env
ACCESS_TOKEN_EXPIRY="2m"          # Access token expires in 2 minutes
REFRESH_TOKEN_EXPIRY_DAYS="5m"    # Refresh token expires in 5 minutes
```

### How It Works:

1. **Login** → User receives:
   - Access Token (valid for 2 minutes)
   - Refresh Token (valid for 5 minutes)

2. **Protected Page Navigation** → Automatic token validation:
   - If access token expires within 1 minute → automatically refreshes
   - If refresh token is valid → new access token issued
   - If refresh token expired → user logged out

3. **API Calls** → Token handling:
   - Adds Bearer token to Authorization header
   - If API returns 401 → attempts refresh and retries
   - If refresh fails → logs user out

## Testing Scenarios

### Scenario 1: Proactive Token Refresh on Navigation
**Expected behavior:** Access token refreshes automatically when navigating between pages

**Steps:**
1. Login at `/signin`
2. Wait 1 minute (access token will be close to expiry)
3. Navigate to a protected route (e.g., `/profile` or `/dashboard`)
4. **✅ Expected:** Console shows "✅ Access token refreshed successfully"
5. **✅ Expected:** User remains logged in, page loads normally

### Scenario 2: Token Refresh on API Call (401 Response)
**Expected behavior:** If access token expired and API returns 401, automatically refresh and retry

**Steps:**
1. Login at `/signin`
2. Navigate to `/dashboard`
3. Wait 2 minutes (access token expires)
4. Trigger an API call (e.g., refresh dashboard stats)
5. **✅ Expected:** Token refreshes automatically, API call succeeds
6. **✅ Expected:** Dashboard data loads successfully

### Scenario 3: Refresh Token Expiry (Complete Logout)
**Expected behavior:** User logged out when refresh token expires

**Steps:**
1. Login at `/signin`
2. Wait 5-6 minutes (both tokens expire)
3. Try to navigate to a protected route
4. **✅ Expected:** Console shows "⚠️ Token refresh failed, logging out"
5. **✅ Expected:** Redirected to `/signin`
6. **✅ Expected:** User logged out, localStorage cleared

### Scenario 4: Cross-Tab Behavior
**Expected behavior:** Token refresh in one tab updates all tabs

**Steps:**
1. Login in Tab 1
2. Open same app in Tab 2
3. Wait 1 minute
4. Navigate in Tab 1 → token refreshes
5. **✅ Expected:** Tab 2 also receives updated token (localStorage sync)

## Browser Console Monitoring

Open DevTools Console to see real-time token events:

```
✅ Access token refreshed successfully     → Token refreshed proactively
⚠️ Token refresh failed, logging out      → Refresh token expired
❌ Token refresh error: [error details]   → Network or server error
```

## Production Configuration

Once testing is complete, update `.env` back to production values:

```env
ACCESS_TOKEN_EXPIRY="15m"         # 15 minutes
REFRESH_TOKEN_EXPIRY_DAYS="7"     # 7 days (use 'd' suffix or just number)
```

Or:
```env
ACCESS_TOKEN_EXPIRY="1h"          # 1 hour
REFRESH_TOKEN_EXPIRY_DAYS="30d"   # 30 days
```

## Technical Details

### Token Validation Trigger Points:

1. **Protected Route Mount** (`ProtectedRoute`, `AdminRoute`)
   - Runs `useTokenValidation()` hook
   - Checks token expiry on every route change
   - Proactively refreshes if expiring within 1 minute

2. **API Calls** (`apiFetch` utility)
   - Validates token before request
   - Handles 401 responses with automatic refresh + retry

3. **Refresh Token Response** (Backend)
   - Returns: `{ user, accessToken, expiresIn }`
   - Frontend updates Redux + localStorage

### Security Features:

- ✅ Refresh tokens hashed (SHA-256) in database
- ✅ Access tokens are short-lived and stateless (JWT)
- ✅ Automatic cleanup on logout
- ✅ Expired refresh tokens deleted from DB
- ✅ Token validation on every protected page load

## Troubleshooting

### Issue: "secretOrPrivateKey must have a value"
**Solution:** Ensure `JWT_SECRET` exists in `backend/.env`

### Issue: Token not refreshing
**Solution:** Check browser console for error messages, verify backend is running

### Issue: User logged out immediately after login
**Solution:** Check that both `ACCESS_TOKEN_EXPIRY` and `REFRESH_TOKEN_EXPIRY_DAYS` are set correctly

### Issue: "Invalid or expired refresh token"
**Solution:** Refresh token expired (5m in testing), login again

## File References

### Frontend:
- `frontend/src/hooks/useTokenValidation.ts` - Proactive token validation hook
- `frontend/src/utils/api.ts` - API fetch with token refresh
- `frontend/src/store/authSlice.ts` - Redux auth state management
- `frontend/src/components/ProtectedRoute.tsx` - Protected route wrapper
- `frontend/src/components/AdminRoute.tsx` - Admin route wrapper

### Backend:
- `backend/src/services/refreshTokenService.ts` - Refresh token DB operations
- `backend/src/controllers/authController.ts` - Auth endpoints (login, register, refresh)
- `backend/src/middleware/auth.ts` - JWT generation and validation
- `backend/.env` - Token expiry configuration
