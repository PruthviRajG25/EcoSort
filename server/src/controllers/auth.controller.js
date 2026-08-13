import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/app-error.js";

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Helper to sign and send token inside cookie & body
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Set the HTTP-Only JWT token cookie
  res.cookie("token", token, cookieOptions);

  // Set a client-accessible cookie for Next.js routing middleware
  res.cookie("ecosort_authenticated", "true", {
    expires: cookieOptions.expires,
    secure: cookieOptions.secure,
    sameSite: "lax", // Lax allows cookie checking during route navigation
  });

  // Remove password from response payload
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    data: {
      user,
    },
  });
};

// Register Controller
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email is already registered. Please login instead.", 400));
    }

    // Create the new user
    const newUser = await User.create({
      name,
      email,
      password,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login Controller
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include the password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect email or password.", 401));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout Controller
export const logout = (_req, res) => {
  // Clear both auth cookies
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "strict",
  });
  
  res.cookie("ecosort_authenticated", "", {
    expires: new Date(0),
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get Current Logged In User details
export const getMe = async (req, res) => {
  // req.user was attached by the 'protect' middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
