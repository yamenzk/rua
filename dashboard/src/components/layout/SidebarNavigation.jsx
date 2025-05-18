// src/components/SidebarNavigation.jsx
import React from "react";
import { Tooltip } from "primereact/tooltip";

const SidebarNavigation = () => {
  const navItems = [
    { label: "Dashboard", icon: "pi-th-large", path: "#" },
    { label: "Orders", icon: "pi-shopping-cart", path: "#" },
    { label: "Products", icon: "pi-tags", path: "#" },
    { label: "Customers", icon: "pi-users", path: "#" },
    { label: "Analytics", icon: "pi-chart-bar", path: "#" },
    { label: "Settings", icon: "pi-cog", path: "#" },
  ];

  return (
    <nav className="mt-4 flex-1">
      <ul>
        {navItems.map((item) => (
          <li key={item.label} className="mb-1">
            <Tooltip
              target={`.tooltip-target-${item.label
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              content={item.label}
              position="right"
            />
            <a
              href={item.path}
              className={`tooltip-target-${item.label
                .toLowerCase()
                .replace(/\s+/g, "-")}
                                flex items-center justify-center py-3 px-3 rounded-md text-text-color-secondary
                                hover:bg-surface-hover hover:text-text-color
                                transition-colors duration-150 group`}
            >
              <i className={`pi ${item.icon} text-xl`}></i>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNavigation;
