import mongoose, { Document } from "mongoose";

export interface ProductVariantI {
    sku: string;
    price: number;
    discount: number;
    stock: number;
    size?: string;
    color?: string;
    colorCode?: string;
    images?: string[];
}

export default interface ProductI extends Document {
    title: string;
    slug: string;
    description?: string;
    brand: mongoose.Schema.Types.ObjectId;
    gender: string;
    category: mongoose.Schema.Types.ObjectId;
    subCategory: mongoose.Schema.Types.ObjectId;
    isActive: boolean;
    isTrending: boolean;
    isLimitedOffer: boolean;
    variants: ProductVariantI[];
    averageRating: number;
    totalReviews: number;
    specifications: Array<{ title: string; value: string }>;
    tags: string[];
    metaTitle: string;
    metaDescription: string;
    deletedAt: Date;
    createdBy: mongoose.Schema.Types.ObjectId;
    updatedBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}