import { api } from "../lib/api";

export const userService = {
  getProfile: async () => {
    return api.get("/users/me");
  },

  updateProfile: async (name, email) => {
    return api.patch("/users/me", { name, email });
  },

  deleteAccount: async () => {
    return api.delete("/users/me");
  },
};
