import mongoose, { Document } from "mongoose";

export default interface ProductI extends Document{
    title:string,
    slug:string,
    description?:string,
    brand:mongoose.Schema.Types.ObjectId,
    gender:string,
    category:mongoose.Schema.Types.ObjectId,
    subCategory:mongoose.Schema.Types.ObjectId,
    isActive:boolean,
    isTrending:boolean,
    isLimitedOffer:boolean,
    variants:[
        {
            sku:string,
            size:string,
            color:string,
            price:number,
            discount:number,
            stock:number,
            images:string[]
        }
    ],
    averageRating:number,
    totalReviews:number,
    specifications:[
        {
            title:string,
            value:string   
        }
    ],
    tags:string[],
    metaTitle:string,
    metaDescription:string,
    deletedAt:Date

    createdBy:mongoose.Schema.Types.ObjectId,
    updatedBy:mongoose.Schema.Types.ObjectId

    createdAt:Date,
    updatedAt:Date
}