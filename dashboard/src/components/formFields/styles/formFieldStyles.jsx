// src/styles/formFieldStyles.js - Enhanced Centralized Form Field Styles System
import React from "react";
import { useMemo } from "react";

/**
 * =============================================================================
 * CORE DESIGN TOKENS - GRANULAR EXTRACTION
 * =============================================================================
 * Ultra-granular tokens for maximum customization flexibility
 */

export const DESIGN_TOKENS = {
  // === SPACING & SIZING (Enhanced) ===
  spacing: {
    // Input padding variants
    input: {
      compact: "px-3 py-2",
      base: "px-4 py-3",
      large: "px-5 py-4",
      xl: "px-6 py-5",
    },
    // Panel/Container spacing
    panel: {
      padding: "p-4",
      paddingSmall: "p-2",
      paddingLarge: "p-6",
      margin: "mt-2",
      marginLarge: "mt-4",
    },
    // Component spacing
    gap: {
      tiny: "gap-1",
      small: "gap-2",
      base: "gap-4",
      large: "gap-6",
      xl: "gap-8",
    },
    // Icon/addon spacing
    addon: {
      padding: "px-4 py-3",
      paddingCompact: "px-3 py-2",
      paddingLarge: "px-5 py-4",
      gap: "ml-2",
      gapLarge: "ml-4",
    },
    // Margin utilities
    margin: {
      none: "m-0",
      tiny: "m-1",
      small: "m-2",
      base: "m-4",
      large: "m-6",
    },
  },

  // === BORDER RADIUS (Enhanced) ===
  radius: {
    none: "rounded-none",
    tiny: "rounded-sm",
    small: "rounded-lg",
    base: "rounded-2xl",
    large: "rounded-3xl",
    xl: "rounded-[2rem]",
    full: "rounded-full",
    // Directional radius
    left: {
      small: "rounded-l-lg",
      base: "rounded-l-2xl",
      large: "rounded-l-3xl",
    },
    right: {
      small: "rounded-r-lg",
      base: "rounded-r-2xl",
      large: "rounded-r-3xl",
    },
    top: {
      small: "rounded-t-lg",
      base: "rounded-t-2xl",
      large: "rounded-t-3xl",
    },
    bottom: {
      small: "rounded-b-lg",
      base: "rounded-b-2xl",
      large: "rounded-b-3xl",
    },
  },

  // === TYPOGRAPHY (Enhanced) ===
  typography: {
    // Size variants
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    xxl: "text-2xl",

    // Weight variants
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },

    // Combined variants (your existing ones)
    field: {
      compact: "text-sm font-medium",
      base: "text-sm font-medium",
      large: "text-lg font-bold",
      xl: "text-xl font-bold",
    },

    // Specialized text
    placeholder: "placeholder:text-text-color-secondary/60",
    error: "text-xs text-red-600 font-medium",
    secondary: "text-text-color-secondary font-medium text-sm",
    helper: "text-xs text-text-color-secondary/80",
  },

  // === COLORS (Massively Enhanced) ===
  colors: {
    // Border colors with intensity variants
    border: {
      // Base borders
      none: "border-none",
      transparent: "border-transparent",
      default: "border-surface-100",
      light: "border-surface-50",
      medium: "border-surface-200",
      strong: "border-surface-300",

      // State borders
      hover: "border-primary-200",
      hoverStrong: "border-primary-300",
      focus: "border-primary-400",
      focusStrong: "border-primary-500",
      active: "border-primary-600",

      // Status borders
      error: "border-red-300",
      errorStrong: "border-red-400",
      success: "border-green-300",
      warning: "border-yellow-300",
      info: "border-blue-300",

      // Disabled
      disabled: "border-surface-100/50",
    },

    // Background colors with comprehensive variants
    background: {
      // Base backgrounds
      none: "",
      transparent: "bg-transparent",
      white: "bg-white",
      surface: "bg-surface-0",
      surfaceAlt: "bg-surface-50",
      surfaceStrong: "bg-surface-100",
      surfaceDisabled: "bg-surface-100",

      // Primary variants
      primary: "bg-primary-500",
      primaryLight: "bg-primary-50",
      primaryMedium: "bg-primary-100",
      primaryStrong: "bg-primary-200",
      primaryDark: "bg-primary-600",

      // Status backgrounds
      error: "bg-red-50/30",
      errorLight: "bg-red-25",
      errorStrong: "bg-red-100",
      success: "bg-green-50/30",
      warning: "bg-yellow-50/30",
      info: "bg-blue-50/30",

      // Addon specific
      addon: "bg-surface-0",
      addonHover: "bg-surface-50",
      addonFocus: "bg-primary-50/30",
      addonActive: "bg-primary-100/50",
    },

    // Text colors with variants
    text: {
      // Base text
      default: "text-text-color",
      secondary: "text-text-color-secondary",
      tertiary: "text-text-color-secondary/70",
      disabled: "text-text-color-secondary/50",

      // Primary variants
      primary: "text-primary-700",
      primaryLight: "text-primary-500",
      primaryStrong: "text-primary-600",
      primaryDark: "text-primary-800",

      // Status text
      error: "text-red-600",
      errorLight: "text-red-500",
      success: "text-green-600",
      warning: "text-yellow-600",
      info: "text-blue-600",

      // Special
      white: "text-white",
      muted: "text-text-color-secondary/60",

      // Hover variants (safe fallbacks)
      hover: {
        primary: "hover:text-text-color",
        primaryStrong: "hover:text-primary-500",
      },
    },
  },

  // === INTERACTION PRESETS (New!) ===
  presets: {
    // Hover effect presets
    hover: {
      // Scale effects
      scale: {
        subtle:
          "hover:scale-[1.02] transform transition-transform duration-200",
        medium: "hover:scale-105 transform transition-transform duration-200",
        strong: "hover:scale-110 transform transition-transform duration-200",
      },

      // Glow effects
      glow: {
        subtle:
          "hover:shadow-md hover:shadow-primary-200/20 transition-shadow duration-300",
        medium:
          "hover:shadow-lg hover:shadow-primary-300/30 transition-shadow duration-300",
        strong:
          "hover:shadow-xl hover:shadow-primary-400/40 transition-shadow duration-300",
      },

      // Brightness effects
      brightness: {
        subtle: "hover:brightness-105 transition-all duration-200",
        medium: "hover:brightness-110 transition-all duration-200",
        strong: "hover:brightness-125 transition-all duration-200",
      },

      // Background effects
      background: {
        subtle: "hover:bg-surface-50 transition-colors duration-200",
        medium: "hover:bg-surface-100 transition-colors duration-200",
        strong: "hover:bg-surface-200 transition-colors duration-200",
        primary: "hover:bg-primary-50 transition-colors duration-200",
        primaryStrong: "hover:bg-primary-100 transition-colors duration-200",
      },

      // Border effects
      border: {
        subtle: "hover:border-surface-200 transition-colors duration-200",
        medium: "hover:border-surface-300 transition-colors duration-200",
        strong: "hover:border-primary-200 transition-colors duration-200",
        primaryStrong:
          "hover:border-primary-300 transition-colors duration-200",
      },

      // Combined presets
      gentle:
        "hover:bg-surface-50 hover:border-surface-200 hover:scale-[1.01] transition-all duration-200",
      elevated:
        "hover:bg-primary-50 hover:border-primary-200 hover:shadow-md hover:shadow-primary-200/20 transition-all duration-300",
      dynamic:
        "hover:bg-primary-50 hover:border-primary-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-300/30 transition-all duration-300",
    },

    // Focus effect presets
    focus: {
      // Ring effects (disabled by default but available)
      ring: {
        none: "focus:outline-none focus:ring-0",
        subtle: "focus:outline-none focus:ring-2 focus:ring-primary-200/50",
        medium: "focus:outline-none focus:ring-2 focus:ring-primary-300",
        strong: "focus:outline-none focus:ring-4 focus:ring-primary-400/60",
      },

      // Glow effects
      glow: {
        subtle:
          "focus:shadow-md focus:shadow-primary-200/30 transition-shadow duration-200",
        medium:
          "focus:shadow-lg focus:shadow-primary-300/40 transition-shadow duration-200",
        strong:
          "focus:shadow-xl focus:shadow-primary-400/50 transition-shadow duration-200",
      },

      // Background effects
      background: {
        subtle: "focus:bg-primary-25 transition-colors duration-200",
        medium: "focus:bg-primary-50 transition-colors duration-200",
        strong: "focus:bg-primary-100 transition-colors duration-200",
      },

      // Border effects
      border: {
        subtle: "focus:border-primary-300 transition-colors duration-200",
        medium: "focus:border-primary-400 transition-colors duration-200",
        strong: "focus:border-primary-500 transition-colors duration-200",
      },

      // Combined presets
      gentle:
        "focus:outline-none focus:ring-0 focus:bg-primary-25 focus:border-primary-300 transition-all duration-200",
      elevated:
        "focus:outline-none focus:ring-0 focus:bg-primary-50 focus:border-primary-400 focus:shadow-md focus:shadow-primary-200/30 transition-all duration-300",
      dynamic:
        "focus:outline-none focus:ring-0 focus:bg-primary-50 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-300/40 transition-all duration-300",
    },

    // Active state presets
    active: {
      scale: {
        subtle: "active:scale-[0.98] transition-transform duration-100",
        medium: "active:scale-95 transition-transform duration-100",
      },
      background: {
        subtle: "active:bg-primary-100 transition-colors duration-100",
        strong: "active:bg-primary-200 transition-colors duration-100",
      },
      border: {
        strong: "active:border-primary-600 transition-colors duration-100",
      },
    },

    // Disabled state presets
    disabled: {
      opacity: "disabled:opacity-50",
      cursor: "disabled:cursor-not-allowed",
      background: "disabled:bg-surface-100",
      text: "disabled:text-text-color-secondary/50",
      border: "disabled:border-surface-100/50",
      combined:
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-text-color-secondary/50",
    },
  },

  // === EFFECTS & ANIMATIONS (Enhanced) ===
  effects: {
    // Transitions with variants
    transition: {
      none: "transition-none",
      fast: "transition-all duration-100 ease-out",
      base: "transition-all duration-200 ease-out",
      slow: "transition-all duration-300 ease-out",
      colors: "transition-colors duration-200",
      transform: "transition-transform duration-200",
      shadow: "transition-shadow duration-300",
    },

    // Shadows with variants
    shadow: {
      none: "shadow-none",
      tiny: "shadow-sm",
      base: "shadow-md",
      strong: "shadow-lg",
      xl: "shadow-xl",
      xxl: "shadow-2xl",
      // Colored shadows
      primary: "shadow-lg shadow-primary-200/20",
      primaryStrong: "shadow-xl shadow-primary-300/30",
      error: "shadow-lg shadow-red-200/20",
    },

    // Opacity variants
    opacity: {
      hidden: "opacity-0",
      subtle: "opacity-30",
      medium: "opacity-60",
      visible: "opacity-100",
      disabled: "opacity-50",
    },

    // Scale variants
    scale: {
      none: "scale-100",
      subtle: "scale-[1.02]",
      medium: "scale-105",
      large: "scale-110",
      down: "scale-95",
      hide: "scale-0",
    },

    // Special effects (simplified - no focus rings by default)
    focusRing: "focus:outline-none focus:ring-0",
    hoverGradient:
      "hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-transparent",
    focusShine:
      "focus:bg-gradient-to-br focus:from-white/10 focus:via-transparent focus:to-transparent",

    // Animation presets
    slideIn: "animate-in slide-in-from-top-1 duration-200",
    fadeIn: "animate-in fade-in duration-200",
    scaleIn: "animate-in scale-in-95 duration-200",
  },

  // === SIZING (Enhanced) ===
  sizing: {
    // Icon sizes
    icon: {
      tiny: "w-3 h-3",
      compact: "w-4 h-4",
      base: "w-5 h-5",
      large: "w-6 h-6",
      xl: "w-8 h-8",
      xxl: "w-10 h-10",
      xxxl: "w-12 h-12",
    },

    // Component sizes
    component: {
      minWidth: "min-w-[2.5rem]",
      minWidthLarge: "min-w-[4rem]",
      fullWidth: "w-full",
      maxWidth: "max-w-full",
      flexShrink: "flex-shrink-0",
      flexGrow: "flex-grow",
    },

    // Height variants
    height: {
      compact: "h-8",
      base: "h-10",
      large: "h-12",
      xl: "h-16",
    },

    // Space utilities
    space: {
      tiny: "w-1 h-1",
      small: "w-1.5 h-1.5",
      base: "w-2 h-2",
      large: "w-3 h-3",
    },
  },

  // === LAYOUT (Enhanced) ===
  layout: {
    // Flexbox utilities
    flex: {
      center: "flex items-center justify-center",
      between: "flex items-center justify-between",
      start: "flex items-start",
      end: "flex items-end",
      col: "flex flex-col",
      colCenter: "flex items-center flex-col",
      inline: "inline-flex",
      inlineCenter: "inline-flex items-center",
      wrap: "flex-wrap",
      nowrap: "flex-nowrap",
    },

    // Grid utilities
    grid: {
      base: "grid",
      cols1: "grid-cols-1",
      cols2: "grid-cols-2",
      cols3: "grid-cols-3",
      cols4: "grid-cols-4",
      gap: "gap-4",
      gapSmall: "gap-2",
      gapLarge: "gap-6",
    },

    // Positioning
    position: {
      relative: "relative",
      absolute: "absolute",
      fixed: "fixed",
      sticky: "sticky",
      inset: "inset-0",
      topHalf: "top-1/2 -translate-y-1/2",
      rightCenter: "right-3 top-1/2 -translate-y-1/2",
      leftCenter: "left-3 top-1/2 -translate-y-1/2",
    },

    // Overflow
    overflow: {
      hidden: "overflow-hidden",
      visible: "overflow-visible",
      auto: "overflow-auto",
      scroll: "overflow-scroll",
      xHidden: "overflow-x-hidden",
      yHidden: "overflow-y-hidden",
    },

    // Display
    display: {
      hidden: "hidden",
      block: "block",
      inlineBlock: "inline-block",
      flex: "flex",
      inlineFlex: "inline-flex",
      grid: "grid",
      inlineGrid: "inline-grid",
    },
  },

  // === INTERACTIONS (Enhanced) ===
  interactions: {
    cursor: {
      auto: "cursor-auto",
      default: "cursor-default",
      pointer: "cursor-pointer",
      wait: "cursor-wait",
      text: "cursor-text",
      move: "cursor-move",
      notAllowed: "cursor-not-allowed",
      grab: "cursor-grab",
      grabbing: "cursor-grabbing",
    },

    pointerEvents: {
      none: "pointer-events-none",
      auto: "pointer-events-auto",
    },

    userSelect: {
      none: "select-none",
      text: "select-text",
      all: "select-all",
      auto: "select-auto",
    },

    // Touch interactions
    touch: {
      auto: "touch-auto",
      none: "touch-none",
      pinchZoom: "touch-pinch-zoom",
      manipulation: "touch-manipulation",
    },
  },

  // === BORDERS (Enhanced) ===
  borders: {
    width: {
      none: "border-none",
      thin: "border",
      base: "border",
      thick: "border-2",
      thicker: "border-4",
    },

    sides: {
      all: "border",
      top: "border-t",
      right: "border-r",
      bottom: "border-b",
      left: "border-l",
      x: "border-x",
      y: "border-y",
      none: {
        all: "border-0",
        top: "border-t-0",
        right: "border-r-0",
        bottom: "border-b-0",
        left: "border-l-0",
        x: "border-x-0",
        y: "border-y-0",
      },
    },

    style: {
      solid: "border-solid",
      dashed: "border-dashed",
      dotted: "border-dotted",
      double: "border-double",
      none: "border-none",
    },
  },
};

