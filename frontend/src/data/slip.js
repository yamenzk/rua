import { createListResource, createDocumentResource } from "frappe-ui"

export const slipResource = createListResource({
	doctype: 'RUA Payslip',
	fields: ['*'],
	cache: ['rua:payslip'],
	start: 0,
	pageLength: 99999999,
})

export function createSlipResource(name) {
    return createDocumentResource({
      doctype: 'RUA Payslip',
      name,
      transform(doc) {
        return doc
      },
      onError(error) {
        console.error('Error loading Payslip:', error)
      },
      realtime: true,
    }, $socket)
  }