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
  ThumbsUp,
  ThumbsDown,
  Camera,
  Truck,
  Navigation,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldCheck,
  Layers,
  Scissors,
  ScanBarcode
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
import LiveCamera from "@/components/dashboard/live-camera";
import BarcodeScannerModal from "@/components/dashboard/barcode-scanner-modal";
import EcoCraftIdeas from "@/components/dashboard/ecocraft-ideas";
import DecompositionSimulator from "@/components/dashboard/decomposition-simulator";
import ScrapPickupModal from "@/components/dashboard/scrap-pickup-modal";
import EprScanner from "@/components/dashboard/epr-scanner";

// Canonical demo fallback if user has not scanned an item yet
const DEMO_PREDICTION = {
  id: "demo-pet-bottle",
  _id: "demo-pet-bottle",
  category: "plastic",
  subCategory: "Plastic Bottle",
  confidence: 100,
  materials: ["Polyethylene Terephthalate (PET)", "Grade 1 Recyclable Resin"],
  recyclability: true,
  condition: "Good",
  recommendation: {
    primaryAction: "RECYCLE",
    reason: "Clear PET beverage bottles are universally accepted in curbside sorting systems. They are cleaned, shredded into rPET flakes, and spun into polyester textile fibers or food-grade containers.",
    instructions: [
      "Rinse: Remove any remaining beverage residue.",
      "Prepare: Screw the blue cap back onto the bottle.",
      "Recycle: Place the bottle in the recycling bin or drop-off hub."
    ],
    alternatives: [
      "Return through a reverse vending / bottle deposit system",
      "Upcycle into a garden seed starter or funnel"
    ],
    environmentalImpact: {
      text: "Saves approx. 0.08 kg of CO2 emissions",
      co2SavedKg: 0.08
    }
  },
  imageUrl: "https://images.unsplash.com/photo-1605600611283-c48a702277ee?w=800&auto=format&fit=crop",
  createdAt: new Date().toISOString()
};

