import './index.css'
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { initSocket } from './socket'
import { session } from "@/data/session"

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

app.use(router)
app.use(resourcesPlugin)

app.component('Button', Button)
app.component('Card', Card)
app.component('Input', Input)

// Initialize app based on environment
if (import.meta.env.DEV) {
  frappeRequest({ url: '/api/method/rua.www.rua.get_context_for_dev' })
    .then((values) => {
      for (let key in values) {
        window[key] = values[key]
      }
      const socket = initSocket()
      console.log('Socket initialized:', socket)
      window.$socket = socket  // Add this line
      app.provide('$socket', socket)
      app.mount('#app')
    })
} else {
  const socket = initSocket()
  window.$socket = socket  // Add this line
  app.provide('$socket', socket)
  app.mount('#app')
}