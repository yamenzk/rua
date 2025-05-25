// src/styles/formFieldStyles.js - Central Form Field Styles System
import React from "react";
// src/styles/formFieldStyles.js - Central Form Field Styles System
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
    }
  },
  
  // Transitions
  transitions: "transition-all duration-200 ease-out",
  
  // Effects
  effects: {
    focusRing: "absolute inset-0 border-2 border-primary-400 rounded-2xl pointer-events-none opacity-30 animate-pulse",
    hoverGradient: "absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
    focusShine: "absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl opacity-60",
  }
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
    size = 'base', // 'compact', 'base', 'large'
    className = '',
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
      isFocused && !disabled && [
        tokens.colors.border.focus,
        "shadow-none",
      ],
      
      // Hover states (only when not focused)
      !isFocused && isHovered && !disabled && [
        tokens.colors.border.hover,
      ],
      
      // Disabled states
      disabled && [
        tokens.colors.background.disabled,
        tokens.colors.border.disabled,
        tokens.colors.text.disabled,
        "cursor-not-allowed",
      ],
      
      // Error states
      error && !disabled && [
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
    size = 'base',
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
    }
  }),
  
  // InputNumber (Int, Float, Currency, etc.)
  inputNumber: (state) => ({
    root: {
      className: "w-full inline-flex bg-transparent border-none p-0 shadow-none", // Neutralize wrapper completely
    },
    input: {
      root: {
        className: useFormFieldClasses({
          ...state,
          // The input.root gets all our styling
          className: `${state.className || ''}`,
        }),
      }
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
  
  // Calendar (Date, DateTime, Time)
  calendar: (state) => ({
    root: {
      className: "relative group",
    },
    input: {
      className: useFormFieldClasses(state),
    },
    trigger: {
      className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-color-secondary hover:text-primary-500 transition-colors",
    }
  }),
  
  // Dropdown (Select, Link, etc.)
  dropdown: (state) => ({
    root: {
      className: useFormFieldClasses({
        ...state,
        excludePadding: true, // Dropdown has internal padding structure
        className: `${state.className || ''} cursor-pointer flex items-center`,
      }),
    },
    input: {
      className: "outline-none bg-transparent border-none w-full text-sm font-medium placeholder:text-text-color-secondary/60",
    },
    trigger: {
      className: "text-text-color-secondary hover:text-primary-500 transition-colors flex-shrink-0 ml-2",
    },
    panel: {
      className: "border-none shadow-lg rounded-2xl mt-2 overflow-hidden",
    },
    list: {
      className: "p-0",
    },
    item: {
      className: "px-4 py-3 hover:bg-primary-50 transition-colors cursor-pointer border-none",
    }
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
    }
  }),
  
  // InputSwitch
  inputSwitch: (state) => ({
    root: {
      className: `relative inline-flex items-center cursor-pointer transition-all duration-200 ${
        state.disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`,
    },
    slider: {
      className: "bg-surface-300 rounded-full transition-all duration-200 hover:bg-surface-400",
    }
  }),
  
  // Checkbox
  checkbox: (state) => ({
    root: {
      className: "relative inline-flex items-center",
    },
    box: {
      className: `w-5 h-5 border-2 rounded-md transition-all duration-200 ${
        state.error ? 'border-red-300' : 'border-surface-300'
      } hover:border-primary-400`,
    }
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