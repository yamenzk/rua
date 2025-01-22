import { createListResource, createDocumentResource } from "frappe-ui"

export const purchaseReceiptResource = createListResource({
    doctype: 'RUA Purchase Receipt',
    fields: ['*'],
	cache: ['rua:purchase_receipt'],
	start: 0,
	pageLength: 99999999
})

export function createPurchaseReceiptResource(name) {
	return createDocumentResource({
	  doctype: 'RUA Purchase Receipt',
	  name,
	  transform(doc) {
		return doc
	  },
	  onError(error) {
		console.error('Error loading Purchase Receipt:', error)
	  },
	})
  }