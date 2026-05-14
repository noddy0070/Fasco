import { Document } from "mongoose";
export default interface CategoryI extends Document {
    name:string,
    slug:string,
    parent?:string,
    level:string,
    createdAt:Date,
    updatedAt:Date
}