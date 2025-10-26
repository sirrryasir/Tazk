import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  login: (data) => {
    localStorage.setItem("token", data.token);
    set({ token: data.token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));

export default useAuthStore;
