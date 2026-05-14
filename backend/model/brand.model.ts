import mongoose, { Schema } from 'mongoose';
import type BrandI from '../model.interfaces/brand.interface';
const brandSchema = new Schema<BrandI>({
  title: { type: String, required: true },
  slug: { type: String, unique: true },

  description: String,

  logo: String,
  banner: String,

  contactInfo: {
    email: String,
    phone: String,
    website: String,
    address: String
  },

  social: {
    instagram: String,
    twitter: String,
    facebook: String
  },

  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }

}, { timestamps: true });

export const Brand = mongoose.model<BrandI>('Brand', brandSchema);