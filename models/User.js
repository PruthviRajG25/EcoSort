import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    ecoPoints: {
      type: Number,
      default: 150,
    },
    ecoLevel: {
      type: String,
      default: "Eco Pioneer",
    },
    city: {
      type: String,
      default: "Bengaluru",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password || "");
};

// Prevent model recompilation error in Next.js hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
