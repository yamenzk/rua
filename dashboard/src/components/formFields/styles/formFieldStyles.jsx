// src/styles/formFieldStyles.js - Central Form Field Styles System
import React from "react";
import { useMemo } from "react";

/**
 * Central Form Field Styles System
 * Provides consistent styling across all form components with PrimeReact PassThrough support
 */

// Base design tokens
export const FORM_FIELD_TOKENS = {
  // Spacing & Sizing
  padding: {
    input: "px-4 py-3",
    compact: "px-3 py-2",
    large: "px-5 py-4",
  },

  // Border Radius
  radius: {
    base: "rounded-2xl",
    small: "rounded-xl",
    large: "rounded-3xl",
  },

  // Typography
  typography: {
    base: "text-sm font-medium",
    placeholder: "placeholder:text-text-color-secondary/60",
    error: "text-xs text-red-600 font-medium",
  },

  // Colors
  colors: {
    border: {
      default: "border-surface-100",
      hover: "border-primary-400",
      focus: "border-primary-400",
      error: "border-red-300",
      disabled: "border-none",
    },
    background: {
      default: "",
      focus: "",
      error: "bg-red-50/30",
      disabled: "bg-surface-100",
    },
    text: {
      default: "text-text-color",
      disabled: "text-text-color-secondary",
      error: "text-red-600",
    },
  },

  // Transitions
  transitions: "transition-all duration-200 ease-out",

  // Effects
  effects: {
    focusRing:
      "absolute inset-0 border-2 border-primary-400 rounded-2xl pointer-events-none opacity-30 animate-pulse",
    hoverGradient:
      "absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
    focusShine:
      "absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl opacity-60",
  },
};

/**
 * Hook to generate consistent input classes based on state
 */
export const useFormFieldClasses = (state = {}) => {
  const {
    isFocused = false,
    isHovered = false,
    disabled = false,
    error = false,
    size = "base", // 'compact', 'base', 'large'
    className = "",
    excludePadding = false, // New flag for components with internal padding
  } = state;

  return useMemo(() => {
    const tokens = FORM_FIELD_TOKENS;

    const classes = [
      // Base styling
      "w-full",
      // Only add padding if not excluded (for components like Dropdown)
      !excludePadding && (tokens.padding[size] || tokens.padding.input),
      tokens.typography.base,
      tokens.radius.base,
      "border",
      tokens.typography.placeholder,
      tokens.transitions,

      // Default colors
      tokens.colors.text.default,
      tokens.colors.border.default,
      tokens.colors.background.default,

      // Focus states
      isFocused && !disabled && [tokens.colors.border.focus, "shadow-none"],

      // Hover states (only when not focused)
      !isFocused && isHovered && !disabled && [tokens.colors.border.hover],

      // Disabled states
      disabled && [
        tokens.colors.background.disabled,
        tokens.colors.border.disabled,
        tokens.colors.text.disabled,
        "cursor-not-allowed",
      ],

      // Error states
      error &&
        !disabled && [
          tokens.colors.border.error,
          tokens.colors.background.error,
        ],

      // Custom className
      className,
    ]
      .filter(Boolean)
      .flat()
      .join(" ");

    return classes;
  }, [isFocused, isHovered, disabled, error, size, className, excludePadding]);
};

/**
 * Generate PrimeReact PassThrough (PT) props for consistent styling
 */
export const getFormFieldPT = (state = {}) => {
  const {
    isFocused = false,
    isHovered = false,
    disabled = false,
    error = false,
    size = "base",
    customPT = {},
  } = state;

  const classes = useFormFieldClasses(state);

  return {
    root: {
      className: "relative group",
      ...customPT.root,
    },
    input: {
      className: classes,
      ...customPT.input,
    },
    ...customPT,
  };
};

/**
 * Addon styling functions for input groups (currency, percent, duration, etc.)
 */
