// dashboard/src/utils/formatters.js

/**
 * Formats an ISO string or Date object into a displayable date and time string.
 * Locale: en-AE (English, United Arab Emirates)
 * Example: 18/05/2025 15:30:45
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted date-time string or empty string if input is invalid.
 */
export const formatDisplayDateTime = (dateInput) => {
  if (!dateInput) return "";
  try {
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }

    // Validate if the date is actually valid before formatting
    if (isNaN(date.getTime())) {
      console.warn(
        `Invalid date input for formatDisplayDateTime: ${dateInput}`
      );
      return String(dateInput); // Fallback to raw string if invalid
    }
    return new Intl.DateTimeFormat("en-AE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch (error) {
    console.error("Error formatting display date-time:", error);
    return String(dateInput); // Fallback
  }
};

/**
 * Formats a Date object or a display string into a server-compatible datetime string.
 * Format: YYYY-MM-DD HH:MM:SS
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted server datetime string or empty string if input is invalid.
 */
export const formatServerDateTime = (dateInput) => {
  if (!dateInput) return "";
  try {
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error formatting server date-time:", error);
    return "";
  }
};

/**
 * Formats an ISO string or Date object into a displayable date string.
 * Locale: en-AE
 * Example: 18/05/2025
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted date string or empty string if input is invalid.
 */
export const formatDisplayDate = (dateInput) => {
  if (!dateInput) return "";
  try {
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date input for formatDisplayDate: ${dateInput}`);
      return String(dateInput);
    }
    return new Intl.DateTimeFormat("en-AE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting display date:", error);
    return String(dateInput);
  }
};

/**
 * Formats a Date object or a display string into a server-compatible date string.
 * Format: YYYY-MM-DD
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted server date string or empty string if input is invalid.
 */
export const formatServerDate = (dateInput) => {
  if (!dateInput) return "";
  try {
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting server date:", error);
    return "";
  }
};

/**
 * Formats an ISO string or Date object into a displayable time string.
 * Locale: en-AE
 * Example: 15:30 or 15:30:45 (depending on includeSeconds)
 * @param {string | Date} dateInput - The date string or Date object.
 * @param {boolean} includeSeconds - Whether to include seconds in the output.
 * @returns {string} Formatted time string or empty string if input is invalid.
 */
export const formatDisplayTime = (dateInput, includeSeconds = false) => {
  if (!dateInput) return "";
  try {
    let date;
    if (dateInput instanceof Date) {
      // If it's already a Date object, use it directly
      date = dateInput;
    } else {
      // Otherwise, try to parse the string.
      // For time-only strings, prefix with a dummy date to ensure parsability.
      if (
        typeof dateInput === "string" &&
        dateInput.match(/^\d{2}:\d{2}(:\d{2})?$/)
      ) {
        // Assuming it's a time string like "HH:MM" or "HH:MM:SS"
        date = new Date(`2000-01-01T${dateInput}`);
      } else {
        // Try to parse as is (might be a full datetime string from backend)
        date = new Date(dateInput);
      }
    }

    // Final check if parsing resulted in a valid date
    if (isNaN(date.getTime())) {
      console.warn(`Invalid time input for formatDisplayTime: ${dateInput}`);
      return String(dateInput); // Fallback to raw string if invalid
    }

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    if (includeSeconds) {
      options.second = "2-digit";
    }
    return new Intl.DateTimeFormat("en-AE", options).format(date);
  } catch (error) {
    console.error("Error formatting display time:", error);
    return String(dateInput);
  }
};

/**
 * Formats a Date object or a display string into a server-compatible time string.
 * Format: HH:MM:SS
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted server time string or empty string if input is invalid.
 */
export const formatServerTime = (dateInput) => {
  if (!dateInput) return "";
  try {
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
    }
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error formatting server time:", error);
    return "";
  }
};

/**
 * Formats a numeric value as AED currency.
 * Uses toLocaleString for number formatting and appends an SVG for the AED symbol.
 * @param {number | string} value - The numeric value.
 * @returns {React.ReactNode} JSX for the formatted currency or an empty string.
 */
export const formatCurrencyAED = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return ""; // or handle error appropriately
  }
  const formattedNumber = num.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Assuming aed.svg is in public/images/ or similar and accessible via /images/aed.svg
  // Adjust the path to your aed.svg if it's different
  return (
    <span className="inline-flex items-center">
      {formattedNumber}
      <img src="/aed.svg" alt="AED" className="ml-1 h-4 w-4 inline-block" />
    </span>
  );
};

/**
 * Formats a duration from total seconds into a "Xh Ym Zs" string.
 * @param {number | string} totalSecondsInput - The total duration in seconds.
 * @returns {string} Formatted duration string or empty string if input is invalid.
 */
export const formatDuration = (totalSecondsInput) => {
  const totalSeconds = parseInt(totalSecondsInput, 10);
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return ""; // Or handle error/invalid input
  }

  if (totalSeconds === 0) {
    return "0s";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    // Add seconds if it's non-zero or if hours and minutes are zero
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
};

/**
 * Parses a duration string "Xh Ym Zs" (or parts of it) into total seconds.
 * This is optional and primarily for form input if needed.
 * @param {string} durationString - The duration string.
 * @returns {number | null} Total seconds or null if parsing fails.
 */
export const parseDuration = (durationString) => {
  if (!durationString || typeof durationString !== "string") {
    return null;
  }

  let totalSeconds = 0;
  const hourMatch = durationString.match(/(\d+)\s*h/i);
  const minuteMatch = durationString.match(/(\d+)\s*m/i);
  const secondMatch = durationString.match(/(\d+)\s*s/i);

  if (hourMatch) {
    totalSeconds += parseInt(hourMatch[1], 10) * 3600;
  }
  if (minuteMatch) {
    totalSeconds += parseInt(minuteMatch[1], 10) * 60;
  }
  if (secondMatch) {
    totalSeconds += parseInt(secondMatch[1], 10);
  }

  // If no parts were matched but string is not empty, it might be just seconds
  if (
    !hourMatch &&
    !minuteMatch &&
    !secondMatch &&
    durationString.trim() !== ""
  ) {
    const justSeconds = parseInt(durationString, 10);
    if (!isNaN(justSeconds)) {
      return justSeconds;
    }
  }

  return hourMatch || minuteMatch || secondMatch ? totalSeconds : null;
};
