import { createListResource } from "frappe-ui"

export const updateResource = createListResource({
    doctype: 'RUA App Update',
    fields: ['*'],
	cache: ['rua:update'],
	start: 0,
	pageLength: 99999999
})

