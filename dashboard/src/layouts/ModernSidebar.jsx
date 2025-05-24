// src/layouts/ModernSidebar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ModernSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const navigationItems = [
    {
      icon: "pi pi-home",
      path: "/",
      label: "Home",
    },
    {
      icon: "pi pi-clock",
      path: "/recent",
      label: "Recent",
    },
    {
      icon: "pi pi-calendar",
      path: "/calendar",
      label: "Calendar",
    },
    {
      icon: "pi pi-cog",
      path: "/settings",
      label: "Settings",
    },
  ];

  const handleNavigation = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  return (
    <aside className="w-16 flex flex-col items-center pl-6">
      {/* Top spacer to align with main content area */}
      <div className="h-36"></div>

      <nav className="flex flex-col gap-4 w-full">
        {navigationItems.map((item) => (
          <div key={item.path} className="relative group">
            <button
              onClick={() => handleNavigation(item.path)}
              className={`
                w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 mx-auto
                ${
                  activeItem === item.path
                    ? "bg-primary-color text-primary-color-text shadow-lg"
                    : "text-text-color-secondary hover:text-text-color hover:bg-surface-card hover:shadow-sm"
                }
              `}
              title={item.label}
            >
              <i className={`${item.icon} text-lg`}></i>
            </button>

            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-surface-900 text-surface-0 text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              {item.label}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom spacer */}
      <div className="flex-1"></div>
    </aside>
  );
};

export default ModernSidebar;
