"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Leaf, Send, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(newsletterSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (data) => {
    // Simulate newsletter subscription delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubscribed(true);
    reset();
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 dark:bg-zinc-950 dark:border-zinc-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Eco Brand Description */}
          <div className="md:col-span-1.5 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-emerald-500 text-white p-1 rounded-md">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                EcoSort AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering individuals and communities to sort waste responsibly through the power of artificial intelligence. Together, we can divert landfill waste and cultivate sustainability.
            </p>
            <div className="pt-2 text-xs text-zinc-400 dark:text-zinc-500">
              © {new Date().getFullYear()} EcoSort AI. All rights reserved.
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              {["Features", "How it Works", "Dashboard", "Recycling Centers"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Resources Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2">
              {["Disposal Guide", "Carbon Calculator", "Terms of Service", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Weekly Green Tips
            </h4>
            <p className="text-sm text-muted-foreground">
              Subscribe for sorting guides, eco challenges, and product updates.
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-200/40">
                <Check className="h-4.5 w-4.5 shrink-0" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div className="relative">
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Enter your email"
                    error={!!errors.email}
                    className="pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
