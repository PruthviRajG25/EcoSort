import express from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
