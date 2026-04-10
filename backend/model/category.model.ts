import mongoose, { Schema } from "mongoose";
import { level } from "../model.interfaces/customEnum";
import type CategoryI from "../model.interfaces/category.interface";

const categorySchema = new Schema<CategoryI>({
  name: { type: String, required: true },

  slug: { type: String, required: true, unique: true },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  level: {
    type: String,
    enum: level,
    required: true
  }

}, { timestamps: true });


categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

export const Category = mongoose.model<CategoryI>('Category', categorySchema);