// src/hooks/useAuthHandler.js - Extract authentication logic
import { useCallback } from "react";

export const useAuthHandler = ({ toast, logout, updateCurrentUser, getUserCookie }) => {
	const handleLogin = useCallback(
		async (credentials) => {
			try {
				const response = await fetch("/api/method/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify(credentials),
				});

				const responseData = await response.json();

				if (!response.ok) {
					let detailMsg =
						responseData.message ||
						(responseData._server_messages &&
							(JSON.parse(responseData._server_messages)[0]?.message ||
								JSON.parse(responseData._server_messages)[0])) ||
						responseData.exception ||
						"Unknown server error";

					toast.current?.show({
						severity: "error",
						summary: `Login Error: ${response.status}`,
						detail: detailMsg,
						life: 7000,
					});
					throw new Error(detailMsg);
				}

				toast.current?.show({
					severity: "success",
					summary: "Logged In!",
					detail: "Welcome back, " + responseData.full_name + "!",
					life: 3000,
				});

				if (getUserCookie) getUserCookie();
				if (updateCurrentUser) await updateCurrentUser();
			} catch (err) {
				const isSpecificErrorHandled = toast.current
					?.getAll()
					.some((t) => t.summary && t.summary.startsWith("Login Error:"));

				if (!isSpecificErrorHandled) {
					toast.current?.show({
						severity: "error",
						summary: "Login Process Failed",
						detail: err.message || "An unexpected error occurred.",
						life: 5000,
					});
				}
				throw err;
			}
		},
		[toast, getUserCookie, updateCurrentUser]
	);

	const handleLogout = useCallback(async () => {
		try {
			await logout();
			toast.current?.show({
				severity: "info",
				summary: "Logged Out",
				detail: "You have been successfully logged out.",
				life: 3000,
			});
		} catch (err) {
			console.error("Logout failed:", err);
			toast.current?.show({
				severity: "error",
				summary: "Logout Error",
				detail: err.message || "Could not log out.",
				life: 3000,
			});
		}
	}, [toast, logout]);

	return {
		handleLogin,
		handleLogout,
	};
};
