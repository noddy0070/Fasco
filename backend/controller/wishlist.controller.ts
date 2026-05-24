import express from 'express';
import { Wishlist } from '../model/wishlist.model.ts';
import type { AuthedRequest } from '../middleware/auth.middleware.ts';
import { resolveProduct } from '../utils/resolve-product.util.ts';

const populateWishlist = (userId: string) =>
    Wishlist.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'title slug variants isActive deletedAt',
    });

export const getWishlist = async (req: AuthedRequest, res: express.Response) => {
    try {
        let wishlist = await populateWishlist(req.user!.userId);
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user!.userId, items: [] });
        }
        return res.status(200).json({ message: 'Wishlist fetched successfully', data: wishlist });
    } catch (err) {
        console.error('getWishlist error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addToWishlist = async (req: AuthedRequest, res: express.Response) => {
    try {
        const { productId, variantSku } = req.body as { productId?: string; variantSku?: string };
        if (!productId || !variantSku) {
            return res.status(400).json({ message: 'productId and variantSku are required' });
        }

        const product = await resolveProduct(productId);
        if (!product || product.deletedAt) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!product.variants.some((v) => v.sku === variantSku)) {
            return res.status(400).json({ message: 'Variant not found for this product' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user!.userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user!.userId, items: [] });
        }

        const exists = wishlist.items.some(
            (i) => i.product.toString() === product._id.toString() && i.variantSku === variantSku,
        );

        if (!exists) {
            wishlist.items.push({
                product: product._id,
                variantSku,
                addedAt: new Date(),
            });
            await wishlist.save();
        }

        const populated = await populateWishlist(req.user!.userId);
        return res.status(200).json({ message: 'Added to wishlist', data: populated });
    } catch (err) {
        console.error('addToWishlist error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromWishlist = async (req: AuthedRequest, res: express.Response) => {
    try {
        const { productId, variantSku } = req.body as { productId?: string; variantSku?: string };
        if (!productId || !variantSku) {
            return res.status(400).json({ message: 'productId and variantSku are required' });
        }

        const product = await resolveProduct(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const wishlist = await Wishlist.findOne({ user: req.user!.userId });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.items = wishlist.items.filter(
            (i) => !(i.product.toString() === product._id.toString() && i.variantSku === variantSku),
        );
        await wishlist.save();

        const populated = await populateWishlist(req.user!.userId);
        return res.status(200).json({ message: 'Removed from wishlist', data: populated });
    } catch (err) {
        console.error('removeFromWishlist error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
