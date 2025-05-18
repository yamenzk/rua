// src/layouts/Sidebar.jsx
import React from "react";
import SidebarNavigation from "@/components/layout/SidebarNavigation"; 

const Sidebar = () => {
  return (
    <aside className="w-20 flex flex-col z-10 shrink-0">
      <div className="p-4 flex items-center justify-center h-16 shrink-0">
        <img
          src="/logo.png" 
          alt="Rua Company Logo"
          className="h-8"
          onError={(e) => {
            e.currentTarget.style.display = "none"; 
            console.error("Logo failed to load");
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <SidebarNavigation />
      </div>
    </aside>
  );
};

export default Sidebar;
