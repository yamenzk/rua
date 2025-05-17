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
    total_overtime = 0.0 

    try:
        month_start_date = getdate(f"{year}-{month:02d}-01")  
        month_end_date = get_last_day(month_start_date)
    except ValueError:
        frappe.log_error(
            f"Invalid year/month combination: {year}-{month}", "Attendance Calculation"
        )
        return {"present": 0, "late": 0, "absent": 0, "leave": 0, "overtime": 0.0}

    for date_str in logged_days_in_month:
        try:
            current_date = getdate(date_str)
            if not (month_start_date <= current_date <= month_end_date):
                continue

            if date_str in leave_dates_for_employee:
                days_on_leave += 1

            elif date_str in daily_logs_for_employee:
                log = daily_logs_for_employee[date_str]
                status = log.get(
                    "status", "Not Recorded"
                )  
                overtime_val = log.get("overtime", 0)
                try:
                    total_overtime += abs(flt(overtime_val))
                except (ValueError, TypeError):
                    frappe.log(
                        f"Could not convert overtime '{overtime_val}' to float for emp {employee_id} on {date_str}"
                    )

                if status == "Present":
                    days_present += 1
                elif status == "Late":
                    days_late += 1
                elif status == "Absent":
                    days_absent += 1
            else:
                days_absent += 1
        except Exception as e:
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
        if not employee_id:
            frappe.throw("Employee ID is required.")
        if not month or not year:
            frappe.throw("Month and Year are required.")

        try:
            month = cint(month)
            year = cint(year)
            if not (1 <= month <= 12 and year > 1900):  
                raise ValueError("Invalid month or year.")
            target_date = getdate(f"{year}-{month:02d}-01")
        except (ValueError, TypeError) as e:
            frappe.throw(f"Invalid Month or Year format: {e}")

        month_start_date = get_first_day(target_date)
        month_end_date = get_last_day(target_date)
        month_name = target_date.strftime("%B")

        days_in_month_for_calc = 30
        standard_hours_per_day = 9

        try:
            employee = frappe.get_doc("RUA Employee", employee_id)
        except DoesNotExistError:
            frappe.throw(f"Employee '{employee_id}' not found.")

        basic_salary = flt(employee.basic)
        allowance = flt(employee.allowance)
        total_base_comp = basic_salary + allowance

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

        payslip_issued = False
        issued_payslip_ids = []  
        issued_payslip_amount_sum = 0.0 
        payslip_doctype = "RUA Payslip"
        payslip_month_field = "for_month"
        payslip_year_field = "year"
        payslip_status_field = "status"
        payslip_completed_status = "Completed"
        payslip_amount_field = "amount" 

        try:
            existing_payslips = frappe.get_all(
                payslip_doctype,
                filters={
                    "employee": employee_id,
                    payslip_month_field: month,
                    payslip_year_field: year,
                    payslip_status_field: payslip_completed_status,
                },
                fields=[
                    "name",
                    payslip_amount_field,
                ], 
            )

            if existing_payslips: 
                payslip_issued = True
                for payslip in existing_payslips:
                    if payslip.get("name"): 
                        issued_payslip_ids.append(payslip.get("name"))
                    issued_payslip_amount_sum += flt(payslip.get(payslip_amount_field))

        except Exception as payslip_e:
            frappe.log_error(
                f"Could not check for existing payslips for Emp:{employee_id}, {month}/{year}: {payslip_e}",
                "Payslip Check Error",
            )

        attendance_records = frappe.get_all(
            "RUA Attendance",
            filters=[["date", ">=", month_start_date], ["date", "<=", month_end_date]],
            fields=["name", "date", "attendance_log"],
            order_by="date", 
        )

        leaves = frappe.get_all(
            "RUA Leave",
            filters=[
                ["employee", "=", employee_id],
                ["docstatus", "=", 1],  
                [
                    "return_date",
                    ">=",
                    month_start_date,
                ], 
                [
                    "leave_date",
                    "<=",
                    month_end_date,
                ],  
            ],
            fields=["name", "leave_date", "return_date"],
        )

        logged_days_in_month = sorted(
            list(set(cstr(rec.date) for rec in attendance_records if rec.date))
        )

        if not logged_days_in_month:
            return {
                "employee_id": employee_id,
                "employee_name": employee.employee_name,
                "month": month,
                "year": year,
                "month_name": month_name,
                "days_present": 0,
                "days_late": 0,
                "days_absent": 0,  
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
                "final_total_compensation": total_base_comp,
                "calculation_based_on_logged_days": logged_days_in_month,
                "payslip_issued": payslip_issued,
                "issued_payslip_ids": issued_payslip_ids,
                "issued_payslip_amount_sum": issued_payslip_amount_sum,
            }

        daily_logs_for_employee = (
            {}
        ) 
        for record in attendance_records:
            if not record.date:
                continue 
            record_date_str = cstr(record.date)
            try:
                log_data = json.loads(record.attendance_log or "{}")
                emp_log = log_data.get(employee_id)

                if emp_log and isinstance(
                    emp_log, dict
                ): 
                    status = "Not Recorded"
                    overtime = 0.0
                    try:
                        overtime = abs(flt(emp_log.get("overtime", 0)))
                    except (ValueError, TypeError):
                        pass 

                    if emp_log.get("absent"):
                        status = "Absent"
                    elif emp_log.get("late"):
                        status = "Late"
                    elif emp_log.get("present"):
                        status = "Present"

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
                frappe.log_error(
                    f"Error processing attendance log in {record.name} for emp {employee_id}: {frappe.get_traceback()}",
                    "Employee Salary API",
                )

        leave_dates_for_employee = set()
        for leave in leaves:
            try:
                start_iter_date = getdate(leave.leave_date)
                end_iter_date = getdate(leave.return_date)
                if (
                    start_iter_date
                    and end_iter_date
                    and start_iter_date <= end_iter_date
                ):
                    current_iter_date = start_iter_date
                    while current_iter_date <= end_iter_date:
                        date_str = cstr(current_iter_date)
                        if date_str in logged_days_in_month:
                            leave_dates_for_employee.add(date_str)
                        # Increment day safely
                        current_iter_date = add_days(current_iter_date, 1)
            except Exception as e:
                frappe.log_error(
                    f"Error processing leave dates for leave {leave.name} for emp {employee_id}: {e}",
                    "Employee Salary API",
                )

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
        late_penalty_days = days_late // 4
        total_deduction_days = days_absent + late_penalty_days
        total_deductions = flt(total_deduction_days * daily_rate, 2)
        overtime_compensation = flt(total_overtime * overtime_rate, 2)
        final_total_compensation = flt(
            total_base_comp - total_deductions + overtime_compensation, 2
        )

        result = {
            "employee_id": employee_id,
            "employee_name": employee.employee_name,
            "month": month,
            "year": year,
            "month_name": month_name,
            "days_present": days_present,
            "days_late": days_late,
            "days_absent": days_absent,
            "days_on_leave": days_on_leave,
            "total_overtime_hours": total_overtime,
            "basic_salary": basic_salary,
            "allowance": allowance,
            "total_base_compensation": total_base_comp,
            "daily_rate": daily_rate,
            "overtime_rate": overtime_rate,
            "late_penalty_days": late_penalty_days,
            "total_deduction_days": total_deduction_days,
            "total_deductions": total_deductions,
            "overtime_compensation": overtime_compensation,
            "final_total_compensation": final_total_compensation,
            "calculation_based_on_logged_days": logged_days_in_month,
            "payslip_issued": payslip_issued,  # Boolean: True if any completed payslip exists
            "issued_payslip_ids": issued_payslip_ids,  # List of String: IDs of ALL existing completed payslips
            "issued_payslip_amount_sum": issued_payslip_amount_sum,  # Float: Sum of 'amount' from ALL existing completed payslips
        }
        return result

    except Exception as e:
        frappe.log_error(
            frappe.get_traceback(),
            f"Error in get_employee_monthly_salary for Emp:{employee_id}, {month}/{year}",
        )
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
        parsed_date = getdate(attendance_date)
    except (ValueError, TypeError):
        return {"error": "Invalid date format provided. Please use YYYY-MM-DD."}

    try:
        doc_name = frappe.get_value("RUA Attendance", {"date": parsed_date}, "name")

        if doc_name:
            params = {
                "doctype": "RUA Attendance",
                "name": doc_name,
                "format": "Daily Attendance Sheet", 
                "no_letterhead": 0,
                "letterhead": "RC-LH",
                "settings": "{}",
                "_lang": "en",  
            }
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
        month_str, year_str = month_year.split("-")
        month = cint(month_str)
        year = cint(year_str)

        if not (1 <= month <= 12 and year > 1900):
            raise ValueError("Invalid month or year.")

        first_day = get_first_day(f"{year}-{month:02d}-01")
        last_day = get_last_day(first_day)

    except (ValueError, TypeError, IndexError):
        return {
            "error": "Invalid month-year format provided. Please use MM-YYYY (e.g., 04-2025)."
        }

    try:
        doc_list = frappe.get_list(
            "RUA Attendance",
            filters={"date": ["between", (first_day, last_day)]},
            fields=["name"],
            limit_page_length=1,
            order_by="date",
        )

        if doc_list:
            doc_name = doc_list[0].get("name")
            params = {
                "doctype": "RUA Attendance",
                "name": doc_name,
                "format": "Monthly Summary Sheet", 
                "no_letterhead": 0,
                "letterhead": "RC-LH",
                "settings": "{}", 
                "_lang": "en", 
            }
            
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


