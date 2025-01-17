import router from "@/router"
import { createListResource } from "frappe-ui"

export const attendanceResource = createListResource({
    doctype: 'RUA Attendance',
    fields: ['*'],
	cache: ['rua:attendance'],
	start: 0,
	pageLength: 99999999
})