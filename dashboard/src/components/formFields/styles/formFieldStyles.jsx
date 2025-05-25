// src/styles/formFieldStyles.js - Central Form Field Styles System
import React from "react";
import { useMemo } from "react";

/**
 * =============================================================================
 * CENTRALIZED DESIGN TOKENS
 * =============================================================================
 * All design tokens for form fields - modify these to change styling uniformly
 */

// Core Design Tokens - Modify these to change all form field styling
export const DESIGN_TOKENS = {
  // === SPACING & SIZING ===
  spacing: {
    // Input padding
    input: {
      compact: "px-3 py-2",
      base: "px-4 py-3",
      large: "px-5 py-4",
    },
    // Panel/Container spacing
    panel: {
      padding: "p-4",
      margin: "mt-2",
    },
    // Component spacing
    gap: {
      small: "gap-2",
      base: "gap-4",
    },
    // Icon/addon spacing
    addon: {
      padding: "px-4 py-3",
      gap: "ml-2",
    },
  },

  // === BORDER RADIUS ===
  radius: {
    small: "rounded-xl",
    base: "rounded-2xl",
    large: "rounded-3xl",
    full: "rounded-full",
  },

  // === TYPOGRAPHY ===
  typography: {
    // Base text styling
    base: "text-sm font-medium",
    large: "text-lg font-bold",
    xl: "text-xl font-bold",

    // Placeholder styling
    placeholder: "placeholder:text-text-color-secondary/60",

    // Error text
    error: "text-xs text-red-600 font-medium",

    // Secondary text
    secondary: "text-text-color-secondary font-medium text-sm",
  },

  // === COLORS ===
  colors: {
    // Border colors
    border: {
      default: "border-surface-100",
      hover: "border-primary-100",
      focus: "!border-primary-400",
      error: "border-red-300",
      disabled: "border-none",
      transparent: "border-transparent",
    },

    // Background colors
    background: {
      default: "",
      surface: "bg-surface-0",
      surfaceAlt: "bg-surface-50",
      surfaceDisabled: "bg-surface-100",
      addonBg: "bg-surface-0",
      addonHover: "bg-surface-50",
      addonFocus: "bg-primary-50/30",
      primary: "bg-primary-500",
      primaryHover: "bg-primary-600",
      primaryLight: "bg-primary-50",
      primaryLighter: "bg-primary-100",
      error: "bg-red-50/30",
      transparent: "bg-transparent",
      white: "bg-white",
      hover: {
        primary: "hover:bg-primary-50",
        primaryStrong: "hover:bg-primary-600",
        surface: "hover:bg-surface-100",
        surfaceAlt: "hover:bg-surface-400",
      },
    },

    // Text colors
    text: {
      default: "text-text-color",
      secondary: "text-text-color-secondary",
      primary: "text-primary-700",
      primaryStrong: "text-primary-600",
      error: "text-red-600",
      white: "text-white",
      disabled: "text-text-color-secondary",
      hover: {
        primary: "hover:text-text-color",
        primaryStrong: "hover:text-primary-500",
      },
    },
  },

  // === EFFECTS & ANIMATIONS ===
  effects: {
    // Transitions
    transition: "transition-all duration-200 ease-out",
    transitionColors: "transition-colors duration-200",

    // Shadows
    shadow: {
      base: "shadow-sm",
      strong: "shadow-lg",
      xl: "shadow-xl",
    },

    // Focus states
    focus: {
      ring: "focus:outline-none focus:ring-2 focus:ring-primary-200",
      ringError: "focus:ring-red-200",
    },

    // Special effects
    // focusRing:
    //   "absolute inset-0 border-2 border-primary-400 rounded-2xl pointer-events-none opacity-30 animate-pulse",
    // hoverGradient:
    //   "absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
    // focusShine:
    //   "absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl opacity-60",

    // Animations
    slideIn: "animate-in slide-in-from-top-1 duration-200",
    scaleIn: "scale-100",
    scaleOut: "scale-75",
    opacity: {
      visible: "opacity-100",
      hidden: "opacity-0",
      disabled: "opacity-50",
      subtle: "opacity-60",
    },
  },

  // === SIZING ===
  sizing: {
    // Icon sizes
    icon: {
      compact: "w-4 h-4",
      base: "w-5 h-5",
      large: "w-6 h-6",
      xl: "w-8 h-8",
      xxl: "w-10 h-10",
    },

    // Component sizes
    component: {
      minWidth: "min-w-[2.5rem]",
      fullWidth: "w-full",
      maxWidth: "max-w-full",
      flexShrink: "flex-shrink-0",
    },

    // Spacing sizes
    space: {
      tiny: "w-1 h-1",
      small: "w-1.5 h-1.5",
    },
  },

  // === LAYOUT ===
  layout: {
    // Flexbox utilities
    flex: {
      center: "flex items-center justify-center",
      between: "flex items-center justify-between",
      col: "flex flex-col",
      colCenter: "flex items-center flex-col",
      inline: "inline-flex",
      inlineCenter: "inline-flex items-center",
      wrap: "flex-wrap",
    },

    // Positioning
    position: {
      relative: "relative",
      absolute: "absolute",
      inset: "inset-0",
      topHalf: "top-1/2 -translate-y-1/2",
      rightCenter: "right-3 top-1/2 -translate-y-1/2",
    },

    // Overflow
    overflow: {
      hidden: "overflow-hidden",
      visible: "overflow-visible",
    },

    // Display
    display: {
      hidden: "hidden",
      block: "block",
      inlineBlock: "inline-block",
    },
  },

  // === INTERACTIONS ===
  interactions: {
    cursor: {
      pointer: "cursor-pointer",
      notAllowed: "cursor-not-allowed",
      default: "cursor-default",
    },

    pointerEvents: {
      none: "pointer-events-none",
      auto: "pointer-events-auto",
    },

    userSelect: {
      none: "select-none",
      text: "select-text",
    },
  },

  // === BORDERS ===
  borders: {
    width: {
      none: "border-none",
      base: "border",
      thick: "border-2",
    },

    sides: {
      top: "border-t",
      right: "border-r",
      bottom: "border-b",
      left: "border-l",
      none: {
        top: "border-t-0",
        right: "border-r-0",
        bottom: "border-b-0",
        left: "border-l-0",
      },
    },
  },
};