export const getAddonStyles = (state, position = "right") => {
  const { isFocused, isHovered, disabled } = state;
  const tokens = FORM_FIELD_TOKENS;

  const baseStyles = [
    "px-4 py-3 border transition-all duration-200 ease-out",
    tokens.typography.base,
  ];

  // Handle border radius based on position
  if (position === "left") {
    baseStyles.push("rounded-l-2xl border-r-0");
  } else if (position === "right") {
    baseStyles.push("rounded-r-2xl border-l-0");
  } else if (position === "middle") {
    baseStyles.push("rounded-none border-l-0 border-r-0");
  }

  if (disabled) {
    baseStyles.push(
      tokens.colors.background.disabled,
      tokens.colors.border.disabled,
      tokens.colors.text.disabled,
      "cursor-not-allowed"
    );
  } else if (isFocused) {
    baseStyles.push(
      tokens.colors.border.focus,
      "bg-primary-50/30",
      tokens.colors.text.default
    );
  } else if (isHovered) {
    baseStyles.push(
      tokens.colors.border.hover,
      "bg-surface-0",
      tokens.colors.text.default
    );
  } else {
    baseStyles.push(
      tokens.colors.border.default,
      "bg-surface-0",
      tokens.colors.text.default
    );
  }

  return baseStyles.filter(Boolean).join(" ");
};

export const getAddonIconStyles = (state) => {
  const { isFocused, disabled } = state;

  if (disabled) {
    return "text-text-color-secondary";
  } else if (isFocused) {
    return "text-primary-600 transition-colors duration-200";
  } else {
    return "text-text-color-secondary hover:text-primary-500 transition-colors duration-200";
  }
};

/**
 * Common wrapper component for form fields with consistent structure
 */
export const FormFieldWrapper = ({
  children,
  id,
  error,
  required,
  disabled,
  isFocused = false,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  className = "",
}) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Input Container */}
      <div
        className="relative"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}

        {/* Focus Ring Enhancement */}
        {isFocused && !disabled && (
          <div className={FORM_FIELD_TOKENS.effects.focusRing} />
        )}

        {/* Required Indicator */}
        {required && !disabled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full opacity-60" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={`${id}-error`}
          className="mt-2 text-xs text-red-600 font-medium flex items-center gap-2 animate-in slide-in-from-top-1 duration-200"
        >
          <div className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Subtle Enhancement Indicators */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none">
        {/* Gradient overlay on hover */}
        {isHovered && !isFocused && !disabled && (
          <div className={FORM_FIELD_TOKENS.effects.hoverGradient} />
        )}

        {/* Shine effect on focus */}
        {isFocused && !disabled && (
          <div className={FORM_FIELD_TOKENS.effects.focusShine} />
        )}
      </div>
    </div>
  );
};

/**
 * Hook for managing common form field state
 */
