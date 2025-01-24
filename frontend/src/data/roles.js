import { createResource } from 'frappe-ui'
import { userResource } from './user'

export const userRoles = createResource({
  url: 'rua.api.get_user_roles',
  params: {
    user: userResource.data
  },
  method: 'GET',
  cache: 'UserRoles',
})

export const userDetails = createResource({
  url: 'rua.api.get_employee_by_user',
  makeParams() {
    return {
      user: userResource.data
    }
  },
  method: 'GET',
  cache: 'UserDetails',
  transform(response) {
    return response?.message || {};
  }
})

