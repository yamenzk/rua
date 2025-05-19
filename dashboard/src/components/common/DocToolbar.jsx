// src/components/common/DocToolbar.jsx
import React from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Avatar } from "primereact/avatar"; // Import Avatar

const DocToolbar = ({
  title,
  primaryActions = [],
  secondaryActions = [],
  onBack,
  leftContent, // New prop for custom content on the left
}) => {
  const menuRef = React.useRef(null);

  const moreActionsModel = secondaryActions
    .filter((action) => action.visible !== false)
    .map((action) => ({
      label: action.label,
      icon: action.icon,
      command: action.command,
      disabled: action.disabled,
      className: action.className,
      style: action.style,
      visible: action.visible !== false,
    }));

  return (
    <div className="doc-toolbar bg-surface-section p-3 md:p-4 m-4 rounded-2xl shadow-sm sticky top-0 z-50">
      {" "}
      {/* Made sticky */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Back button, Custom Left Content, and Optional Title */}
        <div className="flex items-center gap-3 flex-grow">
          {onBack && (
            <Button
              icon="pi pi-arrow-left"
              text
              rounded
              aria-label="Back"
              onClick={onBack}
              className="p-button-secondary text-text-color-secondary hover:text-primary-color hover:bg-surface-hover flex-shrink-0"
              tooltip="Back"
              tooltipOptions={{ position: "bottom" }}
            />
          )}
          {/* Custom content area */}
          {leftContent && (
            <div className="flex items-center gap-3">{leftContent}</div>
          )}

          {/* Optional Title - can be removed if page title is always handled by LayoutContext via Header */}
          {title && !leftContent && (
            <h2 className="text-xl font-semibold text-text-color m-0 truncate">
              {title}
            </h2>
          )}
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {primaryActions
            .filter((action) => action.visible !== false)
            .map((action, index) => (
              <Button
                key={action.id || `primary-action-${index}`}
                label={action.label}
                icon={action.icon}
                onClick={action.command}
                className={`p-button-sm rounded-md ${
                  action.className || "p-button-primary"
                }`}
                disabled={action.disabled}
                loading={action.loading}
                tooltip={action.tooltip}
                tooltipOptions={{ position: "top", ...action.tooltipOptions }}
                visible={action.visible !== false}
              />
            ))}
          {moreActionsModel.length > 0 && (
            <>
              <Menu
                model={moreActionsModel}
                popup
                ref={menuRef}
                id="doc_toolbar_actions_menu"
              />
              <Button
                icon="pi pi-ellipsis-v"
                text
                rounded
                aria-label="More actions"
                onClick={(event) => menuRef.current?.toggle(event)}
                aria-haspopup
                aria-controls="doc_toolbar_actions_menu"
                className="p-button-secondary text-text-color-secondary hover:text-primary-color hover:bg-surface-hover"
                tooltip="More Actions"
                tooltipOptions={{ position: "top" }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocToolbar;
