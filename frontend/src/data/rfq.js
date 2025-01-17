import router from "@/router"
import { createListResource } from "frappe-ui"

export const rfqResource = createListResource({
    doctype: 'RUA RFQ',
    fields: ['*'],
	cache: ['rua:rfq'],
	start: 0,
	pageLength: 99999999
})