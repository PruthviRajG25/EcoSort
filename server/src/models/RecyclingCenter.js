import mongoose from "mongoose";

const RecyclingCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    categories: {
      type: [String],
      required: true,
    },
    contact: {
      type: String,
      default: "",
    },
    rates: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const RecyclingCenter = mongoose.model("RecyclingCenter", RecyclingCenterSchema);
export default RecyclingCenter;
