// src/components/formFields/SelectFormField.jsx - Refactored with Central Styles
import React, { useMemo, useState, useCallback } from "react";
import { Dropdown } from "primereact/dropdown";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";
import nationalitiesData from "@/utils/nationalities.json";

const SelectFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  tooltip,
  required,
  error,
  size = "base",
  fieldSchemaItem,
  showClear = false,
  filter,
  ...otherProps
}) => {
  const [filteredOptions, setFilteredOptions] = useState([]);

  // Use central state management
  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  // Generate options based on field configuration (same logic as before)
  const options = useMemo(() => {
    const {
      fieldname,
      fieldtype,
      options: fieldOptions,
      select_options_data,
    } = fieldSchemaItem || {};

    if (id === "nationality" || fieldname === "nationality") {
      return nationalitiesData.map((n) => ({
        label: `${n.flag} ${n.name}`,
        value: n.name,
        searchText: n.name.toLowerCase(),
      }));
    }

    if (Array.isArray(select_options_data) && select_options_data.length > 0) {
      return select_options_data.map((opt) => ({
        label: String(opt),
        value: opt,
        searchText: String(opt).toLowerCase(),
      }));
    }

    if (typeof fieldOptions === "string" && fieldOptions.trim() !== "") {
      return fieldOptions
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt)
        .map((opt) => ({
          label: String(opt),
          value: opt,
          searchText: String(opt).toLowerCase(),
        }));
    }

    return [];
  }, [id, fieldSchemaItem]);

  // Determine if filtering should be enabled
  const shouldEnableFilter = useMemo(() => {
    if (filter !== undefined) return filter;
    const fieldname = fieldSchemaItem?.fieldname || id;
    const fieldtype = fieldSchemaItem?.fieldtype;

    return (
      id === "nationality" ||
      fieldname === "nationality" ||
      fieldtype === "Autocomplete" ||
      options.length > 10
    );
  }, [filter, id, fieldSchemaItem, options.length]);

  const handleChange = (e) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: id,
          value: e.value,
        },
        originalEvent: e.originalEvent,
      };
      onChange(syntheticEvent);
    }
  };

  // Custom filter function for better performance
  const handleFilter = useCallback(
    (e) => {
      const query = e.filter.toLowerCase();
      if (!query) {
        setFilteredOptions(options);
        return;
      }
      const filtered = options.filter((option) =>
        option.searchText.includes(query)
      );
      setFilteredOptions(filtered);
    },
    [options]
  );

  // Initialize filtered options
  React.useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Custom item template for nationality
  const itemTemplate = (option) => {
    if (id === "nationality" || fieldSchemaItem?.fieldname === "nationality") {
      return (
        <div className="flex align-items-center gap-2 p-1">
          <span style={{ fontSize: "1.2em" }}>
            {option.label.split(" ")[0]}
          </span>
          <span>{option.label.substring(option.label.indexOf(" ") + 1)}</span>
        </div>
      );
    }
    return <span>{option.label}</span>;
  };

  const isLargeDataset = options.length > 50;
  const displayOptions = shouldEnableFilter ? filteredOptions : options;

  // Filter out non-DOM props
  const {
    fieldSchemaItem: _fieldSchemaItem,
    onFocus,
    onBlur,
    ...safeOtherProps
  } = otherProps;

  // Get PrimeReact PassThrough config with enhanced dropdown styling
  const ptConfig = {
    ...PRIMEREACT_PT_CONFIGS.dropdown({
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    }),
    // Enhanced panel styling for elegant dropdown
    panel: {
      className:
        "border-none shadow-xl rounded-2xl mt-2 overflow-hidden bg-surface-0 backdrop-blur-sm",
    },
    list: {
      className: "p-2",
    },
    item: {
      className:
        "px-3 py-2 mx-1 rounded-xl hover:bg-primary-50 transition-all duration-150 cursor-pointer border-none text-sm",
    },
    itemGroup: {
      className:
        "px-3 py-2 font-semibold text-text-color-secondary text-xs uppercase tracking-wider",
    },
    filterContainer: {
      className: "p-3 border-b border-surface-100",
    },
    filterInput: {
      className:
        "w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors",
    },
    // Hide the clear button completely
    clearIcon: {
      className: "hidden",
    },
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
      <Dropdown
        id={id}
        value={value || null}
        options={displayOptions}
        onChange={handleChange}
        onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
        onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
        disabled={disabled}
        placeholder={placeholder || "Select an option..."}
        showClear={false}
        filter={shouldEnableFilter}
        filterBy={shouldEnableFilter ? undefined : "label"}
        onFilter={
          shouldEnableFilter && isLargeDataset ? handleFilter : undefined
        }
        filterPlaceholder={shouldEnableFilter ? "Search..." : undefined}
        emptyMessage="No options available"
        itemTemplate={isLargeDataset ? itemTemplate : undefined}
        virtualScrollerOptions={
          isLargeDataset
            ? {
                itemSize: 38,
                scrollHeight: "200px",
                lazy: false,
                showSpacer: false,
              }
            : undefined
        }
        pt={ptConfig}
        title={tooltip}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...safeOtherProps}
      />
    </FormFieldWrapper>
  );
};

export default SelectFormField;
