"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user-store";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);
  const registerUser = useUserStore((state) => state.register);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      await registerUser(data.name, data.email, data.password);
      setSuccess(true);
      // Redirect to dashboard after brief success banner display
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setServerError(error.message || "Registration failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="flex justify-center text-emerald-500">
          <CheckCircle className="h-16 w-16 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Account Created!</h3>
        <p className="text-sm text-muted-foreground">
          Your Eco account has been successfully initialized. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create an account
        </h2>
        <p className="text-sm text-muted-foreground">
          Register to scan waste, track carbon impact, and earn rewards
        </p>
      </div>

      {serverError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg border border-red-200/30">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <Input
              {...register("name")}
              type="text"
              placeholder="Alex Green"
              error={!!errors.name}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <Input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              error={!!errors.email}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={!!errors.password}
              className="pl-10 pr-10"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <Input
              {...register("confirmPassword")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={!!errors.confirmPassword}
              className="pl-10 pr-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      {/* Alternative actions */}
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
