import router from '@/router'
import { createResource } from 'frappe-ui'
import { userResource } from './user'

export const userRoles = createResource({
  url: 'rua.api.get_user_roles',
  params: {
    user: userResource.data
  },
  cache: 'UserRoles',
  auto: true,
  onError(error) {
    if (error && error.exc_type === 'AuthenticationError') {
      router.push({ name: 'LoginPage' })
    }
  }
})

export const hasRole = (role) => {
  return userRoles.data?.includes(role)
}
