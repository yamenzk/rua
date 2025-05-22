// dashboard/src/utils/cookies.js - Enhanced with Modern Storage
/**
 * Smart Cookie/Storage Manager
 *
 * Automatically routes data to the best storage mechanism:
 * - Authentication data → Cookies (for server access)
 * - App data (table states, presets) → localStorage/IndexedDB
 * - Maintains backward compatibility with existing code
 */

class SmartStorage {
	constructor() {
		this.prefix = "rua_app_";
		this.version = "1.0";
		this.dbName = `${this.prefix}database`;
		this.dbVersion = 1;
		this.db = null;

		// Auth-related cookies that should stay as cookies
		this.authCookies = new Set([
			"sid",
			"system_user",
			"user_id",
			"user_image",
			"user_lang",
			"full_name",
			"csrf_token",
			"session_id",
			"auth_token",
			"access_token",
			"refresh_token",
			"login_token",
			"user_session",
		]);

		// Initialize IndexedDB
		this.initDB();

		// Auto-migrate existing cookies on first load
		this.migrateCookiesOnce();
	}

	async initDB() {
		if (!window.indexedDB) {
			console.warn("[SmartStorage] IndexedDB not supported, using localStorage only");
			return;
		}

		try {
			this.db = await new Promise((resolve, reject) => {
				const request = indexedDB.open(this.dbName, this.dbVersion);

				request.onerror = () => reject(request.error);
				request.onsuccess = () => resolve(request.result);

				request.onupgradeneeded = (event) => {
					const db = event.target.result;

					if (!db.objectStoreNames.contains("appData")) {
						const store = db.createObjectStore("appData", { keyPath: "key" });
						store.createIndex("category", "category", { unique: false });
						store.createIndex("created", "created", { unique: false });
					}
				};
			});

			console.log("[SmartStorage] IndexedDB initialized");
		} catch (error) {
			console.error("[SmartStorage] IndexedDB init failed:", error);
		}
	}

	// Determine if a key should use cookies or modern storage
	shouldUseCookies(name) {
		// Check if it's an auth-related cookie
		if (this.authCookies.has(name)) {
			return true;
		}

		// Check if it starts with auth patterns
		const lowerName = name.toLowerCase();
		if (
			lowerName.includes("auth") ||
			lowerName.includes("session") ||
			lowerName.includes("login") ||
			lowerName.includes("csrf") ||
			lowerName.includes("token")
		) {
			return true;
		}

		// Everything else uses modern storage
		return false;
	}

	// Enhanced setCookie with automatic routing
	setCookie(name, value, days) {
		if (this.shouldUseCookies(name)) {
			return this.setRealCookie(name, value, days);
		} else {
			return this.setModernStorage(name, value, days);
		}
	}

	// Enhanced getCookie with automatic routing
	getCookie(name) {
		if (this.shouldUseCookies(name)) {
			return this.getRealCookie(name);
		} else {
			return this.getModernStorage(name);
		}
	}

	// Enhanced eraseCookie with automatic routing
	eraseCookie(name) {
		if (this.shouldUseCookies(name)) {
			this.eraseRealCookie(name);
		} else {
			this.removeModernStorage(name);
		}
	}

