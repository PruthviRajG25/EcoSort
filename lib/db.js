import mongoose from "mongoose";
import dns from "dns";

// Ensure DNS resolution succeeds for MongoDB Atlas SRV connection strings in all environments
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://pruthvirajgispro_db_user:8tmjW1SFfwmD2Gv7@cluster0.qjddv3v.mongodb.net/ecosort?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function executions on Vercel.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(" Connected to MongoDB Atlas (EcoSort Database)");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(" MongoDB Atlas Connection Error:", e.message);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
