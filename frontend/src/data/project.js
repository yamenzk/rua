import router from '@/router'
import { createListResource, createDocumentResource } from 'frappe-ui'

export const projectResource = createListResource({
	doctype: 'RUA Project',
	fields: ['*'],
	cache: ['rua:project'],
	start: 0,
	pageLength: 99999999,
})

export function createProjectResource(name) {
	return createDocumentResource({
		doctype: 'RUA Project',
		name,
		transform(doc) {
			return doc
		},
		onError(error) {
			console.error('Error loading Project:', error)
		},
	})
}
