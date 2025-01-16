// Common options used across components
export const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ]
  
  export const positionOptions = [
    'CEO',
    'Operations Manager',
    'Production Supervisor',
    'Glass Fabricator',
    'Aluminum Fabricator',
    'CNC Operator',
    'Quality Control Inspector',
    'Installation Team Leader',
    'Installer',
    'Driver',
    'Sales Manager',
    'Sales Representative',
    'Accountant',
    'HR Manager',
    'Warehouse Supervisor',
    'Warehouse Worker',
    'Maintenance Technician',
  ].map((position) => ({
    label: position,
    value: position,
  }))