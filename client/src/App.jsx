import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthForm } from "./components/AuthForm";
import TaskPage from "./components/TaskPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<AuthForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
