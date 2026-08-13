import mongoose from "mongoose";

const RecommendationFeedbackSchema = new mongoose.Schema(
  {
    predictionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WastePrediction",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wasUseful: {
      type: Boolean,
      required: [true, "Usefulness flag is required"],
    },
    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only leave feedback once per prediction
RecommendationFeedbackSchema.index({ predictionId: 1, userId: 1 }, { unique: true });

const RecommendationFeedback = mongoose.model("RecommendationFeedback", RecommendationFeedbackSchema);
export default RecommendationFeedback;
