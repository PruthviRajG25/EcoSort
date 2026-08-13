"use client";

import React from "react";
import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      {/* Left panel - Eco branding illustration (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Abstract organic backdrop patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.3),transparent_40%)]" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-24 -right-12 w-64 h-64 bg-teal-500/20 rounded-full blur-2xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <div className="bg-white/10 backdrop-blur-md text-white p-2 rounded-xl border border-white/20">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">EcoSort AI</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight"
          >
            Sort Smart, <br />
            <span className="text-emerald-300">Live Green.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-emerald-100 text-lg leading-relaxed font-medium"
          >
            EcoSort AI helps you instantly analyze discardable items and teaches you proper local disposal and recycling instructions, saving carbon emissions one scan at a time.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-emerald-200">
          <div>© {new Date().getFullYear()} EcoSort AI</div>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right panel - Form Wrapper */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 relative">
        {/* Back link */}
        <Link
          href="/"
          className="absolute left-6 top-6 flex items-center space-x-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-2xl p-8 shadow-soft dark:shadow-soft-dark"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
