import router from "@/router"
import { createListResource } from "frappe-ui"

export const partyResource = createListResource({
    doctype: 'RUA Party',
    fields: ['*'],
	cache: ['rua:party'],
	onError(error) {
		if (error && error.exc_type === "AuthenticationError") {
			router.push("/login")
		}
	},
})