import { createListResource, createDocumentResource } from 'frappe-ui'

export const letterResource = createListResource({
	doctype: 'RUA Letter',
	fields: ['*'],
	cache: ['rua:letter'],
	start: 0,
	pageLength: 99999999,
})

export function createLetterResource(name) {
	return createDocumentResource(
		{
			doctype: 'RUA Letter',
			name,
			transform(doc) {
				return doc
			},
			onError(error) {
				console.error('Error loading Letter:', error)
			},
			realtime: true,
		},
		$socket,
	)
}
export const letterListResource = createListResource({
	doctype: 'RUA Letter',
	fields: ['*'],
	orderBy: 'modified desc', // Default sort order
	start: 0,
	pageLength: 99999999,
	cache: ['rua:letter'],
})

export const templateListResource = createListResource({
	doctype: 'RUA Letter',
	fields: ['*'],
	filters: [['is_template', '=', 1]], // Filter only templates
	orderBy: 'title asc',
})