import { Router } from 'express';
import { login, register, refresh, me, logout, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { validateLogin, validateRegister, validateRequestPasswordReset, validateResetPassword } from '../middleware/validation.js';
import { optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user; sets HTTP-only cookies with access + refresh tokens
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user; sets HTTP-only cookies with access + refresh tokens
 * @access  Public
 */
router.post('/register', validateRegister, register);

/**
 * @route   POST /api/auth/refresh
 * @desc    Issue new tokens using refresh token from cookie; sets new HTTP-only cookies
 * @access  Public (sends refresh token via cookie)
 */
router.post('/refresh', refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Return current user if access token cookie is valid; 200 { user: null } when not logged in (no 401)
 * @access  Public (returns 200 with user or null)
 */
router.get('/me', optionalAuthenticateToken, me);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear auth cookies
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Create password reset token for email (stored in DB); same message whether email exists or not
 * @access  Public
 */
router.post('/request-password-reset', validateRequestPasswordReset, requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Set new password using token from reset link; token consumed and saved to DB
 * @access  Public
 */
router.post('/reset-password', validateResetPassword, resetPassword);

export default router;
