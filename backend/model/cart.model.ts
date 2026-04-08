import mongoose, { Schema } from "mongoose";
import { CartI } from "../model.interfaces/cart.interface";

const cartSchema = new Schema<CartI>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    variantSku: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  totalItems: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });


cartSchema.index({ user: 1 });

export const Cart = mongoose.model<CartI>('Cart', cartSchema);