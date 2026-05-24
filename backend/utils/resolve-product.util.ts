import mongoose from 'mongoose';
import Product from '../model/product.model.ts';

export const resolveProduct = async (identifier: string) => {
    const value = identifier.trim();
    if (!value) return null;

    if (mongoose.Types.ObjectId.isValid(value)) {
        const byId = await Product.findOne({ _id: value, deletedAt: null });
        if (byId) return byId;
    }

    return Product.findOne({
        $or: [{ slug: value }, { slug: value.toLowerCase() }],
        deletedAt: null,
    });
};
