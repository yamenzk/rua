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
)


def calculate_monthly_attendance(
    employee_id, year, month, daily_logs, leave_dates_by_employee, logged_days_in_month
):
    """Calculates attendance counts for a specific employee and month based on logged days."""
    days_present = 0
    days_late = 0
    days_absent = 0
    days_on_leave = 0
    total_overtime = 0

    emp_daily_logs = daily_logs.get(employee_id, {})
    emp_leave_dates = leave_dates_by_employee.get(employee_id, set())

    # Iterate only through days logged *in this specific month*
    month_start_date = getdate(f"{year}-{month}-01")
    month_end_date = get_last_day(month_start_date)

    for date_str in logged_days_in_month:
        current_date = getdate(date_str)
        # Ensure the logged day is within the target month
        if not (month_start_date <= current_date <= month_end_date):
            continue

        if date_str in emp_leave_dates:
            days_on_leave += 1
        elif date_str in emp_daily_logs:
            log = emp_daily_logs[date_str]
            status = log["status"]
            total_overtime += log["overtime"]

            if status == "Present":
                days_present += 1
            elif status == "Late":
                days_late += 1
            elif status == "Absent":
                days_absent += 1
        else:
            # Employee has NO log for this logged day -> count as Absent
            days_absent += 1

    return {
        "present": days_present,
        "late": days_late,
        "absent": days_absent,
        "leave": days_on_leave,
        "overtime": total_overtime,
    }


