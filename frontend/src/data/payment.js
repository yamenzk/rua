import router from "@/router"
import { createListResource } from "frappe-ui"

export const paymentResource = createListResource({
    doctype: 'RUA Payment',
    fields: ['*'],
	cache: ['rua:payment'],
	start: 0,
	pageLength: 99999999
})