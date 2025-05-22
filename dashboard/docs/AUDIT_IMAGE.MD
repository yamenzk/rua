# Implementation Guide: Audit Fields & Attach Image Enhancement

## Summary of Changes

### 1. Enhanced Schema to Columns Transformation
- **File**: `src/components/document/utils/schemaToColumns.js`
- **Changes**: 
  - Added audit fields (creation, owner, modified, modified_by) automatically
  - Enhanced Attach Image field handling via description parsing
  - Added `includeAuditFields` option for flexibility

### 2. Audit Information Component
- **File**: `src/components/common/AuditInfo.jsx` (new)
- **Purpose**: Clean display of creation and modification information
- **Features**: 
  - Smart formatting of dates and usernames
  - Shows only relevant information (creation vs modification)
  - Responsive design with icons

### 3. Enhanced DocToolbar
- **File**: `src/components/common/DocToolbar.jsx`
- **Changes**: 
  - Added `docData` and `showAuditInfo` props
  - Integrated AuditInfo component
  - Maintains clean layout with audit info below main content

### 4. Updated Table and Pages
- **Files**: Employee table and view page
- **Changes**: Include audit fields in data fetching and display

## Usage Examples

### For Attach Image Fields in Schema Description

```json
{
  "inTable": "true",
  "asAvatar": true,
  "tooltip": "Employee profile picture"
}
```

Or for default visibility:
```json
{
  "inTable": "default", 
  "asAvatar": true,
  "imageWidth": "60px"
}
```

### Customizing Audit Fields Display

```javascript
// Disable audit fields in table
const customArgs = {
  includeAuditFields: false, // Hide audit columns
  // ... other options
};

// Hide audit info in DocToolbar
<DocToolbar
  // ... other props
  showAuditInfo={false}
/>
```

### Adding to Other DocTypes

```javascript
// In any table component
const columnsConfig = useMemo(() => {
  if (!formSchema) return [];

  const customArgs = {
    linkFieldFilterOptions: {
      User: userOptions, // For audit fields + other User links
    },
    includeAuditFields: true, // Enable audit fields
  };
  return transformSchemaToColumnConfig(formSchema, customArgs);
}, [formSchema, userOptions]);
```

## Database Field Mapping

| Field | Type | Description | Display |
|-------|------|-------------|---------|
| `creation` | Datetime | When record was created | "Created 18/05/2025 23:16:52" |
| `owner` | Link (User) | Who created the record | "by Admin" |
| `modified` | Datetime | Last modification time | "Updated 21/05/2025 20:00:06" |
| `modified_by` | Link (User) | Who last modified | "by John Doe" |

## Attach Image Field Enhancement

### Before
```javascript
// Attach Image fields couldn't be included in tables due to Frappe validation
```

### After
```javascript
// In field description:
{
  "inTable": "true",      // Makes field available in table
  "inTable": "default",   // Makes field visible by default
  "asAvatar": true,       // Display as circular avatar
  "imageWidth": "80px"    // Custom image width
}
```

## Column Visibility Logic

1. **Schema Fields**: `field.in_list_view === true`
2. **Attach Image Override**: `description.inTable === "true"` or `"default"`
3. **Audit Fields**: Added automatically (hidden by default)
4. **Default Visibility**: 
   - Schema fields: `field.in_standard_filter`
   - Attach Image: `description.inTable === "default"`
   - Audit fields: `false` (hidden by default)

## Performance Considerations

- Audit fields are fetched automatically but hidden by default
- Lazy loading maintains performance
- Audit info only shown when DocData is available
- Minimal impact on existing functionality
