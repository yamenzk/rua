// src/components/formFields/ColorPickerFormField.jsx - Fixed version
import React from "react";
import { ColorPicker } from "primereact/colorpicker";

const ColorPickerFormField = (props) => {
  const {
    id, // fieldname
    value, // current color value (can be with or without #)
    onChange, // The callback from DocEditor's commonProps (handleInputChange)
    className,
    disabled,
    // fieldSchemaItem is available if FormFieldAdapter passes it, but not strictly needed here
    // if all necessary info like 'label' for tooltips is already in otherProps
    ...otherProps // Includes tooltip, placeholder (though not very relevant for color picker)
  } = props;

  // ColorPicker component expects the hex value *without* the '#' prefix.
  // It also returns the value without '#'
  const normalizedDisplayValue = value?.replace("#", "") || "";

  const handleChange = (e) => {
    // e.value is the new color string (e.g., "ff0000") from ColorPicker
    // The parent DocEditor's default onChange expects an event-like structure
    // or the adapter can provide a custom onChange.
    // Assuming the adapter/editor expects: handleInputChange(fieldname, newValue, fieldtype)
    // We need to call onChange with the field's ID/name and the new value.
    if (onChange) {
      // The standard `handleInputChange` in `useFormHandler` expects (name, value, fieldtype)
      // The `onChange` prop passed here by `DocEditor`'s `commonProps`
      // is already tailored to call `handleInputChange(fieldname, e.target.value, fieldtype)`.
      // So we need to construct an event-like object that `handleInputChange` can destructure.
      // OR, the FormFieldAdapter for "Color" type should provide a specific onChange.

      // Let's assume FormFieldAdapter for Color provides a specific onChange
      // that directly calls handleInputChange(fieldname, newValueFromColorPicker).
      // If not, and we rely on the default commonProps.onChange, this is how to adapt:
      const simulatedEvent = {
        target: {
          name: id, // fieldname
          value: `#${e.value}`, // Pass back with # to store consistently
        },
        // originalEvent: e.originalEvent // if needed
      };
      onChange(simulatedEvent);
    }
  };

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem: _fieldSchemaItem, ...safeOtherProps } = otherProps;

  return (
    <div className={`flex flex-col items-center ${className || ""}`}>
      <ColorPicker
        id={id}
        value={normalizedDisplayValue} // Pass value without #
        onChange={handleChange}
        disabled={disabled}
        className="mb-2" // Removed className from props as it's on the wrapper
        format="hex" // Ensures it deals with hex
        pt={
          {
            // Example: PassThrough to style the input part if needed
            // input: { className: 'w-full' }
          }
        }
        {...safeOtherProps} // Spread other props from FormFieldAdapter (now filtered)
      />
      {/* Display the current value with # for user confirmation */}
      <span className="text-sm text-text-color-secondary mt-1">
        #{normalizedDisplayValue.toUpperCase()}
      </span>
    </div>
  );
};

export default ColorPickerFormField;
