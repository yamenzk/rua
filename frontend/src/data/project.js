import router from "@/router"
import { createListResource } from "frappe-ui"

export const projectResource = createListResource({
    doctype: 'RUA Project',
    fields: ['*'],
	cache: ['rua:project'],
	start: 0,
	pageLength: 99999999
})