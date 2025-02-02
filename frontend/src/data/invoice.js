import { createListResource, createDocumentResource } from "frappe-ui"

export const invoiceResource = createListResource({
    doctype: 'RUA Invoice',
    fields: ['*'],
	cache: ['rua:invoice'],
	start: 0,
	pageLength: 99999999
})

export function createInvoiceResource(name) {
    return createDocumentResource({
      doctype: 'RUA Invoice',
      name,
      transform(doc) {
        return doc
      },
      onError(error) {
        console.error('Error loading Invoice:', error)
      },
      realtime: true,
    }, $socket)
  }