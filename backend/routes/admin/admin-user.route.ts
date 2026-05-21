import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} from '../../controller/admin/admin-user.controller.ts';

const router = express.Router();

const userAdminRoles = [adminRole.SUPER_ADMIN, adminRole.USER_ADMIN];

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin Users
 *     summary: List all users (paginated)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Users list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRole(userAdminRoles), listUsers);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin Users
 *     summary: Get a single user by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id', requireRole(userAdminRoles), getUser);

/**
 * @openapi
 * /api/admin/users:
 *   post:
 *     tags:
 *       - Admin Users
 *     summary: Create a new user
 *     security:
 *       - cookieAuth: []
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
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRole(userAdminRoles), createUser);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   patch:
 *     tags:
 *       - Admin Users
 *     summary: Update a user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch('/:id', requireRole(userAdminRoles), updateUser);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin Users
 *     summary: Soft-delete a user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/:id', requireRole(userAdminRoles), deleteUser);

export default router;
