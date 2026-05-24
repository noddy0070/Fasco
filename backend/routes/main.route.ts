import express from 'express';
import authRoutes from './auth/auth.route.ts';
import adminRoutes from './admin/admin.route.ts';
import productRoutes from './product.route.ts';
import cartRoutes from './cart.route.ts';
import wishlistRoutes from './wishlist.route.ts';
import orderRoutes from './order.route.ts';
import collectionRoutes from './collection.route.ts';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/collections', collectionRoutes);

export default router;
