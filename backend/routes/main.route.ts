import express from 'express';
import authRoutes from './auth/auth.route.ts';
import adminRoutes from './admin/admin.route.ts';
import productRoutes from './product.route.ts';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/products', productRoutes);

export default router;
