import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error.js";

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to support dynamic local development ports
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow server-to-server or test requests
      const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
      if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost) {
        return callback(null, true);
      }
      return callback(new Error("CORS Policy Violation: Origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Built-in body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for reading secure auth token cookies
app.use(cookieParser());

// Health Check Route
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "EcoSort API is running",
  });
});

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import wasteRouter from "./routes/waste.routes.js";

// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/waste", wasteRouter);

// Centralized error handler
app.use(errorHandler);

export default app;
