import cloudinary from "../config/cloudinary.js";
import WastePrediction from "../models/WastePrediction.js";
import Recommendation from "../models/Recommendation.js";
import RecommendationFeedback from "../models/RecommendationFeedback.js";
import RecyclingCenter from "../models/RecyclingCenter.js";
import wasteClassifier from "../services/ai/waste-classifier.js";
import disposalDecisionEngine from "../services/recommendation/decision-engine.js";
import { AppError } from "../utils/app-error.js";

// Cloudinary Stream uploader helper
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ecosort" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(fileBuffer);
  });
};

// Upload & Classify Waste Image
export const uploadWasteImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Please select a waste image to upload.", 400));
    }

    // 1. Upload image buffer to Cloudinary (fallback to Base64 in offline environments)
    let imageUrl = "";
    let cloudinaryPublicId = "";
    try {
      const cloudinaryResult = await streamUpload(req.file.buffer);
      imageUrl = cloudinaryResult.secure_url;
      cloudinaryPublicId = cloudinaryResult.public_id;
    } catch (uploadError) {
      console.warn("⚠️ Cloudinary upload failed (offline environment detected). Using local Base64 fallback!");
      const base64Data = req.file.buffer.toString("base64");
      imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      cloudinaryPublicId = `offline_fallback_${Date.now()}`;
    }

    // 2. Classify waste image using AI
    let classification;
    try {
      classification = await wasteClassifier.classify(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    } catch (aiError) {
      // Fallback classification if service throws directly
      classification = {
        category: "Other",
        confidence: 50,
        detectedObjects: ["Unidentified Waste"],
      };
    }

    // 3. Generate primary and alternative disposal suggestions
    const recommendation = await disposalDecisionEngine.getRecommendation(
      classification.category,
      classification.detectedObjects,
      "Unknown" // Default condition on upload
    );

    // 4. Save WastePrediction to MongoDB
    const prediction = await WastePrediction.create({
      userId: req.user._id,
      imageUrl,
      cloudinaryPublicId,
      category: classification.category,
      confidence: classification.confidence,
      detectedObjects: classification.detectedObjects,
      condition: "Unknown",
      originalPrediction: classification.category,
      status: "SUCCESS",
    });

    // 5. Save Recommendations linked to this prediction
    const savedRec = await Recommendation.create({
      predictionId: prediction._id,
      primaryAction: recommendation.primaryAction,
      alternatives: recommendation.alternatives,
      reason: recommendation.reason,
      instructions: recommendation.instructions,
      environmentalImpact: recommendation.environmentalImpact,
    });

    res.status(201).json({
      success: true,
      data: {
        id: prediction._id,
        imageUrl: prediction.imageUrl,
        category: prediction.category,
        confidence: prediction.confidence,
        detectedObjects: prediction.detectedObjects,
        condition: prediction.condition,
        originalPrediction: prediction.originalPrediction,
        correctedCategory: prediction.correctedCategory,
        status: prediction.status,
        recommendation: savedRec,
        createdAt: prediction.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update item condition and regenerate recommendations
export const updateCondition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { condition } = req.body;

    const allowedConditions = ["New", "Good", "Damaged", "Broken", "Unknown"];
    if (!allowedConditions.includes(condition)) {
      return next(new AppError("Invalid condition option specified.", 400));
    }

    const prediction = await WastePrediction.findOne({ _id: id, userId: req.user._id });
    if (!prediction) {
      return next(new AppError("Prediction record not found.", 404));
    }

    // Update condition
    prediction.condition = condition;
    await prediction.save();

    // Use correctedCategory if it exists, otherwise original AI category
    const activeCategory = prediction.correctedCategory || prediction.category || "Other";

    // Re-run the recommendation engine
    const newRecommendation = await disposalDecisionEngine.getRecommendation(
      activeCategory,
      prediction.detectedObjects,
      condition
    );

    // Update existing recommendations
    const recommendation = await Recommendation.findOneAndUpdate(
      { predictionId: prediction._id },
      {
        primaryAction: newRecommendation.primaryAction,
        alternatives: newRecommendation.alternatives,
        reason: newRecommendation.reason,
        instructions: newRecommendation.instructions,
        environmentalImpact: newRecommendation.environmentalImpact,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: {
        prediction,
        recommendation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Record manual category correction and regenerate recommendations
export const correctPrediction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { correctedCategory } = req.body;

    const prediction = await WastePrediction.findOne({ _id: id, userId: req.user._id });
    if (!prediction) {
      return next(new AppError("Prediction record not found.", 404));
    }

    prediction.correctedCategory = correctedCategory;
    await prediction.save();

    // Re-run the recommendation engine on the corrected category
    const newRecommendation = await disposalDecisionEngine.getRecommendation(
      correctedCategory,
      prediction.detectedObjects,
      prediction.condition
    );

    // Update existing recommendations
    const recommendation = await Recommendation.findOneAndUpdate(
      { predictionId: prediction._id },
      {
        primaryAction: newRecommendation.primaryAction,
        alternatives: newRecommendation.alternatives,
        reason: newRecommendation.reason,
        instructions: newRecommendation.instructions,
        environmentalImpact: newRecommendation.environmentalImpact,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: {
        prediction,
        recommendation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Submit feedback for a recommendation
export const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { wasUseful, comment } = req.body;

    const prediction = await WastePrediction.findOne({ _id: id, userId: req.user._id });
    if (!prediction) {
      return next(new AppError("Prediction record not found.", 404));
    }

    // Save or update feedback
    const feedback = await RecommendationFeedback.findOneAndUpdate(
      { predictionId: prediction._id, userId: req.user._id },
      { wasUseful, comment: comment || "" },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// Get Paginated Waste Scan History
export const getWasteHistory = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const total = await WastePrediction.countDocuments({ userId: req.user._id });
    
    const predictions = await WastePrediction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch recommendations for these predictions
    const predictionIds = predictions.map((p) => p._id);
    const recommendations = await Recommendation.find({ predictionId: { $in: predictionIds } });

    // Map recommendations to each prediction
    const history = predictions.map((pred) => {
      const rec = recommendations.find((r) => r.predictionId.toString() === pred._id.toString());
      return {
        ...pred.toObject(),
        recommendation: rec || null,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all recycling centers from database
export const getRecyclingCenters = async (req, res, next) => {
  try {
    const centers = await RecyclingCenter.find({});
    res.status(200).json({
      success: true,
      data: centers,
    });
  } catch (error) {
    next(error);
  }
};

// Securely Proxy LocationIQ Static Maps request
export const getStaticMap = async (req, res, next) => {
  try {
    const { lat, lon, centerId } = req.query;
    
    if (!lat || !lon) {
      return next(new AppError("User coordinates (lat, lon) are required.", 400));
    }

    const userLat = Number(lat);
    const userLon = Number(lon);
    
    let centerLat = userLat;
    let centerLon = userLon;
    let selectedCenter = null;

    if (centerId) {
      selectedCenter = await RecyclingCenter.findById(centerId);
      if (selectedCenter) {
        centerLat = selectedCenter.latitude;
        centerLon = selectedCenter.longitude;
      }
    }

    const zoom = selectedCenter ? 14 : 12;
    const apiKey = process.env.LOCATIONIQ_TOKEN;

    if (!apiKey) {
      return next(new AppError("LocationIQ API token is not configured on the backend.", 500));
    }

    // Construct LocationIQ Static Map URL markers list
    let markersStr = `icon:large-green-cutout|${userLat},${userLon}`;
    
    // Add all centers to markers
    const centers = await RecyclingCenter.find({});
    centers.forEach((c) => {
      const isSelected = selectedCenter && selectedCenter._id.toString() === c._id.toString();
      const color = isSelected ? "red" : "blue";
      markersStr += `&markers=icon:large-${color}-cutout|${c.latitude},${c.longitude}`;
    });

    const mapUrl = `https://maps.locationiq.com/v3/staticmap?key=${apiKey}&center=${centerLat},${centerLon}&zoom=${zoom}&size=500x500&format=png&maptype=streets&markers=${markersStr}`;

    // Fetch the image from LocationIQ and pipe it
    const response = await fetch(mapUrl);
    if (!response.ok) {
      throw new Error(`LocationIQ returned status ${response.status}`);
    }

    // Get image buffer
    const buffer = await response.arrayBuffer();
    
    // Set response headers
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache locally for 1 hour
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("❌ Map proxy failed:", error.message);
    next(new AppError(`Failed to load map: ${error.message}`, 502));
  }
};
