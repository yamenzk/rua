// src/components/formFields/TextEditorFormField.jsx - Refactored with Central Styles
import React from "react";
import { Editor } from "primereact/editor";
import { 
  FormFieldWrapper, 
  useFormFieldState 
} from "./styles/formFieldStyles";

const TextEditorFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  tooltip,
  required,
  error,
  size = 'base',
  style,
  ...otherProps
}) => {
  // Use central state management
  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  const handleChange = (e) => {
    if (onChange) {
      // Editor uses onTextChange with e.htmlValue
      const syntheticEvent = {
        target: {
          name: id,
          value: e.htmlValue,
        },
        originalEvent: e,
      };
      onChange(syntheticEvent);
    }
  };

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, onFocus, onBlur, onTextChange, ...safeOtherProps } = otherProps;

  // Default height can be overridden by props
  const defaultStyle = { height: "200px" };
  const finalStyle = { ...defaultStyle, ...style };

  // Editor PassThrough configuration
  const ptConfig = {
    root: {
      className: `
        w-full rounded-2xl border transition-all duration-200 ease-out overflow-hidden
        ${isFocused && !disabled 
          ? 'border-primary-400 shadow-none' 
          : !isFocused && isHovered && !disabled
          ? 'border-primary-400'
          : disabled
          ? 'bg-surface-100 border-surface-200'
          : 'border-surface-100'
        }
        ${error && !disabled ? 'border-red-300 bg-red-50/30' : ''}
        ${className || ''}
      `,
    },
    toolbar: {
      className: `
        border-b border-surface-200 bg-surface-50 px-4 py-3 flex flex-wrap gap-1
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `,
    },
    formats: {
      className: "flex flex-wrap gap-1",
    },
    header: {
      className: "border-b border-surface-200 bg-surface-50",
    },
    content: {
      className: `
        min-h-[150px] p-4 bg-surface-0 text-text-color text-sm
        focus:outline-none
        ${disabled ? 'bg-surface-100 text-text-color-secondary cursor-not-allowed' : ''}
      `,
      style: {
        ...finalStyle,
      }
    },
    // Style toolbar buttons
    bold: {
      className: "w-8 h-8 rounded-lg border-0 bg-transparent hover:bg-surface-200 text-text-color-secondary hover:text-text-color transition-colors duration-200",
    },
    italic: {
      className: "w-8 h-8 rounded-lg border-0 bg-transparent hover:bg-surface-200 text-text-color-secondary hover:text-text-color transition-colors duration-200",
    },
    underline: {
      className: "w-8 h-8 rounded-lg border-0 bg-transparent hover:bg-surface-200 text-text-color-secondary hover:text-text-color transition-colors duration-200",
    },
    // Add styling for other toolbar elements as needed
  };

  return (
    <FormFieldWrapper
      id={id}
      error={error}
      required={required}
      disabled={disabled}
      isFocused={isFocused}
      isHovered={isHovered}
      onMouseEnter={() => handleMouseEnter(disabled)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full">
        <Editor
          id={id}
          value={value || ""}
          onTextChange={handleChange}
          onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
          onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
          disabled={disabled}
          placeholder={placeholder}
          pt={ptConfig}
          title={tooltip}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...safeOtherProps}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default TextEditorFormField;