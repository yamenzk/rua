// src/pages/HomePage.jsx
import React from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";

const HomePage = ({ user, onLogout }) => {
  // Assuming `user` is the username string
  const userInitial = user ? user.substring(0, 1).toUpperCase() : "?";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card
        title="Home Dashboard"
        className="w-full max-w-2xl shadow-lg rounded-lg"
      >
        <div className="flex flex-col items-center gap-6 p-4">
          <Avatar
            label={userInitial}
            size="xlarge"
            shape="circle"
            className="bg-amber-500 text-white text-2xl"
          />
          <h2 className="text-2xl font-semibold text-gray-700">
            Welcome, <span className="text-amber-600">{user}!</span>
          </h2>
          <p className="text-gray-600">
            You are successfully logged in.
          </p>

          <div className="mt-6 border-t pt-6 w-full text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Application Content
            </h3>
            <p className="text-gray-500">
              Current user: <strong>{user}</strong>
            </p>
            {/* You can add more application-specific content here */}
          </div>

          <Button
            label="Logout"
            icon="pi pi-sign-out"
            onClick={onLogout}
            className="p-button-danger p-button-outlined mt-8"
          />
        </div>
      </Card>
    </div>
  );
};

export default HomePage;