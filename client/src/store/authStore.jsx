import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  authLoading: false,
  error: null,

  setAuthLoading: (l) => set({ authLoading: l }),
  setError: (e) => set({ error: e }),

  login: (data) => {
    localStorage.setItem("token", data.token);
    set({ user: data.user });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
}));

export default useAuthStore;
