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
    await fetch("https://https://tazky.onrender.com/logout", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("user");
    set({ user: null });
  },
}));

export default useAuthStore;
