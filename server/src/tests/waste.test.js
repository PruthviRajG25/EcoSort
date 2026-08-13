import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import WastePrediction from "../models/WastePrediction.js";
import Recommendation from "../models/Recommendation.js";
import RecyclingCenter from "../models/RecyclingCenter.js";
import cloudinary from "../config/cloudinary.js";
import wasteClassifier from "../services/ai/waste-classifier.js";
import disposalDecisionEngine from "../services/recommendation/decision-engine.js";

// Mock JSON Web Token verification
jest.spyOn(jwt, "verify").mockImplementation(() => ({
  id: "507f1f77bcf86cd799439011",
}));

// Mock Mongoose model queries
jest.spyOn(User, "findById").mockImplementation(() => ({
  _id: "507f1f77bcf86cd799439011",
  name: "Test User",
  email: "test@ecosort.ai",
  role: "USER",
}));

jest.spyOn(WastePrediction, "create").mockImplementation((data) => Promise.resolve({
  _id: "507f1f77bcf86cd799439022",
  userId: "507f1f77bcf86cd799439011",
  imageUrl: data.imageUrl || "https://res.cloudinary.com/test/image/upload/sample.jpg",
  cloudinaryPublicId: data.cloudinaryPublicId || "ecosort/sample",
  category: data.category || "Plastic",
  confidence: data.confidence || 94,
  detectedObjects: data.detectedObjects || ["Plastic Bottle"],
  condition: data.condition || "Unknown",
  originalPrediction: data.category || "Plastic",
  status: "SUCCESS",
  createdAt: new Date(),
}));

jest.spyOn(WastePrediction, "findOne").mockImplementation(() => Promise.resolve({
  _id: "507f1f77bcf86cd799439022",
  userId: "507f1f77bcf86cd799439011",
  category: "E-Waste",
  detectedObjects: ["Laptop"],
  condition: "Unknown",
  save: jest.fn().mockResolvedValue(true),
}));

jest.spyOn(Recommendation, "create").mockImplementation((data) => Promise.resolve({
  predictionId: data.predictionId,
  primaryAction: data.primaryAction,
  alternatives: data.alternatives,
  reason: data.reason,
  instructions: data.instructions,
  environmentalImpact: data.environmentalImpact,
}));

jest.spyOn(Recommendation, "findOneAndUpdate").mockImplementation(() => Promise.resolve({
  predictionId: "507f1f77bcf86cd799439022",
  primaryAction: "DONATE",
  alternatives: ["SELL", "RECYCLE"],
}));

// Mock Cloudinary stream upload spy
const uploadSpy = jest.spyOn(cloudinary.uploader, "upload_stream");

// Mock AI Classifier service
jest.spyOn(wasteClassifier, "classify").mockImplementation(() => Promise.resolve({
  category: "Plastic",
  confidence: 94,
  detectedObjects: ["Plastic Bottle"],
}));

// Mock Decision Engine service
jest.spyOn(disposalDecisionEngine, "getRecommendation").mockImplementation(() => Promise.resolve({
  primaryAction: "RECYCLE",
  alternatives: ["REUSE"],
  reason: "Plastic bottles are highly recyclable.",
  instructions: ["Rinse the bottle", "Place in blue bin"],
  environmentalImpact: {
    wasteAvoidedGrams: 50,
    co2SavedKg: 0.15,
    text: "Avoids 0.15kg CO2",
  },
}));

describe("Waste API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uploadSpy.mockImplementation((options, callback) => {
      return {
        end: (buffer) => {
          callback(null, {
            secure_url: "https://res.cloudinary.com/test/image/upload/sample.jpg",
            public_id: "ecosort/sample",
          });
        },
      };
    });
  });

  describe("POST /api/waste/upload", () => {
    it("should upload an image and return AI prediction + recommendations successfully", async () => {
      const response = await request(app)
        .post("/api/waste/upload")
        .set("Cookie", ["token=mock-valid-token-12345"]) // Pass mock cookie to trigger auth middleware
        .attach("image", Buffer.from("fake-binary-image-data"), "bottle.png");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe("Plastic");
      expect(response.body.data.confidence).toBe(94);
      expect(response.body.data.recommendation.primaryAction).toBe("RECYCLE");
    });

    it("should fallback to local Base64 image URL if Cloudinary upload fails", async () => {
      // Mock Cloudinary stream upload to invoke the callback with an error (real-world network fail)
      uploadSpy.mockImplementationOnce((options, callback) => {
        return {
          end: (buffer) => {
            callback(new Error("DNS lookup failed"), null);
          },
        };
      });

      const response = await request(app)
        .post("/api/waste/upload")
        .set("Cookie", ["token=mock-valid-token-12345"])
        .attach("image", Buffer.from("fake-binary-image-data"), "bottle.png");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.imageUrl).toContain("data:image/png;base64,");
    });

    it("should reject uploads with empty files", async () => {
      const response = await request(app)
        .post("/api/waste/upload")
        .set("Cookie", ["token=mock-valid-token-12345"]);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("Please select a waste image");
    });
  });

  describe("PATCH /api/waste/predictions/:id/condition", () => {
    it("should update item condition and regenerate recommendations", async () => {
      const response = await request(app)
        .patch("/api/waste/predictions/507f1f77bcf86cd799439022/condition")
        .set("Cookie", ["token=mock-valid-token-12345"])
        .send({ condition: "Good" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(disposalDecisionEngine.getRecommendation).toHaveBeenCalledWith("E-Waste", ["Laptop"], "Good");
    });

    it("should reject invalid conditions", async () => {
      const response = await request(app)
        .patch("/api/waste/predictions/507f1f77bcf86cd799439022/condition")
        .set("Cookie", ["token=mock-valid-token-12345"])
        .send({ condition: "Excellent" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/waste/predictions/:id/correct", () => {
    it("should record category correction and regenerate recommendations", async () => {
      const response = await request(app)
        .patch("/api/waste/predictions/507f1f77bcf86cd799439022/correct")
        .set("Cookie", ["token=mock-valid-token-12345"])
        .send({ correctedCategory: "Glass" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(disposalDecisionEngine.getRecommendation).toHaveBeenCalledWith("Glass", ["Laptop"], "Unknown");
    });
  });

  describe("GET /api/waste/centers", () => {
    it("should fetch all recycling centers successfully from database", async () => {
      jest.spyOn(RecyclingCenter, "find").mockResolvedValueOnce([
        {
          _id: "507f1f77bcf86cd799439033",
          name: "Test Municipal Center",
          address: "123 Green Ave",
          latitude: 12.9716,
          longitude: 77.6406,
          categories: ["plastic"],
          rates: { plastic: 10 },
        },
      ]);

      const response = await request(app)
        .get("/api/waste/centers")
        .set("Cookie", ["token=mock-valid-token-12345"]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("Test Municipal Center");
    });
  });

  describe("GET /api/waste/map", () => {
    it("should proxy and return static map image successfully", async () => {
      jest.spyOn(RecyclingCenter, "findById").mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439033",
        latitude: 12.9716,
        longitude: 77.6406,
      });

      jest.spyOn(RecyclingCenter, "find").mockResolvedValueOnce([
        {
          _id: "507f1f77bcf86cd799439033",
          latitude: 12.9716,
          longitude: 77.6406,
        },
      ]);

      // Mock the global node-fetch call
      const mockFetchResponse = {
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      };
      const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(mockFetchResponse);

      const response = await request(app)
        .get("/api/waste/map?lat=12.9719&lon=77.5937&centerId=507f1f77bcf86cd799439033")
        .set("Cookie", ["token=mock-valid-token-12345"]);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("image/png");
      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});
