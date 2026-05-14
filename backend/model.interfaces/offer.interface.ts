import { Document } from "mongoose";
export default interface OfferI extends Document     {
    title:string,
    description?:string,
    slug:string,
    type:string,
    validFrom:Date,
    validTo:Date,
    applicableProducts?:{offer:{title:string, discount:number, description:string}, type:string}[],
    applicableCategories?:{offer:{title:string, discount:number, description:string}, type:string}[],
    applicableBrands?:{offer:{title:string, discount:number, description:string}, type:string}[],
    createdAt:Date,
    updatedAt:Date    
}

