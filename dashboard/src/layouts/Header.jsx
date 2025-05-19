// src/layouts/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { CSSTransition } from "react-transition-group";
import UserProfileSection from "@/components/layout/UserProfileSection"; // Adjust path as needed
import AppBreadcrumb from "@/components/common/AppBreadcrumb"; // Import AppBreadcrumb

const Header = ({ pageTitle, user, onLogout, breadcrumbItems, homeLink }) => {
  // Added breadcrumbItems and homeLink props
  const [searchActive, setSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchIconBtnRef = useRef(null);
  const searchInputSpanRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const toggleSearch = () => {
    if (searchActive && searchTerm) {
      console.log("Perform search for:", searchTerm);
    } else {
      setSearchActive(!searchActive);
    }
    if (!searchActive) setSearchTerm("");
  };

  const handleClearSearch = () => {
    setSearchActive(false);
    setSearchTerm("");
  };

  return (
    <header className="h-auto md:h-16 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 z-0 shrink-0 pt-2 md:pt-0">
      <div className="flex flex-col items-start w-full md:w-auto">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <div className="mt-1 md:mt-0 w-full">
            {" "}
            {/* Ensure breadcrumb fits well */}
            <AppBreadcrumb items={breadcrumbItems} home={homeLink} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 md:mt-0 self-end md:self-center">
        <div className="relative flex items-center">
          <CSSTransition
            nodeRef={searchIconBtnRef}
            in={!searchActive}
            timeout={200}
            classNames="fade-fast"
            unmountOnExit
          >
            <div ref={searchIconBtnRef}>
              <Button
                icon="pi pi-search"
                text
                aria-label="Open search"
                onClick={toggleSearch}
                className="p-2 rounded-full text-text-color-secondary hover:bg-surface-hover hover:text-text-color focus:outline-none"
              />
            </div>
          </CSSTransition>
          <CSSTransition
            nodeRef={searchInputSpanRef}
            in={searchActive}
            timeout={300}
            classNames="search-input"
            unmountOnExit
            onEntered={() => searchInputRef.current?.focus()}
          >
            <span
              ref={searchInputSpanRef}
              className="relative flex items-center"
            >
              <InputText
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchTerm) {
                    toggleSearch();
                  }
                }}
                placeholder="Search..."
                className="w-full max-w-[200px] rounded-lg text-sm py-2 pl-3 pr-10"
              />
              <i
                className="pi pi-times cursor-pointer text-text-color-secondary hover:text-text-color p-1 hover:bg-surface-hover rounded-full z-10 absolute right-[0.625rem] top-1/2 -translate-y-1/2"
                onClick={handleClearSearch}
                title="Clear search"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleClearSearch();
                }}
              />
            </span>
          </CSSTransition>
        </div>
        <UserProfileSection user={user} onLogout={onLogout} />
      </div>
    </header>
  );
};

export default Header;
