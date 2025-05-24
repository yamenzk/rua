// src/layouts/ModernHeader.jsx
import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";

const ModernHeader = ({ user, onLogout }) => {
  const [searchValue, setSearchValue] = useState("");
  const userMenuRef = useRef(null);

  const userMenuItems = [
    {
      label: "Profile",
      icon: "pi pi-user",
      command: () => console.log("Profile clicked"),
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      command: () => console.log("Settings clicked"),
    },
    { separator: true },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: onLogout,
    },
  ];

  return (
    <header className="px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo/Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-color rounded-lg flex items-center justify-center">
              <i className="pi pi-bars text-primary-color-text text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-text-color">Portfolio</h1>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="pi pi-search text-text-color-secondary"></i>
            </div>
            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for anything..."
              className="w-full pl-10 pr-4 py-2 rounded-3xl"
            />
          </div>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            icon="pi pi-moon"
            text
            rounded
            className="text-text-color-secondary hover:text-text-color hover:bg-surface-hover"
            aria-label="Toggle theme"
          />

          {/* Add Button */}
          <Button
            icon="pi pi-plus"
            rounded
            size="small"
            className="bg-primary-color hover:bg-primary-600 border-primary-color hover:border-primary-600"
            aria-label="Add new"
          />

          {/* Notifications */}
          <div className="relative">
            <Button
              icon="pi pi-bell"
              text
              rounded
              className="text-text-color-secondary hover:text-text-color hover:bg-surface-hover"
              aria-label="Notifications"
            />
            <Badge
              value="3"
              severity="danger"
              className="absolute -top-1 -right-1"
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Avatar
              label={user ? user.substring(0, 1).toUpperCase() : "U"}
              shape="circle"
              size="normal"
              className="cursor-pointer bg-primary-color text-primary-color-text"
              onClick={(e) => userMenuRef.current?.toggle(e)}
            />
            <div className="hidden md:block">
              <div className="text-sm font-medium text-text-color">
                {user || "User"}
              </div>
            </div>
            <Menu
              model={userMenuItems}
              popup
              ref={userMenuRef}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;
