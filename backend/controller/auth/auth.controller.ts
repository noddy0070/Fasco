import express from 'express';
import User from '../../model/user.model.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/mailService.ts';

const extractCookieToken = (cookieHeader?: string): string | null => {
    if (!cookieHeader) return null;
    const tokenPair = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('token='));
    if (!tokenPair) return null;
    return decodeURIComponent(tokenPair.replace('token=', ''));
};

const signup = async (req: express.Request, res: express.Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
        } = req.body;

        if (!firstName || !email || !phone || !password) {
            return res.status(400).json({ message: "First name, email, phone and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser?.isVerified) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Replace unverified account so signup can proceed with fresh details.
        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ _id: existingUser._id });
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
        await sendEmail(
            email,
            `${process.env.FRONTEND_URL}/signup/verify?token=${jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" })}`,
            newUser._id.toString()
        );

        return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.log("Error signing up", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // hashedPassword is select:false in schema, so we must explicitly include it.
        const user = await User.findOne({ email }).select('+hashedPassword');
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (!user.hashedPassword) {
            return res.status(400).json({ message: "Invalid account data. Please sign up again." });
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "User is blocked" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: "User is not verified" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );
        const { hashedPassword, ...userData } = user.toObject();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            token,
            data: userData
        });
    } catch (err) {
        console.log("Error logging in", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const logout = async (_req: express.Request, res: express.Response) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        return res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.log("Error logging out", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const me = async (req: express.Request, res: express.Response) => {
    try {
        const token = extractCookieToken(req.headers.cookie);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId?: string };
        if (!decoded?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            data: user,
        });
    } catch (err) {
        console.log("Error fetching current user", err);
        return res.status(401).json({ message: "Unauthorized" });
    }
};


export { signup, login, logout, me };