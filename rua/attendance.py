# -*- coding: utf-8 -*-
# Copyright (c) [Your Name/Company Name] and contributors
# For license information, please see license.txt

# This file likely belongs in a custom Frappe app, e.g.,
# [your_app]/api/salary_details.py or similar.

import frappe
import json
from datetime import datetime
from frappe.utils import (
    flt,
    getdate,
    nowdate,
    add_months,
    date_diff,
    cint,
    cstr,
    format_date,
    add_days,
    get_first_day,
    get_last_day,
    today,
)
from frappe.exceptions import DoesNotExistError
import urllib.parse


# --- Reusable Helper Function (calculate_employee_monthly_attendance) ---
# (This function calculates attendance counts based on logs and leaves for ONE employee)
def calculate_employee_monthly_attendance(
    employee_id,
    year,
    month,
    daily_logs_for_employee,
    leave_dates_for_employee,
    logged_days_in_month,
):
    """
    Calculates attendance counts for ONE specific employee and month based on logged days.

    Args:
        employee_id (str): The ID of the employee.
        year (int): The target year.
        month (int): The target month.
        daily_logs_for_employee (dict): Pre-filtered daily logs for THIS employee {date_str: {status, overtime}}.
        leave_dates_for_employee (set): Pre-filtered leave dates for THIS employee {date_str}.
        logged_days_in_month (list): List of date strings ('YYYY-MM-DD') where *any* attendance was logged in the month.

    Returns:
        dict: Dictionary with 'present', 'late', 'absent', 'leave', 'overtime' counts.
    """
    days_present = 0
    days_late = 0
    days_absent = 0
    days_on_leave = 0
    total_overtime = 0.0  # Use float for overtime

    try:
        month_start_date = getdate(f"{year}-{month:02d}-01")  # Ensure 2-digit month
        month_end_date = get_last_day(month_start_date)
    except ValueError:
        frappe.log_error(
            f"Invalid year/month combination: {year}-{month}", "Attendance Calculation"
        )
        # Return zero counts if date calculation fails
        return {"present": 0, "late": 0, "absent": 0, "leave": 0, "overtime": 0.0}

    # Iterate only through days where *someone* had an attendance log that month
    for date_str in logged_days_in_month:
        try:
            current_date = getdate(date_str)
            # Double-check date is within the target month (safety check)
            if not (month_start_date <= current_date <= month_end_date):
                continue

            # Check leave first
            if date_str in leave_dates_for_employee:
                days_on_leave += 1
            # Check if employee has specific log for this day
            elif date_str in daily_logs_for_employee:
                log = daily_logs_for_employee[date_str]
                status = log.get(
                    "status", "Not Recorded"
                )  # Default if status somehow missing
                overtime_val = log.get("overtime", 0)
                # Add overtime, ensuring it's a float and using abs() based on original logic
                try:
                    total_overtime += abs(flt(overtime_val))
                except (ValueError, TypeError):
                    frappe.log(
                        f"Could not convert overtime '{overtime_val}' to float for emp {employee_id} on {date_str}"
                    )

                # Increment count based on status
                if status == "Present":
                    days_present += 1
                elif status == "Late":
                    days_late += 1
                elif status == "Absent":
                    days_absent += 1
                # Implicitly ignore 'Not Recorded' or other statuses for counting purposes
            else:
                # Employee has NO log for this day (where others might have), count as Absent
                days_absent += 1
        except Exception as e:
            # Log error for specific date processing but continue loop
            frappe.log_error(
                f"Error processing date {date_str} for employee {employee_id} in calculate_employee_monthly_attendance: {e}",
                "Attendance Calculation",
            )

    return {
        "present": days_present,
        "late": days_late,
        "absent": days_absent,
        "leave": days_on_leave,
        "overtime": total_overtime,
    }


