import router from '@/router'
import { createResource } from 'frappe-ui'

export const userResource = createResource({
  url: 'frappe.auth.get_logged_user',
  cache: 'User',
  onError(error) {
    if (error && error.exc_type === 'AuthenticationError') {
      router.push({ name: 'LoginPage' })
    }
  },
})

export const userRolesResource = createResource({
  url: 'rua.api.get_user_roles',
  makeParams({ user }) {
    return {
      user,
    }
  },
})

export function setUserRolesCookie(roles) {
  document.cookie = `user_roles=${JSON.stringify(roles)};path=/`
}

export function getUserRolesFromCookie() {
  const cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
  const roles = cookies.get('user_roles')
  return roles ? JSON.parse(roles) : []
}
