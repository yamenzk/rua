import router from "@/router"
import { createListResource, createDocumentResource } from "frappe-ui"

export const rfqResource = createListResource({
    doctype: 'RUA RFQ',
    fields: ['*'],
	cache: ['rua:rfq'],
	start: 0,
	pageLength: 99999999
})

export function createRFQResource(name) {
	return createDocumentResource({
	  doctype: 'RUA RFQ',
	  name,
	  transform(doc) {
		return doc
	  },
	  onError(error) {
		console.error('Error loading RFQ:', error)
	  },
	})
}