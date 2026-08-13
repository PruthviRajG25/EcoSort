import { create } from "zustand";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";

export const useUserStore = create((set, get) => ({
  user: null, 
  stats: {
    totalScans: 0,
    recycledItemsCount: 0,
    scansThisWeek: 0,
    co2SavedKg: 0.0,
    pointsEarned: 0,
    levelProgressPercent: 0,
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const user = response.data.user;
      
      set({
        user: {
          ...user,
          ecoPoints: user.ecoPoints || 0,
          ecoLevel: user.ecoLevel || "Eco Novice",
          joinedAt: user.createdAt,
        },
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(name, email, password);
      const user = response.data.user;
      set({
        user: {
          ...user,
          ecoPoints: user.ecoPoints || 0,
          ecoLevel: user.ecoLevel || "Eco Novice",
          joinedAt: user.createdAt,
        },
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout request failed, clearing local state anyway:", err.message);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  getMe: async () => {
    set({ isLoading: true });
    try {
      const response = await authService.getMe();
      const user = response.data.user;
      set({
        user: {
          ...user,
          ecoPoints: user.ecoPoints || 0,
          ecoLevel: user.ecoLevel || "Eco Novice",
          joinedAt: user.createdAt,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (name, email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateProfile(name, email);
      const updatedUser = response.data.user;
      set((state) => ({
        user: {
          ...state.user,
          ...updatedUser,
        },
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Calculate dynamic stats from scanned predictions
  syncStatsFromHistory: (history) => {
    let totalScans = history.length;
    let co2SavedKg = 0;
    
    history.forEach((scan) => {
      if (scan.recommendation && scan.recommendation.environmentalImpact) {
        co2SavedKg += scan.recommendation.environmentalImpact.co2SavedKg || 0;
      }
    });

    const pointsEarned = totalScans * 50;
    const progress = Math.min(100, Math.floor(((pointsEarned % 500) / 500) * 100));

    let ecoLevel = "Eco Novice";
    if (pointsEarned >= 2000) ecoLevel = "Eco Champion";
    else if (pointsEarned >= 1500) ecoLevel = "Recycling Ranger";
    else if (pointsEarned >= 500) ecoLevel = "Eco Enthusiast";

    set((state) => ({
      user: state.user ? { ...state.user, ecoPoints: pointsEarned, ecoLevel } : null,
      stats: {
        totalScans,
        recycledItemsCount: totalScans,
        scansThisWeek: totalScans,
        co2SavedKg,
        pointsEarned,
        levelProgressPercent: progress,
      },
    }));
  },

  addPoints: (points) =>
    set((state) => {
      if (!state.user) return {};
      const newPoints = state.user.ecoPoints + points;
      let newLevel = state.user.ecoLevel;
      if (newPoints >= 2000) newLevel = "Eco Champion";
      else if (newPoints >= 1500) newLevel = "Recycling Ranger";
      
      const newProgress = Math.min(100, Math.floor(((newPoints % 500) / 500) * 100));

      return {
        user: { ...state.user, ecoPoints: newPoints, ecoLevel: newLevel },
        stats: {
          ...state.stats,
          pointsEarned: newPoints,
          levelProgressPercent: newProgress
        }
      };
    }),

  incrementScans: () =>
    set((state) => ({
      stats: {
        ...state.stats,
        totalScans: state.stats.totalScans + 1,
        recycledItemsCount: state.stats.recycledItemsCount + 1,
        scansThisWeek: state.stats.scansThisWeek + 1
      }
    }))
}));
