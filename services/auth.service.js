import { api } from "../lib/api";

export const authService = {
  register: async (name, email, password) => {
    return api.post("/auth/register", { name, email, password });
  },

  login: async (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  logout: async () => {
    return api.post("/auth/logout");
  },

  getMe: async () => {
    return api.get("/auth/me");
  },
};
