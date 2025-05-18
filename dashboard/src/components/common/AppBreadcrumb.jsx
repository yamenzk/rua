// src/components/AppBreadcrumb.jsx
import React from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { Link } from "react-router-dom"; // Using react-router-dom Link

const AppBreadcrumb = ({ items, home }) => {
  // Ensure home object has a template if it needs to use React Router Link
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
    template: item.template ? (
      item.template
    ) : item.url ? (
      <Link to={item.url} className="p-menuitem-link">
        <span className="p-menuitem-text">{item.label}</span>
      </Link>
    ) : (
      <span className="p-menuitem-text">{item.label}</span> // Non-clickable
    ),
  }));

  return (
    <div className="mb-4">
      {" "}
      {/* Added margin-bottom for spacing */}
      <BreadCrumb model={processedItems} home={processedHome} />
    </div>
  );
};

export default AppBreadcrumb;
