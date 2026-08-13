import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

console.log("=========================================");
console.log("♻️  EcoSort AI Diagnostic Tool");
console.log("=========================================");
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log("-----------------------------------------");

async function runDiagnostics() {
  // 1. Check environment variables
  console.log("1. Checking Environment variables...");
  const keys = [
    "PORT",
    "MONGODB_URI",
    "JWT_SECRET",
    "CLIENT_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  
  let envOK = true;
  keys.forEach(k => {
    if (!process.env[k]) {
      console.log(`   ❌ Missing variable: ${k}`);
      envOK = false;
    } else {
      // Hide secrets in log
      const val = process.env[k];
      const masked = val.length > 8 ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` : "***";
      console.log(`   ✅ ${k}: ${masked}`);
    }
  });

  if (!envOK) {
    console.log("\n   ⚠️  Please update your server/.env file with missing credentials.");
  }

  // 2. Test MongoDB connection
  console.log("\n2. Testing MongoDB Connection...");
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecosort";
  console.log(`   Connecting to: ${uri}`);
  
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("   ✅ Database connection successful!");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    await mongoose.connection.close();
  } catch (error) {
    console.log("   ❌ DATABASE CONNECTION FAILED!");
    console.log(`   Error message: ${error.message}`);
    console.log("   \n   💡 Solution:");
    if (uri.includes("127.0.0.1") || uri.includes("localhost")) {
      console.log("      Your local MongoDB Community Server is not running.");
      console.log("      Please start it in Windows Services or Command Prompt (net start MongoDB).");
      console.log("      Alternatively, set MONGODB_URI in server/.env to your MongoDB Atlas cloud string.");
    } else {
      console.log("      Double-check your Atlas connection string, database username, and password.");
      console.log("      Also check if your network IP is whitelisted on the MongoDB Atlas dashboard.");
    }
  }

  // 3. Test Internet connectivity
  console.log("\n3. Testing DNS Resolution for Cloud Services...");
  dns.resolve("cloudinary.com", (err) => {
    if (err) {
      console.log("   ❌ DNS Resolution failed for Cloudinary. Check internet connection.");
    } else {
      console.log("   ✅ Cloudinary DNS resolves successfully.");
    }
    
    dns.resolve("generativelanguage.googleapis.com", (err2) => {
      if (err2) {
        console.log("   ❌ DNS Resolution failed for Google Gemini API. Check internet connection.");
      } else {
        console.log("   ✅ Google Gemini API DNS resolves successfully.");
      }
      console.log("=========================================");
      process.exit(0);
    });
  });
}

runDiagnostics();