@frappe.whitelist()
def get_monthly_summary_context(attendance_doc_name=None, month=None, year=None):
    """
    Prepares context for the Monthly Attendance and Salary Summary print format.
    Calculates based *only* on days with attendance logs within the month.
    """
    try:
        if attendance_doc_name:
            attendance_doc = frappe.get_doc("RUA Attendance", attendance_doc_name)
            target_date = getdate(attendance_doc.date)
            month = target_date.month
            year = target_date.year
        elif month and year:
            month = cint(month)
            year = cint(year)
            if not (1 <= month <= 12 and year > 1900):
                frappe.throw("Invalid month or year provided.")
            target_date = getdate(f"{year}-{month}-01")
        else:
            frappe.throw("Please provide either attendance_doc_name or month and year.")

        month_start_date = get_first_day(target_date)
        month_end_date = get_last_day(target_date)
        month_name = target_date.strftime("%B")
        # Using 30 days consistently for rate calculation as per user logic
        days_in_month_for_calc = 30

        # Fetch all active employees
        employees = frappe.get_all(
            "RUA Employee",
            fields=["name", "employee_name", "image", "basic", "allowance"],
        )

        if not employees:
            return {
                "month_name": month_name,
                "year": year,
                "summary_data": [],
                "error": "No active employees found.",
            }

        # Fetch all attendance records for the month
        attendance_records = frappe.get_all(
            "RUA Attendance",
            filters=[["date", ">=", month_start_date], ["date", "<=", month_end_date]],
            fields=["name", "date", "attendance_log"],
        )

        # --- Identify unique days where attendance was logged ---
        logged_days_in_month = sorted(
            list(set(cstr(rec.date) for rec in attendance_records))
        )
        if not logged_days_in_month:
            return {
                "month_name": month_name,
                "year": year,
                "summary_data": [],
                "error": "No attendance records found for this month.",
            }

        # Process attendance logs into a per-employee, per-day structure
        daily_logs = (
            {}
        )  # { employee_name: { date_str: {status:'Present', overtime: 1}, ... }, ... }
        for record in attendance_records:
            try:
                log_data = json.loads(record.attendance_log or "{}")
                record_date_str = cstr(record.date)
                for emp_id, log in log_data.items():
                    if emp_id not in daily_logs:
                        daily_logs[emp_id] = {}

                    status = "Not Recorded"
                    overtime = 0
                    try:
                        overtime = abs(flt(log.get("overtime", 0)))
                    except (ValueError, TypeError):
                        pass

                    if log.get("absent"):
                        status = "Absent"
                    elif log.get("late"):
                        status = "Late"
                    elif log.get("present"):
                        status = "Present"

                    daily_logs[emp_id][record_date_str] = {
                        "status": status,
                        "overtime": overtime,
                    }
            except json.JSONDecodeError:
                frappe.log_error(
                    f"Failed to parse attendance_log JSON for {record.name}",
                    "Monthly Summary Print",
                )
            except Exception as e:
                frappe.log_error(
                    frappe.get_traceback(), f"Error processing record {record.name}"
                )

        # Fetch leave records overlapping the month
        leaves = frappe.get_all(
            "RUA Leave",
            filters=[
                ["docstatus", "=", 1],
                ["return_date", ">=", month_start_date],
                ["leave_date", "<=", month_end_date],
            ],
            fields=["employee", "leave_date", "return_date"],
        )

        # Create a set of leave dates per employee for quick lookup
        leave_dates_by_employee = {}
        for leave in leaves:
            emp_id = leave.employee
            if emp_id not in leave_dates_by_employee:
                leave_dates_by_employee[emp_id] = set()
            try:
                start_iter_date = getdate(leave.leave_date)
                end_iter_date = getdate(leave.return_date)
                current_date = start_iter_date
                while current_date <= end_iter_date:
                    # Check if leave day falls within the actual logged days of the month
                    date_str = cstr(current_date)
                    if (
                        date_str in logged_days_in_month
                    ):  # Only count leave if it's on a logged day
                        leave_dates_by_employee[emp_id].add(date_str)
                    current_date = add_days(current_date, 1)
            except Exception as e:
                frappe.log_error(
                    f"Error processing leave dates for leave record linked to employee {emp_id}: {e}",
                    "Monthly Summary Print",
                )

        # --- Calculate summary for each employee based on LOGGED days ---
        summary_data = []
        for emp in employees:
            emp_id = emp.name
            basic_salary = flt(emp.basic)
            allowance = flt(emp.allowance)
            total_base_comp = basic_salary + allowance
            # Daily rate still based on fixed 30 days per user requirement
            daily_rate = (
                flt(total_base_comp / days_in_month_for_calc, 2)
                if days_in_month_for_calc
                else 0
            )

            days_present = 0
            days_late = 0
            days_absent = 0
            days_on_leave = 0
            total_overtime = 0

            emp_daily_logs = daily_logs.get(emp_id, {})
            emp_leave_dates = leave_dates_by_employee.get(emp_id, set())

            # --- Iterate only through days where attendance was logged ---
            for date_str in logged_days_in_month:
                if date_str in emp_leave_dates:
                    days_on_leave += 1
                elif date_str in emp_daily_logs:
                    # Employee has a log for this logged day
                    log = emp_daily_logs[date_str]
                    status = log["status"]
                    total_overtime += log["overtime"]

                    if status == "Present":
                        days_present += 1
                    elif status == "Late":
                        days_late += 1
                    elif status == "Absent":
                        days_absent += 1
                    # Ignore 'Not Recorded' if it appears in logs
                else:
                    # Employee has NO log for this logged day (but others did) -> count as Absent
                    days_absent += 1
            # --- End iteration through logged days ---

            # Calculate Deductions (based on counts from logged days only)
            late_penalty_days = days_late // 4
            total_deduction_days = days_absent + late_penalty_days
            total_deductions = flt(total_deduction_days * daily_rate, 2)

            # Calculate Overtime Compensation
            standard_hours_per_day = 9
            overtime_rate = (
                flt(daily_rate / standard_hours_per_day, 4)
                if daily_rate and standard_hours_per_day
                else 0
            )
            overtime_compensation = flt(total_overtime * overtime_rate, 2)

            # Calculate Total Compensation
            total_compensation = flt(
                total_base_comp - total_deductions + overtime_compensation, 2
            )

            summary_data.append(
                {
                    "employee_name": emp.employee_name,
                    "image": emp.image,
                    "days_present": days_present,
                    "days_late": days_late,
                    "days_absent": days_absent,
                    "days_on_leave": days_on_leave,
                    "basic_salary": basic_salary,
                    "allowance": allowance,
                    "total_deductions": total_deductions,
                    "total_overtime_hours": total_overtime,
                    "overtime_compensation": overtime_compensation,
                    "total_compensation": total_compensation,
                }
            )

        # Prepare final context
        context = {
            "month_name": month_name,
            "year": year,
            "summary_data": summary_data,
            "error": None,
        }
        return context

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error in get_monthly_summary_context")
        return {"error": str(e)}


