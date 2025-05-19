// src/pages/ViewEmployeePage.jsx
import React from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocViewer from "@/components/common/UniversalDocViewer"; // Ensure this path is correct
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants"; // Assuming this constant exists
import { useLayout } from "@/contexts/LayoutContext";

// Import your new demo components
import EmployeeNotesCard from "@/components/custom/EmployeeNotesCard";
import EmployeePerformanceChart from "@/components/custom/EmployeePerformanceChart";

const ViewEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();

  useEffect(() => {
    const employeeNameToDisplay = employeeId; // Replace with actual name if fetched from docData later

    setPageTitle(`${RUA_EMPLOYEE_DOCTYPE.name}: ${employeeNameToDisplay}`);

    const breadcrumbPath = [
      {
        label: RUA_EMPLOYEE_DOCTYPE.pluralLabel,
        url: `/${RUA_EMPLOYEE_DOCTYPE.route}`,
      },
      {
        label: employeeNameToDisplay,
      },
    ];
    setBreadcrumbItems(breadcrumbPath);
    setHomeLink({ icon: "pi pi-home", url: "/" });

    return () => {
      setBreadcrumbItems([]);
      // setPageTitle('Dashboard');
    };
  }, [
    employeeId,
    setPageTitle,
    setBreadcrumbItems,
    setHomeLink,
    RUA_EMPLOYEE_DOCTYPE,
  ]);

  const handleEdit = () => {
    // Removed doctype, docname as employeeId is in scope
    navigate(employeeId ? `/employees/edit/${employeeId}` : "/employees");
  };

  const handleBack = () => {
    navigate("/employees");
  };

  // Define the custom UI augmentations
  const employeeCustomUIAugmentations = {
    additionalTabs: [
      {
        id: "employeePerformanceTab",
        label: "Performance",
        order: 20, // Example: place it after the first schema tab (assuming schema tabs start around order 0 or 10)
        icon: "pi pi-chart-bar",
        // The content function receives (docData, customComponentContext) from UniversalDocViewer
        content: (docData, context) => (
          <EmployeePerformanceChart
            docData={docData}
            customComponentContext={context}
          />
        ),
      },
    ],
    injectIntoTabs: [
      {
        // Target the main/default tab.
        // If your schema explicitly defines a tab named "Details", use that.
        // If UniversalLayoutRenderer creates a default tab, its ID might be 'default-schema-tab' or similar.
        // For this demo, let's assume the first schema tab is the target.
        // You might need to inspect the generated IDs or labels from your schema's first tab.
        // If your default tab from schema is "Details": targetTab: { label: "Details" }
        // If its ID (e.g. from TabBreak name) is "main_details": targetTab: { id: "main_details" }
        // For now, let's assume we target the first schema tab by an assumed ID or default.
        targetTab: { label: "Test Tab" }, // Or your actual first tab's ID/label from schema
        // if 'default-schema-tab' is what your UniversalLayoutRenderer generates
        // when no schema tabs are explicitly defined but fields exist.
        // Or, target by label if you know it, e.g., { label: 'Contact Info' }
        items: [
          {
            id: "customEmployeeNotes",
            type: "Card", // This will make UniversalLayoutRenderer wrap it in a PrimeReact Card
            title: "Private Notes (Custom Card)",
            order: 50, // Example: place it further down within the target tab
            className: "mt-6 mb-4", // Custom styling for the card wrapper
            content: (docData, context) => (
              <EmployeeNotesCard
                docData={docData}
                customComponentContext={context}
              />
            ),
          },
          {
            id: "anotherCustomSectionHeader",
            type: "SectionHeader",
            title: "Additional Custom Information",
            order: 40, // Place it before the notes card
            className: "mt-5",
          },
        ],
      },
    ],
  };

  return (
    <UniversalDocViewer
      doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
      docname={employeeId}
      onEdit={handleEdit}
      onBack={handleBack}
      customUIAugmentations={employeeCustomUIAugmentations} // <<<< Pass the augmentations
    />
  );
};

export default ViewEmployeePage;