export default function DashboardPage() {
  const fileInputRef = useRef(null);
  const analysisRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showWhyExpanded, setShowWhyExpanded] = useState(true);
  const [showDiyStudio, setShowDiyStudio] = useState(false);

  // Zustand stores
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

  useEffect(() => {
    fetchHistory(1, 10);
    setFeedbackSubmitted(false);
  }, [fetchHistory, currentPrediction?.id, currentPrediction?._id]);

  // Active prediction is either the current scanned item, the latest history item, or the canonical demo
  const activePrediction = currentPrediction || (history.length > 0 ? history[0] : DEMO_PREDICTION);
  const activeImage = currentImage || activePrediction?.imageUrl || DEMO_PREDICTION.imageUrl;
  const isDemo = !currentPrediction && history.length === 0;

  // Approx value in Rupees (₹)
  const getEstimatedValue = (category) => {
    if (!category) return null;
    const key = category.toLowerCase();
    const rate = SCRAP_RATES[key] || 0;
    if (rate === 0) return null;

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

  const activeCategory = activePrediction?.correctedCategory || activePrediction?.category || "plastic";
  const estValue = getEstimatedValue(activeCategory);

  const displayPrimaryAction = activePrediction?.recommendation?.primaryAction ||
    (activePrediction?.recyclability ? "RECYCLE" : "DISPOSE");

  const displayReason = activePrediction?.recommendation?.reason ||
    (activePrediction?.materials ? `Contains materials: ${activePrediction.materials.join(", ")}.` : "Disposal details and guide.");

  const rawInstructions = activePrediction?.recommendation?.instructions ||
    activePrediction?.recommendations?.map(r => `${r.action}: ${r.details}`) ||
    DEMO_PREDICTION.recommendation.instructions;

  // Normalize instructions into { stepNumber, title, detail }
  const displaySteps = rawInstructions.map((item, idx) => {
    if (typeof item === "string") {
      const parts = item.split(/:\s*(.+)/);
      if (parts.length >= 2) {
        return { step: idx + 1, title: parts[0].replace(/^\d+[\.\)]\s*/, ""), detail: parts[1] };
      }
      return { step: idx + 1, title: `Step ${idx + 1}`, detail: item };
    }
    return { step: idx + 1, title: item.action || `Step ${idx + 1}`, detail: item.details || "" };
  });

  const displayAlternatives = activePrediction?.recommendation?.alternatives || DEMO_PREDICTION.recommendation.alternatives;
  const displayConfidence = activePrediction?.confidence ?? 100;

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
    setShowCamera(false);
    await uploadAndClassify(file);
    incrementScans();
    addPoints(50);
    // Smooth scroll down to analysis
    if (analysisRef.current) {
      setTimeout(() => {
        analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Just now";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 2. WELCOME / DASHBOARD HEADER                                             */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {user?.name ? user.name.split(" ")[0] : "Green"}!
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-1">
            Analyze your disposal items to track carbon offsets and build green habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Eco Novice Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
            <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{user?.ecoLevel || "Eco Novice"}</span>
            <span className="text-zinc-400 dark:text-zinc-500">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.pointsEarned || 150} pts</span>
          </div>

          {/* Schedule Doorstep Pickup (Secondary CTA) */}
          <Button
            variant="outline"
            onClick={() => setShowPickupModal(true)}
            className="flex items-center gap-2 text-xs font-semibold h-10 px-4 rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Schedule Doorstep Pickup</span>
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WASTE SCANNER — HERO FEATURE (LEVEL 1 PRIMARY)                         */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Step 1 · Identify Any Item
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              Scan Waste Item
            </h2>
          </div>
          <span className="text-xs font-medium text-zinc-400 hidden sm:inline">
            Fast AI Classification & Disposal Guides
          </span>
        </div>

        <Card className="border-2 border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-b from-white to-emerald-50/20 dark:from-zinc-900 dark:to-zinc-950 shadow-xl shadow-emerald-500/5 overflow-hidden rounded-2xl">
          <CardContent className="p-5 sm:p-8 space-y-6">
            {showCamera ? (
              <LiveCamera onCapture={handleFileSubmit} onClose={() => setShowCamera(false)} />
            ) : (
              <>
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[240px]",
                    {
                      "bg-emerald-500/10 border-emerald-500 scale-[0.99]": dragActive,
                      "border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/70 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20": !dragActive && !isUploading,
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
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Spinner size="lg" />
                      <div className="text-center space-y-1">
                        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          Analyzing Waste with EcoSort Vision...
                        </p>
                        <p className="text-xs text-zinc-500 font-semibold">
                          Uploading & Processing: {uploadProgress}%
                        </p>
                      </div>
                      <div className="h-2 w-48 sm:w-64 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-200 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <Upload className="h-8 w-8" />
                      </div>

                      <div className="space-y-1 max-w-md">
                        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          Upload or capture an image to identify your waste
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Drag and drop your file here, or click to browse files
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
                        {/* Scan with Camera (Primary CTA) */}
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCamera(true);
                          }}
                          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Scan with Camera</span>
                        </Button>

                        {/* Barcode Scanner (New Feature) */}
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBarcodeScanner(true);
                          }}
                          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-bold h-11 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
                        >
                          <ScanBarcode className="h-4 w-4" />
                          <span>Barcode Scanner</span>
                        </Button>

                        {/* Upload Image (Secondary CTA) */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerFileSelect();
                          }}
                          className="w-full sm:w-auto font-bold h-11 px-5 rounded-xl border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                          <Upload className="h-4 w-4 text-zinc-500 mr-1.5" />
                          <span>Upload Image</span>
                        </Button>
                      </div>

                      <div className="pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-2 font-medium">
                        <span>JPEG · PNG · WEBP</span>
                        <span>·</span>
                        <span>Max 5MB</span>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCamera(true);
                          }}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          Launch Live Camera Lens
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* 4. AI ANALYSIS + RECOMMENDED ACTION (LEVEL 1 PRIMARY)                     */}
      {/* ========================================================================= */}
      <section ref={analysisRef} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Step 2 · Understand & Act
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              AI Analysis & Recommended Action
            </h2>
          </div>
          {isDemo && (
            <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold">
              Interactive Sample Preview
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: AI Detection & Media Preview */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-emerald-500/20 bg-white dark:bg-zinc-900 shadow-md rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block">
                      AI Vision Identification
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Scan Inspection Result
                    </h3>
                  </div>
                </div>

                {/* Clear / Rescan control */}
                {currentPrediction && (
                  <button
                    onClick={clearCurrentPrediction}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 font-semibold"
                    title="Dismiss this result"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <CardContent className="p-5 sm:p-6 space-y-6">
                {/* Media and Primary Info Split */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Scanned Image Preview */}
                  <div className="sm:col-span-5 relative rounded-2xl overflow-hidden aspect-square bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImage}
                      alt="Scanned waste item"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-white font-medium truncate text-center">
                      Verified Visual Feed
                    </div>
                  </div>

                  {/* Primary Item Detection details */}
                  <div className="sm:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Detected Category
                        </span>
                        {activePrediction.correctedCategory && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded font-bold border border-amber-200/60 dark:border-amber-900/40">
                            Manually Corrected
                          </span>
                        )}
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 capitalize tracking-tight">
                        {activeCategory} {activeCategory.toLowerCase() === "plastic" ? "Bottle" : ""}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {activePrediction.materials?.join(" · ") || "Primary Consumer Grade Material"}
                      </p>
                    </div>

                    {/* AI Confidence Gauge Bar */}
                    <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                          <span>AI Confidence</span>
                        </span>
                        <span className={cn("font-extrabold text-sm", {
                          "text-emerald-600 dark:text-emerald-400": displayConfidence >= 80,
                          "text-amber-500": displayConfidence >= 50 && displayConfidence < 80,
                          "text-rose-500": displayConfidence < 50
                        })}>
                          {displayConfidence}% Match
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-700/60 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-500 rounded-full", {
                            "bg-gradient-to-r from-emerald-500 to-teal-400": displayConfidence >= 80,
                            "bg-gradient-to-r from-amber-400 to-amber-500": displayConfidence >= 50 && displayConfidence < 80,
                            "bg-rose-500": displayConfidence < 50
                          })}
                          style={{ width: `${Math.max(10, displayConfidence)}%` }}
                        />
                      </div>

                      {displayConfidence < 75 && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-0.5">
                          ⚠ Moderate certainty. Please verify physical condition below.
                        </p>
                      )}
                    </div>

                    {/* Condition Assessment Selector */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">
                        Item Physical Condition:
                      </span>
                      <div className="grid grid-cols-5 gap-1 pt-0.5">
                        {["New", "Good", "Damaged", "Broken", "Unknown"].map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => {
                              if (activePrediction.id && activePrediction.id !== "demo-pet-bottle") {
                                updateItemCondition(activePrediction.id || activePrediction._id, cond);
                              }
                            }}
                            className={cn(
                              "py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all duration-150",
                              activePrediction.condition === cond
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            )}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 7. WHY THIS RECOMMENDATION (LEVEL 3 UTILITY)                      */}
                {/* ================================================================= */}
                <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowWhyExpanded(!showWhyExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-emerald-500" />
                      <span>Why this recommendation?</span>
                    </span>
                    {showWhyExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                  </button>

                  <AnimatePresence>
                    {showWhyExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-3.5 pt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60"
                      >
                        {displayReason}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ================================================================= */}
                {/* 12. FEEDBACK / MANUAL CORRECTION (LEVEL 3 UTILITY)                */}
                {/* ================================================================= */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                      Was this recommendation useful?
                    </span>
                    {feedbackSubmitted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Thanks for your feedback!</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (activePrediction.id && activePrediction.id !== "demo-pet-bottle") {
                              await submitRecommendationFeedback(activePrediction.id || activePrediction._id, true);
                            }
                            setFeedbackSubmitted(true);
                          }}
                          className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Yes
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (activePrediction.id && activePrediction.id !== "demo-pet-bottle") {
                              await submitRecommendationFeedback(activePrediction.id || activePrediction._id, false);
                            }
                            setFeedbackSubmitted(true);
                          }}
                          className="flex items-center text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                        >
                          <ThumbsDown className="h-3.5 w-3.5 mr-1" /> No
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Compact Manual Correction Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <label htmlFor="category-select" className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      Is this classification incorrect?
                    </label>
                    <select
                      id="category-select"
                      value={activeCategory}
                      onChange={(e) => {
                        if (activePrediction.id && activePrediction.id !== "demo-pet-bottle") {
                          submitManualCorrection(activePrediction.id || activePrediction._id, e.target.value);
                        }
                      }}
                      className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-200 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto min-w-[160px]"
                    >
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Dedicated Recommended Action & Step-by-Step Instructions */}
          <div className="lg:col-span-5 space-y-6">
            {/* ================================================================= */}
            {/* 6. RECOMMENDED ACTION CARD (LEVEL 1 PRIMARY)                      */}
            {/* ================================================================= */}
            <Card className="border-2 border-emerald-500/40 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-emerald-500/10">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block">
                      Clear Direction
                    </span>
                    <CardTitle className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                      Recommended Action
                    </CardTitle>
                  </div>

                  <Badge
                    variant={
                      displayPrimaryAction === "DISPOSE"
                        ? "destructive"
                        : displayPrimaryAction === "SPECIAL_HANDLING"
                        ? "warning"
                        : "success"
                    }
                    className="text-xs font-black uppercase tracking-wider px-3 py-1 shadow-sm"
                  >
                    ✓ {displayPrimaryAction}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-extrabold text-base">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Recycle this item</span>
                  </div>
                  <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed font-medium">
                    This material is suitable for circular reclamation. Sort it clean and drop off at your nearest municipal recycling hub or scheduled doorstep pickup.
                  </p>
                </div>

                {/* Primary Action Button */}
                <Link href="/dashboard/map" className="block w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-2 rounded-xl h-11 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]">
                    <MapPin className="h-4 w-4" />
                    <span>Find Recycling Depot</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>

                {/* Supporting metrics: Scrap Value & Carbon Offset */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 text-xs">
                  {estValue && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 font-semibold">
                      <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">₹</span>
                        <span>Estimated Scrap Value:</span>
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                        ₹{estValue.value} <span className="text-[10px] text-zinc-400 font-normal">(₹{estValue.rate}/kg)</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 font-semibold">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span>Estimated Carbon Offset:</span>
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      ~0.08 kg CO₂ Saved
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ================================================================= */}
            {/* 8. HOW TO DISPOSE — STEP-BY-STEP STEPPER                          */}
            {/* ================================================================= */}
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span>How to Dispose — Step-by-Step</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Follow this 3-step preparation to guarantee successful sorting
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5">
                {/* Visual Stepper */}
                <div className="space-y-4">
                  {displaySteps.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {/* Numbered Indicator Circle */}
                      <div className="flex flex-col items-center">
                        <span className="h-7 w-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                          {s.step}
                        </span>
                        {idx < displaySteps.length - 1 && (
                          <span className="w-0.5 h-10 bg-emerald-200 dark:bg-emerald-950 mt-1" />
                        )}
                      </div>

                      {/* Step Text */}
                      <div className="space-y-0.5 pt-0.5">
                        <h5 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                          {s.title}
                        </h5>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                          {s.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* =============================================================== */}
                {/* 9. ALTERNATIVES SECTION (LEVEL 3 UTILITY)                       */}
                {/* =============================================================== */}
                {displayAlternatives.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">
                      Other Circular Options
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block">
                          Bottle Deposit / RVM
                        </span>
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Return through a reverse vending system for instant store credit.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block">
                          EcoCraft Upcycle
                        </span>
                        <p className="text-[11px] text-zinc-500 leading-snug">
                          Turn into a self-watering seed starter or pantry funnel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. ENVIRONMENTAL IMPACT (LEVEL 2 SUPPORTING)                             */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Step 3 · Measure Impact
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Environmental Impact
          </h2>
        </div>

        <DecompositionSimulator category={activeCategory} />
      </section>

      {/* ========================================================================= */}
      {/* 13. RECENT WASTE SCANS (LEVEL 2 SUPPORTING)                               */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Historical Verification
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              <History className="h-5 w-5 text-zinc-400" />
              <span>Recent Waste Scans</span>
            </h2>
          </div>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
            {history.length} items logged
          </span>
        </div>

        <Card className="border border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-2xl shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">AI Match</th>
                  <th className="py-3.5 px-4">Scanned At</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
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
                        if (analysisRef.current) {
                          analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt="Scanned item preview"
                            className="h-11 w-11 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
                          />
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize block">
                              {item.correctedCategory || item.category || "General Waste"}
                            </span>
                            <span className="text-[11px] text-zinc-400">Verified Image</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-xs font-semibold">
                          {item.correctedCategory || item.category}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {item.confidence || 95}% Match
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-zinc-500 font-medium">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              usePredictionStore.setState({
                                currentPrediction: item,
                                currentImage: item.imageUrl,
                              });
                              setFeedbackSubmitted(false);
                              if (analysisRef.current) {
                                analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                              }
                            }}
                            className="h-8 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteHistoryItem(item._id || item.id)}
                            className="text-zinc-400 hover:text-rose-500 rounded-full h-8 w-8 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Delete item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400 text-xs">
                      No scan history logged yet. Use the camera or upload above to analyze your first item!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item._id || item.id}
                  onClick={() => {
                    usePredictionStore.setState({
                      currentPrediction: item,
                      currentImage: item.imageUrl,
                    });
                    setFeedbackSubmitted(false);
                    if (analysisRef.current) {
                      analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt="Scanned item"
                      className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize truncate">
                        {item.correctedCategory || item.category || "General Waste"}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.confidence || 95}%</span>
                        <span>·</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        usePredictionStore.setState({
                          currentPrediction: item,
                          currentImage: item.imageUrl,
                        });
                        setFeedbackSubmitted(false);
                        if (analysisRef.current) {
                          analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="h-8 px-2.5 text-xs"
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHistoryItem(item._id || item.id)}
                      className="h-8 w-8 text-zinc-400 hover:text-rose-500 rounded-full"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No scan history logged yet. Use the camera or upload above to analyze your first item!
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* 9. EXPLORE ECOSORT (FEATURES GRID)                                        */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Step 4 · Discover Tools
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Explore EcoSort
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: EcoCraft AI */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm rounded-2xl flex flex-col justify-between p-6 hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  EcoCraft AI Studio
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Turn household waste and packaging into functional home decor, planters, and desk organizers with step-by-step DIY plans.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <Button
                variant="outline"
                onClick={() => setShowDiyStudio(!showDiyStudio)}
                className="w-full text-xs font-bold border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl"
              >
                {showDiyStudio ? "Collapse DIY Studio" : "Explore DIY Ideas"}
              </Button>
            </div>
          </Card>

          {/* Feature 2: Interactive Recycling Depot Navigation */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm rounded-2xl flex flex-col justify-between p-6 hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Navigation className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Recycling Depot Navigation
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Locate verified municipal scrap centers and smart reverse vending machines with live turn-by-turn driving, cycling, and walking routes.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <Link href="/dashboard/map" className="w-full block">
                <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1" /> Open Navigation Maps
                </Button>
              </Link>
            </div>
          </Card>

          {/* Feature 3: Brand EPR & Packaging Scanner */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 shadow-sm rounded-2xl flex flex-col justify-between p-6 hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Brand EPR Scanner
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Scan commercial barcodes to check producer recyclability grades, composition, and official manufacturer take-back rebate schemes.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <Button
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("epr-scanner-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full text-xs font-bold border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl"
              >
                Scan Barcode / Brand
              </Button>
            </div>
          </Card>
        </div>

        {/* Expandable EcoCraft Studio */}
        <AnimatePresence>
          {showDiyStudio && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 overflow-hidden"
            >
              <EcoCraftIdeas category={activeCategory} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Embedded EPR Scanner Component */}
        <div id="epr-scanner-section" className="pt-2">
          <EprScanner />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. ECO PROGRESS / GAMIFICATION (LEVEL 2 SUPPORTING)                      */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Step 5 · Build Better Habits
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Eco Progress & Badges
          </h2>
        </div>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Level & Progress bar */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {user?.ecoLevel || "Eco Novice"}
                    </h4>
                    <span className="text-xs text-zinc-400">Current Rank XP Status</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {stats.pointsEarned || 150} / 1500 XP
                  </span>
                  <span className="text-[11px] text-zinc-400 block font-semibold">
                    {stats.levelProgressPercent || 30}% Completed
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-700/50">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, stats.levelProgressPercent || 30)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-zinc-500 font-semibold">
                <span>Rank: Eco Novice</span>
                <span>Next Milestone: Recycling Ranger (1500 pts)</span>
              </div>
            </div>

            {/* Supporting 3 Stats Grid */}
            <div className="lg:col-span-6 grid grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 lg:pl-6 pt-4 lg:pt-0">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-1">
                <div className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                  {stats.totalScans || history.length || 1}
                </div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Total Scans</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-1">
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.recycledItemsCount || history.length || 1}
                </div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Recycled</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-1">
                <div className="text-xl font-black text-teal-600 dark:text-teal-400">
                  {(stats.co2SavedKg || 0.08).toFixed(1)} <span className="text-xs">kg</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">CO₂ Saved</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Doorstep Scrap Pickup Modal */}
      <ScrapPickupModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
      />

      {/* Barcode & EPR Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
      />
    </div>
  );
}
