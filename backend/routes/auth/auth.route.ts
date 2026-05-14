import express from 'express';
import { forgotPassword, login, logout, me, resetPassword, signup } from '../../controller/auth/auth.controller.ts';
import { resendVerification, verifyEmail } from '../../controller/auth/verify.controller.ts';

const router = express.Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, email, phone, password]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post('/signup', signup);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login and set auth cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Blocked or unverified user
 */
router.post('/login',login);
/**
 * @openapi
 * /api/auth/verify/resend:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Resend email verification link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 */
router.post('/verify/resend', resendVerification);
router.post('/google',signup)
/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Send password reset link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email process completed
 */
router.post('/forgot-password',forgotPassword)
/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password using reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password',resetPassword)
/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Fetch currently authenticated user from cookie JWT
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched
 *       401:
 *         description: Unauthorized
 */
router.get('/me',me)
/**
 * @openapi
 * /api/auth/verify/{token}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verify email from token link
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid token
 */
router.get('/verify/:token', verifyEmail);
/**
 * @openapi
 * /api/auth/logout:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Logout and clear auth cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.get('/logout',logout)
router.get('/refresh',signup)

export default router;