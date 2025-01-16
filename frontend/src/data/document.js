import router from "@/router"
import { createListResource } from "frappe-ui"

export const documentResource = createListResource({
    doctype: 'RUA Document',
    fields: ['*'],
	cache: ['rua:document'],
	start: 0,
	pageLength: 99999999,
	onError(error) {
		if (error && error.exc_type === "AuthenticationError") {
			router.push("/login")
		}
	},
})