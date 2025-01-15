import frappe

@frappe.whitelist()
def get_user_roles(user):
    return frappe.get_roles(user)

@frappe.whitelist(allow_guest=True)
def get_server_time(date=None, time=None, datetime=None):
    current_date = frappe.utils.getdate(frappe.utils.nowdate())
    current_time = frappe.utils.get_time(frappe.utils.nowtime())
    current_datetime = frappe.utils.now_datetime()
    if date:
        return current_date
    if time:
        return current_time
    if datetime:
        return current_datetime
    else:
        return {
            'current_date': current_date,
            'current_time': current_time,
            'current_datetime': current_datetime
        }


@frappe.whitelist()
def get_project_refs(project):
    references = []

    # Query for RUA Quotation
    quotations = frappe.get_all('RUA Quotation', filters={'project': project}, fields=['name', 'party', 'date'])
    for ref in quotations:
        references.append({
            'doctype': 'RUA Quotation',
            'name': ref['name'],
            'party': ref['party'],
            'date': ref['date'],
            'link': f'/project/{project}/documents/quotation/{ref["name"]}'
        })

    # # Query for RUA Invoice   
    # invoices = frappe.get_all('RUA Invoice', filters={'project': project}, fields=['name', 'party', 'date'])
    # for ref in invoices:
    #     references.append({
    #         'doctype': 'RUA Invoice',
    #         'name': ref['name'],
    #         'party': ref['party'],
    #         'date': ref['date'],
    #         'link': f'/project/{project}/documents/invoice/{ref["name"]}'
    #     })

    # # Query for RUA Purchase Order
    # purchase_orders = frappe.get_all('RUA Purchase Order', filters={'project': project}, fields=['name', 'party', 'date'])
    # for ref in purchase_orders:
    #     references.append({
    #         'doctype': 'RUA Purchase Order',
    #         'name': ref['name'],
    #         'party': ref['party'],
    #         'date': ref['date'],
    #         'link': f'/project/{project}/documents/purchase-order/{ref["name"]}'
    #     })

    # You can add more queries for other doctypes as needed

    return references

@frappe.whitelist()
def get_all_users():
    references = []
    employees = frappe.get_all('RUA Employee', fields=['name', 'user', 'employee_name', 'image'])
    for employee in employees:
        if employee.user:
            references.append({
                'name': employee.name,
                'user': employee.user,
                'employee_name': employee.employee_name,
                'image': employee.image,
            })

    return references