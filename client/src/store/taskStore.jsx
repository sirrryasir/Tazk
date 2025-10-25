import { create } from "zustand";

const useTaskStore = create((set) => ({
  tasks: [],
  task: "",
  loading: true,
  error: null,
  setTask: (t) => set({ task: t }),
  setError: (e) => set({ error: e }),
  setLoading: (l) => set({ loading: l }),
  setTasks: (tasks) => set({ tasks }),
  addTask: (newTask) => set((state) => ({ tasks: [...state.tasks, newTask] })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
    })),
  toggleCompleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
}));

export default useTaskStore;
