import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    getOverview,
    getRevenueChart,
    getOrderStatusBreakdown,
    getTopProducts,
} from '../../controller/admin/admin-analytics.controller.ts';

const router = express.Router();

const superAdminOnly = [adminRole.SUPER_ADMIN];

/**
 * @openapi
 * /api/admin/analytics/overview:
 *   get:
 *     tags:
 *       - Admin Analytics
 *     summary: Get aggregated KPIs (revenue, orders, users, products)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Overview metrics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — super-admin only
 */
router.get('/overview', requireRole(superAdminOnly), getOverview);

/**
 * @openapi
 * /api/admin/analytics/revenue:
 *   get:
 *     tags:
 *       - Admin Analytics
 *     summary: Get daily revenue for the last 30 days
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daily revenue array
 */
router.get('/revenue', requireRole(superAdminOnly), getRevenueChart);

/**
 * @openapi
 * /api/admin/analytics/order-status-breakdown:
 *   get:
 *     tags:
 *       - Admin Analytics
 *     summary: Get order counts grouped by status
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Order status breakdown
 */
router.get('/order-status-breakdown', requireRole(superAdminOnly), getOrderStatusBreakdown);

/**
 * @openapi
 * /api/admin/analytics/top-products:
 *   get:
 *     tags:
 *       - Admin Analytics
 *     summary: Get top 10 best-selling products
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Top products list
 */
router.get('/top-products', requireRole(superAdminOnly), getTopProducts);

export default router;
