"use client";

import React, { useEffect } from "react";
import { Calendar, Mail, Flame, ShieldAlert, Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/user-store";
import { usePredictionStore } from "@/store/prediction-store";

export default function ProfilePage() {
  const { user, stats } = useUserStore();
  const fetchHistory = usePredictionStore((state) => state.fetchHistory);

  useEffect(() => {
    fetchHistory(1, 10);
  }, [fetchHistory]);

  const achievements = [
    {
      id: "ach-1",
      title: "First Scan",
      description: "Scanned your first waste item.",
      icon: Sparkles,
      unlocked: true,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      id: "ach-2",
      title: "Plastic Pioneer",
      description: "Scanned over 10 plastic items.",
      icon: Trophy,
      unlocked: true,
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/20"
    },
    {
      id: "ach-3",
      title: "Carbon Saver",
      description: "Saved more than 10kg of CO2.",
      icon: Flame,
      unlocked: true,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
    },
    {
      id: "ach-4",
      title: "Zero Waste Hero",
      description: "Recycle 100 items without error.",
      icon: ShieldAlert,
      unlocked: false,
      color: "text-zinc-400 bg-zinc-100 dark:bg-zinc-900"
    }
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Header welcome banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your sustainability metrics and unlocked achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Avatar & General info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="text-center p-6 space-y-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col items-center space-y-3">
              <Avatar
                fallback={getInitials(user?.name)}
                src={user?.avatarUrl}
                size="lg"
                className="ring-4 ring-emerald-500/20 shadow-md h-20 w-20 text-2xl"
              />
              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">
                  {user?.name}
                </h3>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full border">
                  {user?.ecoLevel}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-left text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center space-x-3">
                <Mail className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                <span>Joined {formatDate(user?.joinedAt)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Achievements & Stats detail */}
        <div className="lg:col-span-8 space-y-6">
          {/* Detailed Statistics Recap */}
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">Eco Metric Summary</CardTitle>
              <CardDescription>Metrics verified by EcoSort AI classification logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {stats.totalScans}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Scans Completed</div>
                </div>
                <div className="space-y-1 border-y sm:border-y-0 sm:border-x py-4 sm:py-0">
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {stats.co2SavedKg.toFixed(1)} kg
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Carbon Prevented</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {stats.pointsEarned}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Eco Points Accumulated</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Grid Card */}
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">Badges & Achievements</CardTitle>
              <CardDescription>Earn badges by maintaining consistent recycling schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div
                      key={ach.id}
                      className={`flex items-start space-x-3 p-4 rounded-xl border transition-all ${
                        ach.unlocked
                          ? "border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/30"
                          : "border-zinc-100 bg-zinc-50/20 dark:border-zinc-900/20 opacity-60"
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg shrink-0 ${ach.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                            {ach.title}
                          </h4>
                          {ach.unlocked && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