/**
 * =============================================================================
 * PRESET COMBINATIONS - READY-TO-USE INTERACTION STYLES
 * =============================================================================
 */

export const INTERACTION_PRESETS = {
  // Input field presets
  input: {
    // Gentle, professional feel
    gentle: {
      base: `${DESIGN_TOKENS.presets.hover.gentle} ${DESIGN_TOKENS.presets.focus.gentle}`,
      hover: DESIGN_TOKENS.presets.hover.background.subtle,
      focus: DESIGN_TOKENS.presets.focus.gentle,
      active: DESIGN_TOKENS.presets.active.scale.subtle,
    },

    // Modern, elevated feel
    elevated: {
      base: `${DESIGN_TOKENS.presets.hover.elevated} ${DESIGN_TOKENS.presets.focus.elevated}`,
      hover: DESIGN_TOKENS.presets.hover.elevated,
      focus: DESIGN_TOKENS.presets.focus.elevated,
      active: DESIGN_TOKENS.presets.active.scale.subtle,
    },

    // Dynamic, interactive feel
    dynamic: {
      base: `${DESIGN_TOKENS.presets.hover.dynamic} ${DESIGN_TOKENS.presets.focus.dynamic}`,
      hover: DESIGN_TOKENS.presets.hover.dynamic,
      focus: DESIGN_TOKENS.presets.focus.dynamic,
      active: DESIGN_TOKENS.presets.active.scale.medium,
    },

    // Minimal, clean feel
    minimal: {
      base: `${DESIGN_TOKENS.presets.hover.border.subtle} ${DESIGN_TOKENS.presets.focus.border.subtle}`,
      hover: DESIGN_TOKENS.presets.hover.border.subtle,
      focus: DESIGN_TOKENS.presets.focus.border.subtle,
      active: "",
    },
  },

  // Button presets
  button: {
    primary: {
      base: `${DESIGN_TOKENS.presets.hover.scale.subtle} ${DESIGN_TOKENS.presets.hover.glow.medium} ${DESIGN_TOKENS.presets.focus.glow.strong}`,
      hover: `${DESIGN_TOKENS.presets.hover.scale.subtle} ${DESIGN_TOKENS.presets.hover.glow.medium}`,
      focus: DESIGN_TOKENS.presets.focus.glow.strong,
      active: DESIGN_TOKENS.presets.active.scale.medium,
    },

    secondary: {
      base: `${DESIGN_TOKENS.presets.hover.background.primary} ${DESIGN_TOKENS.presets.hover.border.strong} ${DESIGN_TOKENS.presets.focus.gentle}`,
      hover: `${DESIGN_TOKENS.presets.hover.background.primary} ${DESIGN_TOKENS.presets.hover.border.strong}`,
      focus: DESIGN_TOKENS.presets.focus.gentle,
      active: DESIGN_TOKENS.presets.active.background.subtle,
    },
  },

  // Card/panel presets
  panel: {
    subtle: {
      hover: DESIGN_TOKENS.presets.hover.glow.subtle,
      focus: DESIGN_TOKENS.presets.focus.glow.subtle,
    },

    interactive: {
      base: `${DESIGN_TOKENS.presets.hover.scale.subtle} ${DESIGN_TOKENS.presets.hover.glow.medium}`,
      hover: `${DESIGN_TOKENS.presets.hover.scale.subtle} ${DESIGN_TOKENS.presets.hover.glow.medium}`,
      active: DESIGN_TOKENS.presets.active.scale.subtle,
    },
  },
};

