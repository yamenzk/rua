// resourceManager.js
import { employeeResource } from "./employee"
import { attendanceResource } from "./attendance"
import { partyResource } from "./party"
import { chatResource } from "./chat"
import { projectResource } from "./project"
import { userResource } from "./user"
import { userRoles } from "./roles"
import { quotationResource } from "./quotation"
import { documentResource } from "./document"
import { rfqResource } from "./rfq"
import { lpoResource } from "./lpo"

export const resources = {
  user: userResource,
  userRoles: userRoles,
  project: projectResource,
  party: partyResource,
  employee: employeeResource,
  attendance: attendanceResource,
  chat: chatResource,
  quotation: quotationResource,
  document: documentResource,
  rfq: rfqResource,
  lpo: lpoResource
}

export const reloadResources = async () => {
  try {
    // Log initial state
    Object.entries(resources).forEach(([key, resource]) => {
      //console.log(`Current ${key} data:`, resource.data)
    })

    // Reload all resources
    await Promise.all(
      Object.values(resources).map(resource => resource.reload())
    )

    // Log updated state
    Object.entries(resources).forEach(([key, resource]) => {
      //console.log(`Updated ${key} data:`, resource.data)
    })

    //console.log('Resources reloaded successfully!')
  } catch (error) {
    //console.error('Failed to reload resources:', error)
  }
}

export const resetResources = () => {
  Object.values(resources).forEach(resource => resource.reset())
}