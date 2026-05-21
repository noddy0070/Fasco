import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listOrders,
    getOrder,
    updateOrderStatus,
} from '../../controller/admin/admin-order.controller.ts';

const router = express.Router();

const superAdminOnly = [adminRole.SUPER_ADMIN];

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags:
 *       - Admin Orders
 *     summary: List all orders (paginated, filterable by status)
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, out_for_delivery, delivered, cancelled, returned]
 *     responses:
 *       200:
 *         description: Orders list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — super-admin only
 */
router.get('/', requireRole(superAdminOnly), listOrders);

/**
 * @openapi
 * /api/admin/orders/{id}:
 *   get:
 *     tags:
 *       - Admin Orders
 *     summary: Get a single order by ID
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
 *         description: Order found
 *       404:
 *         description: Order not found
 */
router.get('/:id', requireRole(superAdminOnly), getOrder);

/**
 * @openapi
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Orders
 *     summary: Update order status (and optionally trackingId)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *               trackingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Order not found
 */
router.patch('/:id/status', requireRole(superAdminOnly), updateOrderStatus);

export default router;
