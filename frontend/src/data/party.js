import router from "@/router"
import { createListResource } from "frappe-ui"

export const partyResource = createListResource({
    doctype: 'RUA Party',
    fields: ['*'],
	cache: ['rua:party'],
	start: 0,
	pageLength: 99999999
})