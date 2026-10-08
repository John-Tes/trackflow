import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TrackPage from "./TrackPage";
import AdminPage from "./AdminPage";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <Routes>
        <Route path="/track" element={<TrackPage />} />
        <Route path="/track/:code" element={<TrackPage />} />
        <Route path="/admin/shipments" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/track" replace />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
