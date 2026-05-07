import User from "../../model/user.model.ts";
import express from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
const verifyEmail= (req: express.Request, res: express.Response)=>{
    try {
        // console.log(req)
        const token=req.params.token;
        if(!token){
            return res.status(400).json({message:"Token is required"});
        }
        if(typeof token !== "string"){
            return res.status(400).json({message:"Invalid token"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        const userId = decoded.userId;
        User.findByIdAndUpdate(userId, { isVerified: true }, { new: true })
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            return res.status(200).json({ message: "Email verified successfully" });
        })
        .catch((err) => {
            console.error("Error verifying email:", err);
            return res.status(500).json({ message: "Internal server error" });
        });
    } catch (err) {
        console.error("Invalid token:", err);
        return res.status(400).json({ message: "Invalid token" });
    }
}

export {verifyEmail};