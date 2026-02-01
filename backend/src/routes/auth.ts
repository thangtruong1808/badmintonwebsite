import { Router } from 'express';
import { login, register, refresh, me, logout } from '../controllers/authController.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

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
 * @desc    Return current user if access token cookie is valid
 * @access  Private
 */
router.get('/me', authenticateToken, me);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear auth cookies
 * @access  Public
 */
router.post('/logout', logout);

export default router;
