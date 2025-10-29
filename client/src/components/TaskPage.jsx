import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTaskStore from "../store/taskStore";
import useAuthStore from "../store/authStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2, LogOut } from "lucide-react";

export default function TaskPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { tasks, loading, error, setError, setLoading, setTasks, addTask } =
    useTaskStore();
  const [task, setTask] = useState("");

  // Add new task
  const AddTask = async () => {
    setError(null);
    const trimmedTask = task.trim();
    if (!trimmedTask) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmedTask }),
      });

      if (!response.ok) throw new Error("Failed to add task");
      const data = await response.json();
      addTask(data);
      setTask("");
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Something went wrong while adding task.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle completion
  const toggleComplete = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updated = await response.json();
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // Delete
  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete task");

      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [navigate, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Welcome, {user?.name || "User"}!
            </CardTitle>
            <CardDescription>Manage your tasks below</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add a new task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && AddTask()}
              disabled={loading}
            />
            <Button onClick={AddTask} disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Add"}
            </Button>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Tasks */}
          <div className="border rounded-md p-3 space-y-2 max-h-[300px] overflow-y-auto">
            {loading ? (
              <p className="text-gray-500 text-center">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-500 text-center">No tasks yet.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={t.completed}
                      onCheckedChange={() => toggleComplete(t.id, t.completed)}
                    />
                    <span
                      className={`text-base ${
                        t.completed
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteTask(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
