// src/components/formFields/SelectFormField.jsx - Enhanced with Presets
import React, { useMemo, useState, useCallback } from "react";
import { Dropdown } from "primereact/dropdown";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  DESIGN_TOKENS,
} from "./styles/formFieldStyles";
import nationalitiesData from "@/utils/nationalities.json";
import { useTheme } from "@/contexts/ThemeContext";

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
  preset,
  fieldSchemaItem,
  showClear = false,
  filter,
  ...otherProps
}) => {
  const theme = useTheme();
  const activePreset = preset || theme.preset;
  const [filteredOptions, setFilteredOptions] = useState([]);

  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  const t = DESIGN_TOKENS;

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
        target: { name: id, value: e.value },
        originalEvent: e.originalEvent,
      };
      onChange(syntheticEvent);
    }
  };

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

  React.useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const itemTemplate = (option) => {
    if (id === "nationality" || fieldSchemaItem?.fieldname === "nationality") {
      return (
        <div className={`${t.layout.flex.center} ${t.spacing.gap.small} p-1`}>
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

  const {
    fieldSchemaItem: _fieldSchemaItem,
    onFocus,
    onBlur,
    ...safeOtherProps
  } = otherProps;

  const ptConfig = {
    ...PRIMEREACT_PT_CONFIGS.dropdown(
      {
        isFocused,
        isHovered,
        disabled,
        error: !!error,
        size,
        className,
      },
      activePreset // Pass preset
    ),
    panel: {
      className: `${t.borders.width.none} ${t.effects.shadow.xl} ${t.radius.base} ${t.spacing.panel.margin} ${t.layout.overflow.hidden} ${t.colors.background.surface} backdrop-blur-sm`,
    },
    list: { className: t.spacing.panel.paddingSmall },
    item: {
      className: `px-3 py-2 mx-1 ${t.radius.small} hover:bg-primary-50 ${t.effects.transition.colors} ${t.interactions.cursor.pointer} ${t.borders.width.none} ${t.typography.sm}`,
    },
    itemGroup: {
      className: `px-3 py-2 ${t.typography.weight.semibold} ${t.colors.text.secondary} ${t.typography.xs} uppercase tracking-wider`,
    },
    filterContainer: {
      className: `${t.spacing.panel.padding} ${t.borders.sides.bottom} ${t.colors.border.light}`,
    },
    filterInput: {
      className: `${t.sizing.component.fullWidth} px-3 py-2 ${t.typography.sm} ${t.borders.width.base} ${t.colors.border.medium} ${t.radius.small} focus:${t.colors.border.focus} ${t.effects.focusRing} ${t.effects.transition.colors}`,
    },
    clearIcon: { className: t.layout.display.hidden },
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
      preset={activePreset}
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