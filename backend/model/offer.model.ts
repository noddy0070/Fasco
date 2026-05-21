import mongoose, { Schema } from "mongoose";
import { offerType } from "../model.interfaces/customEnum.ts";
import type OfferI from "../model.interfaces/offer.interface.ts";
const limitedTimeOfferSchema = new Schema<OfferI>({
  title: { type: String, required: true },
  description: String,
  slug: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: offerType,
    required: true
  },

  validFrom: { type: Date, required: true, index: true },
  validTo: { type: Date, required: true, index: true },

  applicableProducts: [{offer:{title:String, discount:Number, description:String} ,type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{offer:{title:String, discount:Number, description:String} , type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableBrands: [{ offer:{title:String, discount:Number, description:String} ,type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],


}, { timestamps: true });

limitedTimeOfferSchema.index({ title: 'text', description: 'text' });
export const LimitedTimeOffer = mongoose.model<OfferI>('LimitedTimeOffer', limitedTimeOfferSchema);