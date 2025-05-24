// src/components/formFields/CheckSwitchFormField.jsx - Fixed version
import React from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Checkbox } from "primereact/checkbox";
import { parseDescription } from "@/components/document/utils/schemaUtils";

const CheckSwitchFormField = (props) => {
  // Props from DocEditor's commonProps & componentSpecificProps:
  // id, checked, onChange (which is handleInputChange wrapper), disabled, className,
  // fieldSchemaItem, tooltip, etc.
  const {
    id, // fieldname
    checked, // This is correctly passed as currentFormData[fieldname] due to valuePropName logic
    onChange, // This is effectively (e) => handleInputChange(id, e.target.value, "Check")
    disabled,
    className, // Applied by DocEditor to wrapper, not directly used here unless needed
    fieldSchemaItem,
    tooltip, // From commonProps
    ...otherProps // Any other specific props from FormFieldAdapter
  } = props;

  const descriptionData = parseDescription(fieldSchemaItem?.description || "");
  const label = fieldSchemaItem?.label || ""; // For Checkbox label if needed and not handled by editor

  // The `onChange` prop from DocEditor's commonProps expects an event-like object.
  // Both InputSwitch and Checkbox provide the new boolean state differently.
  // The FormFieldAdapter for "Check" should provide a specific onChange.
  // If not, and we rely on the default commonProps.onChange, this is how to adapt:

  const handleChange = (e) => {
    if (onChange) {
      let newCheckedState;
      if (descriptionData.asSwitch) {
        newCheckedState = e.value; // InputSwitch puts new boolean state in e.value
      } else {
        newCheckedState = e.checked; // Checkbox puts new boolean state in e.checked
      }

      // Construct the event-like object that the default commonProps.onChange expects
      const simulatedEvent = {
        target: {
          name: id, // fieldname
          value: newCheckedState,
        },
        // originalEvent: e.originalEvent // if needed
      };
      onChange(simulatedEvent);
    }
  };

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem: _fieldSchemaItem, ...safeOtherProps } = otherProps;

  const commonInputProps = {
    inputId: id, // PrimeReact convention for associating label
    checked: !!checked, // Ensure boolean
    onChange: handleChange, // Use our adapted handler
    disabled: disabled,
    tooltip: tooltip, // Pass tooltip
    tooltipOptions: props.tooltipOptions || { position: "top" },
    ...safeOtherProps, // Spread other props from FormFieldAdapter (now filtered)
  };

  if (descriptionData.asSwitch) {
    return (
      <InputSwitch
        {...commonInputProps}
        // className for InputSwitch itself, if needed, different from wrapper
        // className={otherProps.inputClassName || ""}
      />
    );
  }

  // For Checkbox, PrimeReact often expects a label beside it.
  // The DocEditor's label is typically above or beside the whole field.
  // If a label specific to the checkbox input itself is desired (e.g., "Agree to terms"),
  // it can be parsed from description or fieldSchemaItem.
  const checkboxLabel =
    descriptionData.inputLabel ||
    (fieldSchemaItem?.options === "true" ? label : null);

  return (
    <div className="flex align-items-center">
      <Checkbox
        {...commonInputProps}
        // className for Checkbox itself
        // className={otherProps.inputClassName || ""}
      />
      {checkboxLabel && (
        <label htmlFor={id} className="ml-2 text-sm text-text-color">
          {checkboxLabel}
        </label>
      )}
    </div>
  );
};

export default CheckSwitchFormField;
