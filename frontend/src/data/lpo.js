import { createListResource, createDocumentResource } from "frappe-ui"

export const lpoResource = createListResource({
    doctype: 'RUA LPO',
    fields: ['*'],
	cache: ['rua:lpo'],
	start: 0,
	pageLength: 99999999
})

export function createLPOResource(name) {
	return createDocumentResource({
	  doctype: 'RUA LPO',
	  name,
	  transform(doc) {
		return doc
	  },
	  onError(error) {
		console.error('Error loading LPO:', error)
	  },
	})
  }