import { createListResource, createDocumentResource } from "frappe-ui"

export const paymentResource = createListResource({
    doctype: 'RUA Payment',
    fields: ['*'],
	cache: ['rua:payment'],
	start: 0,
	pageLength: 99999999
})

export function createPaymentResource(name) {
	return createDocumentResource({
	  doctype: 'RUA Payment',
	  name,
	  transform(doc) {
		return doc
	  },
	  onError(error) {
		console.error('Error loading Payment:', error)
	  },
	})
  }