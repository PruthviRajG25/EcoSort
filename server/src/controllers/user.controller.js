import User from "../models/User.js";
import { AppError } from "../utils/app-error.js";

// Get user profile details
export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

// Update user profile details (Name and/or Email)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    // Check if new email is already taken by another user
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return next(new AppError("Email is already taken by another user.", 400));
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
export const deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    // Clear auth cookies on response
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
      message: "User account deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
