import router from "@/router"
import { createListResource } from "frappe-ui"

export const lpoResource = createListResource({
    doctype: 'RUA LPO',
    fields: ['*'],
	cache: ['rua:lpo'],
	start: 0,
	pageLength: 99999999
})