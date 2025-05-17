// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FrappeProvider } from "frappe-react-sdk";
import { PrimeReactProvider } from "primereact/api";
import "./index.css";

function getFrappeSiteName() {
  if (window.frappe && window.frappe.boot && window.frappe.boot.site_name) {
    if (
      window.frappe.boot.versions &&
      (window.frappe.boot.versions.frappe?.startsWith("15") ||
        window.frappe.boot.versions.frappe?.startsWith("16"))
    ) {
      return window.frappe.boot.site_name;
    }
  }
  if (import.meta.env.VITE_SITE_NAME) {
    return import.meta.env.VITE_SITE_NAME;
  }
  console.warn(
    "Frappe site name could not be determined. Ensure VITE_SITE_NAME is in .env.local or frappe.boot is configured."
  );
  return undefined;
}

const siteNameValue = getFrappeSiteName();
const socketPortValue = import.meta.env.VITE_SOCKET_PORT;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <FrappeProvider
        url="http://localhost:8080"
        siteName={siteNameValue}
        socketPort={socketPortValue}
      >
        <App />
      </FrappeProvider>
    </PrimeReactProvider>
  </React.StrictMode>
);
