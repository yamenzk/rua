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
import { invoiceResource } from "./invoice"
import { paymentResource } from "./payment"
import { leaveResource } from "./leave"
import { purchaseReceiptResource } from "./purchaseReceipt"

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
  lpo: lpoResource,
  invoice: invoiceResource,
  payment: paymentResource,
  leave: leaveResource,
  purchaseReceipt: purchaseReceiptResource
}

export const reloadResources = async () => {
  try {
    await Promise.all(
      Object.values(resources).map(resource => resource.reload())
    )
  } catch (error) {
    console.error('Failed to reload resources:', error)
  }
}

export const resetResources = () => {
  Object.values(resources).forEach(resource => resource.reset())
}