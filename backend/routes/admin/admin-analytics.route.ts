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


router.get('/overview', requireRole(superAdminOnly), getOverview);
router.get('/revenue', requireRole(superAdminOnly), getRevenueChart);
router.get('/order-status-breakdown', requireRole(superAdminOnly), getOrderStatusBreakdown);
router.get('/top-products', requireRole(superAdminOnly), getTopProducts);

export default router;