/**
 * =============================================================================
 * QUICK PRESET SELECTOR
 * =============================================================================
 */

// Quick way to get a complete interaction preset
export const getInteractionPreset = (type = "input", variant = "elevated") => {
  return (
    INTERACTION_PRESETS[type]?.[variant] || INTERACTION_PRESETS.input.elevated
  );
};

/**
 * =============================================================================
 * ENHANCED HOOKS & UTILITIES
 * =============================================================================
 */

/**
 * Enhanced hook with preset support
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
    preset = "elevated", // New preset option
    customInteractions = {}, // Custom interaction overrides
  } = state;

  return useMemo(() => {
    const t = DESIGN_TOKENS;
    // Safe interaction preset access with fallback
    const interactions = getInteractionPreset("input", preset) || {};

    const classes = [
      // Base styling
      t.sizing.component.fullWidth,
      !excludePadding && t.spacing.input[size],
      t.typography.field[size] || t.typography.field.base,
      t.radius.base,
      t.borders.width.base,
      t.typography.placeholder,
      t.effects.transition.base,

      // Apply interaction preset (safely)
      interactions.base || "",

      // Default colors (if not overridden by preset)
      t.colors.text.default,
      t.colors.border.default,
      t.colors.background.none,

      // Disabled states (highest priority)
      disabled && [
        t.presets.disabled.combined,
        t.colors.background.surfaceDisabled,
        t.colors.border.disabled,
      ],

      // Error states
      error &&
        !disabled && [
          t.colors.border.error,
          t.colors.background.error,
          t.effects.shadow.error,
        ],

      // Custom interaction overrides
      customInteractions.hover,
      customInteractions.focus,
      customInteractions.active,

      // Custom className (highest priority)
      className,
    ]
      .filter(Boolean)
      .flat()
      .join(" ");

    return classes;
  }, [
    isFocused,
    isHovered,
    disabled,
    error,
    size,
    className,
    excludePadding,
    preset,
  ]);
};

/**
 * Enhanced addon styling with presets and unified states
 */
