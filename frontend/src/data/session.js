import router from '@/router'
import { computed, reactive } from 'vue'
import { createResource } from 'frappe-ui'

import { userResource, userRolesResource, setUserRolesCookie, getUserRolesFromCookie } from './user'

export function sessionUser() {
  const cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
  let _sessionUser = cookies.get('user_id')
  if (_sessionUser === 'Guest') {
    _sessionUser = null
  }
  return _sessionUser
}

export const session = reactive({
  login: createResource({
    url: 'login',
    makeParams({ email, password }) {
      return {
        usr: email,
        pwd: password,
      }
    },
    async onSuccess(data) {
      userResource.reload()
      session.user = sessionUser()
      session.justLoggedIn = true  // Add this flag
      
      // Fetch and store user roles
      const rolesResponse = await userRolesResource.submit({ user: session.user })
      setUserRolesCookie(rolesResponse)
      session.userRoles = rolesResponse
      
      session.login.reset()
      router.replace(data.default_route || '/')
    },
  }),
  logout: createResource({
    url: 'logout',
    onSuccess() {
      userResource.reset()
      session.user = sessionUser()
      session.userRoles = []
      session.justLoggedIn = false  // Reset the flag on logout
      setUserRolesCookie([]) // Clear roles on logout
      router.replace({ name: 'Login' })
    },
  }),
  user: sessionUser(),
  userRoles: getUserRolesFromCookie(),
  isLoggedIn: computed(() => !!session.user),
  justLoggedIn: false  // Add this new state
})