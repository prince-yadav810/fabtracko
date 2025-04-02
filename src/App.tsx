
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LoginPage from "./styles/LoginPage";
import authService from "./services/authService";

import Index from "./pages/Index";
import WorkerPage from "./pages/WorkerPage";
import AttendancePage from "./pages/AttendancePage";
import PaymentPage from "./pages/PaymentPage";
import ReportPage from "./pages/ReportPage";
import AddWorkerPage from "./pages/AddWorkerPage";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  useEffect(() => {
    // Initialize authentication headers on app load
    authService.initAuthHeaders();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public login route */}
              <Route path="/login" element={<LoginPage />} />
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/workers" element={<ProtectedRoute><WorkerPage /></ProtectedRoute>} />
              <Route path="/workers/add" element={<ProtectedRoute><AddWorkerPage /></ProtectedRoute>} />
              <Route path="/workers/:workerId" element={<ProtectedRoute><WorkerPage /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
