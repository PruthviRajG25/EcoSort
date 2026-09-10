"use client";

import React, { useState } from "react";
import { Sparkles, Clock, Scissors, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const UPCYCLING_DATABASE = {
  plastic: [
    {
      title: "Self-Watering Herb Planter",
      difficulty: "Easy",
      time: "15 mins",
      materials: ["Clean plastic bottle", "Cotton string or yarn", "Soil & herb seeds", "Utility knife/scissors"],
      steps: [
        "Cut the plastic bottle in half horizontally about 4 inches from the base.",
        "Pierce a small hole in the bottle cap and thread a 6-inch piece of cotton yarn through.",
        "Invert the top funnel half into the bottom base half with the yarn dangling into the reservoir.",
        "Fill the top half with potting soil and your favorite herb seeds. Fill bottom base with water.",
      ],
      impact: "Replaces store-bought plastic pots and keeps bottle out of landfill forever.",
    },
    {
      title: "Zippered Desk Organizer Case",
      difficulty: "Medium",
      time: "30 mins",
      materials: ["2 plastic beverage bottles", "One 7-inch zipper", "Hot glue gun", "Scissors"],
      steps: [
        "Cut the bottom 3 inches off both plastic bottles.",
        "Smooth the cut edges with fine sandpaper or careful warm-iron press.",
        "Hot glue the zipper tape around the inside rim of the first bottom bottle piece.",
        "Glue the other zipper tape side to the second bottle piece to create a zippered container.",
      ],
      impact: "Great for storing pens, sewing needles, coins, or charging cables.",
    },
  ],
  cardboard: [
    {
      title: "Modular Geometric Desk Organizer",
      difficulty: "Easy",
      time: "20 mins",
      materials: ["Corrugated cardboard box", "Ruler", "Pencil", "Utility cutter", "Glue"],
      steps: [
        "Cut 4 square base pieces (4x4 inches) and 8 side strips of varying heights (2 to 6 inches).",
        "Assemble open-top rectangular modular bins using non-toxic PVA glue.",
        "Cluster the bins together on a single cardboard tray base.",
        "Optional: Paint with watercolor or wrap with scrap newspaper for an artisanal finish.",
      ],
      impact: "Zero-cost desk storage that diverts packaging from recycling shredders.",
    },
    {
      title: "Biodegradable Seedling Starting Pots",
      difficulty: "Easy",
      time: "10 mins",
      materials: ["Cardboard tubes or box flaps", "Scissors", "Potting soil"],
      steps: [
        "Cut cardboard tubes into 3-inch sections.",
        "Make four 0.5-inch vertical cuts at one end, fold flaps inward to form the pot base.",
        "Fill with compost and sow tomato or chili seeds.",
        "Plant the entire pot directly into garden soil when ready—cardboard naturally decomposes!",
      ],
      impact: "Enriches soil carbon while eliminating nursery plastic pots.",
    },
  ],
  glass: [
    {
      title: "Aesthetic Fairy Light Lantern",
      difficulty: "Easy",
      time: "10 mins",
      materials: ["Clean glass jar", "Jute twine or copper wire", "Battery LED fairy lights"],
      steps: [
        "Soak the jar in warm soapy water to peel off paper labels completely.",
        "Wrap jute twine tightly around the threaded jar neck, creating a rustic hanging handle.",
        "Insert micro LED wire fairy lights inside the jar.",
        "Hang on a balcony hook or patio table for cozy ambient lighting.",
      ],
      impact: "Gives durable glass packaging a new decorative life for years.",
    },
    {
      title: "Minimalist Kitchen Spice Shaker",
      difficulty: "Easy",
      time: "15 mins",
      materials: ["Small glass jar with metal lid", "Hammer & small nail", "Parchment paper"],
      steps: [
        "Clean and dry the jar thoroughly to eliminate lingering odors.",
        "Using a small nail and hammer, punch a uniform grid of 6-8 small holes in the metal lid.",
        "Fill with coarse sea salt, cinnamon, oregano, or ground pepper.",
        "Screw lid on securely for an airtight pantry shaker.",
      ],
      impact: "Avoids purchasing new plastic spice shakers.",
    },
  ],
  metal: [
    {
      title: "Rustic Tin Can Desk Pen Stand & Planter",
      difficulty: "Easy",
      time: "15 mins",
      materials: ["Aluminum/tin beverage or soup can", "Pliers", "Acrylic paint or twine"],
      steps: [
        "Wash the can thoroughly and ensure the inner rim is smoothed down using pliers.",
        "Paint with pastel acrylic coats or wrap with rustic jute rope using craft glue.",
        "Add felt pads to the bottom to protect table surfaces.",
        "Organize stationery or use as a succulent holder.",
      ],
      impact: "Saves metal remelting energy by direct creative reuse.",
    },
  ],
  "e-waste": [
    {
      title: "Vintage Circuit Board Wall Art & Keychain",
      difficulty: "Medium",
      time: "35 mins",
      materials: ["Disused motherboard/RAM circuit", "Small jeweler saw", "Keyring", "Clear resin/nail polish"],
      steps: [
        "Safely cut a clean rectangular trace section from non-battery electronic board.",
        "Smooth the edges using a metal file.",
        "Coat with clear lacquer or topcoat to protect metallic traces from oxidation.",
        "Drill a 2mm hole and attach to a stainless keyring.",
      ],
      impact: "Transforms non-biodegradable circuit waste into conversation-starting accessories.",
    },
  ],
  default: [
    {
      title: "Eco Upcycling Exploration",
      difficulty: "Easy",
      time: "15 mins",
      materials: ["Discarded clean packaging item", "Scissors", "Household glue"],
      steps: [
        "Inspect the material structural integrity to see if it holds shape.",
        "Clean and sterilize surface using mild soapy water.",
        "Repurpose as a drawer divider, cable organizer, or seed starter.",
      ],
      impact: "Extends product lifecycle before eventual recycling.",
    },
  ],
};

export default function EcoCraftIdeas({ category = "plastic" }) {
  const normalizedKey = (category || "plastic").toLowerCase();
  
  let projects = UPCYCLING_DATABASE[normalizedKey];
  if (!projects) {
    if (normalizedKey.includes("plastic")) projects = UPCYCLING_DATABASE.plastic;
    else if (normalizedKey.includes("paper") || normalizedKey.includes("cardboard")) projects = UPCYCLING_DATABASE.cardboard;
    else if (normalizedKey.includes("glass")) projects = UPCYCLING_DATABASE.glass;
    else if (normalizedKey.includes("metal")) projects = UPCYCLING_DATABASE.metal;
    else if (normalizedKey.includes("electronic") || normalizedKey.includes("e-waste")) projects = UPCYCLING_DATABASE["e-waste"];
    else projects = UPCYCLING_DATABASE.default;
  }

  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const activeProject = projects[selectedProjectIndex] || projects[0];

  return (
    <Card className="border border-emerald-500/20 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <span>EcoCraft AI Upcycling Studio</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold border-emerald-300 dark:border-emerald-700">
                  DIY Ideas
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Don&apos;t toss it yet! Transform this item into functional home goods
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Project Tabs Selector */}
        {projects.length > 1 && (
          <div className="flex space-x-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {projects.map((proj, idx) => (
              <button
                key={proj.title}
                onClick={() => setSelectedProjectIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedProjectIndex === idx
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                Project {idx + 1}: {proj.title.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Active Project Card */}
        <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl p-4 border border-zinc-200/60 dark:border-zinc-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Scissors className="h-4 w-4 text-emerald-500" />
              <span>{activeProject.title}</span>
            </h4>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1 text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{activeProject.time}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                {activeProject.difficulty}
              </span>
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Required Supplies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeProject.materials.map((m) => (
                <span
                  key={m}
                  className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/40 dark:border-emerald-800/40"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Build Instructions:
            </span>
            <ol className="space-y-2">
              {activeProject.steps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Impact Banner */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-lg p-2.5 flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-medium">{activeProject.impact}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
