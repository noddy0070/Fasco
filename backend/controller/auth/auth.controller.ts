import express from 'express';
import User from '../../model/user.model.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from "jsonwebtoken";
import { sendEmail } from '../../utils/mailService.ts';


// ================= SIGNUP =================

const signup = async (req: express.Request, res: express.Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !email || !phone || !password) {
      return res.status(400).json({
        message: "First name, email, phone and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          message: "Email already in use",
        });
      } else {
        await User.deleteOne({ email });
      }
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      hashedPass,
    });

    await newUser.save();

    const accessToken = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    const { hashedPassword, ...userData } = newUser.toObject();

    const verificationToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    try {
      await sendEmail(
        email,
        `${process.env.FRONTEND_URL}/signup/verification?token=${verificationToken}`,
        newUser._id.toString()
      );
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError);
    }

    return res.status(201).json({
      message: "User created successfully",
      token: accessToken,
      data: userData,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= LOGIN =================

const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.hashedPassword
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "User is blocked",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "User is not verified",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      data: user,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



// ================= GOOGLE LOGIN =================

const googleAuth = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email, firstName, lastName } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        isVerified: true,
        phone: "",
        hashedPassword: "",
      });

      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Google login successful",
      token,
      data: user,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= FORGOT PASSWORD =================

const forgotPassword = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const resetToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    await sendEmail(
      email,
      `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      user._id.toString()
    );

    return res.status(200).json({
      message: "Password reset link sent",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= RESET PASSWORD =================

const resetPassword = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.userId, {
      hashedPassword,
    });

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }
};


// ================= GET CURRENT USER =================

const me = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded.userId).select(
      "-hashedPassword"
    );

    return res.status(200).json({
      data: user,
    });
  } catch (err) {
    console.log(err);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};


// ================= LOGOUT =================

const logout = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= REFRESH TOKEN =================

const refresh = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      token: accessToken,
    });
  } catch (err) {
    console.log(err);

    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};


export {
  signup,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  me,
  logout,
  refresh,
};