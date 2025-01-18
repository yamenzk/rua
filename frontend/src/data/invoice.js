import router from "@/router"
import { createListResource } from "frappe-ui"

export const invoiceResource = createListResource({
    doctype: 'RUA Invoice',
    fields: ['*'],
	cache: ['rua:invoice'],
	start: 0,
	pageLength: 99999999
})