import router from "@/router"
import { createListResource } from "frappe-ui"

export const attendanceResource = createListResource({
    doctype: 'RUA Attendance',
    fields: ['*'],
	cache: ['rua:attendance'],
	onError(error) {
		if (error && error.exc_type === "AuthenticationError") {
			router.push("/login")
		}
	},
})