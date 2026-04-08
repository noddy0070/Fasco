import mongoose, { Document } from "mongoose";


export interface ReviewI extends Document{
    user:mongoose.Schema.Types.ObjectId,
    product:mongoose.Schema.Types.ObjectId,
    rating:number,
    comment?:string,
    assets:[
        {
            url:string,
            type:string,
        }
    ],
    isVerifiedPurchase:boolean,
    isApproved:boolean,
    likes:number,
    dislikes:number,
    deletedAt:Date,
    createdAt:Date,
    updatedAt:Date
}