// src/hooks/useUnsavedChanges.js
import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useUnsavedChanges = (
	hasUnsavedChanges,
	message = "You have unsaved changes. Are you sure you want to leave?"
) => {
	const navigate = useNavigate();
	const location = useLocation();

	// Handle browser refresh/close
	useEffect(() => {
		const handleBeforeUnload = (e) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = message; // Standard way to show confirmation dialog
				return message;
			}
		};

		if (hasUnsavedChanges) {
			window.addEventListener("beforeunload", handleBeforeUnload);
		}

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [hasUnsavedChanges, message]);

	// Custom navigation function that checks for unsaved changes
	const navigateWithWarning = useCallback(
		(to, options = {}) => {
			if (hasUnsavedChanges) {
				const confirmed = window.confirm(message);
				if (!confirmed) {
					return false; // Navigation cancelled
				}
			}
			navigate(to, options);
			return true; // Navigation proceeded
		},
		[hasUnsavedChanges, message, navigate]
	);

	return { navigateWithWarning };
};
