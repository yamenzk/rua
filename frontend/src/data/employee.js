import router from "@/router"
import { createListResource } from "frappe-ui"

export const employeeResource = createListResource({
    doctype: 'RUA Employee',
    fields: ['*'],
	start: 0,
	pageLength: 99999999,
	cache: ['rua:employee']
})