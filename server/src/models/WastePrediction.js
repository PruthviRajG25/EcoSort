import mongoose from "mongoose";

const WastePredictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "Cloudinary Public ID is required"],
    },
    category: {
      type: String,
      default: null,
    },
    confidence: {
      type: Number,
      default: null,
    },
    detectedObjects: {
      type: [String],
      default: [],
    },
    condition: {
      type: String,
      enum: ["New", "Good", "Damaged", "Broken", "Unknown"],
      default: "Unknown",
    },
    originalPrediction: {
      type: String,
      default: null,
    },
    correctedCategory: {
      type: String,
      default: null,
    },
    modelName: {
      type: String,
      default: "Gemini-1.5-Flash",
    },
    modelVersion: {
      type: String,
      default: "v1.0",
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const WastePrediction = mongoose.model("WastePrediction", WastePredictionSchema);
export default WastePrediction;