	// Original cookie methods (for auth data)
	setRealCookie(name, value, days) {
		let expires = "";
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "") + expires + "; path=/";
		return true;
	}

	getRealCookie(name) {
		const nameEQ = name + "=";
		const ca = document.cookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === " ") c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	eraseRealCookie(name) {
		document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	}

	// Modern storage methods (for app data)
	setModernStorage(name, value, days) {
		try {
			const ttl = days ? days * 24 * 60 * 60 * 1000 : null;
			const item = {
				value,
				timestamp: Date.now(),
				ttl: ttl ? Date.now() + ttl : null,
				version: this.version,
			};

			// Determine storage strategy based on data size and type
			const serialized = JSON.stringify(item);
			const size = new Blob([serialized]).size;

			if (size > 50000 && this.db) {
				// >50KB goes to IndexedDB
				this.setLargeData(name, item);
			} else {
				// ≤50KB goes to localStorage
				localStorage.setItem(this.getStorageKey(name), serialized);
			}

			console.log(
				`[SmartStorage] Saved ${name}: ${size} bytes to ${
					size > 50000 ? "IndexedDB" : "localStorage"
				}`
			);
			return true;
		} catch (error) {
			console.error("[SmartStorage] Error saving to modern storage:", error);
			return false;
		}
	}

	getModernStorage(name) {
		try {
			// Try localStorage first (most common)
			const stored = localStorage.getItem(this.getStorageKey(name));
			if (stored) {
				const item = JSON.parse(stored);

				// Check if expired
				if (item.ttl && Date.now() > item.ttl) {
					localStorage.removeItem(this.getStorageKey(name));
					return null;
				}

				return item.value;
			}

			// Try IndexedDB if not in localStorage
			if (this.db) {
				return this.getLargeData(name);
			}

			return null;
		} catch (error) {
			console.error("[SmartStorage] Error reading from modern storage:", error);
			return null;
		}
	}

	removeModernStorage(name) {
		// Remove from localStorage
		localStorage.removeItem(this.getStorageKey(name));

		// Remove from IndexedDB
		if (this.db) {
			this.removeLargeData(name);
		}
	}

	// IndexedDB methods for large data
	async setLargeData(name, item) {
		if (!this.db) return false;

		try {
			const transaction = this.db.transaction(["appData"], "readwrite");
			const store = transaction.objectStore("appData");

			const record = {
				key: name,
				...item,
				category: this.getDataCategory(name),
				size: new Blob([JSON.stringify(item.value)]).size,
			};

			await new Promise((resolve, reject) => {
				const request = store.put(record);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});

			return true;
		} catch (error) {
			console.error("[SmartStorage] IndexedDB save error:", error);
			return false;
		}
	}

	async getLargeData(name) {
		if (!this.db) return null;

		try {
			const transaction = this.db.transaction(["appData"], "readonly");
			const store = transaction.objectStore("appData");

			const record = await new Promise((resolve, reject) => {
				const request = store.get(name);
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});

			if (!record) return null;

			// Check if expired
			if (record.ttl && Date.now() > record.ttl) {
				await this.removeLargeData(name);
				return null;
			}

			return record.value;
		} catch (error) {
			console.error("[SmartStorage] IndexedDB read error:", error);
			return null;
		}
	}

	async removeLargeData(name) {
		if (!this.db) return;

		try {
			const transaction = this.db.transaction(["appData"], "readwrite");
			const store = transaction.objectStore("appData");

			await new Promise((resolve, reject) => {
				const request = store.delete(name);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		} catch (error) {
			console.error("[SmartStorage] IndexedDB delete error:", error);
		}
	}

	// Utility methods
	getStorageKey(name) {
		return `${this.prefix}${name}`;
	}

	getDataCategory(name) {
		if (name.includes("datatable") || name.includes("preset")) return "table";
		if (name.includes("view") || name.includes("layout")) return "ui";
		if (name.includes("filter")) return "filter";
		return "general";
	}

	// Migration from old cookies (run once)
	migrateCookiesOnce() {
		const migrationKey = `${this.prefix}migration_completed`;

		if (localStorage.getItem(migrationKey)) {
			return; // Already migrated
		}

		console.log("[SmartStorage] Starting one-time cookie migration...");

		let migrationCount = 0;
		const cookies = document.cookie.split(";");

		for (const cookie of cookies) {
			const [name, ...valueParts] = cookie.split("=");
			const cookieName = name.trim();
			const cookieValue = valueParts.join("=").trim();

			// Only migrate app data cookies, not auth cookies
			if (
				cookieName.startsWith("datatable_") ||
				cookieName.includes("_presets") ||
				cookieName.includes("_state") ||
				cookieName.includes("_viewmode")
			) {
				try {
					const data = JSON.parse(decodeURIComponent(cookieValue));
					this.setModernStorage(cookieName, data, 30); // 30 days TTL

					// Clear the old cookie
					this.eraseRealCookie(cookieName);
					migrationCount++;
				} catch (error) {
					console.warn(`[SmartStorage] Could not migrate cookie ${cookieName}:`, error);
				}
			}
		}

		// Mark migration as complete
		localStorage.setItem(
			migrationKey,
			JSON.stringify({
				completed: Date.now(),
				migratedCount: migrationCount,
			})
		);

		console.log(
			`[SmartStorage] Migration completed: ${migrationCount} cookies migrated to modern storage`
		);
	}

	// Storage info and cleanup
	async getStorageInfo() {
		const info = {
			localStorage: {
				used: 0,
				items: 0,
			},
			indexedDB: {
				used: 0,
				items: 0,
				quota: 0,
			},
			cookies: {
				count: document.cookie.split(";").filter((c) => c.trim()).length,
				authCookies: 0,
				appCookies: 0,
			},
		};

		// Count localStorage usage
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(this.prefix)) {
				info.localStorage.items++;
				info.localStorage.used += localStorage.getItem(key).length;
			}
		}

		// Count IndexedDB usage
		if (this.db) {
			try {
				const transaction = this.db.transaction(["appData"], "readonly");
				const store = transaction.objectStore("appData");

				const count = await new Promise((resolve, reject) => {
					const request = store.count();
					request.onsuccess = () => resolve(request.result);
					request.onerror = () => reject(request.error);
				});

				info.indexedDB.items = count;

				if (navigator.storage && navigator.storage.estimate) {
					const estimate = await navigator.storage.estimate();
					info.indexedDB.quota = estimate.quota || 0;
					info.indexedDB.used = estimate.usage || 0;
				}
			} catch (error) {
				console.warn("[SmartStorage] Could not get IndexedDB info:", error);
			}
		}

		// Count cookies
		const cookies = document.cookie.split(";");
		for (const cookie of cookies) {
			const name = cookie.split("=")[0].trim();
			if (this.shouldUseCookies(name)) {
				info.cookies.authCookies++;
			} else {
				info.cookies.appCookies++;
			}
		}

		return info;
	}

	// Clean up expired data
	async cleanup() {
		let cleanupCount = 0;

		// Clean localStorage
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);
			if (key && key.startsWith(this.prefix)) {
				try {
					const item = JSON.parse(localStorage.getItem(key));
					if (item.ttl && Date.now() > item.ttl) {
						localStorage.removeItem(key);
						cleanupCount++;
					}
				} catch (error) {
					localStorage.removeItem(key);
					cleanupCount++;
				}
			}
		}

		// Clean IndexedDB
		if (this.db) {
			try {
				const transaction = this.db.transaction(["appData"], "readwrite");
				const store = transaction.objectStore("appData");

				const cursor = await new Promise((resolve, reject) => {
					const request = store.openCursor();
					const toDelete = [];

					request.onsuccess = (event) => {
						const cursor = event.target.result;
						if (cursor) {
							const record = cursor.value;
							if (record.ttl && Date.now() > record.ttl) {
								toDelete.push(record.key);
							}
							cursor.continue();
						} else {
							resolve(toDelete);
						}
					};
					request.onerror = () => reject(request.error);
				});

				for (const key of cursor) {
					await this.removeLargeData(key);
					cleanupCount++;
				}
			} catch (error) {
				console.error("[SmartStorage] IndexedDB cleanup error:", error);
			}
		}

		console.log(`[SmartStorage] Cleaned up ${cleanupCount} expired items`);
		return cleanupCount;
	}

	// Clear all app data (keep auth cookies)
	async clearAllAppData() {
		// Clear localStorage
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);
			if (key && key.startsWith(this.prefix)) {
				localStorage.removeItem(key);
			}
		}

		// Clear IndexedDB
		if (this.db) {
			try {
				const transaction = this.db.transaction(["appData"], "readwrite");
				const store = transaction.objectStore("appData");
				await new Promise((resolve, reject) => {
					const request = store.clear();
					request.onsuccess = () => resolve();
					request.onerror = () => reject(request.error);
				});
			} catch (error) {
				console.error("[SmartStorage] Error clearing IndexedDB:", error);
			}
		}

		// Clear app cookies (not auth cookies)
		const cookies = document.cookie.split(";");
		for (const cookie of cookies) {
			const name = cookie.split("=")[0].trim();
			if (!this.shouldUseCookies(name) && name) {
				this.eraseRealCookie(name);
			}
		}

		console.log("[SmartStorage] All app data cleared (auth cookies preserved)");
	}
}

// Create singleton instance
const smartStorage = new SmartStorage();

// Export backward-compatible API
export const setCookie = (name, value, days) => smartStorage.setCookie(name, value, days);
export const getCookie = (name) => smartStorage.getCookie(name);
export const eraseCookie = (name) => smartStorage.eraseCookie(name);

// Export additional utilities
export const getStorageInfo = () => smartStorage.getStorageInfo();
export const cleanupStorage = () => smartStorage.cleanup();
export const clearAppData = () => smartStorage.clearAllAppData();

// Export for debugging
export const storage = smartStorage;
