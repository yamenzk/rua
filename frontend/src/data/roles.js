import { createResource } from 'frappe-ui'
import { userResource } from './user'

export const userRoles = createResource({
  url: 'rua.api.get_user_roles',
  params: {
    user: userResource.data
  },
  cache: 'UserRoles',
})

export const hasRole = (role) => {
  return userRoles.data?.includes(role)
}
