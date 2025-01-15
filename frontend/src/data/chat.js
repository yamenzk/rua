import router from "@/router"
import { createListResource } from "frappe-ui"

export const chatResource = createListResource({
    doctype: 'RUA Chat',
    fields: ['*'],
	cache: ['rua:chat'],
	onError(error) {
		if (error && error.exc_type === "AuthenticationError") {
			router.push("/login")
		}
	},
})