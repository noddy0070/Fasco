import mongoose from "mongoose"
import { Document } from "mongoose"

export default interface CartI extends Document{
    user:mongoose.Types.ObjectId,
    items:{
            product:mongoose.Types.ObjectId,
            variantSku:string,
            quantity:number,
            addedAt:Date
        }[],

    totalItems:number,
    totalAmount:number,

    createdAt:Date,
    updatedAt:Date
}

