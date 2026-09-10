"use client";

import React from "react";
import { Hourglass, Flame, Droplets, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

const DECOMPOSITION_METRICS = {
  plastic: {
    years: 450,
    generations: 18,
    microplasticsRisk: "Severe",
    toxicLeach: "Phthalates & BPA",
    co2PerKg: 2.1,
    waterLiters: 24,
    energyKwh: 5.6,
    treesRatio: 0.05,
    tagline: "Outlives your great-great-great-great grandchildren.",
  },
  cardboard: {
    years: 0.25, // 3 months
    generations: 0,
    microplasticsRisk: "None",
    toxicLeach: "Methane if anaerobically buried",
    co2PerKg: 0.9,
    waterLiters: 18,
    energyKwh: 3.8,
    treesRatio: 0.08,
    tagline: "Easily compostable, but releases methane if trapped in landfills.",
  },
  paper: {
    years: 0.15, // 6 weeks
    generations: 0,
    microplasticsRisk: "None",
    toxicLeach: "Inks & bleaching agents",
    co2PerKg: 0.8,
    waterLiters: 15,
    energyKwh: 3.2,
    treesRatio: 0.1,
    tagline: "Can be recycled up to 7 times before fibers break down.",
  },
  glass: {
    years: 1000000,
    generations: 40000,
    microplasticsRisk: "None",
    toxicLeach: "Inert mineral, but zero decomposition",
    co2PerKg: 0.35,
    waterLiters: 5,
    energyKwh: 1.8,
    treesRatio: 0.02,
    tagline: "100% infinitely recyclable without quality loss.",
  },
  metal: {
    years: 200,
    generations: 8,
    microplasticsRisk: "None",
    toxicLeach: "Rust & heavy metal leaching",
    co2PerKg: 4.5,
    waterLiters: 40,
    energyKwh: 9.2,
    treesRatio: 0.15,
    tagline: "Recycling 1 aluminum can saves enough power to run a TV for 3 hours.",
  },
  "e-waste": {
    years: 1000,
    generations: 40,
    microplasticsRisk: "Critical",
    toxicLeach: "Lead, Cadmium, Mercury, Lithium",
    co2PerKg: 15.0,
    waterLiters: 120,
    energyKwh: 28.0,
    treesRatio: 0.5,
    tagline: "Highly hazardous. Must never enter standard landfills.",
  },
  "food/organic": {
    years: 0.08, // 1 month
    generations: 0,
    microplasticsRisk: "None",
    toxicLeach: "Creates potent greenhouse methane in sealed landfills",
    co2PerKg: 0.5,
    waterLiters: 2,
    energyKwh: 0.8,
    treesRatio: 0.01,
    tagline: "Composting turns this into nutrient-rich black gold for gardens.",
  },
  default: {
    years: 100,
    generations: 4,
    microplasticsRisk: "Moderate",
    toxicLeach: "Mixed synthetic residues",
    co2PerKg: 1.5,
    waterLiters: 12,
    energyKwh: 4.0,
    treesRatio: 0.04,
    tagline: "Sorting prevents irreversible ecological contamination.",
  },
};

export default function DecompositionSimulator({ category = "plastic" }) {
  const normalizedKey = (category || "plastic").toLowerCase();


  let metrics = DECOMPOSITION_METRICS[normalizedKey];
  if (!metrics) {
    if (normalizedKey.includes("plastic")) metrics = DECOMPOSITION_METRICS.plastic;
    else if (normalizedKey.includes("cardboard")) metrics = DECOMPOSITION_METRICS.cardboard;
    else if (normalizedKey.includes("paper")) metrics = DECOMPOSITION_METRICS.paper;
    else if (normalizedKey.includes("glass")) metrics = DECOMPOSITION_METRICS.glass;
    else if (normalizedKey.includes("metal")) metrics = DECOMPOSITION_METRICS.metal;
    else if (normalizedKey.includes("electronic") || normalizedKey.includes("e-waste")) metrics = DECOMPOSITION_METRICS["e-waste"];
    else if (normalizedKey.includes("organic") || normalizedKey.includes("food")) metrics = DECOMPOSITION_METRICS["food/organic"];
    else metrics = DECOMPOSITION_METRICS.default;
  }

  const formatYears = (years) => {
    if (years >= 1000000) return "1,000,000+ Years";
    if (years >= 1) return `${years} Years`;
    const months = Math.round(years * 12);
    if (months >= 1) return `${months} Months`;
    return `${Math.round(years * 52)} Weeks`;
  };

  return (
    <Card className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Hourglass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Environmental Impact Analysis
                </CardTitle>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold border-emerald-300 dark:border-emerald-700">
                  Circular Impact
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Real-world decomposition lifespan compared to circular diversion
              </CardDescription>
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-500 capitalize bg-zinc-100 dark:bg-zinc-800/70 px-3 py-1 rounded-full w-fit">
            Item Category: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{normalizedKey}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {/* Visual Comparison: LANDFILL vs RECYCLING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* LANDFILL */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-rose-50/70 to-rose-100/30 dark:from-rose-950/20 dark:to-zinc-900 border border-rose-200/60 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>If Dumped in Landfill</span>
              </span>
              <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0.5 px-2">
                High Hazard
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                {formatYears(metrics.years)}
              </div>
              <p className="text-xs font-medium text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                {metrics.tagline}
              </p>
            </div>

            <div className="pt-2 border-t border-rose-200/40 dark:border-rose-900/30 space-y-1.5 text-xs">
              {metrics.generations > 0 ? (
                <div className="text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                  <span>Persistence:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">~{metrics.generations} human generations</span>
                </div>
              ) : null}
              <div className="text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <span>Toxic Leaching:</span>
                <span className="font-semibold text-rose-700 dark:text-rose-300 text-right truncate max-w-[180px]">{metrics.toxicLeach}</span>
              </div>
            </div>
          </div>

          {/* RECYCLING */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50/70 to-teal-100/30 dark:from-emerald-950/20 dark:to-zinc-900 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>By Sorting & Recycling</span>
              </span>
              <Badge variant="outline" className="bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 text-[10px] uppercase font-bold py-0.5 px-2 border-emerald-300 dark:border-emerald-700">
                Circular
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                100% Diverted
              </div>
              <p className="text-xs font-medium text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                Immediate circular lifecycle re-entry into secondary raw material streams.
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-200/40 dark:border-emerald-900/30 space-y-1.5 text-xs">
              <div className="text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <span>Landfill Burden:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">0 kg permanently buried</span>
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <span>Microplastics Risk:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Prevented from waterways</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stat Metric Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
            Verified Resource Conservation (Per Kg)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* CO2 Saved */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-center space-y-1 hover:border-emerald-500/40 transition-colors">
              <div className="flex justify-center text-emerald-500 mb-1">
                <Flame className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {metrics.co2PerKg} <span className="text-xs font-semibold text-zinc-400">kg</span>
              </div>
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">CO₂ Saved</div>
            </div>

            {/* Water Saved */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-center space-y-1 hover:border-sky-500/40 transition-colors">
              <div className="flex justify-center text-sky-500 mb-1">
                <Droplets className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {metrics.waterLiters} <span className="text-xs font-semibold text-zinc-400">L</span>
              </div>
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Water Conserved</div>
            </div>

            {/* Energy Saved */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-center space-y-1 hover:border-amber-500/40 transition-colors">
              <div className="flex justify-center text-amber-500 mb-1">
                <Zap className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {metrics.energyKwh} <span className="text-xs font-semibold text-zinc-400">kWh</span>
              </div>
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Energy Saved</div>
            </div>

            {/* Trees Ratio / Forest equivalent */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-center space-y-1 hover:border-emerald-500/40 transition-colors">
              <div className="flex justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {metrics.treesRatio} <span className="text-xs font-semibold text-zinc-400">tree</span>
              </div>
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Forest Equivalent</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
