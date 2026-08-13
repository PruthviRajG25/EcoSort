import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/app-error.js";

export const protect = async (req, _res, next) => {
  try {
    let token = "";

    // 1. Read JWT from cookies (preferred) or Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to get access.", 401));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    // 4. Attach authenticated user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired authentication token. Please log in again.", 401));
  }
};

// Role authorization guard
export const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};
