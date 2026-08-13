"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (data) => {
    // Simulate API reset trigger delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
  };

  return (
    <div className="space-y-6">
      {success ? (
        <div className="space-y-4 text-center py-4">
          <div className="flex justify-center text-emerald-500">
            <CheckCircle className="h-14 w-14 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Reset link sent!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We have sent a secure password reset link to your email. Please check your inbox and follow the instructions.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Forgot password?
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Submit Button */}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Send Reset Link
            </Button>
          </form>

          {/* Alternative actions */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to login</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