# --- Main API Endpoint ---
@frappe.whitelist()
def get_employee_monthly_salary(employee_id, month, year):
    """
    Calculates attendance summary and estimated salary for a specific employee.
    Checks if any 'Completed' payslips exist for that period, sums their amounts,
    and lists their IDs, based on the RUA Payslip DocType schema.

    Args:
        employee_id (str): The name/ID of the RUA Employee document.
        month (str or int): The month number (1-12).
        year (str or int): The year (e.g., 2024).

    Returns:
        dict: A dictionary containing attendance summary, salary calculation,
              and payslip status (including summed amount and list of IDs),
              or an error dictionary like {"error": "message"}.
    """
    try:
        # 1. Input Validation and Date Setup
        if not employee_id:
            frappe.throw("Employee ID is required.")
        if not month or not year:
            frappe.throw("Month and Year are required.")

        try:
            month = cint(month)
            year = cint(year)
            if not (1 <= month <= 12 and year > 1900):  # Basic year validation
                raise ValueError("Invalid month or year.")
            # Create date object for first day of month to easily get month name/last day
            target_date = getdate(f"{year}-{month:02d}-01")
        except (ValueError, TypeError) as e:
            frappe.throw(f"Invalid Month or Year format: {e}")

        month_start_date = get_first_day(target_date)
        month_end_date = get_last_day(target_date)
        month_name = target_date.strftime("%B")  # e.g., "April"

        # Consistent calculation parameters from original logic
        days_in_month_for_calc = 30
        standard_hours_per_day = 9

        # 2. Fetch Employee Master Data
        try:
            employee = frappe.get_doc("RUA Employee", employee_id)
        except DoesNotExistError:
            frappe.throw(f"Employee '{employee_id}' not found.")

        # Get salary components, defaulting to 0 if not set
        basic_salary = flt(employee.basic)
        allowance = flt(employee.allowance)
        total_base_comp = basic_salary + allowance

        # Calculate rates based on fixed 30 days and 9 hours/day
        daily_rate = (
            flt(total_base_comp / days_in_month_for_calc, 2)
            if days_in_month_for_calc
            else 0
        )
        overtime_rate = (
            flt(daily_rate / standard_hours_per_day, 4)
            if daily_rate and standard_hours_per_day
            else 0
        )

        # --------------------------------------------------
        # 3. Check for Existing Completed Payslip(s) using Schema Info
        # --------------------------------------------------
        payslip_issued = False
        issued_payslip_ids = []  # Store potentially multiple IDs
        issued_payslip_amount_sum = 0.0  # Initialize sum

        # Field names confirmed from RUA Payslip schema:
        payslip_doctype = "RUA Payslip"
        payslip_month_field = "for_month"
        payslip_year_field = "year"
        payslip_status_field = "status"
        payslip_completed_status = "Completed"
        payslip_amount_field = "amount"  # Confirmed amount field

        try:
            # Fetch ALL completed payslips for the employee and period
            existing_payslips = frappe.get_all(
                payslip_doctype,
                filters={
                    "employee": employee_id,
                    payslip_month_field: month,
                    payslip_year_field: year,
                    payslip_status_field: payslip_completed_status,
                    # Optionally add docstatus check if 'status' field isn't sufficient guarantee
                    # "docstatus": 1
                },
                fields=[
                    "name",
                    payslip_amount_field,
                ],  # Fetch name and the amount field
                # No limit specified, so it fetches all matching records
            )

            if existing_payslips:  # Check if the list returned is not empty
                payslip_issued = True
                # Iterate through all found payslips
                for payslip in existing_payslips:
                    if payslip.get("name"):  # Ensure name exists before appending
                        issued_payslip_ids.append(payslip.get("name"))
                    # Add the amount to the sum, safely converting using flt
                    issued_payslip_amount_sum += flt(payslip.get(payslip_amount_field))

        except Exception as payslip_e:
            # Log error if payslip check fails, but continue with salary calc
            frappe.log_error(
                f"Could not check for existing payslips for Emp:{employee_id}, {month}/{year}: {payslip_e}",
                "Payslip Check Error",
            )

        # 4. Fetch All Attendance Records for the Month
        # Needed to identify logged days and parse individual logs
        attendance_records = frappe.get_all(
            "RUA Attendance",
            filters=[["date", ">=", month_start_date], ["date", "<=", month_end_date]],
            fields=["name", "date", "attendance_log"],
            order_by="date",  # Order for potential consistency, though set logic follows
        )

        # 5. Fetch Approved Leave Records for the Employee Overlapping the Month
        leaves = frappe.get_all(
            "RUA Leave",
            filters=[
                ["employee", "=", employee_id],
                ["docstatus", "=", 1],  # Only consider submitted/approved leaves
                [
                    "return_date",
                    ">=",
                    month_start_date,
                ],  # End date is within or after month start
                [
                    "leave_date",
                    "<=",
                    month_end_date,
                ],  # Start date is within or before month end
            ],
            fields=["name", "leave_date", "return_date"],
        )

        # 6. Pre-process Data for Calculation

        # Identify unique days where *any* attendance was logged this month
        # This forms the basis of days to check for this employee
        logged_days_in_month = sorted(
            list(set(cstr(rec.date) for rec in attendance_records if rec.date))
        )

        # Handle case where no attendance was logged by anyone in the month
        if not logged_days_in_month:
            # Return calculated salary (usually base) + payslip info
            return {
                "employee_id": employee_id,
                "employee_name": employee.employee_name,
                "month": month,
                "year": year,
                "month_name": month_name,
                "days_present": 0,
                "days_late": 0,
                "days_absent": 0,  # No logged days = no absence counted here
                "days_on_leave": 0,
                "total_overtime_hours": 0.0,
                "basic_salary": basic_salary,
                "allowance": allowance,
                "total_base_compensation": total_base_comp,
                "daily_rate": daily_rate,
                "overtime_rate": overtime_rate,
                "late_penalty_days": 0,
                "total_deduction_days": 0,
                "total_deductions": 0.0,
                "overtime_compensation": 0.0,
                # If no attendance, final = base (no deductions/OT)
                "final_total_compensation": total_base_comp,
                "calculation_based_on_logged_days": logged_days_in_month,  # Will be empty list
                # Include payslip status found earlier
                "payslip_issued": payslip_issued,
                "issued_payslip_ids": issued_payslip_ids,
                "issued_payslip_amount_sum": issued_payslip_amount_sum,
            }

        # Process attendance logs specifically for *this* employee
        daily_logs_for_employee = (
            {}
        )  # { date_str: {status:'Present', overtime: 1.0}, ... }
        for record in attendance_records:
            if not record.date:
                continue  # Skip if date is missing
            record_date_str = cstr(record.date)
            try:
                # Safely load JSON, default to empty dict if null or invalid
                log_data = json.loads(record.attendance_log or "{}")
                # Get log ONLY for the requested employee_id
                emp_log = log_data.get(employee_id)

                if emp_log and isinstance(
                    emp_log, dict
                ):  # Process only if a valid log dict exists
                    status = "Not Recorded"
                    overtime = 0.0
                    try:
                        # Use abs() based on original logic
                        overtime = abs(flt(emp_log.get("overtime", 0)))
                    except (ValueError, TypeError):
                        pass  # Keep overtime as 0.0

                    # Determine status based on keys present in the log
                    if emp_log.get("absent"):
                        status = "Absent"
                    elif emp_log.get("late"):
                        status = "Late"
                    elif emp_log.get("present"):
                        status = "Present"
                    # Add other status checks if necessary (e.g., On Leave if marked in attendance log)

                    daily_logs_for_employee[record_date_str] = {
                        "status": status,
                        "overtime": overtime,
                    }
            except json.JSONDecodeError:
                frappe.log_error(
                    f"Failed JSON parse for RUA Attendance {record.name}",
                    "Employee Salary API",
                )
            except Exception as e:
                # Log other errors during log processing
                frappe.log_error(
                    f"Error processing attendance log in {record.name} for emp {employee_id}: {frappe.get_traceback()}",
                    "Employee Salary API",
                )

        # Create a set of leave dates for *this* employee that fall on logged days
        leave_dates_for_employee = set()
        for leave in leaves:
            try:
                start_iter_date = getdate(leave.leave_date)
                end_iter_date = getdate(leave.return_date)
                # Ensure dates are valid before iterating
                if (
                    start_iter_date
                    and end_iter_date
                    and start_iter_date <= end_iter_date
                ):
                    current_iter_date = start_iter_date
                    while current_iter_date <= end_iter_date:
                        date_str = cstr(current_iter_date)
                        # IMPORTANT: Only count leave if it falls on a day where *any* attendance was logged
                        if date_str in logged_days_in_month:
                            leave_dates_for_employee.add(date_str)
                        # Increment day safely
                        current_iter_date = add_days(current_iter_date, 1)
            except Exception as e:
                frappe.log_error(
                    f"Error processing leave dates for leave {leave.name} for emp {employee_id}: {e}",
                    "Employee Salary API",
                )

        # 7. Calculate Attendance Counts using the helper function
        attendance_counts = calculate_employee_monthly_attendance(
            employee_id,
            year,
            month,
            daily_logs_for_employee,
            leave_dates_for_employee,
            logged_days_in_month,
        )
        days_present = attendance_counts["present"]
        days_late = attendance_counts["late"]
        days_absent = attendance_counts["absent"]
        days_on_leave = attendance_counts["leave"]
        total_overtime = attendance_counts["overtime"]

        # 8. Calculate Salary Components based on Attendance (using original logic)
        # Late penalty: 1 day deduction for every 4 late days
        late_penalty_days = days_late // 4
        # Total days to deduct = Absent days + Late penalty days
        total_deduction_days = days_absent + late_penalty_days
        # Total monetary deduction
        total_deductions = flt(total_deduction_days * daily_rate, 2)
        # Total monetary overtime compensation
        overtime_compensation = flt(total_overtime * overtime_rate, 2)
        # Final calculated salary for the month based on this run
        final_total_compensation = flt(
            total_base_comp - total_deductions + overtime_compensation, 2
        )

        # 9. Prepare and Return Response
        result = {
            # Employee and Period Info
            "employee_id": employee_id,
            "employee_name": employee.employee_name,
            "month": month,
            "year": year,
            "month_name": month_name,
            # Attendance Counts
            "days_present": days_present,
            "days_late": days_late,
            "days_absent": days_absent,
            "days_on_leave": days_on_leave,
            "total_overtime_hours": total_overtime,
            # Base Salary Info
            "basic_salary": basic_salary,
            "allowance": allowance,
            "total_base_compensation": total_base_comp,
            # Calculation Rates
            "daily_rate": daily_rate,
            "overtime_rate": overtime_rate,
            # Deduction/Compensation Details
            "late_penalty_days": late_penalty_days,
            "total_deduction_days": total_deduction_days,
            "total_deductions": total_deductions,
            "overtime_compensation": overtime_compensation,
            # Final Calculated Salary (based on this run's attendance)
            "final_total_compensation": final_total_compensation,
            # Context for calculation
            "calculation_based_on_logged_days": logged_days_in_month,
            # --- Payslip Information ---
            "payslip_issued": payslip_issued,  # Boolean: True if any completed payslip exists
            "issued_payslip_ids": issued_payslip_ids,  # List of String: IDs of ALL existing completed payslips
            "issued_payslip_amount_sum": issued_payslip_amount_sum,  # Float: Sum of 'amount' from ALL existing completed payslips
        }
        return result

    # --- General Error Handling ---
    except Exception as e:
        # Log the full traceback for debugging
        frappe.log_error(
            frappe.get_traceback(),
            f"Error in get_employee_monthly_salary for Emp:{employee_id}, {month}/{year}",
        )
        # Return a user-friendly error structure
        return {"error": str(e)}


