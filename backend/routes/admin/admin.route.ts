import express from 'express';
import adminAuthRoutes from './admin-auth.route.ts';
import adminUserRoutes from './admin-user.route.ts';
import adminProductRoutes from './admin-product.route.ts';
import adminOrderRoutes from './admin-order.route.ts';
import adminAnalyticsRoutes from './admin-analytics.route.ts';

const router = express.Router();

router.use('/auth', adminAuthRoutes);
router.use('/users', adminUserRoutes);
router.use('/products', adminProductRoutes);
router.use('/orders', adminOrderRoutes);
router.use('/analytics', adminAnalyticsRoutes);

export default router;
