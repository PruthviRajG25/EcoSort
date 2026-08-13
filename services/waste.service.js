import { api } from "../lib/api";

export const wasteService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return api.post("/waste/upload", formData);
  },

  updateCondition: async (id, condition) => {
    return api.patch(`/waste/predictions/${id}/condition`, { condition });
  },

  submitCorrection: async (id, correctedCategory) => {
    return api.patch(`/waste/predictions/${id}/correct`, { correctedCategory });
  },

  submitFeedback: async (id, wasUseful, comment = "") => {
    return api.post(`/waste/predictions/${id}/feedback`, { wasUseful, comment });
  },

  getHistory: async (page = 1, limit = 10) => {
    return api.get(`/waste/history?page=${page}&limit=${limit}`);
  },
};
