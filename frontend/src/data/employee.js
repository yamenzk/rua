import router from "@/router"
import { createListResource } from "frappe-ui"

export const employeeResource = createListResource({
    doctype: 'RUA Employee',
    fields: ['*'],
	cache: ['rua:employee'],
	onError(error) {
		if (error && error.exc_type === "AuthenticationError") {
			router.push("/login")
		}
	},
})