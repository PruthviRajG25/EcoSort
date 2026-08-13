import mongoose from "mongoose";
import RecyclingCenter from "../models/RecyclingCenter.js";

const DEFAULT_CENTERS = [
  {
    name: "Bengaluru Dry Waste Collection Centre",
    address: "12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru",
    latitude: 12.9716,
    longitude: 77.6406,
    categories: ["plastic", "paper", "cardboard", "metal"],
    contact: "+91 80 2266 0000",
    rates: { plastic: 12, paper: 8, cardboard: 15, metal: 75 },
  },
  {
    name: "EcoRehab Electronic Recycling",
    address: "Outer Ring Rd, Marathahalli, Bengaluru",
    latitude: 12.9562,
    longitude: 77.7011,
    categories: ["e-waste", "metal", "plastic"],
    contact: "+91 98860 12345",
    rates: { "e-waste": 120, metal: 75, plastic: 10 },
  },
  {
    name: "GreenBin Organic Composting Depot",
    address: "5th Cross Rd, Malleshwaram, Bengaluru",
    latitude: 13.0031,
    longitude: 77.5684,
    categories: ["organic", "paper"],
    contact: "+91 80 2346 5555",
    rates: { organic: 2, paper: 5 },
  },
];

const seedRecyclingCenters = async () => {
  try {
    const count = await RecyclingCenter.countDocuments();
    if (count === 0) {
      console.log("🌱 Database: No recycling centers found. Seeding default depots...");
      await RecyclingCenter.insertMany(DEFAULT_CENTERS);
      console.log("✅ Database: Default recycling centers seeded successfully.");
    }
  } catch (err) {
    console.error(`⚠️ Database: Failed to seed recycling centers: ${err.message}`);
  }
};

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is missing!");
      return false;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed collection
    await seedRecyclingCenters();
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    return false;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed gracefully.");
  } catch (error) {
    console.error(`❌ Error during MongoDB disconnection: ${error.message}`);
  }
};
