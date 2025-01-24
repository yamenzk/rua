// resourceManager.js
import { sessionUser } from './session'
import router from '@/router'
import { employeeResource } from "./employee"
import { attendanceResource } from "./attendance"
import { partyResource } from "./party"
import { chatResource } from "./chat"
import { projectResource } from "./project"
import { userResource } from "./user"
import { userRoles } from "./roles"
import { userDetails } from "./roles"
import { quotationResource } from "./quotation"
import { documentResource } from "./document"
import { rfqResource } from "./rfq"
import { lpoResource } from "./lpo"
import { invoiceResource } from "./invoice"
import { paymentResource } from "./payment"
import { leaveResource } from "./leave"
import { purchaseReceiptResource } from "./purchaseReceipt"
import { todoResource } from "./todo"

export const resources = {
  user: userResource,
  userRoles: userRoles,
  userDetails: userDetails,
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
  purchaseReceipt: purchaseReceiptResource,
  todo: todoResource
}

export const reloadResources = async () => {
  try {
    const user = sessionUser()
    if (!user) {
      return
    }

    // Load user resource first
    await resources.user.reload()

    // Then load user-dependent resources
    const userDependentResources = ['userRoles', 'userDetails']
    await Promise.all(
      userDependentResources.map(key => resources[key]?.reload())
    )

    // Finally load other resources
    const otherResources = Object.entries(resources)
      .filter(([key]) => !['user', ...userDependentResources].includes(key))
    await Promise.all(
      otherResources.map(([_, resource]) => resource?.reload())
    )

  } catch (error) {
    if (error.message?.includes('<!doctype')) {
      throw new Error('Session expired')
    }
    if (error instanceof SyntaxError && error.message?.includes('<!doctype')) {
      throw new Error('Session expired')
    }
    console.error('Failed to reload resources:', error)
    throw error
  }
}

export const resetResources = () => {
  Object.values(resources).forEach(resource => resource?.reset())
}