export const useFormFieldState = (initialProps = {}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFocus = React.useCallback((e, originalOnFocus) => {
    setIsFocused(true);
    if (originalOnFocus) {
      originalOnFocus(e);
    }
  }, []);

  const handleBlur = React.useCallback((e, originalOnBlur) => {
    setIsFocused(false);
    if (originalOnBlur) {
      originalOnBlur(e);
    }
  }, []);

  const handleMouseEnter = React.useCallback((disabled) => {
    if (!disabled) {
      setIsHovered(true);
    }
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isFocused,
    isHovered,
    setIsFocused,
    setIsHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  };
};

/**
 * Specific PrimeReact component PT configurations
 */
export const PRIMEREACT_PT_CONFIGS = {
  // InputText, InputTextarea, etc.
  inputText: (state) => ({
    root: {
      className: useFormFieldClasses(state),
    },
  }),

  // InputNumber (Int, Float, Currency, etc.)
  inputNumber: (state) => ({
    root: {
      className:
        "w-full inline-flex bg-transparent border-none p-0 shadow-none", // Neutralize wrapper completely
    },
    input: {
      root: {
        className: useFormFieldClasses({
          ...state,
          // The input.root gets all our styling
          className: `${state.className || ""}`,
        }),
      },
    },
    // Style the increment/decrement buttons
    incrementButton: {
      className: "hidden", // Hide the default buttons for cleaner look
    },
    decrementButton: {
      className: "hidden", // Hide the default buttons for cleaner look
    },
    buttonGroup: {
      className: "hidden", // Hide the entire button group
    },
  }),

  // InputNumber with Addons (Currency, Percent, Duration, etc.)
  inputNumberWithAddon: (state, addonPosition = "right") => ({
    root: {
      className:
        "w-full inline-flex bg-transparent border-none p-0 shadow-none", // Neutralize wrapper completely
    },
    input: {
      root: {
        className: useFormFieldClasses({
          ...state,
          className: `${state.className || ""} ${
            addonPosition === "left"
              ? "rounded-l-none border-l-0"
              : addonPosition === "right"
              ? "rounded-r-none border-r-0"
              : addonPosition === "both"
              ? "rounded-none border-l-0 border-r-0"
              : ""
          }`,
        }),
      },
    },
    // Hide increment/decrement buttons for cleaner look
    incrementButton: {
      className: "hidden",
    },
    decrementButton: {
      className: "hidden",
    },
    buttonGroup: {
      className: "hidden",
    },
  }),

  // InputText with Addons (for color picker, etc.)
  inputTextWithAddon: (state, addonPosition = "right") => ({
    root: {
      className: useFormFieldClasses({
        ...state,
        className: `${state.className || ""} ${
          addonPosition === "left"
            ? "rounded-l-none border-l-0"
            : addonPosition === "right"
            ? "rounded-r-none border-r-0"
            : addonPosition === "both"
            ? "rounded-none border-l-0 border-r-0"
            : ""
        }`,
      }),
    },
  }),

  // Calendar (Date, DateTime, Time) - Now with addon-style trigger
  calendar: (state) => ({
    root: {
      className: "inline-flex max-w-full relative w-full",
    },
    input: {
      root: {
        className: useFormFieldClasses({
          ...state,
          className: `${state.className || ""} ${
            !state.disabled ? "rounded-r-none border-r-0" : ""
          }`,
        }),
      },
    },
    dropdownButton: {
      root: {
        className: getAddonStyles(
          {
            isFocused: state.isFocused,
            isHovered: state.isHovered,
            disabled: state.disabled,
          },
          "right"
        ),
      },
      icon: {
        className: getAddonIconStyles({
          isFocused: state.isFocused,
          disabled: state.disabled,
        }),
      },
    },
    panel: {
      className:
        "bg-surface-0 border-none shadow-xl rounded-2xl mt-2 overflow-hidden backdrop-blur-sm",
    },
    header: {
      className:
        "flex items-center justify-between p-4 text-text-color bg-surface-0 font-semibold border-b border-surface-100",
    },
    previousButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    nextButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    title: {
      className: "leading-8 mx-auto font-medium text-text-color",
    },
    monthTitle: {
      className:
        "text-text-color transition duration-200 font-medium p-2 mr-2 hover:text-primary-500 rounded-lg hover:bg-primary-50",
    },
    yearTitle: {
      className:
        "text-text-color transition duration-200 font-medium p-2 hover:text-primary-500 rounded-lg hover:bg-primary-50",
    },
    table: {
      className: "border-collapse w-full my-2",
    },
    tableHeaderCell: {
      className: "p-2",
    },
    weekday: {
      className: "text-text-color-secondary font-medium text-sm",
    },
    day: {
      className: "p-1",
    },
    dayLabel: {
      className:
        "w-10 h-10 rounded-xl transition-all duration-200 border-transparent border flex items-center justify-center mx-auto overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-primary-200 cursor-pointer text-text-color hover:bg-primary-50 data-[p-highlight=true]:text-primary-700 data-[p-highlight=true]:bg-primary-100 data-[p-highlight=true]:hover:bg-primary-200",
    },
    monthPicker: {
      className: "my-2 p-2",
    },
    month: {
      className:
        "w-1/3 inline-flex items-center justify-center cursor-pointer overflow-hidden relative p-3 transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-text-color hover:bg-primary-50 data-[p-highlight=true]:text-primary-700 data-[p-highlight=true]:bg-primary-100",
    },
    yearPicker: {
      className: "my-2 p-2",
    },
    year: {
      className:
        "w-1/2 inline-flex items-center justify-center cursor-pointer overflow-hidden relative p-3 transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-text-color hover:bg-primary-50 data-[p-highlight=true]:text-primary-700 data-[p-highlight=true]:bg-primary-100",
    },
    // Time picker specific styling (for DateTime and Time fields)
    timePicker: {
      className:
        "flex justify-center items-center border-t border-surface-100 p-4 bg-surface-50",
    },
    separatorContainer: {
      className: "flex items-center flex-col px-2",
    },
    separator: {
      className: "text-xl font-bold text-text-color-secondary",
    },
    hourPicker: {
      className: "flex items-center flex-col px-2",
    },
    minutePicker: {
      className: "flex items-center flex-col px-2",
    },
    secondPicker: {
      className: "flex items-center flex-col px-2",
    },
    ampmPicker: {
      className: "flex items-center flex-col px-2",
    },
    incrementButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    decrementButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    // Time display styling
    hour: {
      className:
        "text-xl font-bold text-text-color bg-surface-100 rounded-xl px-3 py-2 min-w-[2.5rem] text-center",
    },
    minute: {
      className:
        "text-xl font-bold text-text-color bg-surface-100 rounded-xl px-3 py-2 min-w-[2.5rem] text-center",
    },
    second: {
      className:
        "text-xl font-bold text-text-color bg-surface-100 rounded-xl px-3 py-2 min-w-[2.5rem] text-center",
    },
    ampm: {
      className:
        "text-lg font-bold text-text-color bg-primary-100 text-primary-700 rounded-xl px-3 py-2 min-w-[2.5rem] text-center",
    },
  }),

  // Dropdown (Select, Link, etc.)
  dropdown: (state) => ({
    root: {
      className: useFormFieldClasses({
        ...state,
        excludePadding: true, // Dropdown has internal padding structure
        className: `${state.className || ""} cursor-pointer flex items-center`,
      }),
    },
    input: {
      className:
        "outline-none bg-transparent border-none w-full text-sm font-medium placeholder:text-text-color-secondary/60",
    },
    trigger: {
      className:
        "text-text-color-secondary hover:text-primary-500 transition-colors flex-shrink-0 ml-2",
    },
    panel: {
      className: "border-none shadow-lg rounded-2xl mt-2 overflow-hidden",
    },
    list: {
      className: "p-0",
    },
    item: {
      className:
        "px-4 py-3 hover:bg-primary-50 transition-colors cursor-pointer border-none",
    },
  }),

  // ColorPicker
  colorPicker: (state) => ({
    root: {
      className: "flex flex-col items-center",
    },
    input: {
      className: useFormFieldClasses(state),
    },
    panel: {
      className: "border-none shadow-lg rounded-2xl mt-2",
    },
  }),

  // InputSwitch - Enhanced styling
  inputSwitch: (state) => ({
    root: {
      className: `
        relative inline-flex items-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 rounded-full
        ${state.disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${state.error ? "ring-2 ring-red-200" : ""}
      `,
    },
    slider: {
      className: `
        transition-all duration-200 rounded-full
        ${
          state.disabled
            ? "bg-surface-300"
            : state.checked || state.value
            ? "bg-primary-500 hover:bg-primary-600"
            : "bg-surface-300 hover:bg-surface-400"
        }
      `,
    },
    handle: {
      className: `
        transition-all duration-200 rounded-full shadow-lg border-2 border-white bg-white transform
        ${
          state.size === "large"
            ? "w-6 h-6"
            : state.size === "compact"
            ? "w-4 h-4"
            : "w-5 h-5"
        }
        ${state.checked || state.value ? "translate-x-full" : "translate-x-0"}
      `,
    },
  }),

  // Checkbox - Enhanced styling
  checkbox: (state) => ({
    root: {
      className: "relative inline-flex items-center",
    },
    box: {
      className: `
        transition-all duration-200 border-2 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-200 cursor-pointer
        ${
          state.size === "large"
            ? "w-6 h-6"
            : state.size === "compact"
            ? "w-4 h-4"
            : "w-5 h-5"
        }
        ${
          state.error
            ? "border-red-300 focus:ring-red-200"
            : state.disabled
            ? "border-surface-200 bg-surface-100 cursor-not-allowed"
            : state.checked || state.value
            ? "border-primary-500 bg-primary-500 hover:border-primary-600 hover:bg-primary-600 shadow-sm"
            : "border-surface-300 bg-surface-0 hover:border-primary-400 hover:shadow-sm"
        }
      `,
    },
    icon: {
      className: `
        transition-all duration-200 text-white font-bold
        ${
          state.size === "large"
            ? "text-sm"
            : state.size === "compact"
            ? "text-xs"
            : "text-sm"
        }
        ${
          state.checked || state.value
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75"
        }
      `,
    },
  }),
};

export default {
  FORM_FIELD_TOKENS,
  useFormFieldClasses,
  getFormFieldPT,
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  getAddonStyles,
  getAddonIconStyles,
};
