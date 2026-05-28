import mongoose, { Document } from 'mongoose';

export default interface WishlistI extends Document {
    user: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        variantSku: string;
        addedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
