import router from '@/router'
import { computed, reactive } from 'vue'
import { createResource } from 'frappe-ui'
import { reloadResources, resetResources } from './resourceManager'

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
      await reloadResources()
      session.user = sessionUser()
      session.justLoggedIn = true
      session.login.reset()
      router.replace(data.default_route || '/')
    },
  }),
  logout: createResource({
    url: 'logout',
    onSuccess() {
      resetResources()
      session.user = sessionUser()
      session.userRoles = []
      session.justLoggedIn = false
      router.replace({ name: 'Login' })
    },
  }),
  user: sessionUser(),
  isLoggedIn: computed(() => !!session.user),
  justLoggedIn: false
})