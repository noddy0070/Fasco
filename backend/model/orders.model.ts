import mongoose, { Schema } from "mongoose";
import type OrderI from "../model.interfaces/orders.interface.ts";
import { orderStatus, paymentMethod, paymentStatus } from "../model.interfaces/customEnum.ts";

const orderSchema = new Schema<OrderI>({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    title: String,         
    slug: String,          

    variantSku: String,
    size: String,
    color: String,

    price: Number,         // original price
    discount: Number,      // product discount
    finalPrice: Number,    // final at purchase time

    quantity: Number,

    image: [String]          // snapshot for UI
  }],


  shippingAddress: {
    fullName: String,
    phone: String,
    pincode: String,
    state: String,
    city: String,
    addressLine1: String,
    addressLine2: String
  },

  
  payment: {
    method: {
      type: String,
      enum: paymentMethod,
      required: true
    },

    status: {
      type: String,
      enum: paymentStatus,
      default: 'pending'
    },

    transactionId: String
  },

  orderStatus: {
    type: String,
    enum: orderStatus,
    default: 'pending',
    index: true
  },

  totalItems: Number,

  subtotal: Number,
  discountAmount: Number,
  shippingCharges: Number,
  totalAmount: Number,

  trackingId: String,
  deliveredAt: Date,
  cancelledAt: Date,

}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model<OrderI>('Order', orderSchema);
export default Order;