// src/layouts/MainLayout.jsx
import React, {
  useState,
  useRef,
  useEffect,
} from "react"; 
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { CSSTransition } from "react-transition-group";
import { Tooltip } from "primereact/tooltip";
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

const MainLayout = ({ children, user, onLogout }) => {
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

  return (
    <div className="h-screen bg-surface-ground text-text-color flex">
      <div className="flex flex-1 bg-surface-0 overflow-hidden">
        <aside className="w-20 flex flex-col z-10 shrink-0">
          <div className="p-4 flex items-center justify-center h-16 shrink-0">
            <img
              src="/logo.png"
              alt="Rua Company Logo"
              className="h-8"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
            <SidebarNavigation />
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 md:px-6 z-0 shrink-0">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-text-color hidden sm:block">
                SaaS Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2">
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
                      placeholder="Search..."
                      className="w-full max-w-[200px] rounded-lg text-sm py-2 pl-3 pr-10"
                    />
                    <i
                      className="pi pi-times cursor-pointer text-text-color-secondary hover:text-text-color p-1 hover:bg-surface-hover rounded-full z-10 absolute right-[0.625rem] top-1/2 -translate-y-1/2"
                      onClick={() => {
                        setSearchActive(false);
                        setSearchTerm("");
                      }}
                      title="Clear search"
                    />
                  </span>
                </CSSTransition>
              </div>
              <UserProfileSection user={user} onLogout={onLogout} />
            </div>
          </header>

          <main
            style={{ boxShadow: "inset 0 3px 4px rgba(0, 0, 0, 0.1)" }}
            className=" flex-1 bg-surface-ground overflow-y-auto relative p-4 md:p-6 rounded-tl-3xl rounded-tr-xl"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
