// src/components/common/AppBreadcrumb.jsx
import React from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Link } from "react-router-dom";

const AppBreadcrumb = ({ items, home }) => {
  const processedHome = home
    ? {
        ...home,
        template:
          home.url && home.icon
            ? () => (
                <Link to={home.url} className="p-breadcrumb-home p-link">
                  <span className={home.icon}></span>
                </Link>
              )
            : home.template,
      }
    : undefined;

  const processedItems = items.map((item) => ({
    ...item,
    template: item.template
      ? item.template
      : item.url
      ? () => (
          // Ensure template returns a function for PrimeReact
          <Link to={item.url} className="p-menuitem-link">
            <span className="p-menuitem-text">{item.label}</span>
          </Link>
        )
      : () => <span className="p-menuitem-text">{item.label}</span>, // Non-clickable
  }));

  return (
    // The mb-4 class from the div can be removed if spacing is handled by the Header
    // <div className="mb-4">
    <BreadCrumb
      model={processedItems}
      home={processedHome}
      pt={{
        root: {
          className: "border-none bg-transparent p-0", // Remove border, background, and padding
        },
        menuitem: {
          // Targets the <li> element
          className: "text-sm", // Reduce font size for the whole item
        },
        label: {
          // Targets the <span> containing the label text
          className: "text-sm", // Alternative: reduce font size specifically for the label
        },
        action: {
          // Targets the <a> tag
          className: "text-sm", // Apply to link font size as well
        },
        separator: {
          className: "text-sm mx-1", // Adjust separator font size and margin if needed
        },
        // Add other PT options as needed, for example, to style the home icon or separators
      }}
    />
    // </div>
  );
};

export default AppBreadcrumb;
