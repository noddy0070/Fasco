import express from 'express';
import User from '../../model/user.model.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/mailService.ts';

const signup=async(req:express.Request,res:express.Response)=>{
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
    }=req.body;

    if(!firstName || !email || !phone || !password){
        return res.status(400).json({message:"First name, email, phone and password are required"});
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        if(existingUser.isVerified) {
            return res.status(400).json({ message: "Email already in use" });
        } else {
            User.deleteOne({ email })        
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        hashedPassword
    });
    await newUser.save();
    await sendEmail(email, `${process.env.FRONTEND_URL}/signup/verification?token=${jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" })}`, newUser._id.toString());
    
    return res.status(201).json({ message: "User created successfully" });
}

const login = async (req:express.Request,res:express.Response)=>{
    const {email,password}=req.body;
    if(!email || !password){    
        return res.status(400).json({message:"Email and password are required"});
    }
    User.findOne({email}).then(async (user)=>{
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if(!isMatch){
            return res.status(400).json({message:"Invalid password"});
        }
        if(user.isBlocked){
            return res.status(403).json({message:"User is blocked"});
        }
        if(!user.isVerified){
            return res.status(403).json({message:"User is not verified"});
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );
        
        return res.status(200).json({
            message: "Login successful",
            token,
            data:user
        });

    }).catch((err)=>{
        console.log("Error logging in", err);
        return res.status(500).json({message:"Internal server error"});
    }
    );  
}


export {signup, login}