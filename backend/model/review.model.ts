import mongoose, { Schema } from "mongoose";
import { ReviewI } from "../model.interfaces/review.interface";

const reviewSchema = new Schema<ReviewI>({

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    index: true
  },

  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    index: true
  },

  comment: { 
    type: String, 
    trim: true 
  },

  assets: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true }
  }],

  isVerifiedPurchase: { type: Boolean, default: false },

  isApproved: { type: Boolean, default: true },

  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },

  deletedAt: Date

}, { timestamps: true });


// 🔥 Prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = mongoose.model<ReviewI>('Review', reviewSchema);