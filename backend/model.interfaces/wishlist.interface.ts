import mongoose, { Document } from 'mongoose';

export default interface WishlistI extends Document {
    user: mongoose.Schema.Types.ObjectId;
    items: {
        product: mongoose.Schema.Types.ObjectId;
        variantSku: string;
        addedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
