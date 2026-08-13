import { create } from "zustand";
import { wasteService } from "@/services/waste.service";
import { useUserStore } from "./user-store";

export const usePredictionStore = create((set, get) => ({
  history: [],
  isUploading: false,
  uploadProgress: 0,
  currentPrediction: null,
  currentImage: null,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },

  // Fetch paginated history from database
  fetchHistory: async (page = 1, limit = 10) => {
    try {
      const response = await wasteService.getHistory(page, limit);
      const { history, pagination } = response.data;
      
      set({
        history,
        pagination,
      });

      // Sync user points and scans automatically with history stats
      useUserStore.getState().syncStatsFromHistory(history);
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Upload image to Cloudinary and trigger AI classification + Recommendation engine
  uploadAndClassify: async (file) => {
    set({ isUploading: true, uploadProgress: 0, currentPrediction: null, error: null });

    // Set local image URL preview
    const localUrl = URL.createObjectURL(file);
    set({ currentImage: localUrl });

    // Simulate progress increments for high-fidelity UI
    const progressInterval = setInterval(() => {
      set((state) => {
        if (state.uploadProgress >= 90) {
          clearInterval(progressInterval);
          return { uploadProgress: 90 };
        }
        return { uploadProgress: state.uploadProgress + 10 };
      });
    }, 100);

    try {
      const response = await wasteService.uploadImage(file);
      clearInterval(progressInterval);
      set({ uploadProgress: 100 });

      const newPrediction = response.data;

      // Prepend to history
      set((state) => {
        const updatedHistory = [newPrediction, ...state.history];
        
        // Sync user metrics
        useUserStore.getState().syncStatsFromHistory(updatedHistory);

        return {
          history: updatedHistory,
          currentPrediction: newPrediction,
          isUploading: false,
        };
      });
      return newPrediction;
    } catch (error) {
      clearInterval(progressInterval);
      set({ isUploading: false, error: error.message, currentImage: null });
      throw error;
    }
  },

  // Update item condition and fetch updated recommendations
  updateItemCondition: async (predictionId, condition) => {
    set({ error: null });
    try {
      const response = await wasteService.updateCondition(predictionId, condition);
      const { prediction, recommendation } = response.data;

      const updatedPrediction = {
        ...prediction,
        recommendation,
      };

      set((state) => {
        // Update history entry
        const updatedHistory = state.history.map((item) =>
          item._id === predictionId ? updatedPrediction : item
        );
        
        // Sync stats
        useUserStore.getState().syncStatsFromHistory(updatedHistory);

        return {
          history: updatedHistory,
          // Update active card if active
          currentPrediction:
            state.currentPrediction && state.currentPrediction.id === predictionId
              ? { ...state.currentPrediction, condition, recommendation }
              : state.currentPrediction,
        };
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Update user manual category correction
  submitManualCorrection: async (predictionId, correctedCategory) => {
    set({ error: null });
    try {
      const response = await wasteService.submitCorrection(predictionId, correctedCategory);
      const { prediction, recommendation } = response.data;

      const updatedPrediction = {
        ...prediction,
        recommendation,
      };

      set((state) => {
        const updatedHistory = state.history.map((item) =>
          item._id === predictionId ? updatedPrediction : item
        );

        return {
          history: updatedHistory,
          currentPrediction:
            state.currentPrediction && state.currentPrediction.id === predictionId
              ? { ...state.currentPrediction, correctedCategory, recommendation }
              : state.currentPrediction,
        };
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Record thumbs-up / down feedback
  submitRecommendationFeedback: async (predictionId, wasUseful, comment = "") => {
    try {
      await wasteService.submitFeedback(predictionId, wasUseful, comment);
      return true;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearCurrentPrediction: () => {
    set({ currentPrediction: null, currentImage: null, uploadProgress: 0, error: null });
  },

  deleteHistoryItem: (id) => {
    set((state) => ({
      history: state.history.filter((item) => (item._id || item.id) !== id),
    }));
  },
}));
