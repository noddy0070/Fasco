import { Document } from "mongoose";

export interface WishlistI extends Document{
    user:string,
}