import router from "@/router"
import { createListResource } from "frappe-ui"

export const chatResource = createListResource({
    doctype: 'RUA Chat',
    fields: ['*'],
	cache: ['rua:chat'],
	start: 0,
	pageLength: 99999999,
	onError(error) {
		if (error && error.exc_type === "AuthenticationError") {
			router.push("/login")
		}
	},
})