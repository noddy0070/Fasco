import { level } from "./customEnum";
import { Document } from "mongoose";
export interface CategoryI extends Document {
    name:string,
    slug:string,
    parent?:string,
    level:string,
    createdAt:Date,
    updatedAt:Date
}