@frappe.whitelist()
def get_daily_attendance_context(attendance_doc_name):
    """
    Prepares the context data needed for the Daily Attendance Sheet print format.

    Args:
        attendance_doc_name (str): The name (ID) of the RUA Attendance document.

    Returns:
        dict: A dictionary containing processed data for the print format.
    """
    try:
        # Get the specific RUA Attendance document
        doc = frappe.get_doc("RUA Attendance", attendance_doc_name)
        attendance_date = getdate(doc.date)  # Ensure it's a date object

        # Safely parse the JSON log
        try:
            attendance_log = json.loads(doc.attendance_log or "{}")
        except json.JSONDecodeError:
            frappe.log_error(
                f"Failed to parse attendance_log JSON for {attendance_doc_name}",
                "Attendance Print Format",
            )
            attendance_log = {}

        # Fetch all active employees
        employees = frappe.get_all(
            "RUA Employee",
            fields=["name", "employee_name", "image", "branch"],
        )

        # Fetch leave records overlapping with the attendance date
        leaves_today = frappe.get_all(
            "RUA Leave",
            filters=[
                ["leave_date", "<=", attendance_date],
                ["return_date", ">=", attendance_date],
            ],
            fields=["employee"],
        )
        employees_on_leave = [leave.employee for leave in leaves_today]

        # Process and group employees
        employees_by_branch = {}
        for emp in employees:
            branch = emp.get("branch") or "Unassigned"
            if branch not in employees_by_branch:
                employees_by_branch[branch] = []

            # Determine attendance status
            emp_log = attendance_log.get(emp.name, {})
            status = "Not Recorded"

            # --- Safely get and convert overtime ---
            overtime_val = emp_log.get("overtime", 0)
            overtime = 0  # Default to 0
            try:
                # Attempt to convert to float first (handles decimals), then take abs
                overtime = abs(float(overtime_val))
            except (ValueError, TypeError):
                # If conversion fails, log it (optional) and keep overtime as 0
                frappe.log(
                    f"Could not convert overtime value '{overtime_val}' to number for employee {emp.name} on {doc.date}",
                    "Attendance Print Format",
                )
            # --- End overtime handling ---

            if emp.name in employees_on_leave:
                status = "On Leave"
            elif emp_log:  # Check if there's any log entry
                if emp_log.get("absent"):
                    status = "Absent"
                elif emp_log.get("late"):
                    status = "Late"
                elif emp_log.get("present"):
                    status = "Present"

            # Append processed employee data
            employees_by_branch[branch].append(
                {
                    "name": emp.name,
                    "employee_name": emp.employee_name,
                    "image": emp.image,
                    "status": status,
                    "overtime": overtime,  # Use the safely converted value
                }
            )

        # Sort employees within each branch
        for branch in employees_by_branch:
            employees_by_branch[branch].sort(key=lambda x: x["employee_name"])

        # Prepare the final context
        context = {
            "doc": doc,  # Pass the original doc if needed in the template
            "formatted_date": format_date(doc.date, "long"),
            "employees_by_branch": employees_by_branch,
            # Add any other data needed by the template
        }
        return context

    except Exception as e:
        frappe.log_error(
            frappe.get_traceback(),
            f"Error in get_daily_attendance_context for {attendance_doc_name}",
        )
        return {"error": str(e)}  # Return an error indication


