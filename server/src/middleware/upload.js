import multer from "multer";
import path from "path";
import { AppError } from "../utils/app-error.js";

// Setup memory storage to hold buffer before uploading to Cloudinary
const storage = multer.memoryStorage();

// File filter validator
const fileFilter = (_req, file, cb) => {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|webp/;
  
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  
  cb(
    new AppError(
      "Unsupported file format! Only JPEG, JPG, PNG, and WEBP image formats are allowed.",
      400
    )
  );
};

// Initialize multer upload
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB size limit
  },
  fileFilter,
});
