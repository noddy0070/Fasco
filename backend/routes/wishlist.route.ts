import express from 'express';
import { requireUser } from '../middleware/auth.middleware.ts';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controller/wishlist.controller.ts';

const router = express.Router();

router.use(requireUser);
router.get('/', getWishlist);
router.post('/items', addToWishlist);
router.delete('/items', removeFromWishlist);

export default router;
