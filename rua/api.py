import frappe

@frappe.whitelist()
def get_user_roles(user):
    return frappe.get_roles(user)

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