# Assuming this is in rua/prints.py or similar
import frappe
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
from frappe.utils import (
    flt, getdate, cint, cstr, formatdate, add_days, add_months,
    get_first_day, get_last_day, nowdate, date_diff, today
)

# --- Helper function to calculate monthly attendance ---
# (Remains the same as before)
def calculate_monthly_attendance(employee_id, year, month, daily_logs, leave_dates_by_employee, logged_days_in_month):
    """Calculates attendance counts for a specific employee and month based on logged days."""
    days_present = 0
    days_late = 0
    days_absent = 0
    days_on_leave = 0
    total_overtime = 0

    emp_daily_logs = daily_logs.get(employee_id, {})
    emp_leave_dates = leave_dates_by_employee.get(employee_id, set())

    try:
        month_start_date = getdate(f"{year}-{month}-01")
        month_end_date = get_last_day(month_start_date)
    except ValueError:
         return {"present": 0, "late": 0, "absent": 0, "leave": 0, "overtime": 0}

    for date_str in logged_days_in_month:
        try:
            current_date = getdate(date_str)
            if not (month_start_date <= current_date <= month_end_date):
                continue

            if date_str in emp_leave_dates:
                days_on_leave += 1
            elif date_str in emp_daily_logs:
                log = emp_daily_logs[date_str]
                status = log['status']
                total_overtime += log['overtime']

                if status == 'Present': days_present += 1
                elif status == 'Late': days_late += 1
                elif status == 'Absent': days_absent += 1
            else:
                days_absent += 1
        except Exception as e:
             frappe.log_error(f"Error processing date {date_str} in calculate_monthly_attendance: {e}")

    return {
        "present": days_present, "late": days_late, "absent": days_absent,
        "leave": days_on_leave, "overtime": total_overtime,
    }

