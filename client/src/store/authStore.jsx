import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  authLoading: true,
  error: null,

  setAuthLoading: (l) => set({ authLoading: l }),
  setError: (e) => set({ error: e }),

  login: (data) => set({ user: data.user }),
  logout: async () => {
    try {
      await fetch("https://tazky.onrender.com/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    set({ user: null });
  },
}));

export default useAuthStore;
