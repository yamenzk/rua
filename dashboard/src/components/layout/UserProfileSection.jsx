// src/components/UserProfileSection.jsx
import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { ContextMenu } from "primereact/contextmenu";

const UserProfileSection = ({ user, onLogout }) => {
  const cm = useRef(null);
  const menuModel = [
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => onLogout(),
    },
  ];

  return (
    <div className="flex items-center gap-3 ml-auto">
      <div
        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-surface-hover"
        onClick={(event) => cm.current.show(event)}
        aria-controls="user_actions_menu"
        aria-haspopup
      >
        <Avatar
          label={user ? user.substring(0, 1).toUpperCase() : "U"}
          shape="circle"
          className="bg-primary-color text-primary-color-text"
          size="normal"
        />
        <span className="font-medium text-text-color hidden md:block">
          {user}
        </span>
      </div>
      <ContextMenu
        model={menuModel}
        ref={cm}
        id="user_actions_menu"
        breakpoint="767px"
        className="w-auto max-w-[180px] text-sm"
      />
    </div>
  );
};

export default UserProfileSection;
