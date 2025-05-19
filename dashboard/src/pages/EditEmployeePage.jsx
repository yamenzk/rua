// src/pages/EditEmployeePage.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocEditor from "@/components/common/UniversalDocEditor";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants"; // { name: "RUA Employee" }
import { useLayout } from "@/contexts/LayoutContext"; // Import useLayout

const EditEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbItems, setHomeLink, setPageTitle } = useLayout(); // Use layout context

  useEffect(() => {
    const baseBreadcrumbs = [{ label: "Employees", url: "/employees" }];

    if (employeeId) {
      setPageTitle(`Edit Employee: ${employeeId}`);
      baseBreadcrumbs.push({
        label: employeeId, // Or fetch employee name for better UX
        url: `/employees/view/${employeeId}`,
      });
    } else {
      setPageTitle("Create New Employee");
      // Optionally, add a "New" breadcrumb if it's a create page different from edit
    }

    baseBreadcrumbs.push({ label: "Edit" }); // Add "Edit" as non-clickable

    setBreadcrumbItems(baseBreadcrumbs);
    setHomeLink({ icon: "pi pi-home", url: "/" }); // Standard home link

    // Clean up breadcrumbs when component unmounts
    return () => {
      setBreadcrumbItems([]);
      setPageTitle("Dashboard"); // Reset to default or previous
    };
  }, [employeeId, setBreadcrumbItems, setHomeLink, setPageTitle]);

  const handleSaveSuccess = (savedDoc) => {
    navigate(`/employees/view/${savedDoc.name}`);
  };

  const handleCancel = () => {
    navigate(employeeId ? `/employees/view/${employeeId}` : "/employees");
  };

  return (
    <UniversalDocEditor
      doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
      docname={employeeId}
      onSaveSuccess={handleSaveSuccess}
      onCancel={handleCancel}
    />
  );
};

export default EditEmployeePage;