export const getAddonStyles = (
  state,
  position = "right",
  preset = "elevated"
) => {
  const { isFocused, isHovered, disabled } = state;
  const t = DESIGN_TOKENS;
  // Safe interaction preset access with fallback
  const interactions = getInteractionPreset("input", preset) || {};

  const baseStyles = [
    t.spacing.addon.padding,
    t.borders.width.base,
    t.effects.transition.base,
    t.typography.field.base,
  ];

  // Handle border radius based on position - NO ROUNDING on connected sides
  if (position === "left") {
    baseStyles.push(
      t.radius.left.base,
      t.borders.sides.none.right, // Remove border where it connects to input
      "border-r-0" // Ensure no right border
    );
  } else if (position === "right") {
    baseStyles.push(
      t.radius.right.base,
      t.borders.sides.none.left, // Remove border where it connects to input
      "border-l-0" // Ensure no left border
    );
  } else if (position === "middle") {
    baseStyles.push(
      t.radius.none,
      t.borders.sides.none.left,
      t.borders.sides.none.right,
      "border-l-0 border-r-0" // Ensure no side borders
    );
  }

  // UNIFIED STATE HANDLING - Addon matches input state exactly
  if (disabled) {
    baseStyles.push(
      t.colors.background.surfaceDisabled,
      t.colors.border.disabled,
      t.colors.text.disabled,
      t.interactions.cursor.notAllowed
    );
  } else if (isFocused) {
    // When input is focused, addon should match
    baseStyles.push(
      t.colors.border.focus,
      t.colors.background.addonFocus,
      t.colors.text.primaryStrong,
      interactions.focus || ""
    );
  } else if (isHovered) {
    // When input is hovered, addon should match
    baseStyles.push(
      t.colors.border.hover,
      t.colors.background.addonHover,
      t.colors.text.primary,
      interactions.hover || ""
    );
  } else {
    // Default state
    baseStyles.push(
      t.colors.border.default,
      t.colors.background.addon,
      t.colors.text.secondary
    );
  }

  return baseStyles.filter(Boolean).join(" ");
};

