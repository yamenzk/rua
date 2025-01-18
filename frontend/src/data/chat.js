import { createListResource } from "frappe-ui"

export const chatResource = createListResource({
    doctype: 'RUA Chat',
    fields: ['*'],
	cache: ['rua:chat'],
	start: 0,
	orderBy: 'timestamp asc',
	pageLength: 99999999
})