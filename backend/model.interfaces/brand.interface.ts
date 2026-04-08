import { Document } from 'mongoose';
export interface BrandI extends Document {
    title: string;
    slug: string;
    description?: string;
    logo?: string;
    banner?: string;
    contactInfo?: {
        email?: string;
        phone?: string;
        website?: string;
        address?: string;
    };
    social?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
    isActive?: boolean;
    isFeatured?: boolean;

    createdAt: Date;
    updatedAt: Date;
}