/**
 * =============================================================================
 * LEGACY COMPATIBILITY
 * =============================================================================
 */

// Keep existing exports for backward compatibility
export const FORM_FIELD_TOKENS = {
  padding: DESIGN_TOKENS.spacing.input,
  radius: DESIGN_TOKENS.radius,
  typography: DESIGN_TOKENS.typography,
  colors: DESIGN_TOKENS.colors,
  transitions: DESIGN_TOKENS.effects.transition.base,
  effects: {
    focusRing: DESIGN_TOKENS.effects.focusRing,
    hoverGradient: DESIGN_TOKENS.effects.hoverGradient,
    focusShine: DESIGN_TOKENS.effects.focusShine,
  },
};

// Enhanced PrimeReact configs with preset support
export const getFormFieldPT = (state = {}) => {
  const { preset = "elevated", customPT = {} } = state;
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

// Enhanced wrapper with unified field group state management
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
  preset = "elevated",
}) => {
  const t = DESIGN_TOKENS;

  return (
    <div className={`${t.layout.position.relative} group ${className}`}>
      {/* Input Container with unified hover/focus area */}
      <div
        className={`${t.layout.position.relative} ${
          !disabled ? "cursor-text" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}

        {/* Required Indicator */}
        {required && !disabled && (
          <div className={t.layout.position.rightCenter}>
            <div
              className={`${t.sizing.space.small} bg-red-400 ${t.radius.full} ${t.effects.opacity.medium}`}
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
    </div>
  );
};

// Enhanced state hook with field group support
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

  // Field group handlers - these maintain state across the entire field group
  const handleFieldGroupMouseEnter = React.useCallback((disabled) => {
    if (!disabled) {
      setIsHovered(true);
    }
  }, []);

  const handleFieldGroupMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleFieldGroupFocus = React.useCallback((e, originalOnFocus) => {
    setIsFocused(true);
    if (originalOnFocus) {
      originalOnFocus(e);
    }
  }, []);

  const handleFieldGroupBlur = React.useCallback((e, originalOnBlur) => {
    // Delay blur to allow clicking on addons
    setTimeout(() => {
      const activeElement = document.activeElement;
      const currentTarget = e.currentTarget;

      // Safety check to prevent null reference errors
      if (currentTarget && activeElement) {
        // Check if focus moved to an element within the same field group
        if (!currentTarget.contains(activeElement)) {
          setIsFocused(false);
        }
      } else {
        // If we can't determine the relationship, assume focus is lost
        setIsFocused(false);
      }
    }, 0);

    if (originalOnBlur) {
      originalOnBlur(e);
    }
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
    // Field group handlers
    handleFieldGroupMouseEnter,
    handleFieldGroupMouseLeave,
    handleFieldGroupFocus,
    handleFieldGroupBlur,
  };
};

/**
 * =============================================================================
 * ENHANCED PRIMEREACT PASSTHROUGH CONFIGURATIONS
 * =============================================================================
 */

export const PRIMEREACT_PT_CONFIGS = {
  // InputText with preset support
  inputText: (state, preset = "elevated") => ({
    root: {
      className: useFormFieldClasses({ ...state, preset }),
    },
  }),

  // Enhanced InputNumber with preset support
  inputNumber: (state, preset = "elevated") => {
    const t = DESIGN_TOKENS;
    return {
      root: {
        className: `${t.sizing.component.fullWidth} ${t.layout.flex.inline} ${t.colors.background.transparent} ${t.borders.width.none} p-0 shadow-none`,
      },
      input: {
        root: {
          className: useFormFieldClasses({
            ...state,
            preset,
            className: `${state.className || ""}`,
          }),
        },
      },
      incrementButton: { className: t.layout.display.hidden },
      decrementButton: { className: t.layout.display.hidden },
      buttonGroup: { className: t.layout.display.hidden },
    };
  },

  // Enhanced InputNumber with Addons
  inputNumberWithAddon: (
    state,
    addonPosition = "right",
    preset = "elevated"
  ) => {
    const t = DESIGN_TOKENS;

    const getBorderClass = (position) => {
      switch (position) {
        case "left":
          // Input is on the right side, so remove LEFT rounding and border
          return `rounded-l-none border-l-0`;
        case "right":
          // Input is on the left side, so remove RIGHT rounding and border
          return `rounded-r-none border-r-0`;
        case "both":
          // Input is in the middle, so remove BOTH side rounding and borders
          return `rounded-none border-l-0 border-r-0`;
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
            preset,
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

  // Enhanced InputText with Addons
  inputTextWithAddon: (state, addonPosition = "right", preset = "elevated") => {
    const t = DESIGN_TOKENS;

    const getBorderClass = (position) => {
      switch (position) {
        case "left":
          // Input is on the right side, so remove LEFT rounding and border
          return `rounded-l-none border-l-0`;
        case "right":
          // Input is on the left side, so remove RIGHT rounding and border
          return `rounded-r-none border-r-0`;
        case "both":
          // Input is in the middle, so remove BOTH side rounding and borders
          return `rounded-none border-l-0 border-r-0`;
        default:
          return "";
      }
    };

    return {
      root: {
        className: useFormFieldClasses({
          ...state,
          preset,
          className: `${state.className || ""} ${getBorderClass(
            addonPosition
          )}`,
        }),
      },
    };
  },

  // Enhanced Calendar with preset support and seamless integration
  calendar: (state, preset = "elevated") => {
    const t = DESIGN_TOKENS;
    // Safe interaction preset access with fallback
    const interactions = getInteractionPreset("input", preset) || {};

    return {
      root: {
        className: `${t.layout.flex.inline} ${t.sizing.component.maxWidth} ${t.layout.position.relative} ${t.sizing.component.fullWidth}`,
      },
      input: {
        root: {
          className: useFormFieldClasses({
            ...state,
            preset,
            className: `${state.className || ""} ${
              !state.disabled
                ? `rounded-r-none border-r-0` // Remove right rounding and border for seamless connection
                : ""
            }`,
          }),
        },
      },
      dropdownButton: {
        root: {
          className: `
            ${getAddonStyles(
              {
                isFocused: state.isFocused,
                isHovered: state.isHovered,
                disabled: state.disabled,
              },
              "right",
              preset
            )}
            ${!state.disabled ? "cursor-pointer" : "cursor-not-allowed"}
            min-w-[3rem] flex items-center justify-center
            ${state.disabled ? "" : "hover:bg-primary-50 focus:bg-primary-100"}
            transition-colors duration-200
          `,
        },
        icon: {
          className: `
            ${getAddonIconStyles(
              {
                isFocused: state.isFocused,
                disabled: state.disabled,
              },
              preset
            )}
            text-lg transition-colors duration-200
          `,
        },
      },
      panel: {
        className: `${t.colors.background.surface} ${t.borders.width.none} ${t.effects.shadow.xl} ${t.radius.base} ${t.spacing.panel.margin} ${t.layout.overflow.hidden} backdrop-blur-sm`,
      },
      header: {
        className: `${t.layout.flex.between} ${t.spacing.panel.padding} ${t.colors.text.default} ${t.colors.background.surface} ${t.typography.weight.semibold} ${t.borders.sides.bottom} ${t.colors.border.default}`,
      },
      previousButton: {
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition.base} hover:bg-surface-100 hover:text-primary-600`,
      },
      nextButton: {
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition.base} hover:bg-surface-100 hover:text-primary-600`,
      },
      title: {
        className: `leading-8 mx-auto ${t.typography.weight.medium} ${t.colors.text.default}`,
      },
      monthTitle: {
        className: `${t.colors.text.default} ${t.effects.transition.colors} ${t.typography.weight.medium} p-2 mr-2 hover:bg-primary-50 hover:text-primary-500 ${t.radius.small}`,
      },
      yearTitle: {
        className: `${t.colors.text.default} ${t.effects.transition.colors} ${t.typography.weight.medium} p-2 hover:bg-primary-50 hover:text-primary-500 ${t.radius.small}`,
      },
      table: {
        className: "border-collapse w-full my-2",
      },
      tableHeaderCell: {
        className: "p-2",
      },
      weekday: {
        className: `${t.colors.text.secondary} ${t.typography.weight.medium} ${t.typography.sm}`,
      },
      day: {
        className: "p-1",
      },
      dayLabel: {
        className: `${t.sizing.icon.xxl} ${t.radius.small} ${t.effects.transition.base} ${t.colors.border.transparent} ${t.borders.width.base} ${t.layout.flex.center} mx-auto ${t.layout.overflow.hidden} ${t.layout.position.relative} ${t.effects.focusRing} ${t.interactions.cursor.pointer} ${t.colors.text.default} hover:bg-primary-50 data-[p-highlight=true]:${t.colors.text.primary} data-[p-highlight=true]:${t.colors.background.primaryLight} data-[p-highlight=true]:hover:bg-primary-100`,
      },
      monthPicker: {
        className: "my-2 p-2",
      },
      month: {
        className: `w-1/3 ${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.layout.overflow.hidden} ${t.layout.position.relative} p-3 ${t.effects.transition.base} ${t.radius.small} ${t.effects.focusRing} ${t.colors.text.default} hover:bg-primary-50 data-[p-highlight=true]:${t.colors.text.primary} data-[p-highlight=true]:${t.colors.background.primaryLight}`,
      },
      yearPicker: {
        className: "my-2 p-2",
      },
      year: {
        className: `w-1/2 ${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.layout.overflow.hidden} ${t.layout.position.relative} p-3 ${t.effects.transition.base} ${t.radius.small} ${t.effects.focusRing} ${t.colors.text.default} hover:bg-primary-50 data-[p-highlight=true]:${t.colors.text.primary} data-[p-highlight=true]:${t.colors.background.primaryLight}`,
      },
      // Enhanced time picker styling
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
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition.base} hover:bg-surface-100 hover:text-primary-600`,
      },
      decrementButton: {
        className: `${t.layout.flex.center} ${t.interactions.cursor.pointer} ${t.sizing.icon.xl} ${t.colors.text.secondary} ${t.borders.width.none} ${t.colors.background.transparent} ${t.radius.small} ${t.effects.transition.base} hover:bg-surface-100 hover:text-primary-600`,
      },
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
        className: `${t.typography.lg} ${t.colors.text.primary} ${t.colors.background.primaryMedium} ${t.radius.small} px-3 py-2 ${t.sizing.component.minWidth} text-center`,
      },
    };
  },

  // Enhanced Dropdown with preset support
  dropdown: (state, preset = "elevated") => {
    const t = DESIGN_TOKENS;
    // Safe interaction preset access with fallback
    const interactions = getInteractionPreset("input", preset) || {};

    return {
      root: {
        className: useFormFieldClasses({
          ...state,
          preset,
          excludePadding: true,
          className: `${state.className || ""} ${
            t.interactions.cursor.pointer
          } ${t.layout.flex.center}`,
        }),
      },
      input: {
        className: `outline-none ${t.colors.background.transparent} ${t.borders.width.none} ${t.sizing.component.fullWidth} ${t.typography.field.base} ${t.typography.placeholder}`,
      },
      trigger: {
        className: `${t.colors.text.secondary} hover:${t.colors.text.primaryStrong} ${t.effects.transition.colors} ${t.sizing.component.flexShrink} ${t.spacing.addon.gap}`,
      },
      panel: {
        className: `${t.borders.width.none} ${t.effects.shadow.strong} ${t.radius.base} ${t.spacing.panel.margin} ${t.layout.overflow.hidden} ${t.colors.background.surface}`,
      },
      list: {
        className: "p-0",
      },
      item: {
        className: `${t.spacing.addon.padding} hover:bg-primary-50 ${t.effects.transition.colors} ${t.interactions.cursor.pointer} ${t.borders.width.none} ${t.colors.text.default}`,
      },
    };
  },

  // Enhanced ColorPicker with preset support
  colorPicker: (state, preset = "elevated") => {
    const t = DESIGN_TOKENS;

    return {
      root: {
        className: `${t.layout.flex.colCenter}`,
      },
      input: {
        className: useFormFieldClasses({ ...state, preset }),
      },
      panel: {
        className: `${t.borders.width.none} ${t.effects.shadow.strong} ${t.radius.base} ${t.spacing.panel.margin} ${t.colors.background.surface}`,
      },
    };
  },

  // Enhanced InputSwitch with preset support
  inputSwitch: (state, preset = "elevated") => {
    const t = DESIGN_TOKENS;
    // Safe interaction preset access with fallback
    const interactions = getInteractionPreset("input", preset) || {};

    return {
      root: {
        className: `
          ${t.layout.position.relative} ${t.layout.flex.inlineCenter} ${
          t.interactions.cursor.pointer
        } 
          ${t.effects.transition.base} ${t.effects.focusRing} ${t.radius.full}
          ${
            state.disabled
              ? `${t.presets.disabled.opacity} ${t.interactions.cursor.notAllowed}`
              : interactions.base
          }
          ${state.error ? `${t.effects.shadow.error}` : ""}
        `,
      },
      slider: {
        className: `
          ${t.effects.transition.base} ${t.radius.full} w-12 h-6
          ${
            state.disabled
              ? t.colors.background.surfaceStrong
              : state.checked || state.value
              ? `${t.colors.background.primary} ${t.presets.hover.background.primaryStrong}`
              : `${t.colors.background.surfaceStrong} ${t.presets.hover.background.medium}`
          }
        `,
      },
      handle: {
        className: `
          ${t.effects.transition.base} ${t.radius.full} ${
          t.effects.shadow.base
        } 
          ${t.borders.width.thick} border-white ${
          t.colors.background.white
        } transform
          ${t.sizing.icon.base} absolute top-0.5 left-0.5
          ${state.checked || state.value ? "translate-x-6" : "translate-x-0"}
        `,
      },
    };
  },

  // Enhanced Checkbox with preset support
  checkbox: (state, preset = "elevated") => {
    const t = DESIGN_TOKENS;
    // Safe interaction preset access with fallback
    const interactions = getInteractionPreset("input", preset) || {};

    return {
      root: {
        className: `${t.layout.position.relative} ${t.layout.flex.inlineCenter}`,
      },
      box: {
        className: `
          ${t.effects.transition.base} ${t.borders.width.thick} ${
          t.radius.small
        } ${t.layout.flex.center} 
          ${t.effects.focusRing} ${t.interactions.cursor.pointer}
          ${
            state.size === "large"
              ? t.sizing.icon.large
              : state.size === "compact"
              ? t.sizing.icon.compact
              : t.sizing.icon.base
          }
          ${
            state.error
              ? `${t.colors.border.error} ${t.effects.shadow.error}`
              : state.disabled
              ? `${t.colors.border.medium} ${t.colors.background.surfaceDisabled} ${t.interactions.cursor.notAllowed}`
              : state.checked || state.value
              ? `${t.colors.border.focusStrong} ${t.colors.background.primary} ${t.presets.hover.background.primaryStrong} ${t.effects.shadow.base}`
              : `${t.colors.border.medium} ${t.colors.background.surface} ${interactions.hover} ${t.effects.shadow.base}`
          }
        `,
      },
      icon: {
        className: `
          ${t.effects.transition.base} ${t.colors.text.white} ${
          t.typography.weight.bold
        }
          ${
            state.size === "large"
              ? t.typography.base
              : state.size === "compact"
              ? t.typography.xs
              : t.typography.sm
          }
          ${
            state.checked || state.value
              ? `${t.effects.opacity.visible} ${t.effects.scale.none}`
              : `${t.effects.opacity.hidden} ${t.effects.scale.down}`
          }
        `,
      },
    };
  },
};

