// src/pages/LoginPage.jsx
import React, { useState, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Image } from "primereact/image";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [passwordState, setPasswordState] = useState("");
  const [loading, setLoading] = useState(false);
  const localToast = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !passwordState.trim()) {
      localToast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Username and password cannot be empty.",
        life: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      await onLogin({ usr: username, pwd: passwordState });
    } catch (error) {
      localToast.current?.show({
        severity: "error",
        summary: "Login Failed",
        detail: error.message || "An unexpected error occurred.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const cardHeader = (
    <div className="flex flex-col items-center justify-center pt-8 pb-4">
      <Image
        src="/logo.png" // Ensure this is in your public folder
        alt="Rua Company Logo"
        width="120"
        className="mb-4"
        onError={(e) => {
          e.currentTarget.onerror = null; // prevent looping
          e.currentTarget.src =
            "https://placehold.co/120x60/FDBF63/FFFFFF?text=Rua+Logo";
        }}
      />
      <h1 className="text-3xl font-bold text-text-color">Welcome to Rua</h1>
      <p className="text-text-color-secondary mt-1">
        Sign in to access your account
      </p>
    </div>
  );

  return (
    // Added bg-surface-ground here for consistent page background
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-ground">
      <Toast ref={localToast} position="top-center" />
      <Card
        className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden bg-surface-card" // Explicitly set Card background if needed, though theme usually handles it
      >
        {cardHeader}
        <form onSubmit={handleSubmit} className="p-fluid px-6 pb-6 pt-4">
          <div className="mb-6">
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-user"></InputIcon>
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or Email"
                className="w-full rounded-lg"
              />
            </IconField>
          </div>

          <div className="mb-6">
            {/* PrimeReact Password component often works best when its parent doesn't try to over-constrain width with 'w-full' directly on component tag if inputClassName is also w-full.
                But if it works, it's fine. */}
            <Password
              id="password"
              value={passwordState}
              onChange={(e) => setPasswordState(e.target.value)}
              placeholder="Password"
              toggleMask
              feedback={false}
              inputClassName="w-full rounded-lg" 
              // className="w-full" // This styles the wrapper; might be redundant if inputClassName="w-full" is used
              pt={{ root: { className: "w-full" } }} 
            />
          </div>

          <Button
            type="submit"
            label={loading ? "Signing In..." : "Sign In"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            className="w-full p-button-lg rounded-lg" 
            loading={loading}
            disabled={loading || !username.trim() || !passwordState.trim()} // Disable if empty
          />
        </form>
      </Card>
      <footer className="mt-8 text-center">
        <p className="text-sm text-text-color-secondary">
          &copy; {new Date().getFullYear()} Rua Company Glass & Aluminum L.L.C
          O.P.C.
        </p>
        <p className="text-xs text-text-color-secondary opacity-75 mt-1">
          All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
