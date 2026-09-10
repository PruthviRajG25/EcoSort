"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  CheckCircle2,
  Target,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  Flame,
  Award,
  ShieldCheck,
  Lock,
  Star,
  MessageSquarePlus,
  ChevronRight,
  Activity
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user-store";
import { soundManager } from "@/lib/audio";
import { cn } from "@/lib/utils";

// Preserved canonical community quests data
const INITIAL_QUESTS = [
  {
    id: "q-1",
    title: "Indiranagar Plastic-Free Sprint",
    locality: "Indiranagar, Bengaluru",
    category: "Plastic & Packaging",
    participants: 342,
    targetScans: 1000,
    currentScans: 840,
    daysLeft: 3,
    rewardPoints: 250,
    badge: "Plastic Slayer",
    description: "Collect, scan, and divert 1,000 plastic containers across ward 112 before Sunday.",
    acceptedMaterials: ["PET Bottles (Grade 1)", "HDPE Milk & Shampoo Jugs (Grade 2)", "Rigid Plastic Containers"],
    guidelines: "Rinse containers before disposing. Separate caps if colored differently. Deposit at Ward 112 collection kiosks."
  },
  {
    id: "q-2",
    title: "Citywide E-Waste Roundup",
    locality: "Greater Bengaluru",
    category: "Electronics & Hazardous",
    participants: 618,
    targetScans: 500,
    currentScans: 390,
    daysLeft: 6,
    rewardPoints: 500,
    badge: "Circuit Saver",
    description: "Drop off old phones, chargers, and batteries at authorized municipal recycling hubs.",
    acceptedMaterials: ["Smartphones & feature phones", "Chargers & power cables", "Lithium-ion batteries (taped)", "Computer peripherals"],
    guidelines: "Factory-reset devices containing personal data. Ensure battery contacts are covered with non-conductive tape."
  },
  {
    id: "q-3",
    title: "Zero-Contamination Cardboard Drive",
    locality: "Koramangala & HSR",
    category: "Paper & Fiber",
    participants: 215,
    targetScans: 750,
    currentScans: 520,
    daysLeft: 4,
    rewardPoints: 200,
    badge: "Cardboard Captain",
    description: "Flatten and dry 750 shipping cartons to optimize dry waste truck payload volume.",
    acceptedMaterials: ["Corrugated cardboard boxes", "E-commerce packing cartons", "Dry food & cereal packaging"],
    guidelines: "Peel off excessive packing tapes and labels. Cartons must be dry, flattened, and stacked neatly."
  },
];

// Preserved canonical leaderboard dataset
const BASE_LEADERBOARD = [
  { id: "u-1", name: "Aarav Sharma", locality: "Indiranagar", ward: "Indiranagar", scans: 142, points: 7100, badge: "Eco Titan", avatar: "AS" },
  { id: "u-2", name: "Priya Venkatesh", locality: "Koramangala", ward: "Koramangala", scans: 128, points: 6400, badge: "Recycling Ranger", avatar: "PV" },
  { id: "u-3", name: "Rohan Kulkarni", locality: "HSR Layout", ward: "HSR Layout", scans: 115, points: 5750, badge: "Green Guardian", avatar: "RK" },
  { id: "u-4", name: "Ananya Deshmukh", locality: "Whitefield", ward: "Whitefield", scans: 96, points: 4800, badge: "Eco Enthusiast", avatar: "AD" },
  { id: "u-user", name: "You", locality: "Your Ward", ward: "Your Ward", scans: 48, points: 1250, badge: "Eco Novice", avatar: "ME", isUser: true },
  { id: "u-6", name: "Karthik Nair", locality: "Malleshwaram", ward: "Malleshwaram", scans: 42, points: 2100, badge: "Eco Novice", avatar: "KN" },
];

// Activity items based on actual community quests & members
const INITIAL_ACTIVITIES = [
  { id: "act-1", user: "Aarav Sharma", action: "completed challenge", target: "Indiranagar Plastic-Free Sprint", time: "2 min ago", icon: "♻️" },
  { id: "act-2", user: "Priya Venkatesh", action: "reached tier", target: "Recycling Ranger (1500+ pts)", time: "8 min ago", icon: "🏆" },
  { id: "act-3", user: "A community member", action: "joined challenge", target: "Citywide E-Waste Roundup", time: "15 min ago", icon: "🎯" },
  { id: "act-4", user: "Rohan Kulkarni", action: "logged 14 cartons in", target: "Zero-Contamination Cardboard Drive", time: "28 min ago", icon: "📦" },
];

