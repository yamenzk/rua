import { createListResource } from "frappe-ui"

export const issueResource = createListResource({
    doctype: 'RUA Issue',
    fields: ['*'],
	cache: ['rua:issue'],
	start: 0,
	pageLength: 99999999
})