@frappe.whitelist()
def get_daily_attendance_pdf_url(attendance_date):
    """
    Finds an RUA Attendance document for a specific date and returns
    the URL to download the 'Daily Attendance Sheet' PDF print format.

    Args:
        attendance_date (str): The date string in 'YYYY-MM-DD' format.

    Returns:
        dict: A dictionary containing either 'pdf_url' or 'error'.
              Example success: {"pdf_url": "/api/method/..."}
              Example error: {"error": "No attendance record found..."}
    """
    try:
        # Validate and parse the date
        parsed_date = getdate(attendance_date)
    except (ValueError, TypeError):
        return {"error": "Invalid date format provided. Please use YYYY-MM-DD."}

    try:
        # Find the document name for the given date
        doc_name = frappe.get_value("RUA Attendance", {"date": parsed_date}, "name")

        if doc_name:
            # Construct the URL parameters
            params = {
                "doctype": "RUA Attendance",
                "name": doc_name,
                "format": "Daily Attendance Sheet",  # Specific format for daily
                "no_letterhead": 0,
                "letterhead": "RC-LH",
                "settings": "{}",  # Empty settings JSON
                "_lang": "en",  # Default language
            }
            # Build the full URL path
            pdf_url = (
                "/api/method/frappe.utils.print_format.download_pdf?"
                + urllib.parse.urlencode(params)
            )
            return {"pdf_url": pdf_url}
        else:
            return {
                "message": f"No attendance record found for date: {attendance_date}"
            }

    except Exception as e:
        frappe.log_error(
            f"Error in get_daily_attendance_pdf_url for date {attendance_date}: {frappe.get_traceback()}"
        )
        return {"error": f"An error occurred: {str(e)}"}


