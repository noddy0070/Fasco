import mongoose, { Schema } from "mongoose";
import type ProductI from "../model.interfaces/product.interface.ts";


const variantSchema = new Schema({
  sku:      { type: String, required: true, trim: true, index: true },
  price:    { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  stock:    { type: Number, required: true, min: 0 },
  size:     { type: String },
  color:    { type: String },
  colorCode:{ type: String },
  images:   [{ type: String }],
}, { _id: false });

const productSchema = new Schema<ProductI>({

  title: { type: String, required: true, trim: true },

  slug: { type: String, unique: true, index: true },

  description: String,

  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },

  gender: {
    type: String,
    enum: ['men', 'women', 'kids', 'unisex'],
    index: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },

  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },

  isActive: { type: Boolean, default: true, index: true },
  isTrending: { type: Boolean, default: false, index: true },
  isLimitedOffer: { type: Boolean, default: false, index: true },

  variants: { type: [variantSchema], default: [] },

  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  specifications: [{
    title: String,
    value: String
  }],

  tags: [{ type: String, index: true }],

  metaTitle: String,
  metaDescription: String,

  deletedAt: Date,

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });


productSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ gender: 1, category: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

export const Product = mongoose.model<ProductI>('Product', productSchema);
export default Product;