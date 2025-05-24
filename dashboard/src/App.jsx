// src/App.jsx - Updated to use Modern Layout
import React, { useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";
import { PrimeReactProvider } from "primereact/api";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

// Context
import { LayoutProvider } from "@/contexts/LayoutContext";

// Routes
import { routeConfig } from "./routes";

// Components
import RouteRenderer from "@/routes/RouteRenderer";

// Pages
import LoginPage from "@/pages/LoginPage";

// Updated Layout - Import the new modern layout
import ModernMainLayout from "./layouts/ModernMainLayout";

// Hooks
import { useAuthHandler } from "./hooks/useAuthHandler";

// Styles
import "./App.css";

function App() {
  const {
    currentUser,
    isLoading,
    error: authError,
    logout,
    updateCurrentUser,
    getUserCookie,
  } = useFrappeAuth();

  const toast = useRef(null);
  const { handleLogin, handleLogout } = useAuthHandler({
    toast,
    logout,
    updateCurrentUser,
    getUserCookie,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="8"
          fill="var(--surface-card)"
          animationDuration=".5s"
        />
      </div>
    );
  }

  // Auth error handling (optional - only show critical errors)
  if (authError && !currentUser && !isLoading) {
    if (
      authError.message !== "Incomplete login details" &&
      authError.httpStatus !== 403 &&
      authError.httpStatus !== 401
    ) {
      console.error("Authentication SDK Error:", authError);
    }
  }

  const primeReactOptions = { ripple: true };

  return (
    <PrimeReactProvider value={primeReactOptions}>
      <BrowserRouter>
        <Toast ref={toast} position="top-right" />
        <Routes>
          {/* Public Route - Login */}
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              currentUser ? (
                <LayoutProvider>
                  <ModernMainLayout user={currentUser} onLogout={handleLogout}>
                    <RouteRenderer routes={routeConfig} />
                  </ModernMainLayout>
                </LayoutProvider>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;
