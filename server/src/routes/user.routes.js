import express from "express";
import { getProfile, updateProfile, deleteProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { updateProfileSchema } from "../validators/user.validator.js";

const router = express.Router();

router.use(protect); // Secure all profile routes

router.get("/me", getProfile);
router.patch("/me", validateRequest(updateProfileSchema), updateProfile);
router.delete("/me", deleteProfile);

export default router;
