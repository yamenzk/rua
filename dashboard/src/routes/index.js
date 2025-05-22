// src/routes/index.js - Pure JS configuration (no JSX)
import { lazy } from "react";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("@/pages/HomePage"));
const EmployeesPage = lazy(() => import("@/pages/employee/EmployeesPage"));
const ViewEmployeePage = lazy(() => import("@/pages/employee/doc/ViewEmployeePage"));
const EditEmployeePage = lazy(() => import("@/pages/employee/doc/EditEmployeePage"));

// Route configuration without JSX elements
export const routeGroups = {
	dashboard: [
		{
			path: "/",
			component: HomePage,
			index: true,
		},
		{
			path: "/home",
			component: HomePage,
		},
	],
	employees: [
		{
			path: "/employees",
			component: EmployeesPage,
		},
		{
			path: "/employees/view/:employeeId",
			component: ViewEmployeePage,
		},
		{
			path: "/employees/edit/:employeeId",
			component: EditEmployeePage,
		},
		{
			path: "/employees/new",
			component: EditEmployeePage,
		},
	],
	fallback: [
		{
			path: "*",
			redirect: "/",
		},
	],
};

// Flatten all routes
export const routeConfig = Object.values(routeGroups).flat();

// Individual route groups
export const { dashboard, employees, fallback } = routeGroups;