// Legacy tokens for backward compatibility
export const FORM_FIELD_TOKENS = {
  padding: DESIGN_TOKENS.spacing.input,
  radius: DESIGN_TOKENS.radius,
  typography: DESIGN_TOKENS.typography,
  colors: DESIGN_TOKENS.colors,
  transitions: DESIGN_TOKENS.effects.transition,
  effects: {
    focusRing: DESIGN_TOKENS.effects.focusRing,
    hoverGradient: DESIGN_TOKENS.effects.hoverGradient,
    focusShine: DESIGN_TOKENS.effects.focusShine,
  },
};

/**
 * =============================================================================
 * COMPONENT LOGIC & HOOKS
 * =============================================================================
 */

/**
 * Hook to generate consistent input classes based on state
 */
export const useFormFieldClasses = (state = {}) => {
  const {
    isFocused = false,
    isHovered = false,
    disabled = false,
    error = false,
    size = "base",
    className = "",
    excludePadding = false,
  } = state;

  return useMemo(() => {
    const t = DESIGN_TOKENS; // Shorthand for tokens

    const classes = [
      // Base styling
      t.sizing.component.fullWidth,
      !excludePadding && t.spacing.input[size],
      t.typography.base,
      t.radius.base,
      t.borders.width.base,
      t.typography.placeholder,
      t.effects.transition,

      // Default colors
      t.colors.text.default,
      t.colors.border.default,
      t.colors.background.default,

      // Focus states
      isFocused && !disabled && [t.colors.border.focus, "shadow-none"],

      // Hover states (only when not focused)
      !isFocused && isHovered && !disabled && [t.colors.border.hover],

      // Disabled states
      disabled && [
        t.colors.background.surfaceDisabled,
        t.colors.border.disabled,
        t.colors.text.disabled,
        t.interactions.cursor.notAllowed,
      ],

      // Error states
      error && !disabled && [t.colors.border.error, t.colors.background.error],

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
      className: `${DESIGN_TOKENS.layout.position.relative} group`,
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
  const t = DESIGN_TOKENS;

  const baseStyles = [
    t.spacing.addon.padding,
    t.borders.width.base,
    t.effects.transition,
    t.typography.base,
  ];

  // Handle border radius based on position
  if (position === "left") {
    baseStyles.push(
      `${t.radius.base.replace("rounded-", "rounded-l-")} ${
        t.borders.sides.none.right
      }`
    );
  } else if (position === "right") {
    baseStyles.push(
      `${t.radius.base.replace("rounded-", "rounded-r-")} ${
        t.borders.sides.none.left
      }`
    );
  } else if (position === "middle") {
    baseStyles.push(
      `rounded-none ${t.borders.sides.none.left} ${t.borders.sides.none.right}`
    );
  }

  if (disabled) {
    baseStyles.push(
      t.colors.background.surfaceDisabled,
      t.colors.border.disabled,
      t.colors.text.disabled,
      t.interactions.cursor.notAllowed
    );
  } else if (isFocused) {
    baseStyles.push(
      t.colors.border.focus,
      t.colors.background.addonFocus,
      t.colors.text.default
    );
  } else if (isHovered) {
    baseStyles.push(
      t.colors.border.hover,
      t.colors.background.addonHover,
      t.colors.text.default
    );
  } else {
    baseStyles.push(
      t.colors.border.default,
      t.colors.background.addonBg,
      t.colors.text.default
    );
  }

  return baseStyles.filter(Boolean).join(" ");
};

export const getAddonIconStyles = (state) => {
  const { isFocused, disabled } = state;
  const t = DESIGN_TOKENS;

  if (disabled) {
    return t.colors.text.secondary;
  } else if (isFocused) {
    return `${t.colors.text.primaryStrong} ${t.effects.transitionColors}`;
  } else {
    return `${t.colors.text.secondary} ${t.colors.text.hover.primaryStrong} ${t.effects.transitionColors}`;
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
  const t = DESIGN_TOKENS;

  return (
    <div className={`${t.layout.position.relative} group ${className}`}>
      {/* Input Container */}
      <div
        className={t.layout.position.relative}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}

        {/* Focus Ring Enhancement */}
        {isFocused && !disabled && <div className={t.effects.focusRing} />}

        {/* Required Indicator */}
        {required && !disabled && (
          <div className={t.layout.position.rightCenter}>
            <div
              className={`${
                t.sizing.space.small
              } ${t.colors.background.error.replace(
                "bg-red-50/30",
                "bg-red-400"
              )} ${t.radius.full} ${t.effects.opacity.subtle}`}
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={`${id}-error`}
          className={`${t.spacing.panel.margin} ${t.typography.error} ${t.layout.flex.center} ${t.spacing.gap.small} ${t.effects.slideIn}`}
        >
          <div
            className={`${t.sizing.space.tiny} bg-red-500 ${t.radius.full} ${t.sizing.component.flexShrink}`}
          />
          {error}
        </div>
      )}

      {/* Subtle Enhancement Indicators */}
      <div
        className={`${t.layout.position.absolute} ${t.layout.position.inset} ${t.radius.base} ${t.interactions.pointerEvents.none}`}
      >
        {/* Gradient overlay on hover */}
        {isHovered && !isFocused && !disabled && (
          <div className={t.effects.hoverGradient} />
        )}

        {/* Shine effect on focus */}
        {isFocused && !disabled && <div className={t.effects.focusShine} />}
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
 * =============================================================================
 * PRIMEREACT PASSTHROUGH CONFIGURATIONS
 * =============================================================================
 */

export const PRIMEREACT_PT_CONFIGS = {
  // InputText, InputTextarea, etc.
  inputText: (state) => ({
    root: {
      className: useFormFieldClasses(state),
    },
  }),

  // InputNumber (Int, Float, Currency, etc.)
  inputNumber: (state) => {
    const t = DESIGN_TOKENS;
    return {
      root: {
        className: `${t.sizing.component.fullWidth} ${t.layout.flex.inline} ${t.colors.background.transparent} ${t.borders.width.none} p-0 shadow-none`,
      },
      input: {
        root: {
          className: useFormFieldClasses({
            ...state,
            className: `${state.className || ""}`,
          }),
        },
      },
      incrementButton: { className: t.layout.display.hidden },
      decrementButton: { className: t.layout.display.hidden },
      buttonGroup: { className: t.layout.display.hidden },
    };
  },

  // InputNumber with Addons (Currency, Percent, Duration, etc.)
  inputNumberWithAddon: (state, addonPosition = "right") => {
    const t = DESIGN_TOKENS;

    const getBorderClass = (position) => {
      switch (position) {
        case "left":
          return `rounded-l-none ${t.borders.sides.none.left}`;
        case "right":
          return `rounded-r-none ${t.borders.sides.none.right}`;
        case "both":
          return `rounded-none ${t.borders.sides.none.left} ${t.borders.sides.none.right}`;
        default:
          return "";
      }
    };

    return {
      root: {
        className: `${t.sizing.component.fullWidth} ${t.layout.flex.inline} ${t.colors.background.transparent} ${t.borders.width.none} p-0 shadow-none`,
      },
      input: {
        root: {
          className: useFormFieldClasses({
            ...state,
            className: `${state.className || ""} ${getBorderClass(
              addonPosition
            )}`,
          }),
        },
      },
      incrementButton: { className: t.layout.display.hidden },
      decrementButton: { className: t.layout.display.hidden },
      buttonGroup: { className: t.layout.display.hidden },
    };
  },

  // InputText with Addons (for color picker, etc.)
  inputTextWithAddon: (state, addonPosition = "right") => {
    const t = DESIGN_TOKENS;

    const getBorderClass = (position) => {
      switch (position) {
        case "left":
          return `rounded-l-none ${t.borders.sides.none.left}`;
        case "right":
          return `rounded-r-none ${t.borders.sides.none.right}`;
        case "both":
          return `rounded-none ${t.borders.sides.none.left} ${t.borders.sides.none.right}`;
        default:
          return "";
      }
    };

    return {
      root: {
        className: useFormFieldClasses({
          ...state,
          className: `${state.className || ""} ${getBorderClass(
            addonPosition
          )}`,
        }),
      },
    };
  },

  // Calendar (Date, DateTime, Time) - Now with addon-style trigger
  calendar: (state) => {
    const t = DESIGN_TOKENS;

    return {
      root: {
        className: `${t.layout.flex.inline} ${t.sizing.component.maxWidth} ${t.layout.position.relative} ${t.sizing.component.fullWidth}`,
      },
      input: {
        root: {
          className: useFormFieldClasses({
            ...state,
            className: `${state.className || ""} ${
              !state.disabled
                ? `rounded-r-none ${t.borders.sides.none.right}`
                : ""
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
        className: `${t.colors.background.surface} ${t.borders.width.none} ${t.effects.shadow.xl} ${t.radius.base} ${t.spacing.panel.margin} ${t.layout.overflow.hidden} backdrop-blur-sm`,
      },
      header: {
        className: `${t.layout.flex.between} ${t.spacing.panel.padding} ${t.colors.text.default} ${t.colors.background.surface} font-semibold ${t.borders.sides.bottom} ${t.colors.border.default}`,
      },
      previousButton: {
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition} ${t.colors.text.hover.primary} ${t.colors.background.hover.surface}`,
      },
      nextButton: {
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition} ${t.colors.text.hover.primary} ${t.colors.background.hover.surface}`,
      },
      title: {
        className: `leading-8 mx-auto font-medium ${t.colors.text.default}`,
      },
      monthTitle: {
        className: `${t.colors.text.default} ${
          t.effects.transition
        } font-medium p-2 mr-2 ${
          t.colors.text.hover.primaryStrong
        } ${t.radius.base.replace("2xl", "lg")} ${
          t.colors.background.hover.primary
        }`,
      },
      yearTitle: {
        className: `${t.colors.text.default} ${
          t.effects.transition
        } font-medium p-2 ${
          t.colors.text.hover.primaryStrong
        } ${t.radius.base.replace("2xl", "lg")} ${
          t.colors.background.hover.primary
        }`,
      },
      table: {
        className: "border-collapse w-full my-2",
      },
      tableHeaderCell: {
        className: "p-2",
      },
      weekday: {
        className: `${t.colors.text.secondary} font-medium ${
          t.typography.secondary.split(" ")[0]
        }`,
      },
      day: {
        className: "p-1",
      },
      dayLabel: {
        className: `${t.sizing.icon.xxl} ${t.radius.small} ${t.effects.transition} ${t.colors.border.transparent} ${t.borders.width.base} ${t.layout.flex.center} mx-auto ${t.layout.overflow.hidden} ${t.layout.position.relative} ${t.effects.focus.ring} ${t.interactions.cursor.pointer} ${t.colors.text.default} ${t.colors.background.hover.primary} data-[p-highlight=true]:${t.colors.text.primary} data-[p-highlight=true]:${t.colors.background.primaryLight} data-[p-highlight=true]:hover:${t.colors.background.primaryLighter}`,
      },
      monthPicker: {
        className: "my-2 p-2",
      },
      month: {
        className: `w-1/3 ${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.layout.overflow.hidden} ${t.layout.position.relative} p-3 ${t.effects.transition} ${t.radius.small} ${t.effects.focus.ring} ${t.colors.text.default} ${t.colors.background.hover.primary} data-[p-highlight=true]:${t.colors.text.primary} data-[p-highlight=true]:${t.colors.background.primaryLight}`,
      },
      yearPicker: {
        className: "my-2 p-2",
      },
      year: {
        className: `w-1/2 ${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.layout.overflow.hidden} ${t.layout.position.relative} p-3 ${t.effects.transition} ${t.radius.small} ${t.effects.focus.ring} ${t.colors.text.default} ${t.colors.background.hover.primary} data-[p-highlight=true]:${t.colors.text.primary} data-[p-highlight=true]:${t.colors.background.primaryLight}`,
      },
      // Time picker specific styling
      timePicker: {
        className: `${t.layout.flex.center} ${t.borders.sides.top} ${t.colors.border.default} ${t.spacing.panel.padding} ${t.colors.background.surfaceAlt}`,
      },
      separatorContainer: {
        className: `${t.layout.flex.colCenter} px-2`,
      },
      separator: {
        className: `${t.typography.xl} ${t.colors.text.secondary}`,
      },
      hourPicker: {
        className: `${t.layout.flex.colCenter} px-2`,
      },
      minutePicker: {
        className: `${t.layout.flex.colCenter} px-2`,
      },
      secondPicker: {
        className: `${t.layout.flex.colCenter} px-2`,
      },
      ampmPicker: {
        className: `${t.layout.flex.colCenter} px-2`,
      },
      incrementButton: {
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition} ${t.colors.text.hover.primary} ${t.colors.background.hover.surface}`,
      },
      decrementButton: {
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition} ${t.colors.text.hover.primary} ${t.colors.background.hover.surface}`,
      },
      // Time display styling
      hour: {
        className: `${t.typography.xl} ${t.colors.text.default} ${t.colors.background.surfaceDisabled} ${t.radius.small} px-3 py-2 ${t.sizing.component.minWidth} text-center`,
      },
      minute: {
        className: `${t.typography.xl} ${t.colors.text.default} ${t.colors.background.surfaceDisabled} ${t.radius.small} px-3 py-2 ${t.sizing.component.minWidth} text-center`,
      },
      second: {
        className: `${t.typography.xl} ${t.colors.text.default} ${t.colors.background.surfaceDisabled} ${t.radius.small} px-3 py-2 ${t.sizing.component.minWidth} text-center`,
      },
      ampm: {
        className: `${t.typography.large} ${t.colors.text.default} ${t.colors.background.primaryLighter} ${t.colors.text.primary} ${t.radius.small} px-3 py-2 ${t.sizing.component.minWidth} text-center`,
      },
    };
  },

  // Dropdown (Select, Link, etc.)
  dropdown: (state) => {
    const t = DESIGN_TOKENS;

    return {
      root: {
        className: useFormFieldClasses({
          ...state,
          excludePadding: true,
          className: `${state.className || ""} ${
            t.interactions.cursor.pointer
          } ${t.layout.flex.center}`,
        }),
      },
      input: {
        className: `outline-none ${t.colors.background.transparent} ${t.borders.width.none} ${t.sizing.component.fullWidth} ${t.typography.base} ${t.typography.placeholder}`,
      },
      trigger: {
        className: `${t.colors.text.secondary} ${t.colors.text.hover.primaryStrong} ${t.effects.transitionColors} ${t.sizing.component.flexShrink} ${t.spacing.addon.gap}`,
      },
      panel: {
        className: `${t.borders.width.none} ${t.effects.shadow.strong} ${t.radius.base} ${t.spacing.panel.margin} ${t.layout.overflow.hidden}`,
      },
      list: {
        className: "p-0",
      },
      item: {
        className: `${t.spacing.addon.padding} ${t.colors.background.hover.primary} ${t.effects.transitionColors} ${t.interactions.cursor.pointer} ${t.borders.width.none}`,
      },
    };
  },

  // ColorPicker
  colorPicker: (state) => {
    const t = DESIGN_TOKENS;

    return {
      root: {
        className: `${t.layout.flex.colCenter}`,
      },
      input: {
        className: useFormFieldClasses(state),
      },
      panel: {
        className: `${t.borders.width.none} ${t.effects.shadow.strong} ${t.radius.base} ${t.spacing.panel.margin}`,
      },
    };
  },

  // InputSwitch - Enhanced styling
  inputSwitch: (state) => {
    const t = DESIGN_TOKENS;

    return {
      root: {
        className: `
          ${t.layout.position.relative} ${t.layout.flex.inlineCenter} ${
          t.interactions.cursor.pointer
        } ${t.effects.transition} ${t.effects.focus.ring} ${t.radius.full}
          ${
            state.disabled
              ? `${t.effects.opacity.disabled} ${t.interactions.cursor.notAllowed}`
              : ""
          }
          ${
            state.error
              ? `${t.effects.focus.ringError.replace("focus:", "")}`
              : ""
          }
        `,
      },
      slider: {
        className: `
          ${t.effects.transition} ${t.radius.full}
          ${
            state.disabled
              ? t.colors.background.surfaceAlt.replace(
                  "bg-surface-50",
                  "bg-surface-300"
                )
              : state.checked || state.value
              ? `${t.colors.background.primary} ${t.colors.background.hover.primaryStrong}`
              : `${t.colors.background.surfaceAlt.replace(
                  "bg-surface-50",
                  "bg-surface-300"
                )} ${t.colors.background.hover.surfaceAlt}`
          }
        `,
      },
      handle: {
        className: `
          ${t.effects.transition} ${t.radius.full} ${t.effects.shadow.strong} ${
          t.borders.width.thick
        } border-white ${t.colors.background.white} transform
          ${
            state.size === "large"
              ? t.sizing.icon.large
              : state.size === "compact"
              ? t.sizing.icon.compact
              : t.sizing.icon.base
          }
          ${state.checked || state.value ? "translate-x-full" : "translate-x-0"}
        `,
      },
    };
  },

  // Checkbox - Enhanced styling
  checkbox: (state) => {
    const t = DESIGN_TOKENS;

    return {
      root: {
        className: `${t.layout.position.relative} ${t.layout.flex.inlineCenter}`,
      },
      box: {
        className: `
          ${t.effects.transition} ${
          t.borders.width.thick
        } ${t.radius.base.replace("2xl", "lg")} ${t.layout.flex.center} ${
          t.effects.focus.ring
        } ${t.interactions.cursor.pointer}
          ${
            state.size === "large"
              ? t.sizing.icon.large
              : state.size === "compact"
              ? t.sizing.icon.compact
              : t.sizing.icon.base
          }
          ${
            state.error
              ? `${t.colors.border.error} ${t.effects.focus.ringError}`
              : state.disabled
              ? `${t.colors.border.default.replace(
                  "border-surface-100",
                  "border-surface-200"
                )} ${t.colors.background.surfaceDisabled} ${
                  t.interactions.cursor.notAllowed
                }`
              : state.checked || state.value
              ? `${t.colors.border.focus.replace(
                  "border-primary-400",
                  "border-primary-500"
                )} ${
                  t.colors.background.primary
                } ${t.colors.border.hover.replace(
                  "border-primary-400",
                  "hover:border-primary-600"
                )} ${t.colors.background.hover.primaryStrong} ${
                  t.effects.shadow.base
                }`
              : `${t.colors.border.default.replace(
                  "border-surface-100",
                  "border-surface-300"
                )} ${t.colors.background.surface} ${
                  t.colors.border.hover
                } ${t.effects.shadow.base.replace(
                  "shadow-sm",
                  "hover:shadow-sm"
                )}`
          }
        `,
      },
      icon: {
        className: `
          ${t.effects.transition} ${t.colors.text.white} font-bold
          ${
            state.size === "large"
              ? t.typography.base.replace("text-sm", "text-sm")
              : state.size === "compact"
              ? t.typography.base.replace("text-sm", "text-xs")
              : t.typography.base
          }
          ${
            state.checked || state.value
              ? `${t.effects.opacity.visible} ${t.effects.scaleIn}`
              : `${t.effects.opacity.hidden} ${t.effects.scaleOut}`
          }
        `,
      },
    };
  },
};

export default {
  DESIGN_TOKENS,
  FORM_FIELD_TOKENS,
  useFormFieldClasses,
  getFormFieldPT,
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  getAddonStyles,
  getAddonIconStyles,
};
