import { createListResource, createDocumentResource } from "frappe-ui"

export const letterResource = createListResource({
    doctype: 'RUA Letter',
    fields: ['*'],
    cache: ['rua:letter'],
    start: 0,
    pageLength: 99999999
})

export function createLetterResource(name) {
    return createDocumentResource({
      doctype: 'RUA Letter',
      name,
      transform(doc) {
        return doc
      },
      onError(error) {
        console.error('Error loading Letter:', error)
      },
      realtime: true,
    }, $socket)
  }