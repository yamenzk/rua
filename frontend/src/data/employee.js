import { createListResource, createDocumentResource } from 'frappe-ui'

export const employeeResource = createListResource({
	doctype: 'RUA Employee',
	fields: ['*'],
	start: 0,
	pageLength: 99999999,
	cache: ['rua:employee'],
})

export function createEmployeeResource(name) {
	return createDocumentResource({
		doctype: 'RUA Employee',
		name,
		transform(doc) {
			return doc
		},
		onError(error) {
			console.error('Error loading Employee:', error)
		},
	})
}
