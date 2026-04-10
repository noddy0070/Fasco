import { Document } from "mongoose";

export default interface WishlistI extends Document{
    user:string,
}