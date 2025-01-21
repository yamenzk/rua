import { createListResource } from "frappe-ui"

export const leaveResource = createListResource({
    doctype: 'RUA Leave',
    fields: ['*'],
	cache: ['rua:leave'],
	start: 0,
	pageLength: 99999999
})