@frappe.whitelist()
def get_monthly_attendance_pdf_url(month_year):
    """
    Finds the first RUA Attendance document within a specific month and year
    and returns the URL to download the 'Monthly Summary Sheet' PDF print format,
    using that document's name in the URL.

    Args:
        month_year (str): The month and year string in 'MM-YYYY' format (e.g., "04-2025").

    Returns:
        dict: A dictionary containing either 'pdf_url' or 'error'.
              Example success: {"pdf_url": "/api/method/..."}
              Example error: {"error": "No attendance records found..."}
    """
    try:
        # Parse month and year
        month_str, year_str = month_year.split("-")
        month = cint(month_str)
        year = cint(year_str)

        if not (1 <= month <= 12 and year > 1900):
            raise ValueError("Invalid month or year.")

        # Determine month boundaries
        first_day = get_first_day(f"{year}-{month:02d}-01")
        last_day = get_last_day(first_day)

    except (ValueError, TypeError, IndexError):
        return {
            "error": "Invalid month-year format provided. Please use MM-YYYY (e.g., 04-2025)."
        }

    try:
        # Find the name of the *first* document within the date range
        doc_list = frappe.get_list(
            "RUA Attendance",
            filters={"date": ["between", (first_day, last_day)]},
            fields=["name"],
            limit_page_length=1,
            order_by="date",  # Get the earliest one in the month
        )

        if doc_list:
            doc_name = doc_list[0].get("name")
            # Construct the URL parameters
            params = {
                "doctype": "RUA Attendance",
                "name": doc_name,  # Use the name of the first doc found
                "format": "Monthly Summary Sheet",  # Specific format for monthly
                "no_letterhead": 0,
                "letterhead": "RC-LH",
                "settings": "{}",  # Empty settings JSON
                "_lang": "en",  # Default language
            }
            # Build the full URL path
            pdf_url = (
                "/api/method/frappe.utils.print_format.download_pdf?"
                + urllib.parse.urlencode(params)
            )
            return {"pdf_url": pdf_url}
        else:
            return {"message": f"No attendance records found for month: {month_year}"}

    except Exception as e:
        frappe.log_error(
            f"Error in get_monthly_attendance_pdf_url for {month_year}: {frappe.get_traceback()}"
        )
        return {"error": f"An error occurred: {str(e)}"}


