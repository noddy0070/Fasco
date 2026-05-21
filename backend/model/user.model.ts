import mongoose, { Schema } from "mongoose";
import { adminRole } from "../model.interfaces/customEnum.ts";
import type UserI from "../model.interfaces/user.interface.ts";
const userSchema = new Schema<UserI>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: { type: String, required: true },

  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },

  hashedPassword: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ['user', 'admin', ...Object.values(adminRole)],
    default: 'user',
  },

  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },

  deletedAt: Date,

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist' }],

  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],

  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  savedAddress: [{
    fullName: String,
    phone: String,
    pincode: String,
    state: String,
    city: String,
    country: String,
    addressLine1: String,
    addressLine2: String,
    label: {type:String, default:'Home'},
    isDefault: { type: Boolean, default: false }
  }],

  savedPaymentModes: [{
    type: { type: String, enum: ['card', 'upi', 'netbanking'] },
    provider: String,
    last4: String
  }],

  avatar: String,
  lastLogin: Date

}, { timestamps: true });

userSchema.index({ phone: 1 });
const User = mongoose.model<UserI>('User', userSchema);
export default User;

