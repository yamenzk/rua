// Example: src/pages/ViewEmployeePage.jsx (Simplified)
import React from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocViewer from "@/components/common/UniversalDocViewer";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";

const ViewEmployeePage = () => {
  const { employeeId } = useParams(); // This is the 'docname'
  const navigate = useNavigate();
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();
  useEffect(() => {
    // Fetch actual employee data here if you want to display employee name instead of ID
    // For now, we'll use employeeId.
    const employeeNameToDisplay = employeeId; // Replace with actual name if fetched

    setPageTitle(`${RUA_EMPLOYEE_DOCTYPE.name}: ${employeeNameToDisplay}`); //

    const breadcrumbPath = [
      {
        label: RUA_EMPLOYEE_DOCTYPE.pluralLabel, //
        url: `/${RUA_EMPLOYEE_DOCTYPE.route}`, //
      },
      {
        label: employeeNameToDisplay, // This is the current page, so no URL
      },
    ];
    setBreadcrumbItems(breadcrumbPath);
    setHomeLink({ icon: "pi pi-home", url: "/" });

    // Cleanup on unmount
    return () => {
      setBreadcrumbItems([]);
      // setPageTitle('Dashboard'); // Or your default title
    };
  }, [
    employeeId,
    setPageTitle,
    setBreadcrumbItems,
    setHomeLink,
    RUA_EMPLOYEE_DOCTYPE,
  ]);

  const handleEdit = (doctype, docname) => {
    navigate(employeeId ? `/employees/edit/${employeeId}` : "/employees");
  };

  const handleBack = () => {
    navigate("/employees"); // Adjust to your list page route
  };


  return (
    <UniversalDocViewer
      doctypeName={RUA_EMPLOYEE_DOCTYPE.name} //
      docname={employeeId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  );
};

export default ViewEmployeePage;