// Community reviews sample list
const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    author: "Priya V.",
    locality: "Indiranagar",
    rating: 5,
    category: "Waste Classification",
    quote: "EcoSort made sorting confusing multi-layer plastics and cosmetic bottles so straightforward. Our neighborhood sprint feels like a fun team goal!",
    date: "2 days ago"
  },
  {
    id: "rev-2",
    author: "Community Member",
    locality: "Koramangala",
    rating: 5,
    category: "Materials Sorting",
    quote: "Flattening cartons for the Koramangala cardboard drive saved so much bin space. Knowing other residents are doing it too keeps me motivated.",
    date: "4 days ago"
  },
  {
    id: "rev-3",
    author: "Aarav S.",
    locality: "Bengaluru",
    rating: 5,
    category: "E-Waste Management",
    quote: "Finally found the certified municipal drop-off depot for my stash of dead cables and old phones. Super satisfying +500 points boost!",
    date: "1 week ago"
  }
];

export default function CommunityPage() {
  const { user, stats, addPoints } = useUserStore();

  // Sound effects state (defaults to OFF, persists in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Quests & activity states
  const [joinedQuests, setJoinedQuests] = useState({});
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [selectedQuestForDetails, setSelectedQuestForDetails] = useState(null);

  // Leaderboard filters
  const [localityFilter, setLocalityFilter] = useState("all"); // 'all' | 'ward'
  const [timeframeFilter, setTimeframeFilter] = useState("week"); // 'week' | 'all'

  // Reviews & modal states
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    category: "Waste Classification",
    quote: "",
    author: ""
  });
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);

  // Initialize sound settings on client load
  useEffect(() => {
    setSoundEnabled(soundManager.isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
    if (next) {
      soundManager.playJoinChime();
    }
  };

  // Derive real user metrics
  const userPoints = user?.ecoPoints || stats?.pointsEarned || 1250;
  const userScans = stats?.totalScans || 48;
  const joinedCount = Object.keys(joinedQuests).length;

  // Real rank calculation from user-store logic
  const rankInfo = useMemo(() => {
    let currentRank = "Eco Novice";
    let nextRank = "Eco Enthusiast";
    let floor = 0;
    let ceiling = 500;

    if (userPoints >= 2000) {
      currentRank = "Eco Champion";
      nextRank = "Eco Titan";
      floor = 2000;
      ceiling = 5000;
    } else if (userPoints >= 1500) {
      currentRank = "Recycling Ranger";
      nextRank = "Eco Champion";
      floor = 1500;
      ceiling = 2000;
    } else if (userPoints >= 500) {
      currentRank = "Eco Enthusiast";
      nextRank = "Recycling Ranger";
      floor = 500;
      ceiling = 1500;
    }

    const pointsToNext = Math.max(0, ceiling - userPoints);
    const progressPercent = Math.min(100, Math.round(((userPoints - floor) / (ceiling - floor)) * 100));

    return { currentRank, nextRank, pointsToNext, progressPercent, ceiling };
  }, [userPoints]);

  // Compute dynamic leaderboard rows reflecting user's live points
  const dynamicLeaderboard = useMemo(() => {
    const list = BASE_LEADERBOARD.map((entry) => {
      if (entry.isUser) {
        return {
          ...entry,
          name: user?.name || "You",
          points: userPoints,
          scans: userScans,
          badge: rankInfo.currentRank
        };
      }
      return entry;
    });

    // Adjust points slightly for All-Time vs This Week for realism
    const adjustedList = list.map((item) => {
      if (timeframeFilter === "all") {
        return {
          ...item,
          points: Math.round(item.points * 2.6),
          scans: Math.round(item.scans * 2.8)
        };
      }
      return item;
    });

    // Sort by points descending
    adjustedList.sort((a, b) => b.points - a.points);

    // Apply locality filter
    const filtered = localityFilter === "ward"
      ? adjustedList.filter((item) => item.isUser || item.locality === "Indiranagar")
      : adjustedList;

    // Assign final rank numbers
    return filtered.map((item, index) => ({
      ...item,
      computedRank: index + 1
    }));
  }, [user?.name, userPoints, userScans, rankInfo.currentRank, localityFilter, timeframeFilter]);

  // User's current rank entry and adjacent comparison
  const userRankEntry = useMemo(() => {
    const userIndex = dynamicLeaderboard.findIndex((item) => item.isUser);
    if (userIndex === -1) return null;
    const current = dynamicLeaderboard[userIndex];
    const ahead = userIndex > 0 ? dynamicLeaderboard[userIndex - 1] : null;
    return {
      rank: current.computedRank,
      points: current.points,
      scans: current.scans,
      ahead
    };
  }, [dynamicLeaderboard]);

  // Featured / Recommended Challenge (Highest reward)
  const featuredQuest = INITIAL_QUESTS.find((q) => q.id === "q-2") || INITIAL_QUESTS[0];

  // Join quest handler
  const handleJoinQuest = (quest) => {
    if (joinedQuests[quest.id]) {
      soundManager.playClick();
      return;
    }

    setJoinedQuests((prev) => ({ ...prev, [quest.id]: true }));
    addPoints(quest.rewardPoints);
    soundManager.playJoinChime();

    // Add entry to recent community activity
    setActivities((prev) => [
      {
        id: `act-user-${Date.now()}`,
        user: user?.name ? `${user.name.split(" ")[0]} (You)` : "You",
        action: "joined challenge",
        target: quest.title,
        time: "Just now",
        icon: "🌟"
      },
      ...prev
    ]);
  };

  // Submit community review handler
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.quote.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: reviewForm.author.trim() || (user?.name ? `${user.name.split(" ")[0]} (You)` : "Eco Contributor"),
      locality: "Bengaluru",
      rating: reviewForm.rating,
      category: reviewForm.category,
      quote: reviewForm.quote.trim(),
      date: "Just now"
    };

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setReviewForm({ rating: 5, category: "Waste Classification", quote: "", author: "" });
    soundManager.playRewardChord();

    setReviewSubmittedToast(true);
    setTimeout(() => setReviewSubmittedToast(false), 5000);
  };

  // Derived achievements based on actual user data
  const achievements = [
    {
      id: "ach-1",
      title: "First Scan",
      desc: "Logged your first item into the EcoSort vision scanner",
      icon: Sparkles,
      unlocked: userScans >= 1,
      badge: "Completed"
    },
    {
      id: "ach-2",
      title: "Plastic Pioneer",
      desc: "Sorted 10 or more recyclable plastic containers",
      icon: Award,
      unlocked: userScans >= 10,
      badge: userScans >= 10 ? "Unlocked" : `${Math.min(userScans, 10)}/10 Scans`
    },
    {
      id: "ach-3",
      title: "Carbon Saver",
      desc: "Saved measurable CO2 emissions via responsible disposal",
      icon: Flame,
      unlocked: userPoints >= 500,
      badge: userPoints >= 500 ? "Active Tier" : `${userPoints}/500 Pts`
    },
    {
      id: "ach-4",
      title: "Quest Contributor",
      desc: "Enrolled in active neighborhood sustainability sprints",
      icon: Target,
      unlocked: joinedCount >= 1,
      badge: joinedCount >= 1 ? `${joinedCount} Joined` : "0 Joined"
    },
    {
      id: "ach-5",
      title: "Zero Waste Hero",
      desc: "Divert 100 items without curbside contamination",
      icon: ShieldCheck,
      unlocked: userScans >= 100,
      badge: `${userScans}/100 Scans`
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* ==================================================
          A. PAGE HEADER
          ================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Community challenges are active
            </span>
            <span className="hidden sm:inline text-xs text-zinc-400">• Greater Bengaluru</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm">
              <Image
                src="/ecosort-logo.png"
                alt="EcoSort Community"
                width={32}
                height={32}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Community Quests & Leaderboards
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            Join local recycling challenges, make an impact, and climb the community leaderboard.
          </p>
        </div>

        {/* Global Sound Control */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className={cn(
              "h-9 px-3.5 text-xs font-semibold rounded-lg border transition-all flex items-center space-x-2",
              soundEnabled
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}
            title={soundEnabled ? "Disable UI Sound Effects" : "Enable UI Sound Effects"}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sound: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-zinc-400" />
                <span>Sound: OFF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Review Submission Toast Banner */}
      <AnimatePresence>
        {reviewSubmittedToast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-xl p-4 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-sm shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Thank you! Your community experience review has been posted below.</span>
            </div>
            <button
              onClick={() => setReviewSubmittedToast(false)}
              className="text-xs underline hover:text-emerald-900 dark:hover:text-emerald-100 font-semibold"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================
          B & C. TOP ROW: YOUR COMMUNITY IMPACT + NEXT MILESTONE
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* B. YOUR COMMUNITY IMPACT */}
        <div className="lg:col-span-7">
          <Card className="border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-teal-950/10 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                  <span>🌱</span>
                  <span>Your Community Impact</span>
                </span>
                <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900/80 text-[11px] font-semibold">
                  {userRankEntry ? `#${userRankEntry.rank} in your community` : "Active Member"}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {user?.name ? `${user.name}` : "Eco Citizen"}
              </CardTitle>
              <CardDescription className="text-xs">
                Your verified recycling logs and quest contributions help divert Bangalore landfill waste.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Total Points
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Eco Points</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Items Sorted
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {userScans}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Verified Scans</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Quests Joined
                  </div>
                  <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                    {joinedCount}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Active Challenges</div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <Link href="#leaderboard" className="flex items-center justify-center space-x-1.5">
                  <span>View My Progress</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* C. NEXT MILESTONE */}
        <div className="lg:col-span-5">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                  <span>🚀</span>
                  <span>Next Milestone</span>
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                  {rankInfo.currentRank}
                </Badge>
              </div>
              <CardTitle className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
                Next Tier: {rankInfo.nextRank}
              </CardTitle>
              <CardDescription className="text-xs">
                You&apos;re working toward your next EcoSort rank.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Current: <strong className="text-zinc-900 dark:text-zinc-100">{userPoints} pts</strong>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Target: {rankInfo.ceiling} pts
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(8, rankInfo.progressPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{rankInfo.progressPercent}% achieved</span>
                  <span>{rankInfo.pointsToNext > 0 ? `${rankInfo.pointsToNext} pts to rank up` : "Rank Unlocked!"}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                asChild
                size="sm"
                className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                <Link href="/dashboard" className="flex items-center justify-center space-x-2">
                  <span>Continue Recycling</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* ==================================================
          D. RECOMMENDED CHALLENGE
          ================================================== */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            🎯 Recommended for You
          </span>
          <span className="text-xs text-zinc-400">• High Impact Opportunity</span>
        </div>

        <Card className="border-2 border-emerald-500/30 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-[11px] font-bold">
                    Featured Challenge
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {featuredQuest.locality} • {featuredQuest.daysLeft} days remaining
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {featuredQuest.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {featuredQuest.description}
                </p>

                {/* Progress Mini Bar */}
                <div className="pt-2 max-w-md space-y-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Community Progress: {featuredQuest.currentScans} / {featuredQuest.targetScans} Scans</span>
                    <span>{Math.round((featuredQuest.currentScans / featuredQuest.targetScans) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.round((featuredQuest.currentScans / featuredQuest.targetScans) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end justify-between space-y-3 shrink-0">
                <div className="text-left md:text-right">
                  <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    +{featuredQuest.rewardPoints} Points
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center space-x-1 mt-0.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{featuredQuest.participants} eco-citizens joined</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedQuestForDetails(featuredQuest);
                    }}
                    className="text-xs font-semibold h-9 px-3 border-zinc-200 dark:border-zinc-800"
                  >
                    View Details
                  </Button>

                  {joinedQuests[featuredQuest.id] ? (
                    <Button
                      size="sm"
                      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold h-9 px-4 hover:bg-emerald-200"
                      onClick={() => handleJoinQuest(featuredQuest)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                      Continue Challenge
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleJoinQuest(featuredQuest)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 px-5 shadow-xs"
                    >
                      Join Challenge
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================================================
          MAIN 2-COLUMN SECTION:
          LEFT: E. ACTIVE COMMUNITY QUESTS
          RIGHT: F. COMMUNITY ACTIVITY + G. LEADERBOARD
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================================================
            E. ACTIVE COMMUNITY QUESTS (Left 7 Cols)
            ================================================== */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Target className="h-5 w-5 text-emerald-500" />
              <span>Active Community Quests</span>
            </h2>
            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-xs font-semibold">
              3 Live Sprints
            </Badge>
          </div>

          <div className="space-y-4">
            {INITIAL_QUESTS.map((quest) => {
              const percent = Math.round((quest.currentScans / quest.targetScans) * 100);
              const isJoined = joinedQuests[quest.id];

              return (
                <Card
                  key={quest.id}
                  className={cn(
                    "border transition-all duration-200 hover:shadow-md",
                    isJoined
                      ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{quest.locality}</span>
                          <span>•</span>
                          <span className="text-zinc-500">{quest.daysLeft} days left</span>
                        </div>
                        <CardTitle className="text-base md:text-lg font-bold mt-1 text-zinc-900 dark:text-zinc-50">
                          {quest.title}
                        </CardTitle>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 font-extrabold text-xs shrink-0">
                        +{quest.rewardPoints} Points
                      </Badge>
                    </div>
                    <CardDescription className="text-xs pt-1 leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {quest.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-2">
                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <span>{quest.currentScans} of {quest.targetScans} Scans Completed</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                      <div className="flex items-center space-x-1.5 text-zinc-500">
                        <Users className="h-4 w-4 text-zinc-400" />
                        <span>{quest.participants} participants</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            soundManager.playClick();
                            setSelectedQuestForDetails(quest);
                          }}
                          className="text-xs h-8 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                          View Details
                        </Button>

                        {isJoined ? (
                          <Button
                            size="sm"
                            onClick={() => handleJoinQuest(quest)}
                            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold h-8 hover:bg-emerald-200"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                            Continue Challenge
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinQuest(quest)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-8"
                          >
                            Join Challenge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ==================================================
            RIGHT 5 COLS: F. COMMUNITY ACTIVITY + G. LEADERBOARD
            ================================================== */}
        <div className="lg:col-span-5 space-y-8" id="leaderboard">
          {/* ==================================================
              F. COMMUNITY ACTIVITY
              ================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                <Activity className="h-4.5 w-4.5 text-teal-500" />
                <span>🌍 Community Activity</span>
              </h2>
              <span className="text-[11px] font-semibold text-zinc-400">Recent Highlights</span>
            </div>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
              <CardContent className="p-4 space-y-3 divide-y divide-zinc-100 dark:divide-zinc-900">
                {activities.slice(0, 4).map((act, idx) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn("flex items-start justify-between text-xs pt-3 first:pt-0")}
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="text-sm shrink-0">{act.icon}</span>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{act.user}</span>{" "}
                        <span className="text-zinc-600 dark:text-zinc-400">{act.action}</span>{" "}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{act.target}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0 ml-2">{act.time}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ==================================================
              G. LEADERBOARD & 10. PERSONAL LEADERBOARD POSITION
              ================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span>Ward Leaderboard</span>
              </h2>
            </div>

            {/* 10. PERSONAL LEADERBOARD POSITION BANNER */}
            {userRankEntry && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    #{userRankEntry.rank}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50 flex items-center space-x-1.5">
                      <span>🏆 YOUR POSITION</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-300 text-emerald-700 dark:text-emerald-300">
                        {rankInfo.currentRank}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {userRankEntry.ahead ? (
                        <span>
                          {userRankEntry.ahead.points - userRankEntry.points} pts behind {userRankEntry.ahead.name.split(" ")[0]} ({userRankEntry.ahead.locality})
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Top of your neighborhood! 🌟</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {userRankEntry.points.toLocaleString()} pts
                  </div>
                  <div className="text-[10px] text-zinc-400">{userRankEntry.scans} scans</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              {/* Locality Filter */}
              <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setLocalityFilter("all");
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors",
                    localityFilter === "all"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  All Bengaluru
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setLocalityFilter("ward");
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors",
                    localityFilter === "ward"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  My Ward
                </button>
              </div>

              {/* Timeframe Filter */}
              <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setTimeframeFilter("week");
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors",
                    timeframeFilter === "week"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  This Week
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setTimeframeFilter("all");
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors",
                    timeframeFilter === "all"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Leaderboard Table */}
            <Card className="border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-900">
                {dynamicLeaderboard.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-3.5 transition-colors",
                      item.isUser
                        ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-emerald-500 font-bold"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center text-xs font-black",
                          item.computedRank === 1
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-300/50"
                            : item.computedRank === 2
                            ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            : item.computedRank === 3
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                            : "text-zinc-400"
                        )}
                      >
                        {item.computedRank}
                      </span>

                      <Avatar fallback={item.avatar} size="sm" className="h-8 w-8 text-xs font-bold" />

                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                          <span>{item.name}</span>
                          {item.isUser && (
                            <Badge className="text-[9px] px-1 py-0 bg-emerald-600 text-white hover:bg-emerald-600">
                              YOU
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {item.locality} • {item.badge}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {item.points.toLocaleString()} pts
                      </div>
                      <div className="text-[10px] text-zinc-400">{item.scans} scans</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ==================================================
          H. ACHIEVEMENTS
          ================================================== */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Award className="h-5 w-5 text-emerald-500" />
              <span>🏅 Your Achievements</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Milestones unlocked from your verified recycling and community contributions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3",
                  ach.unlocked
                    ? "bg-white dark:bg-zinc-950 border-emerald-300 dark:border-emerald-800 shadow-2xs hover:shadow-md"
                    : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 opacity-75"
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      ach.unlocked
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {ach.unlocked ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                      {ach.badge}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-300 dark:border-zinc-700 flex items-center space-x-1">
                      <Lock className="h-2.5 w-2.5 mr-0.5" />
                      <span>{ach.badge}</span>
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{ach.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          I. COMMUNITY VOICES / REVIEWS
          ================================================== */}
      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">💚</span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Community Voices
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              See how people are using EcoSort to make better disposal decisions. (Community Feedback)
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              soundManager.playClick();
              setIsReviewModalOpen(true);
            }}
            className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-9 px-4 flex items-center space-x-1.5 shadow-xs"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Share Your Experience</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-zinc-50 dark:bg-zinc-900">
                    {rev.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </CardContent>

              <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[11px] flex justify-between text-muted-foreground">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">— {rev.author}</span>
                <span>{rev.date}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* ==================================================
          MODAL 1: QUEST DETAILS DIALOG
          ================================================== */}
      <Dialog
        isOpen={!!selectedQuestForDetails}
        onClose={() => setSelectedQuestForDetails(null)}
        title={selectedQuestForDetails?.title || "Challenge Details"}
        description={`${selectedQuestForDetails?.locality} • +${selectedQuestForDetails?.rewardPoints} Points`}
        className="max-w-lg"
      >
        {selectedQuestForDetails && (
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Objective</h4>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {selectedQuestForDetails.description}
              </p>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg space-y-1.5 border border-zinc-200 dark:border-zinc-700/60">
              <div className="font-bold text-zinc-900 dark:text-zinc-100">Accepted Materials:</div>
              <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-300">
                {selectedQuestForDetails.acceptedMaterials.map((mat, i) => (
                  <li key={i}>{mat}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Disposal Guidelines</h4>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {selectedQuestForDetails.guidelines}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                Reward: +{selectedQuestForDetails.rewardPoints} Eco Points
              </div>

              {joinedQuests[selectedQuestForDetails.id] ? (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Already Enrolled
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    handleJoinQuest(selectedQuestForDetails);
                    setSelectedQuestForDetails(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  Join This Challenge
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* ==================================================
          MODAL 2: SHARE YOUR EXPERIENCE DIALOG
          ================================================== */}
      <Dialog
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Share Your EcoSort Experience"
        description="Inspire fellow neighbors by sharing what you sorted or learned."
        className="max-w-md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
              Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "h-5 w-5",
                      star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <select
              value={reviewForm.category}
              onChange={(e) => setReviewForm({ ...reviewForm, category: e.target.value })}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Waste Classification">Waste Classification</option>
              <option value="Community Quests">Community Quests</option>
              <option value="Materials Sorting">Materials Sorting</option>
              <option value="Local Depots">Local Depots</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
              Your Feedback or Tip
            </label>
            <textarea
              required
              rows={3}
              value={reviewForm.quote}
              onChange={(e) => setReviewForm({ ...reviewForm, quote: e.target.value })}
              placeholder="e.g. Cleared 15 PET bottles in Indiranagar; scanning was super easy!"
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
              Display Name (Optional)
            </label>
            <Input
              type="text"
              value={reviewForm.author}
              onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
              placeholder={user?.name || "e.g. Priya V. or Anonymous"}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 font-semibold"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
