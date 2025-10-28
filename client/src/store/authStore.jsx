import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  authLoading: false,
  error: null,

  setAuthLoading: (l) => set({ authLoading: l }),
  setError: (e) => set({ error: e }),

  login: (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user });
  },

  logout: async () => {
    try {
      await fetch("api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem("user");
    set({ user: null });
  },
}));

export default useAuthStore;
