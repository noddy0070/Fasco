import User from "../../model/user.model.ts";
import express from "express";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/mailService.ts";
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
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

const resendVerification = async (req: express.Request, res: express.Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
        });
        await sendEmail(email, `${process.env.FRONTEND_URL}/signup/verify?token=${token}`, user._id.toString());
        return res.status(200).json({ message: "Verification email sent" });
    } catch (err) {
        console.error("Error resending verification email:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export {verifyEmail, resendVerification};