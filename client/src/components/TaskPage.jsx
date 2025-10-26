import React, { useEffect } from "react";
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
import { Loader2, LogOut, Trash2 } from "lucide-react";

export default function TaskPage() {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const {
    tasks,
    task,
    loading,
    error,
    setTask,
    setError,
    setLoading,
    setTasks,
    addTask,
  } = useTaskStore();

  const AddTask = async () => {
    setError(null);
    const trimmedTask = task.trim();
    if (!trimmedTask) {
      setError("Task title cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: trimmedTask, user: user.email }),
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/tasks?user=${user.email}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/tasks/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !currentStatus }),
        }
      );
      if (!response.ok) throw new Error("Failed to update task");

      const updated = await response.json();
      setTasks(tasks.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/tasks/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete task");

      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) navigate("/");
  }, [navigate, token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Welcome, {user.name} !
            </CardTitle>
            <CardDescription>Manage your tasks below</CardDescription>
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={logout}
            title="Logout"
          >
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

          {/* Task List */}
          <div className="border rounded-md p-3 space-y-2 max-h-[300px] overflow-y-auto">
            {loading ? (
              <p className="text-gray-500 text-center">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-500 text-center">No tasks yet.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={t.completed}
                      onCheckedChange={() => toggleComplete(t._id, t.completed)}
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
                    onClick={() => deleteTask(t._id)}
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
