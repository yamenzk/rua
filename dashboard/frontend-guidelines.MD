# Rua App: Frontend Development Guidelines

**Version: 2.0**
**Last Updated:** May 17, 2025

This document outlines the established preferences and guidelines for frontend development in the Rua application. It focuses on PrimeReact components, styling with Tailwind CSS, layout principles, state management strategies, and the detailed usage of the `frappe-react-sdk`.

## 1. Core Philosophy & Design Language

* **Overall Aesthetic:** Modern, clean, professional, and user-centric. Interfaces should be intuitive and visually appealing.
* **Branding:**
    * **Logo:** The "Rua" company logo (`logo.png`) is to be used on the login page and other key branding touchpoints (e.g., application header if applicable). Ensure `favicon.png` is used for the browser icon.
    * **Company Name:** Use "Rua" for general display. For formal contexts like page footers, use the full legal name: "Rua Company Glass & Aluminum L.L.C O.P.C".
* **Accessibility:** Strive to meet WCAG AA standards where feasible. Ensure good color contrast, keyboard navigability, and semantic HTML.

## 2. Styling, Theming, and Layout

### 2.1. Theming & Color Palette
* **PrimeReact Theme:** The application uses the "Lara Amber" PrimeReact theme family. Theme switching between light (`lara-light-amber`) and dark (`lara-dark-amber`) modes should be supported.
* **Backgrounds:**
    * Page backgrounds should primarily be dictated by the active PrimeReact theme's `--surface-ground` CSS variable. Avoid hardcoding page background colors with Tailwind utilities like `bg-gray-100` to allow seamless theme switching.
    * Card backgrounds and similar surfaces should use the theme's `--surface-card` variable.
* **Text Colors:**
    * Utilize PrimeReact's theme-aware CSS variables for text, mapped to Tailwind utilities (see Section 2.3).
        * Primary text: `text-text-color`
        * Secondary/subtle text: `text-text-color-secondary`
        * Adjust opacity (e.g., `opacity-75`) for finer control over subtlety.
* **Accent Colors:** The Lara Amber theme's amber shades (available via `primary-color` and `primary-50` through `primary-900` in the Tailwind config) should be used for primary actions, highlights, and interactive elements to maintain brand consistency.

### 2.2. Layout & Structure
* **Responsiveness:** Design for a fully responsive experience using Tailwind CSS's responsive prefixes (`sm:`, `md:`, `lg:`, etc.).
* **Structure:** Employ Tailwind CSS flexbox (`flex`) and grid (`grid`) utilities for page and component layouts.
* **Spacing:** Maintain consistent spacing using Tailwind's spacing scale.
* **Containers:** PrimeReact `Card` components are preferred for grouping related content and actions.

### 2.3. Tailwind CSS Configuration
* Tailwind CSS is used for utility-first styling and complements PrimeReact.
* **Theme Integration:** The `tailwind.config.js` file is extended to include PrimeReact's theme CSS variables, allowing Tailwind utility classes to use theme-aware colors.

    ```javascript
    // tailwind.config.js (Relevant excerpt)
    module.exports = {
      // darkMode: 'class', // or 'media'
      theme: {
        extend: {
          colors: {
            'text-color': 'var(--text-color)',
            'text-color-secondary': 'var(--text-color-secondary)',
            'primary-color': 'var(--primary-color)',
            'primary-color-text': 'var(--primary-color-text)',
            'surface-ground': 'var(--surface-ground)',
            'surface-card': 'var(--surface-card)',
            // ... (include all surface, primary, and other palette colors as previously defined)
            primary: generateColorShades('primary'), // Helper function generates 50-900
            gray: generateColorShades('gray'),
            // ... other palette colors
          },
          borderRadius: {
            'DEFAULT': '0.5rem', // Default for `rounded` class
            'theme': 'var(--border-radius)', // PrimeReact's specific default
            // xl: '0.75rem' (used for login card)
          },
          // ... other extensions like fontFamily, boxShadow, spacing
        },
      },
    };
    ```
    *(Ensure the `generateColorShades` helper function is present in your actual `tailwind.config.js`)*

