import mongoose from "mongoose";

const WastePredictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      default: "General Recyclable",
    },
    confidence: {
      type: Number,
      default: 95,
    },
    materials: {
      type: [String],
      default: [],
    },
    recyclability: {
      type: Boolean,
      default: true,
    },
    condition: {
      type: String,
      default: "Dry & Clean",
    },
    recommendation: {
      primaryAction: { type: String, default: "RECYCLE" },
      reason: { type: String, default: "Recyclable via local municipal center." },
      instructions: { type: [String], default: [] },
      alternatives: { type: [String], default: [] },
      environmentalImpact: {
        text: { type: String, default: "Saves 0.2 kg CO2" },
        co2SavedKg: { type: Number, default: 0.2 },
      },
    },
  },
  {
    timestamps: true,
  }
);

const WastePrediction =
  mongoose.models.WastePrediction ||
  mongoose.model("WastePrediction", WastePredictionSchema);

export default WastePrediction;
