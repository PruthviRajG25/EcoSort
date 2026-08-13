import app from "./app.js";
import { connectDB, closeDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
// Start Express server listening immediately to prevent "Failed to fetch" on DB delay/failure
const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`♻️ EcoSort API Server Running on port ${PORT}`);
  console.log(`🟢 Health: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
});

// Connect to MongoDB asynchronously in the background
connectDB().catch((err) => {
  console.error("⚠️ Background database connection failed:", err.message);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    closeDB().then(() => {
      process.exit(1);
    });
  });
});

// Handle termination signals for graceful shutdown
const graceShutdown = (signal) => {
  console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);
  server.close(async () => {
    await closeDB();
    console.log("👋 Process terminated.");
    process.exit(0);
  });
};

process.on("SIGINT", () => graceShutdown("SIGINT"));
process.on("SIGTERM", () => graceShutdown("SIGTERM"));