/**
 * =============================================================================
 * ENHANCED ADDON ICON STYLING
 * =============================================================================
 */

export const getAddonIconStyles = (state, preset = "elevated") => {
  const { isFocused, disabled } = state;
  const t = DESIGN_TOKENS;

  if (disabled) {
    return `${t.colors.text.disabled} ${t.effects.transition.colors}`;
  } else if (isFocused) {
    return `${t.colors.text.primaryStrong} ${t.effects.transition.colors}`;
  } else {
    return `${t.colors.text.secondary} hover:${t.colors.text.primaryStrong} ${t.effects.transition.colors}`;
  }
};

/**
 * =============================================================================
 * UTILITY FUNCTIONS FOR QUICK STYLING
 * =============================================================================
 */

// Quick style builders
export const buildInputStyles = (options = {}) => {
  const {
    size = "base",
    preset = "elevated",
    disabled = false,
    error = false,
    className = "",
  } = options;

  return useFormFieldClasses({
    size,
    preset,
    disabled,
    error,
    className,
  });
};

export const buildButtonStyles = (options = {}) => {
  const {
    variant = "primary",
    size = "base",
    disabled = false,
    className = "",
  } = options;

  const t = DESIGN_TOKENS;
  // Safe interaction preset access with fallback
  const buttonPreset = getInteractionPreset("button", variant) || {};

  return [
    // Base button styling
    t.layout.flex.center,
    t.spacing.input[size],
    t.typography.field[size],
    t.radius.base,
    t.borders.width.base,
    t.effects.transition.base,
    t.interactions.cursor.pointer,

    // Variant styling
    variant === "primary"
      ? [
          t.colors.background.primary,
          t.colors.text.white,
          t.colors.border.transparent,
        ]
      : [
          t.colors.background.surface,
          t.colors.text.default,
          t.colors.border.default,
        ],

    // Interaction preset (safely)
    buttonPreset.base || "",

    // Disabled state
    disabled && t.presets.disabled.combined,

    // Custom className
    className,
  ]
    .filter(Boolean)
    .flat()
    .join(" ");
};

