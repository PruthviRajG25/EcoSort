import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema(
  {
    predictionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WastePrediction",
      required: true,
      unique: true,
    },
    primaryAction: {
      type: String,
      required: true,
      enum: ["REUSE", "REPAIR", "DONATE", "SELL", "RECYCLE", "DISPOSE", "SPECIAL_HANDLING"],
    },
    alternatives: {
      type: [String],
      default: [],
    },
    reason: {
      type: String,
      required: true,
    },
    instructions: {
      type: [String],
      default: [],
    },
    environmentalImpact: {
      wasteAvoidedGrams: { type: Number, default: 0 },
      co2SavedKg: { type: Number, default: 0 },
      text: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);
export default Recommendation;
