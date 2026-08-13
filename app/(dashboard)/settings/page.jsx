"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Save, CheckCircle, Bell, Laptop, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";

const profileSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export default function SettingsPage() {
  const { user, updateProfile } = useUserStore();
  const { theme, setTheme } = useTheme();
  const [success, setSuccess] = useState(false);

  // States for toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: user?.name || "Pruthvi Raj",
      email: user?.email || "pruthvi.raj@ecosort.ai",
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data.name, data.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account details and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: General profile settings */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base font-bold">Profile Details</CardTitle>
                <CardDescription>Update your personal information displayed on your profile card</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {success && (
                  <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 p-3 rounded-lg border border-emerald-200/30">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>Settings successfully updated!</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Display Name
                  </label>
                  <Input
                    {...register("name")}
                    type="text"
                    error={!!errors.name}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    error={!!errors.email}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end bg-zinc-50/50 dark:bg-zinc-950/20 border-t p-4 rounded-b-xl">
                <Button type="submit" isLoading={isSubmitting} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Notification Preferences */}
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">Preferences & Alerts</CardTitle>
              <CardDescription>Select which notifications you would like to receive from the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3.5 pr-4">
                  <Bell className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 cursor-pointer">
                      Email Tips & Reminders
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                      Receive notifications when municipal collection schedules or material classifications change.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                    emailAlerts ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                      emailAlerts ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-start space-x-3.5 pr-4">
                  <ShieldCheck className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 cursor-pointer">
                      Weekly CO2 Digest
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                      Receive a weekly summary report highlighting your carbon offsets and community points.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyDigest(!weeklyDigest)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                    weeklyDigest ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                      weeklyDigest ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Theme settings card */}
        <div className="lg:col-span-4">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">Application Theme</CardTitle>
              <CardDescription>Select your preferred viewing theme layout style</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {/* Light button */}
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="w-full flex flex-col items-center justify-center p-4 h-auto space-y-2 text-xs"
              >
                <Laptop className="h-5 w-5 rotate-0 scale-100 transition-all" />
                <span>Light</span>
              </Button>

              {/* Dark button */}
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="w-full flex flex-col items-center justify-center p-4 h-auto space-y-2 text-xs"
              >
                <Laptop className="h-5 w-5 rotate-0 scale-100 transition-all text-current" />
                <span>Dark</span>
              </Button>

              {/* System button */}
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="w-full flex flex-col items-center justify-center p-4 h-auto space-y-2 text-xs"
              >
                <Laptop className="h-5 w-5 rotate-0 scale-100 transition-all text-current" />
                <span>System</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
