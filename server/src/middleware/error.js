import { AppError } from "../utils/app-error.js";

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      error: err,
    },
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
      },
    });
  } else {
    console.error("🔥 ERROR:", err);
    res.status(500).json({
      success: false,
      error: {
        message: "Something went wrong on the server.",
      },
    });
  }
};

export const errorHandler = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err, message: err.message };

  if (err.name === "CastError") {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const value = Object.keys(err.keyValue || {}).join(", ");
    error = new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((el) => el.message);
    error = new AppError(`Invalid input data: ${messages.join(". ")}`, 400);
  }

  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Your session has expired. Please log in again.", 401);
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};