### 2.4. Border Radius
* **Default:** A default border radius of `0.5rem` (equivalent to Tailwind's `rounded-lg`) is preferred for most elements like inputs and buttons. This is set as `borderRadius.DEFAULT` in `tailwind.config.js`.
* **Cards:** Larger cards may use a slightly larger radius, e.g., `rounded-xl` (0.75rem).
* Apply rounding consistently using Tailwind classes (e.g., `rounded`, `rounded-xl`).

## 3. PrimeReact Component Usage

* **Primary UI Library:** Leverage PrimeReact components extensively.
* **Styling Components:**
    1.  Use built-in props first.
    2.  Apply Tailwind CSS utility classes via `className` for layout and minor style adjustments.
    3.  Use the `pt` (PassThrough) prop for fine-grained control over internal elements if necessary, but with caution to avoid excessive theme overrides.
* **Input Fields (`InputText`, `Password`):**
    * Use standard `placeholder` attributes. Avoid `FloatLabel` if it introduces alignment complexities with icons.
    * For inputs with icons: Utilize `<IconField iconPosition="left"><InputIcon className="pi pi-..." /><InputText ... /></IconField>`.
    * `Password` component: Use `toggleMask` prop and `feedback={false}`. Style the internal input using `inputClassName="w-full rounded"` (or `rounded-lg`).
* **Buttons (`Button`):**
    * Primary action buttons should reflect the theme's primary color (amber). This is typically handled by default for standard buttons or by adding `p-button-primary`. Use `className` for specific sizing (e.g., `p-button-lg`) and rounding (`rounded-lg` or just `rounded`).
    * Include icons where they enhance clarity (`icon="pi pi-..."`).
    * Always provide user feedback for actions using the `loading` prop.

## 4. State Management

* **Server State:** **SWR (via `frappe-react-sdk`) is the primary solution for managing server state.** This includes fetching, caching, revalidating, and updating data that originates from the Frappe backend. Its built-in features should be leveraged to handle data fetching lifecycles.
* **Client-Side State:**
    * **Local Component State:** For state that is confined to a single component, use React's `useState` or `useReducer`.
    * **Shared/Global Client State:**
        1.  **React Context API:** For simple global UI state that doesn't update with high frequency (e.g., theme toggles, basic user preferences not tied to backend).
        2.  **Lightweight Store (e.g., Zustand):** If Context becomes insufficient (due to performance concerns with frequent updates or excessive prop drilling), a minimal store like Zustand can be considered. Avoid if not strictly necessary.
    * **Avoid Redux:** Given the capabilities of SWR for server state, a complex state management library like Redux is generally not needed unless client-side state complexity becomes exceptionally high.

## 5. Frappe React SDK Usage Guide (`frappe-react-sdk`)

The `frappe-react-sdk` integrates SWR for robust data handling.

### 5.1. Setup (`FrappeProvider`)

Ensure `FrappeProvider` wraps the application, configured with `url`, `siteName`, and `socketPort` as appropriate.

```javascript
// src/main.jsx
import { FrappeProvider } from "frappe-react-sdk";
// ...
ReactDOM.createRoot(document.getElementById("root")).render(
  <FrappeProvider url="http://localhost:8080" siteName={siteNameValue} socketPort={socketPortValue}>
    <App />
  </FrappeProvider>
);
5.2. Authentication (useFrappeAuth)Manages user authentication state and provides related functions.import { useFrappeAuth } from "frappe-react-sdk";

const {
  currentUser, isLoading, error, logout, updateCurrentUser, getUserCookie
} = useFrappeAuth();
Login (Custom Implementation):Due to an identified issue with the SDK's login function sending an empty payload, a manual fetch request is used for the login process. After a successful manual login:Call getUserCookie(): This updates the SDK's internal awareness of the browser's session cookie.Call await updateCurrentUser(): This triggers the SDK (via SWR) to re-fetch the logged-in user's status, which updates the currentUser state.// Example in App.jsx handleLogin
// ... successful manual fetch ...
if (getUserCookie) getUserCookie();
if (updateCurrentUser) await updateCurrentUser();
Logout: Use await logout();. This interacts with the backend to invalidate the session and updates the SDK's local state.currentUser: This state variable reflects the currently logged-in user (typically the username/email). It will be null or undefined if no user is logged in. The application's navigation (e.g., showing LoginPage vs. HomePage) is conditioned on this value.isLoading: Indicates if the SDK is currently fetching/validating the user's authentication state. Useful for showing loading spinners.error: Contains any error object related to authentication state fetching.5.3. Data Fetching (Docs, Lists, Counts - SWR-based)Single Documents: useFrappeGetDoc("Doctype", "docname", { /* SWR options */ })Document Lists: useFrappeGetDocList("Doctype", { fields: [], filters: [], limit: 10, orderBy: {} }, { /* SWR options */ })GetDocListArgs: Use this type for arguments like fields, filters, orFilters, limit_start, limit, orderBy, asDict.Document Count: useFrappeGetDocCount("Doctype", [["field", "=", "value"]])Prefetching: useFrappePrefetchDoc, useFrappePrefetchDocList, useFrappePrefetchDocCount can be used to load data into the SWR cache proactively (e.g., on hover).5.4. Data Mutation (Create, Update, Delete - Stateful Hooks)These hooks return an object with a mutation function (createDoc, updateDoc, deleteDoc), loading, error, isCompleted, and reset states.Create: useFrappeCreateDoc() -> await createDoc("Doctype", { ...data })Update: useFrappeUpdateDoc() -> await updateDoc("Doctype", "docname", { ...updatedData })Delete: useFrappeDeleteDoc() -> await deleteDoc("Doctype", "docname")5.5. Generic API CallsGET (SWR-based): useFrappeGetCall("method.path", { params }, { /* SWR options */ })POST/PUT/DELETE (Stateful Hooks):useFrappePostCall("method.path") -> await call({ params })useFrappePutCall("method.path") -> await call({ params })useFrappeDeleteCall("method.path") -> await call({ params })5.6. File Uploads (useFrappeFileUpload)Provides upload, progress, loading, error, isCompleted, reset.await upload(file, { is_private: 1, doctype: "...", docname: "...", fieldname: "..." })5.7. Searching (useSearch - Frappe v15+)SWR-based hook for Frappe's link search.useSearch("Doctype", "searchText", [{ /* filters */ }], limit, debounceDelay)5.8. Realtime Events (Socket.IO)Ensure FrappeProvider is configured with enableSocket, siteName, and socketPort.useFrappeEventListener("custom_event", callback)useFrappeDocumentEventListener("Doctype", "docname", onUpdateCallback)useFrappeDocTypeEventListener("Doctype", onListUpdateCallback)5.9. SWR - Key PrinciplesServer State Authority: SWR is the source of truth for server state.Automatic Revalidation: Leverages SWR's revalidation on focus, interval, and reconnect (configurable) to keep data fresh.Caching: Reduces redundant API calls by serving cached data first.mutate: The mutate function returned by SWR-based hooks (including updateCurrentUser from useFrappeAuth) is key for programmatically triggering re-fetches or performing optimistic updates.6. Code Quality and ConventionsFollow standard React best practices (functional components, hooks).Keep components small and focused on a single responsibility.