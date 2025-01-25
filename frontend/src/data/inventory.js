import { createListResource, createDocumentResource } from "frappe-ui"

export const inventoryResource = createListResource({
    doctype: 'RUA Inventory Item',
    fields: ['*'],
	cache: ['rua:inventory'],
	start: 0,
	pageLength: 99999999
})

export function createInventoryResource(name) {
    return createDocumentResource({
      doctype: 'RUA Inventory',
      name,
      transform(doc) {
        return doc
      },
      onError(error) {
        console.error('Error loading Inventory:', error)
      },
    })
  }