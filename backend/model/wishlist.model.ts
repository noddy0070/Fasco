import mongoose, { Schema } from 'mongoose';
import type WishlistI from '../model.interfaces/wishlist.interface.ts';

const wishlistSchema = new Schema<WishlistI>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                variantSku: { type: String, required: true },
                addedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true },
);

export const Wishlist = mongoose.model<WishlistI>('Wishlist', wishlistSchema);
export default Wishlist;
