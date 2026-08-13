"use client";

export const dynamic = "force-dynamic";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  History,
  MapPin,
  Trash2,
  TrendingUp,
  Award,
  Zap,
  Leaf,
  Scale,
  X,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { usePredictionStore } from "@/store/prediction-store";
import { SCRAP_RATES } from "@/constants/mock-data";
import Link from "next/link";
import { Navigation } from "lucide-react";

export default function DashboardPage() {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Get approx value in Rupees (₹)
  const getEstimatedValue = (category) => {
    if (!category) return null;
    const key = category.toLowerCase();
    const rate = SCRAP_RATES[key] || 0;
    if (rate === 0) return null;
    
    // Assume some standard weights per category for Rupees calculations
    let weightKg = 0.25; // default 250g
    if (key.includes("cardboard")) weightKg = 0.6;
    else if (key.includes("paper")) weightKg = 0.3;
    else if (key.includes("glass")) weightKg = 0.4;
    else if (key.includes("metal")) weightKg = 0.15;
    else if (key.includes("e-waste")) weightKg = 1.5;
    else if (key.includes("organic")) weightKg = 1.0;
    else if (key.includes("textile")) weightKg = 0.8;
    
    return {
      rate,
      value: (weightKg * rate).toFixed(2),
      weight: weightKg * 1000
    };
  };
  
  // Zustand State hooks
  const { user, stats, addPoints, incrementScans } = useUserStore();
  const {
    history,
    isUploading,
    uploadProgress,
    currentPrediction,
    currentImage,
    uploadAndClassify,
    clearCurrentPrediction,
    deleteHistoryItem,
    fetchHistory,
    updateItemCondition,
    submitManualCorrection,
    submitRecommendationFeedback
  } = usePredictionStore();

  const estValue = currentPrediction
    ? getEstimatedValue(currentPrediction.correctedCategory || currentPrediction.category)
    : null;

  const displayPrimaryAction = currentPrediction
    ? (currentPrediction.recommendation?.primaryAction || (currentPrediction.recyclability ? "RECYCLE" : "DISPOSE"))
    : "RECYCLE";

  const displayReason = currentPrediction
    ? (currentPrediction.recommendation?.reason || (currentPrediction.materials ? `Contains materials: ${currentPrediction.materials.join(", ")}.` : "Disposal details and guide."))
    : "";

  const displayInstructions = currentPrediction
    ? (currentPrediction.recommendation?.instructions || currentPrediction.recommendations?.map(r => `${r.action}: ${r.details}`) || [])
    : [];

  const displayAlternatives = currentPrediction
    ? (currentPrediction.recommendation?.alternatives || [])
    : [];

  const displayCarbonText = currentPrediction
    ? (currentPrediction.recommendation?.environmentalImpact?.text || (currentPrediction.carbonSavedKg > 0 ? `Saves approx. ${currentPrediction.carbonSavedKg.toFixed(2)} kg of CO2 emissions` : null))
    : null;

  useEffect(() => {
    fetchHistory(1, 10);
    setFeedbackSubmitted(false);
  }, [fetchHistory, currentPrediction?.id, currentPrediction?._id]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileSubmit(file);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleFileSubmit(file);
    }
  };

  const handleFileSubmit = async (file) => {
    // 1. Trigger Zustand upload simulation
    await uploadAndClassify(file);
    
    // 2. Increment stats & award eco points (simulate reward)
    incrementScans();
    addPoints(50); // Award 50 points per classification!
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Grid / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {user?.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze your disposal items to track carbon offsets and build green habits.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 px-4 py-2 rounded-xl flex items-center space-x-2.5">
          <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider">Active Level</div>
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{user?.ecoLevel}</div>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scans Count */}
        <Card className="p-5 flex items-center space-x-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalScans}</span>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Total Waste Scans</p>
          </div>
        </Card>

        {/* Recycled Count */}
        <Card className="p-5 flex items-center space-x-4">
          <div className="bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 p-3 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.recycledItemsCount}</span>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Successfully Recycled</p>
          </div>
        </Card>

        {/* CO2 Saved */}
        <Card className="p-5 flex items-center space-x-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.co2SavedKg.toFixed(1)} kg</span>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Carbon Emissions Saved</p>
          </div>
        </Card>

        {/* Eco points Progress widget */}
        <Card className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Zap className="h-4.5 w-4.5 text-amber-500" />
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Level Progress</span>
            </div>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">{stats.pointsEarned} pts</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              style={{ width: `${stats.levelProgressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground flex justify-between">
            <span>{stats.levelProgressPercent}% Completed</span>
            <span>Next Rank: 1500 pts</span>
          </div>
        </Card>
      </div>

      {/* 3. Primary Interactive Area: Upload Scan & Active predictions split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload module (Left Side) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all bg-white/50 dark:bg-zinc-900/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Upload Waste Image</CardTitle>
              <CardDescription>Drop an image or click to choose from camera roll</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Drag and Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={cn(
                  "border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 cursor-pointer min-h-[220px] transition-all",
                  {
                    "bg-emerald-50/20 border-emerald-500/40 dark:bg-emerald-950/10": dragActive,
                    "hover:bg-zinc-50 dark:hover:bg-zinc-900/30": !dragActive && !isUploading,
                    "pointer-events-none opacity-80": isUploading
                  }
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />

                {isUploading ? (
                  // Google Material Spinner with details
                  <div className="flex flex-col items-center space-y-4">
                    <Spinner size="md" />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Scanning Image...</p>
                      <p className="text-xs text-muted-foreground">Uploading: {uploadProgress}%</p>
                    </div>
                    <div className="h-1.5 w-40 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 p-4 rounded-full border border-emerald-100 dark:border-emerald-900/60 shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <Upload className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Click to upload</span>
                      <span className="text-zinc-500 text-sm"> or drag and drop</span>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prediction Results Display Card (Right Side) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {currentPrediction ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border border-emerald-500/10 glow-green">
                  {/* Scanned Image Preview */}
                  {currentImage && (
                    <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-b">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentImage}
                        alt="Scanned item preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={clearCurrentPrediction}
                        className="absolute right-3 top-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                        title="Close results"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-xl capitalize">
                          {currentPrediction.correctedCategory || currentPrediction.category} Detected
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center space-x-1 mt-0.5">
                          <Sparkles className="h-3 w-3 text-emerald-500" />
                          <span>AI Confidence: {currentPrediction.confidence || 0}%</span>
                        </CardDescription>
                      </div>

                      <Badge
                        variant={
                          displayPrimaryAction === "DISPOSE"
                            ? "destructive"
                            : displayPrimaryAction === "SPECIAL_HANDLING"
                            ? "warning"
                            : "success"
                        }
                      >
                        {displayPrimaryAction}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Item Condition Assessment selector */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">
                        What is the condition of this item?
                      </span>
                      <div className="grid grid-cols-5 gap-1 pt-0.5">
                        {["New", "Good", "Damaged", "Broken", "Unknown"].map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() =>
                              updateItemCondition(currentPrediction.id || currentPrediction._id, cond)
                            }
                            className={cn(
                              "px-1 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all duration-150",
                              currentPrediction.condition === cond
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                            )}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation reason */}
                    <div className="space-y-1.5 border-t pt-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                        Why?
                      </span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {displayReason}
                      </p>
                    </div>

                    {/* Instructions list */}
                    {displayInstructions.length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                          Instructions
                        </span>
                        <ul className="space-y-2">
                          {displayInstructions.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start space-x-2 text-xs leading-normal text-zinc-600 dark:text-zinc-300"
                            >
                              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 h-4.5 w-4.5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Alternatives list */}
                    {displayAlternatives.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                          Alternatives:
                        </span>
                        {displayAlternatives.map((alt, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] uppercase font-semibold">
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Carbon Offset / Impact stats */}
                    {displayCarbonText && (
                      <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20">
                        <TrendingUp className="h-4.5 w-4.5 shrink-0" />
                        <span>{displayCarbonText}</span>
                      </div>
                    )}

                    {/* Approx Scrap Value in Rupees */}
                    {estValue && (
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20">
                        <span className="flex items-center space-x-1.5">
                          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">₹</span>
                          <span>Est. Market Scrap Value:</span>
                        </span>
                        <span className="font-bold">
                          ₹{estValue.value} <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-normal">(at ₹{estValue.rate}/kg, ~{estValue.weight}g)</span>
                        </span>
                      </div>
                    )}

                    {/* Recommendation feedback */}
                    <div className="border-t pt-3 flex justify-between items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        Was this recommendation useful?
                      </span>
                      {feedbackSubmitted ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
                          Thanks for your feedback!
                        </span>
                      ) : (
                        <div className="flex space-x-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              await submitRecommendationFeedback(
                                currentPrediction.id || currentPrediction._id,
                                true
                              );
                              setFeedbackSubmitted(true);
                            }}
                            className="flex items-center text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 transition-all"
                          >
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Yes
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await submitRecommendationFeedback(
                                currentPrediction.id || currentPrediction._id,
                                false
                              );
                              setFeedbackSubmitted(true);
                            }}
                            className="flex items-center text-zinc-500 hover:text-red-500 dark:hover:text-red-400 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 transition-all"
                          >
                            <ThumbsDown className="h-3.5 w-3.5 mr-1" /> No
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category Manual Correction Dropdown */}
                    <div className="space-y-1.5 border-t pt-3">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">
                        Incorrect Category? Correct manually:
                      </label>
                      <select
                        value={currentPrediction.correctedCategory || currentPrediction.category || ""}
                        onChange={(e) =>
                          submitManualCorrection(
                            currentPrediction.id || currentPrediction._id,
                            e.target.value
                          )
                        }
                        className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-700 dark:text-zinc-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {[
                          "Plastic",
                          "Paper",
                          "Cardboard",
                          "Glass",
                          "Metal",
                          "Food/Organic",
                          "E-Waste",
                          "Textile",
                          "Hazardous",
                          "Other",
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              // Empty State results placeholder
              <Card className="h-[380px] flex flex-col justify-center items-center p-6 border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-center">
                <div className="bg-zinc-50 text-zinc-400 dark:bg-zinc-900 p-4 rounded-full mb-4 border border-zinc-100 dark:border-zinc-800">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Awaiting Classification</h3>
                <p className="text-xs text-muted-foreground max-w-[240px] mt-1.5 leading-normal">
                  Drop an image of trash, cardboard, or plastic in the upload panel to see immediate AI predictions here.
                </p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Secondary Row: Recent scan history & Nearby Municipal depots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scans History Table (Left Side) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center space-x-2 text-zinc-900 dark:text-zinc-50">
              <History className="h-5 w-5 text-zinc-400" />
              <span>Recent Waste Scans</span>
            </h2>
          </div>

          <Card className="overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-semibold border-b text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Image</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Confidence</th>
                    <th className="py-3.5 px-4 font-bold">Scanned At</th>
                    <th className="py-3.5 px-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {history.length > 0 ? (
                    history.map((item) => (
                      <tr
                        key={item._id || item.id}
                        onClick={() => {
                          usePredictionStore.setState({
                            currentPrediction: item,
                            currentImage: item.imageUrl,
                          });
                          setFeedbackSubmitted(false);
                        }}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                        title="Click to view full recommendation report"
                      >
                        <td className="py-3 px-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt="Scanned item preview"
                            className="h-10 w-10 object-cover rounded-lg border shadow-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                            {item.correctedCategory || item.category || "Unknown"}
                          </span>
                          {item.correctedCategory && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded ml-1.5 font-bold">
                              Corrected
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {item.confidence || 0}% Match
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteHistoryItem(item._id || item.id)}
                            className="text-zinc-400 hover:text-red-500 rounded-full h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No scans available. Start by uploading an image.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Navigation & Depots Guide Card (Right Side) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-md overflow-hidden shadow-lg p-6 flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 p-4 rounded-2xl w-fit border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
                <Navigation className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-snug">
                  Interactive Depot Navigation
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Need to drop off your recyclables? Open our full maps interface to find nearby municipal depots, check current scrap rates, and get step-by-step route directions.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-900/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Live GPS Location Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Driving, Cycling, and Walking Routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Total Distance & Travel Time Estimates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Complete Street-Level Directions List</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link href="/dashboard/map" className="w-full">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 rounded-xl h-11 transition-all shadow-sm shadow-emerald-500/10">
                  <MapPin className="h-4 w-4" /> Open Navigation Maps
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
