"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  ScanLine,
  Compass,
  Award,
  ChevronRight,
  Upload,
  ArrowRight,
  MapPin,
  CheckCircle,
  Quote,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  const featuresList = [
    {
      title: "AI Visual Recognition",
      description: "Snap a photo of any discardable item, and our model immediately classifies its material category.",
      icon: ScanLine,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "Actionable Disposal Advice",
      description: "Recycle, compost, drop-off, or landfill? Get clear local steps to handle items cleanly.",
      icon: Compass,
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950/20"
    },
    {
      title: "Depot Locator Map",
      description: "Find the closest municipal centers that accept batteries, e-waste, glass, and chemicals.",
      icon: MapPin,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Earn Eco Reward Points",
      description: "Build green habits. Track your carbon offset, gain achievements, and level up your ranking.",
      icon: Award,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20"
    }
  ];

  const steps = [
    {
      title: "Snap & Upload",
      description: "Take a picture of the waste item using your phone or webcam, or upload it to our dashboard.",
      icon: Upload
    },
    {
      title: "AI Analysis",
      description: "Our machine learning model classifies the waste material category and scores confidence.",
      icon: Sparkles
    },
    {
      title: "Sort Guidance",
      description: "Follow customized steps: wash caps, flatten cardboard, or search hazardous waste depots.",
      icon: Leaf
    },
    {
      title: "Track Offsets",
      description: "Check your carbon saved metrics on your dashboard, earn points, and build habits.",
      icon: Zap
    }
  ];

  const stats = [
    { value: "48K+", label: "Waste Items Scanned" },
    { value: "12.4t", label: "CO2 Offset Recorded" },
    { value: "94.2%", label: "AI Classification Accuracy" },
    { value: "8,500+", label: "Active Eco Champions" }
  ];

  const testimonials = [
    {
      name: "Sowmya M",
      role: "Sustainability Activist",
      quote: "EcoSort AI has completely simplified how our household manages trash. I used to be confused about sorting multi-layered packaging; now it takes two seconds.",
      avatar: "SM"
    },
    {
      name: "Abhishek Gowda",
      role: "Municipal Recycling Lead",
      quote: "By giving citizens precise steps on rinsing jars and removing battery elements, EcoSort AI reduces sorting facility contamination by almost 30%.",
      avatar: "AG"
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400"
            >
              <Sparkles className="h-4.5 w-4.5" />
              <span>Smart waste classification is here</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight"
            >
              Sort Waste Smarter. <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                Protect Our Planet.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Stop guessing. Instantly identify recyclable, organic, and hazardous items using AI. Get local disposal instructions, offset CO2, and build sustainable habits.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto flex items-center space-x-2">
                  <span>Start Scanning Free</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  How it Works
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Hero interactive visual preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-3xl" />
            <Card className="w-full max-w-sm relative z-10 border border-zinc-200 dark:border-zinc-800 p-6 glow-green bg-white/90 dark:bg-zinc-900/90 rounded-2xl">
              {/* Scan Overlay Graphic */}
              <div className="relative aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop"
                  alt="Plastic bottle mockup"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 border-2 border-emerald-500/60 rounded-xl animate-pulse" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-[bounce_2s_infinite]" />
              </div>

              {/* Mock prediction classification info */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">PET Bottle</h3>
                    <p className="text-xs text-muted-foreground">Classified via EcoSort AI</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200/50">
                    96% Match
                  </span>
                </div>

                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>Recyclable (Place in Plastics Bin)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>Rinse off contents before sorting</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Core Features
          </h2>
          <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Everything you need for sustainable sorting
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Designed to remove user confusion and simplify daily green habits. Discover what makes EcoSort AI powerful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {featuresList.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full p-6 space-y-4 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`p-3 rounded-xl w-fit ${feat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${feat.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg">
                    {feat.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. How It Works Interactive Steps */}
      <section id="how-it-works" className="bg-zinc-50 dark:bg-zinc-950/20 py-20 border-y border-zinc-100 dark:border-zinc-900/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Step explanation */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Interactive Guide
              </h2>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Sort in 4 Simple Steps
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Click through the steps to see how the system coordinates image submissions, classification parameters, and reward tracking.
              </p>

              {/* Step indicator buttons */}
              <div className="flex flex-col space-y-2 mt-6">
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const Icon = step.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={cn(
                        "flex items-center space-x-4 p-3 rounded-xl text-left border transition-all duration-200",
                        {
                          "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm pl-5": isActive,
                          "border-transparent hover:bg-zinc-100/60 dark:hover:bg-zinc-900/30 text-zinc-500": !isActive,
                        }
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isActive
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold">Step 0{idx + 1}</div>
                        <div
                          className={cn(
                            "font-bold text-sm",
                            isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          {step.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step card graphic preview */}
            <div className="lg:col-span-7 flex justify-center">
              <Card className="w-full max-w-md p-8 border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 rounded-2xl flex flex-col justify-between aspect-[16/10] shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl" />
                <div className="space-y-4 relative z-10">
                  <div className="text-emerald-500 dark:text-emerald-400 font-extrabold text-6xl">
                    0{activeStep + 1}
                  </div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {steps[activeStep].title}
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {steps[activeStep].description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 relative z-10 mt-6">
                  <span>Explore features in dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statistics Panel */}
      <section id="statistics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Abstract backgrounds */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-12" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/10 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-2 px-4 first:pl-0 border-l-0 lg:border-l first:border-l-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-emerald-200/80 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonial Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Community feedback
          </h2>
          <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Hear from our Eco Heroes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {testimonials.map((test, idx) => (
            <Card key={idx} className="p-8 border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <Quote className="h-8 w-8 text-emerald-500/20" />
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center space-x-3 border-t border-zinc-100 dark:border-zinc-800/40 pt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{test.name}</h4>
                  <p className="text-xs text-muted-foreground">{test.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. final CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-br from-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-950/20 border border-emerald-500/10 p-8 md:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-lg">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Ready to reduce your landfill footprint?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Create a free profile to start scanning waste materials, learn green sorting steps, and view your local area drop-off center map.
          </p>
          <div className="flex justify-center pt-2">
            <Link href="/login">
              <Button size="lg" className="flex items-center space-x-2">
                <span>Start Classifying Now</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
