import React, { useRef } from "react"; // Removed useEffect, useState for theme
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";
import { PrimeReactProvider } from "primereact/api";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

// Context
import { LayoutProvider } from "@/contexts/LayoutContext";

// Pages
import LoginPage from "@/pages/LoginPage"; 
import HomePage from "@/pages/HomePage"; 
import EmployeesPage from "@/pages/employee/EmployeesPage"; 
import ViewEmployeePage from "@/pages/employee/doc/ViewEmployeePage";
import EditEmployeePage from "@/pages/employee/doc/EditEmployeePage";

// Layout
import MainLayout from "./layouts/MainLayout"; // Path to your MainLayout.jsx
import "./App.css"; // Path to your App.css


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

  // Removed theme state and toggleTheme function

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch("/api/method/login", {
        // Relative URL, assuming proxy
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let detailMsg =
          responseData.message ||
          (responseData._server_messages &&
            (JSON.parse(responseData._server_messages)[0]?.message ||
              JSON.parse(responseData._server_messages)[0])) ||
          responseData.exception ||
          "Unknown server error";

        toast.current?.show({
          severity: "error",
          summary: `Login Error: ${response.status}`,
          detail: detailMsg,
          life: 7000,
        });
        throw new Error(detailMsg);
      }

      toast.current?.show({
        severity: "success",
        summary: "Logged In!",
        detail: "Welcome back, " + responseData.full_name + "!",
        life: 3000,
      });

      if (getUserCookie) getUserCookie();
      if (updateCurrentUser) await updateCurrentUser();
    } catch (err) {
      const isSpecificErrorHandled = toast.current
        ?.getAll()
        .some((t) => t.summary && t.summary.startsWith("Login Error:"));

      if (!isSpecificErrorHandled) {
        toast.current?.show({
          severity: "error",
          summary: "Login Process Failed",
          detail: err.message || "An unexpected error occurred.",
          life: 5000,
        });
      }
      throw err; // Allow LoginPage to handle its loading state
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.current?.show({
        severity: "info",
        summary: "Logged Out",
        detail: "You have been successfully logged out.",
        life: 3000,
      });
    } catch (err) {
      console.error("Logout failed:", err);
      toast.current?.show({
        severity: "error",
        summary: "Logout Error",
        detail: err.message || "Could not log out.",
        life: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface-ground">
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="8"
          fill="var(--surface-card)"
          animationDuration=".5s"
        />
      </div>
    );
  }

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
          <Route
            path="/*" // All other routes are protected
            element={
              currentUser ? (
                <LayoutProvider>
                  {" "}
                  {/* Provide layout context to authenticated routes */}
                  {/* MainLayout no longer expects theme-related props */}
                  <MainLayout user={currentUser} onLogout={handleLogout}>
                    <Routes>
                      {" "}
                      {/* Nested routes for authenticated area */}
                      <Route index element={<HomePage />} />
                      <Route path="home" element={<HomePage />} />
                      <Route path="employees" element={<EmployeesPage />} />
                      <Route
                        path="employees/view/:employeeId"
                        element={<ViewEmployeePage />}
                      />
                      <Route
                        path="employees/edit/:employeeId"
                        element={<EditEmployeePage />}
                      />
                      <Route
                        path="/employees/new"
                        element={
                            <EditEmployeePage />
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />{" "}
                      {/* Fallback for unknown authenticated routes */}
                    </Routes>
                  </MainLayout>
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
