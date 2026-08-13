import React from "react";
import Link from "next/link";
import { Compass, Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-zinc-50 dark:bg-zinc-950 text-center space-y-8 relative overflow-hidden">
      {/* Decorative organic backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl" />

      <div className="relative z-10 space-y-4">
        {/* Animated Icon Container */}
        <div className="inline-flex bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 p-4 rounded-full border border-emerald-100 dark:border-emerald-900/60 shadow-md">
          <Compass className="h-12 w-12 animate-spin-slow" />
        </div>

        <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
          404
        </h1>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Lost in the Wilderness?
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
          The page you are looking for has been recycled, moved, or never existed in our green ecosystem. Let&apos;s guide you back to civilization.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/">
          <Button variant="default" size="lg" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back Home</span>
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="flex items-center space-x-2">
            <Leaf className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Button>
        </Link>
      </div>

      <div className="relative z-10 text-xs text-zinc-400 dark:text-zinc-500 pt-8">
        EcoSort AI - Promoting circular sustainability
      </div>
    </div>
  );
}
