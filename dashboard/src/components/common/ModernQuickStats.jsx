// src/components/common/ModernQuickStats.jsx
import React from "react";

const ModernQuickStats = ({ stats = [] }) => {
  // Default stats if none provided
  const defaultStats = [
    {
      value: "45",
      label: "In Progress",
      badge: "0",
      color: "blue",
    },
    {
      value: "24",
      label: "Upcoming",
      badge: "0",
      color: "orange",
    },
    {
      value: "62",
      label: "Total Projects",
      color: "green",
    },
  ];

  const statsToRender = stats.length > 0 ? stats : defaultStats;

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "border-l-blue-500 bg-blue-50",
      orange: "border-l-orange-500 bg-orange-50",
      green: "border-l-green-500 bg-green-50",
      purple: "border-l-purple-500 bg-purple-50",
      red: "border-l-red-500 bg-red-50",
    };
    return colorMap[color] || "border-l-gray-500 bg-gray-50";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statsToRender.map((stat, index) => (
        <div
          key={index}
          className={`
            bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-l-4 
            ${getColorClasses(stat.color)}
            hover:shadow-md transition-shadow duration-200
          `}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{stat.label}</span>
                {stat.badge && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {stat.badge}
                  </span>
                )}
              </div>
            </div>
            {stat.icon && (
              <div
                className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${stat.color === "blue" ? "bg-blue-100 text-blue-600" : ""}
                ${
                  stat.color === "orange" ? "bg-orange-100 text-orange-600" : ""
                }
                ${stat.color === "green" ? "bg-green-100 text-green-600" : ""}
                ${
                  stat.color === "purple" ? "bg-purple-100 text-purple-600" : ""
                }
                ${stat.color === "red" ? "bg-red-100 text-red-600" : ""}
              `}
              >
                <i className={`${stat.icon} text-xl`}></i>
              </div>
            )}
          </div>

          {stat.trend && (
            <div className="mt-4 flex items-center gap-1 text-sm">
              <i
                className={`pi ${
                  stat.trend > 0
                    ? "pi-trending-up text-green-600"
                    : "pi-trending-down text-red-600"
                }`}
              ></i>
              <span
                className={stat.trend > 0 ? "text-green-600" : "text-red-600"}
              >
                {Math.abs(stat.trend)}%
              </span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModernQuickStats;
