import express from "express";
import {
  uploadWasteImage,
  updateCondition,
  correctPrediction,
  submitFeedback,
  getWasteHistory,
  getRecyclingCenters,
  getStaticMap,
} from "../controllers/waste.controller.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect); // All waste routes require login session

router.post("/upload", upload.single("image"), uploadWasteImage);
router.patch("/predictions/:id/condition", updateCondition);
router.patch("/predictions/:id/correct", correctPrediction);
router.post("/predictions/:id/feedback", submitFeedback);
router.get("/history", getWasteHistory);
router.get("/centers", getRecyclingCenters);
router.get("/map", getStaticMap);

export default router;
