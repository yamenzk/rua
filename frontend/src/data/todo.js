import { createListResource, createDocumentResource } from "frappe-ui"

export const todoResource = createListResource({
    doctype: 'RUA Todo',
    fields: ['*'],
	cache: ['rua:todo'],
	start: 0,
	pageLength: 99999999
})

export function createTodoResource(name) {
	return createDocumentResource({
	  doctype: 'RUA Todo',
	  name,
	  transform(doc) {
		return doc
	  },
	  onError(error) {
		console.error('Error loading Todo:', error)
	  },
	})
}