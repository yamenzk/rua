// src/App.jsx

import React, { useRef, useEffect } from "react";

import { useFrappeAuth } from "frappe-react-sdk";

import LoginPage from "./pages/LoginPage";

import HomePage from "./pages/HomePage";

import MainLayout from "./layouts/MainLayout"; // Import MainLayout

import { Toast } from "primereact/toast";

import { ProgressSpinner } from "primereact/progressspinner";

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

  // useEffect(() => {

  // console.log(

  // "App.jsx Effect Triggered: currentUser:", currentUser,

  // "isLoading:", isLoading,

  // "authError:", authError ? authError.message : null

  // );

  // }, [currentUser, isLoading, authError]);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch("http://localhost:8080/api/method/login", {
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

      throw err;
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

        detail: "Could not log out.",

        life: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface-ground">
        {" "}
        {/* Use theme variable for loading screen bg */}
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
      toast.current?.show({
        severity: "error",

        summary: "Authentication SDK Error",

        detail: authError.message || "An SDK error occurred.",

        life: 5000,
      });
    }
  }

  return (
    <>
      <Toast ref={toast} position="top-right" />

      {currentUser ? (
        <MainLayout user={currentUser} onLogout={handleLogout}>
          <HomePage />

          {/* Removed user prop from HomePage, MainLayout now has it for header */}

          {/* You might want to pass user to HomePage if it specifically needs it in its direct content */}
        </MainLayout>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
