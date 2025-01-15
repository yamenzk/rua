import router from "@/router"
import { createListResource } from "frappe-ui"

export const quotationResource = createListResource({
    doctype: 'RUA Quotation',
    fields: ['*'],
	cache: ['rua:quotation'],
	onError(error) {
		if (error && error.exc_type === "AuthenticationError") {
			router.push("/login")
		}
	},
})