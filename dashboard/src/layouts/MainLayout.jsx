// src/layouts/MainLayout.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react"; // Added useContext
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { CSSTransition } from "react-transition-group";
import { Tooltip } from "primereact/tooltip";
import { ContextMenu } from "primereact/contextmenu";
import { PrimeReactContext } from "primereact/api"; // Import PrimeReactContext

// ThemeToggleButton and SidebarNavigation components remain the same as previous correct version

const ThemeToggleButton = ({ currentTheme, onSetTheme }) => {
  const cycleTheme = () => {
    if (currentTheme === "light") onSetTheme("dark");
    else if (currentTheme === "dark") onSetTheme("system");
    else onSetTheme("light"); // system goes to light
  };

  const getIcon = () => {
    if (currentTheme === "light") return "pi pi-sun";
    if (currentTheme === "dark") return "pi pi-moon";
    return "pi pi-desktop"; // system
  };

  const getTooltip = () => {
    const capitalized =
      currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
    return `${capitalized} Mode (Click to change)`;
  };

  return (
    <Button
      icon={getIcon()}
      onClick={cycleTheme}
      className="bg-transparent p-2 rounded-full text-text-color-secondary hover:bg-surface-hover hover:text-text-color focus:outline-none"
      tooltip={getTooltip()}
      tooltipOptions={{ position: "bottom" }}
      aria-label={`Toggle theme, current: ${currentTheme}`}
    />
  );
};

const UserProfileSection = ({ user, onLogout, currentTheme, onSetTheme }) => {
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
      <ThemeToggleButton currentTheme={currentTheme} onSetTheme={onSetTheme} />
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

  const { changeTheme } = useContext(PrimeReactContext);
  // Initialize with the theme name corresponding to the initial link in index.html
  const [currentPrimeReactThemeName, setCurrentPrimeReactThemeName] =
    useState("lara-light-amber");

  const [themeSetting, setThemeSetting] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme || "system";
    }
    return "system";
  });

  const applyThemeStyleChanges = useCallback(
    (newSetting) => {
      if (typeof window === "undefined" || !changeTheme) return;

      let applyTailwindDarkClass;
      let newPRThemeName; // e.g., 'lara-light-amber' or 'lara-dark-amber'

      if (newSetting === "light") {
        applyTailwindDarkClass = false;
        newPRThemeName = "lara-light-amber";
      } else if (newSetting === "dark") {
        applyTailwindDarkClass = true;
        newPRThemeName = "lara-dark-amber";
      } else {
        // system
        applyTailwindDarkClass = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        newPRThemeName = applyTailwindDarkClass
          ? "lara-dark-amber"
          : "lara-light-amber";
      }

      document.documentElement.classList.toggle("dark", applyTailwindDarkClass);

      if (currentPrimeReactThemeName !== newPRThemeName) {
        const currentPRThemePath = `/themes/${currentPrimeReactThemeName}/theme.css`; // Path to current theme CSS
        const newPRThemePath = `/themes/${newPRThemeName}/theme.css`; // Path to new theme CSS

        changeTheme(currentPRThemePath, newPRThemePath, "theme-link", () => {
          setCurrentPrimeReactThemeName(newPRThemeName);
        });
      }
    },
    [changeTheme, currentPrimeReactThemeName]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", themeSetting);
    }
    applyThemeStyleChanges(themeSetting);

    let mediaQuery;
    if (themeSetting === "system") {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const systemThemeChangeHandler = () => applyThemeStyleChanges("system"); // Re-evaluate system
      mediaQuery.addEventListener("change", systemThemeChangeHandler);
      return () =>
        mediaQuery.removeEventListener("change", systemThemeChangeHandler);
    }
  }, [themeSetting, applyThemeStyleChanges]);

  // Effect to set initial state of currentPrimeReactThemeName and apply theme on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialSetting = localStorage.getItem("theme") || "system";
    let initialEffectiveDark = false;
    if (initialSetting === "dark") {
      initialEffectiveDark = true;
    } else if (initialSetting === "system") {
      initialEffectiveDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    }
    setCurrentPrimeReactThemeName(
      initialEffectiveDark ? "lara-dark-amber" : "lara-light-amber"
    );
    applyThemeStyleChanges(initialSetting);
  }, []);

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
      <div className="flex flex-1 bg-surface-0 dark:bg-surface-50 overflow-hidden">
        <aside className="w-20 flex flex-col z-10 shrink-0">
          <div className="p-4 flex items-center justify-center h-16 shrink-0">
            <img
              src="/logo.png"
              alt="Rua Company Logo"
              className="h-8 dark:invert"
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
              <UserProfileSection
                user={user}
                onLogout={onLogout}
                currentTheme={themeSetting}
                onSetTheme={setThemeSetting}
              />
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