export const buildPanelStyles = (options = {}) => {
  const { variant = "subtle", padding = "base", className = "" } = options;

  const t = DESIGN_TOKENS;
  // Safe interaction preset access with fallback
  const panelPreset = getInteractionPreset("panel", variant) || {};

  return [
    // Base panel styling
    t.colors.background.surface,
    t.borders.width.base,
    t.colors.border.default,
    t.radius.base,
    t.spacing.panel[
      `padding${
        padding === "base"
          ? ""
          : padding.charAt(0).toUpperCase() + padding.slice(1)
      }`
    ] || t.spacing.panel.padding,
    t.effects.shadow.base,

    // Interaction preset (safely)
    panelPreset.base || panelPreset.hover || "",

    // Custom className
    className,
  ]
    .filter(Boolean)
    .flat()
    .join(" ");
};

/**
 * =============================================================================
 * EXPORT EVERYTHING
 * =============================================================================
 */

export default {
  // Core tokens
  DESIGN_TOKENS,
  INTERACTION_PRESETS,

  // Hooks and utilities
  useFormFieldClasses,
  useFormFieldState,
  getFormFieldPT,
  getInteractionPreset,

  // Styling functions
  getAddonStyles,
  getAddonIconStyles,
  buildInputStyles,
  buildButtonStyles,
  buildPanelStyles,

  // Components
  FormFieldWrapper,

  // PrimeReact configs
  PRIMEREACT_PT_CONFIGS,

  // Legacy compatibility
  FORM_FIELD_TOKENS,
};
