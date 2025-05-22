// src/components/RouteRenderer.jsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
    <ProgressSpinner strokeWidth="4" />
  </div>
);

// Wrapper for lazy-loaded components
const LazyRoute = ({ Component, ...props }) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);

// Route renderer component
const RouteRenderer = ({ routes }) => {
  return (
    <Routes>
      {routes.map((route, index) => {
        if (route.redirect) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to={route.redirect} replace />}
            />
          );
        }

        if (route.component) {
          return (
            <Route
              key={index}
              path={route.path}
              index={route.index}
              element={<LazyRoute Component={route.component} />}
            />
          );
        }

        // Fallback for routes with direct elements
        return <Route key={index} {...route} />;
      })}
    </Routes>
  );
};

export default RouteRenderer;
