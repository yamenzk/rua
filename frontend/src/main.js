import './index.css'
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { initSocket } from './socket'
import { session } from "@/data/session"
import { resources } from '@/data/resourceManager'
import {
  Button,
  Card,
  Input,
  setConfig,
  resourcesPlugin,
  frappeRequest,
} from 'frappe-ui'

const app = createApp(App)
const APP_VERSION = '2.0.1' 
// Configure Frappe UI
setConfig('resourceFetcher', async (...args) => {
  try {
    const response = await frappeRequest(...args)
    return response
  } catch (error) {
    if (error.response?.headers?.get('content-type')?.includes('text/html')) {
      throw new Error('Received HTML response instead of JSON. Server might be down or returning an error page.')
    }
    throw error
  }
})

// Register components and plugins
app.use(router)
app.use(resourcesPlugin)

app.component('Button', Button)
app.component('Card', Card)
app.component('Input', Input)

// Provide resources
Object.entries(resources).forEach(([key, resource]) => {
  app.provide(`$${key}`, resource)
})

// Initialize app based on environment

const initializeApp = async () => {
  try {
    const storedVersion = localStorage.getItem('appVersion')
    if (storedVersion !== APP_VERSION) {
      await session.logout.submit()
      localStorage.setItem('appVersion', APP_VERSION)
      return
    }

    if (session.isLoggedIn) {
      await session.initialize()
    }

    if (import.meta.env.DEV) {
      const values = await frappeRequest({ url: '/api/method/rua.www.rua.get_context_for_dev' })
      for (let key in values) {
        window[key] = values[key]
      }
    }

    const socket = initSocket()
    window.$socket = socket
    app.provide('$socket', socket)
    app.mount('#app')

  } catch (error) {
    console.error('Failed to initialize app:', error)
    // Handle initialization error appropriately
  }
}

initializeApp()