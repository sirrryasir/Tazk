import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  authLoading: false,
  error: null,

  setAuthLoading: (l) => set({ authLoading: l }),
  setError: (e) => set({ error: e }),

  login: (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    set({ user: data });
  },

  logout: async () => {
    try {
      await fetch("/logout", {
        method: "GET",
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
