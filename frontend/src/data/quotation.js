import router from "@/router"
import { createListResource, createDocumentResource } from "frappe-ui"

export const quotationResource = createListResource({
    doctype: 'RUA Quotation',
    fields: ['*'],
	cache: ['rua:quotation'],
	start: 0,
	pageLength: 99999999
})

export function createQuotationResource(name) {
	return createDocumentResource({
	  doctype: 'RUA Quotation',
	  name,
	  transform(doc) {
		return doc
	  },
	  onError(error) {
		console.error('Error loading Quotation:', error)
	  },
	})
  }