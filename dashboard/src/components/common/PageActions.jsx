// src/components/common/PageActions.jsx
import React, { useRef } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";

const PageActions = ({
  primaryAction,
  secondaryActions = [],
  menuActions = [],
}) => {
  const menuRef = useRef(null);

  // Don't render if no actions are provided
  if (
    !primaryAction &&
    secondaryActions.length === 0 &&
    menuActions.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Secondary Actions - Icon only buttons */}
      {secondaryActions.map((action, index) => (
        <Button
          key={`secondary-${index}`}
          icon={action.icon}
          text
          rounded
          onClick={action.command}
          disabled={action.disabled}
          loading={action.loading}
          className={`
            text-text-color-secondary hover:text-text-color hover:bg-surface-hover
            ${action.className || ""}
          `}
          tooltip={action.label}
          tooltipOptions={{ position: "bottom" }}
        />
      ))}

      {/* Primary Action - Most prominent */}
      {primaryAction && (
        <Button
          label={primaryAction.showLabel ? primaryAction.label : undefined}
          icon={primaryAction.icon}
          onClick={primaryAction.command}
          disabled={primaryAction.disabled}
          loading={primaryAction.loading}
          className={`
            bg-primary-color text-primary-color-text hover:bg-primary-600
            ${primaryAction.className || ""}
          `}
          tooltip={!primaryAction.showLabel ? primaryAction.label : undefined}
          tooltipOptions={{ position: "bottom" }}
        />
      )}

      {/* Menu Actions - Overflow menu */}
      {menuActions.length > 0 && (
        <>
          <Menu model={menuActions} popup ref={menuRef} className="mt-2" />
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            onClick={(e) => menuRef.current?.toggle(e)}
            className="text-text-color-secondary hover:text-text-color hover:bg-surface-hover"
            tooltip="More Actions"
            tooltipOptions={{ position: "bottom" }}
          />
        </>
      )}
    </div>
  );
};

export default PageActions;
