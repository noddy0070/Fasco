import mongoose, { Document, mongo } from "mongoose";

export interface OrderI extends Document{
    user:mongoose.Schema.Types.ObjectId,
    items:[{
        product:mongoose.Schema.Types.ObjectId,
        title:string,
        slug:string,
        variantSku:string,
        size:string,
        color:string,
        price:number,
        discount:number,
        quantity:number,
        finalPrice:number,
        image:string[]
    }],
    shippingAddress:{
        fullName:string,
        phone:string,
        pincode:string,
        state:string,
        city:string,
        addressLine1:string,
        addressLine2:string
    },
    payment:{
        method:string,
        status:string
    },
    orderStatus:string,
    totalItems:number,
    subtotal:number,
    discountAmount:number,
    shippingCharges:number,
    trackingId:string,
    totalAmount:number,

    deliveredAt:Date,
    cancelledAt:Date,
    deletedAt:Date,
    createdAt:Date,
    updatedAt:Date
}