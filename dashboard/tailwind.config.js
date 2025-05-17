/** @type {import('tailwindcss').Config} */
function generateColorShades(colorName) {
	const shades = {};
	[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach((shade) => {
		shades[shade] = `var(--${colorName}-${shade})`;
	});
	return shades;
}

export default {
	content: ["./src/**/*.{html,jsx,tsx,vue,js,ts}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				// 1. General Theme Variables
				"text-color": "var(--text-color)",
				"text-color-secondary": "var(--text-color-secondary)",
				"primary-color": "var(--primary-color)", // Main primary color
				"primary-color-text": "var(--primary-color-text)", // Text color for primary backgrounds
				"highlight-bg": "var(--highlight-bg)",
				"highlight-text-color": "var(--highlight-text-color)",
				"mask-bg": "var(--mask-bg)",

				// 2. Surface Palette (Named)
				"surface-ground": "var(--surface-ground)",
				"surface-section": "var(--surface-section)",
				"surface-card": "var(--surface-card)", // Crucial for card backgrounds
				"surface-overlay": "var(--surface-overlay)",
				"surface-border": "var(--surface-border)", // For dividers
				"surface-hover": "var(--surface-hover)", // For hover states

				// 3. Surface Palette (Numbered)
				"surface-0": "var(--surface-0)",
				"surface-50": "var(--surface-50)",
				"surface-100": "var(--surface-100)",
				"surface-200": "var(--surface-200)",
				"surface-300": "var(--surface-300)",
				"surface-400": "var(--surface-400)",
				"surface-500": "var(--surface-500)",
				"surface-600": "var(--surface-600)",
				"surface-700": "var(--surface-700)",
				"surface-800": "var(--surface-800)",
				"surface-900": "var(--surface-900)",
				primary: generateColorShades("primary"),
				blue: generateColorShades("blue"),
				green: generateColorShades("green"),
				yellow: generateColorShades("yellow"),
				cyan: generateColorShades("cyan"),
				pink: generateColorShades("pink"),
				indigo: generateColorShades("indigo"),
				teal: generateColorShades("teal"),
				orange: generateColorShades("orange"),
				bluegray: generateColorShades("bluegray"),
				purple: generateColorShades("purple"),
				red: generateColorShades("red"),
				gray: generateColorShades("gray"),
			},
			borderRadius: {
				DEFAULT: "0.5rem",
				theme: "var(--border-radius)",
				xl: "0.75rem",
				"2xl": "1rem",
				"3xl": "1.5rem",
			},
			boxShadow: {
				"focus-ring": "var(--focus-ring)",
			},
			spacing: {
				"inline-spacing": "var(--inline-spacing)",
			},
		},
	},
	plugins: [],
};

