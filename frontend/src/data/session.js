// session.js
import router from '@/router'
import { computed, reactive } from 'vue'
import { createResource } from 'frappe-ui'
import { reloadResources } from './resourceManager'
import { userDetails } from './roles'

let initializationPromise = null

export function saveCredentials(email, password) {
  localStorage.setItem('cachedCredentials', JSON.stringify({ 
    email, 
    password: btoa(password) // Basic encoding, consider more secure methods
  }))
}

export function getCachedCredentials() {
  const cached = localStorage.getItem('cachedCredentials')
  if (!cached) return null
  const { email, password } = JSON.parse(cached)
  return { email, password: atob(password) }
}



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
      saveCredentials(email, password)
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
    onError(error) {
      console.error('Login failed:', error)
    }
  }),

  logout: createResource({
    url: 'logout',
    onSuccess() {
      session.resetInitialization()
      session.user = sessionUser()
      session.justLoggedIn = false
      router.replace({ name: 'Login' })
    },
    onError(error) {
      console.error('Logout failed:', error)
      router.replace({ name: 'Login' })
    }
  }),

  user: sessionUser(),
  isLoggedIn: computed(() => !!session.user),
  justLoggedIn: false,

  // Employee details as computed properties
  employee_name: computed(() => userDetails.data?.employee_name),
  employee_image: computed(() => userDetails.data?.image),
  employee: computed(() => userDetails.data?.name),

  // Loading states
  isLoading: computed(() => userDetails.loading),
  hasLoaded: computed(() => !userDetails.loading && userDetails.data !== undefined),

  // Helper computed properties
  hasEmployeeDetails: computed(() => !!userDetails.data),
  isEmployee: computed(() => !!session.employee),

  // Reset function
  reset() {
    session.user = null
    session.justLoggedIn = false
  },

  // Initialize session
  initialize: async () => {
    if (initializationPromise) {
      return initializationPromise
    }

    initializationPromise = (async () => {
      const user = sessionUser()
      if (!user) {
        return
      }

      try {
        await reloadResources()
      } catch (error) {
        console.error('Failed to initialize session:', error)
        if (error.message.includes('<!doctype') || error.message.includes('expired')) {
          router.replace({ name: 'Login' })
        }
        throw error
      }
    })()

    return initializationPromise
  },

  // Reset initialization state
  resetInitialization() {
    initializationPromise = null
  }
})

export default session