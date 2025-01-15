import './index.css'
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { initSocket } from './socket'
import { session } from "@/data/session"
import { resources, reloadResources } from '@/data/resourceManager'
import {
  Button,
  Card,
  Input,
  setConfig,
  resourcesPlugin,
  frappeRequest,
} from 'frappe-ui'

const app = createApp(App)
setConfig('resourceFetcher', frappeRequest)

// Register components
app.use(router)
app.use(resourcesPlugin)

app.component('Button', Button)
app.component('Card', Card)
app.component('Input', Input)

// Provide resources
Object.entries(resources).forEach(([key, resource]) => {
  app.provide(`$${key}`, resource)
})

// Initial resource load
console.log('Starting initial resource load...')
if (session?.isLoggedIn) {
  reloadResources()
}

// Initialize app based on environment
if (import.meta.env.DEV) {
  console.log('Initializing app in DEV mode...')
  frappeRequest({ url: '/api/method/rua.www.rua.get_context_for_dev' })
    .then((values) => {
      console.log('Received dev context values:', Object.keys(values))
      for (let key in values) {
        window[key] = values[key]
      }
      const socket = initSocket()
      console.log('Socket initialized in DEV mode:', socket)
      window.$socket = socket
      app.provide('$socket', socket)
      app.mount('#app')
      console.log('App mounted in DEV mode')
    })
    .catch(error => {
      console.error('Failed to initialize app in DEV mode:', error)
    })
} else {
  console.log('Initializing app in PROD mode...')
  const socket = initSocket()
  console.log('Socket initialized in PROD mode:', socket)
  window.$socket = socket
  app.provide('$socket', socket)
  app.mount('#app')
  console.log('App mounted in PROD mode')
}