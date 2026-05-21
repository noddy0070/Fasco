import express from 'express';
import { adminLogin, adminLogout } from '../../controller/admin/admin-auth.controller.ts';

const router = express.Router();

/**
 * @openapi
 * /api/admin/auth/login:
 *   post:
 *     tags:
 *       - Admin Auth
 *     summary: Admin login — returns HTTP-only JWT cookie with role claim
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials or not an admin
 */
router.post('/login', adminLogin);

/**
 * @openapi
 * /api/admin/auth/logout:
 *   get:
 *     tags:
 *       - Admin Auth
 *     summary: Admin logout — clears the JWT cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.get('/logout', adminLogout);

export default router;
