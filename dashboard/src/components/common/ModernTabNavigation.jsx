// src/components/common/ModernTabNavigation.jsx
import React from "react";

const ModernTabNavigation = ({ tabs = [], activeIndex = 0, onTabSelect }) => {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-5 bg-surface-0 rounded-3xl overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) => (
          <button
            key={tab.id || `tab-${index}`}
            onClick={() => onTabSelect?.(index, tab)}
            disabled={tab.disabled}
            className={`
              relative px-4 py-2.5 rounded-3xl font-medium text-sm transition-all duration-200 whitespace-nowrap
              ${
                index === activeIndex
                  ? "bg-surface-card text-text-color shadow-sm border border-surface-border"
                  : "text-text-color-secondary hover:text-text-color hover:bg-surface-card/50"
              }
              ${
                tab.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            {/* Tab Icon */}
            {tab.icon && <i className={`${tab.icon} mr-2`}></i>}

            {/* Tab Label */}
            <span>{tab.label}</span>

            {/* Active Indicator */}
            {index === activeIndex && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500/5 to-primary-600/5 pointer-events-none" />
            )}

            {/* Badge/Count */}
            {tab.badge && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-surface-200 text-text-color-secondary rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Scroll Indicator */}
      <div className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-l from-surface-ground to-transparent pointer-events-none" />
    </div>
  );
};

export default ModernTabNavigation;