@frappe.whitelist()
def get_employee_summary_context(employee_id):
    """
    Prepares context for the Employee Summary Sheet print format.
    Aggregates past years, shows current year monthly.
    Aggregates past compensation status years unless pending months exist after cutoff.

    Args:
        employee_id (str): The name (ID) of the RUA Employee document.

    Returns:
        dict: A dictionary containing processed data for the print format.
    """
    try:
        # 1. Fetch Employee Data
        employee = frappe.get_doc('RUA Employee', employee_id)
        if not employee:
            frappe.throw(f"Employee {employee_id} not found.")

        joining_date = getdate(employee.joining_date) if employee.joining_date else None
        if not joining_date:
             frappe.throw(f"Employee {employee_id} does not have a Joining Date.")

        current_date_today = getdate(today()) # Use frappe.utils.today()
        current_year = current_date_today.year

        basic_salary = flt(employee.basic)
        allowance = flt(employee.allowance)
        total_base_comp = basic_salary + allowance
        days_in_month_for_calc = 30 # As per previous logic for daily rate
        daily_rate = flt(total_base_comp / days_in_month_for_calc, 2) if days_in_month_for_calc else 0
        standard_hours_per_day = 9 # As per previous logic for OT rate
        overtime_rate = flt(daily_rate / standard_hours_per_day, 4) if daily_rate and standard_hours_per_day else 0

        # 2. Fetch All Relevant Data for the Employee (Attendance, Leaves, Payslips)
        attendance_records = frappe.get_all('RUA Attendance', fields=['name', 'date', 'attendance_log'])
        leaves = frappe.get_all('RUA Leave', filters={'employee': employee_id, 'docstatus': 1}, fields=['name', 'leave_date', 'return_date'])
        payslips = frappe.get_all('RUA Payslip', filters={'employee': employee_id, 'status': 'Completed'}, fields=['name', 'for_month', 'year'])

        # --- Pre-process Data ---
        all_logged_days = sorted(list(set(cstr(rec.date) for rec in attendance_records if rec.date)))
        employee_daily_logs = {}
        for record in attendance_records:
            if not record.date: continue
            try:
                log_data = json.loads(record.attendance_log or '{}')
                emp_log = log_data.get(employee_id)
                if emp_log:
                    record_date_str = cstr(record.date)
                    status = 'Not Recorded'
                    overtime = 0
                    try: overtime = abs(flt(emp_log.get('overtime', 0)))
                    except (ValueError, TypeError): pass
                    if emp_log.get('absent'): status = 'Absent'
                    elif emp_log.get('late'): status = 'Late'
                    elif emp_log.get('present'): status = 'Present'
                    employee_daily_logs[record_date_str] = {"status": status, "overtime": overtime}
            except Exception as e: frappe.log_error(f"Error processing attendance record {record.name} for employee {employee_id}: {e}")

        employee_leave_dates = set()
        for leave in leaves:
             try:
                start_iter_date = getdate(leave.leave_date)
                end_iter_date = getdate(leave.return_date)
                current_iter_date = start_iter_date
                while current_iter_date <= end_iter_date:
                    date_str = cstr(current_iter_date)
                    if date_str in all_logged_days: employee_leave_dates.add(date_str)
                    current_iter_date = add_days(current_iter_date, 1)
             except Exception as e: frappe.log_error(f"Error processing leave dates for leave {leave.name}: {e}")

        paid_periods = set((p.for_month, p.year) for p in payslips)

        # --- Generate Monthly/Yearly Attendance Summaries (same as before) ---
        attendance_summary_list = []
        yearly_aggregates = {}
        current_month_start_att = get_first_day(joining_date)
        while current_month_start_att <= current_date_today:
            year = current_month_start_att.year
            month = current_month_start_att.month
            month_name = current_month_start_att.strftime('%B')
            attendance_counts = calculate_monthly_attendance(employee_id, year, month, {employee_id: employee_daily_logs}, {employee_id: employee_leave_dates}, all_logged_days)
            late_penalty_days = attendance_counts['late'] // 4
            total_deduction_days = attendance_counts['absent'] + late_penalty_days
            total_deductions = flt(total_deduction_days * daily_rate, 2)
            overtime_compensation = flt(attendance_counts['overtime'] * overtime_rate, 2)
            monthly_total_compensation = flt(total_base_comp - total_deductions + overtime_compensation, 2)

            if year < current_year:
                if year not in yearly_aggregates: yearly_aggregates[year] = { 'year': year, 'period_label': f"Year {year}", 'type': 'year', 'days_present': 0, 'days_late': 0, 'days_absent': 0, 'days_on_leave': 0, 'total_overtime_hours': 0.0, 'total_deductions': 0.0, 'overtime_compensation': 0.0, 'total_compensation': 0.0, 'basic_salary': None, 'allowance': None }
                agg = yearly_aggregates[year]
                agg['days_present'] += attendance_counts['present']
                agg['days_late'] += attendance_counts['late']
                agg['days_absent'] += attendance_counts['absent']
                agg['days_on_leave'] += attendance_counts['leave']
                agg['total_overtime_hours'] += attendance_counts['overtime']
                agg['total_deductions'] += total_deductions
                agg['overtime_compensation'] += overtime_compensation
                agg['total_compensation'] += monthly_total_compensation
            else:
                attendance_summary_list.append({ 'year': year, 'month': month, 'period_label': f"{month_name} {year}", 'type': 'month', 'days_present': attendance_counts['present'], 'days_late': attendance_counts['late'], 'days_absent': attendance_counts['absent'], 'days_on_leave': attendance_counts['leave'], 'total_overtime_hours': attendance_counts['overtime'], 'basic_salary': basic_salary, 'allowance': allowance, 'total_deductions': total_deductions, 'overtime_compensation': overtime_compensation, 'total_compensation': monthly_total_compensation })
            current_month_start_att = add_months(current_month_start_att, 1)
        final_attendance_summary_list = sorted(yearly_aggregates.values(), key=lambda x: x['year']) + attendance_summary_list


        # --- Generate Aggregated Compensation Payment Status ---
        compensation_status_list = []
        monthly_statuses = {} # {(year, month): status}
        cutoff_date = getdate("2025-05-01")
        current_month_start_comp = get_first_day(joining_date)

        # First, determine status for each month
        while current_month_start_comp <= current_date_today:
            year = current_month_start_comp.year
            month = current_month_start_comp.month
            status = "Pending"
            if current_month_start_comp < cutoff_date: status = "Paid Fully (N/S)"
            elif (month, year) in paid_periods: status = "Paid via Payslip"
            monthly_statuses[(year, month)] = status
            current_month_start_comp = add_months(current_month_start_comp, 1)

        # Now, aggregate or list based on year and status
        years_processed_for_aggregation = set() # Use a different set for aggregation tracking
        current_month_start_comp = get_first_day(joining_date)

        while current_month_start_comp <= current_date_today:
            year = current_month_start_comp.year
            month = current_month_start_comp.month
            month_name = current_month_start_comp.strftime('%B')

            if year < current_year:
                # --- Handle Past Years ---
                if year in years_processed_for_aggregation: # Skip if already aggregated/listed
                    current_month_start_comp = add_months(current_month_start_comp, 1)
                    continue

                # Check past year for pending months after cutoff
                pending_after_cutoff_exists = False
                year_fully_paid = True
                partially_paid = False
                start_month_this_year = joining_date.month if year == joining_date.year else 1
                end_month_this_year = 12

                for m in range(start_month_this_year, end_month_this_year + 1):
                    month_date = getdate(f"{year}-{m}-01") # Check date validity implicitly
                    status = monthly_statuses.get((year, m), "Pending") # Default to Pending if not found

                    if status == "Pending" and month_date >= cutoff_date:
                         pending_after_cutoff_exists = True
                    if status == "Pending":
                         year_fully_paid = False
                    if status == "Paid via Payslip":
                         partially_paid = True # Mark if at least one month was paid via payslip

                if pending_after_cutoff_exists:
                     # List all relevant months for this past year
                     for m in range(start_month_this_year, end_month_this_year + 1):
                          month_date = getdate(f"{year}-{m}-01")
                          m_name = month_date.strftime('%B')
                          status = monthly_statuses.get((year, m), "Pending")
                          compensation_status_list.append({'period_label': f"{m_name} {year}", 'status': status, 'type': 'month'})
                     years_processed_for_aggregation.add(year) # Mark year as processed (listed monthly)

                else:
                     # Aggregate the past year
                     overall_status = "Paid" if year_fully_paid else "Pending" # Default if not fully paid
                     if not year_fully_paid and partially_paid:
                         overall_status = "Partially Paid" # Refine if some payslips exist

                     compensation_status_list.append({'period_label': f"Year {year}", 'status': overall_status, 'type': 'year'})
                     years_processed_for_aggregation.add(year) # Mark year as processed (aggregated)

                # Jump to next year start *only* if we aggregated this year
                if not pending_after_cutoff_exists:
                     current_month_start_comp = getdate(f"{year+1}-01-01")
                     continue # Skip month increment

            else: # --- Handle Current Year ---
                # Always list months for the current year
                status = monthly_statuses.get((year, month), "Pending")
                compensation_status_list.append({'period_label': f"{month_name} {year}", 'status': status, 'type': 'month'})
                # No need to add to years_processed_for_aggregation for current year

            # Move to next month (will happen naturally if not jumped)
            current_month_start_comp = add_months(current_month_start_comp, 1)


        # --- Calculate End of Service (same as before) ---
        days_worked = date_diff(current_date_today, joining_date) + 1
        years_worked = flt(days_worked / 365.25, 2)
        estimated_eos = flt(years_worked * total_base_comp, 2)

        # --- Prepare Final Context ---
        context = {
            'employee': employee.as_dict(),
            'attendance_summary_data': final_attendance_summary_list,
            'compensation_status_data': compensation_status_list, # Use new list
            'days_worked': days_worked,
            'years_worked': years_worked,
            'estimated_eos': estimated_eos,
            'error': None
        }
        return context

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), f"Error in get_employee_summary_context for {employee_id}")
        return {"error": str(e)}

