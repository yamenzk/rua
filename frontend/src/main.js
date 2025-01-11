import './index.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { initSocket } from './socket'

import {
  Button,
  Card,
  Input,
  setConfig,
  resourcesPlugin,
  frappeRequest,
} from 'frappe-ui'

let app = createApp(App)

setConfig('resourceFetcher', frappeRequest)

app.use(router)
app.use(resourcesPlugin)

app.component('Button', Button)
app.component('Card', Card)
app.component('Input', Input)

let socket
if (import.meta.env.DEV) {
  frappeRequest({ url: '/api/method/rua.www.rua.get_context_for_dev' }).then((values) => {
    for (let key in values) {
      window[key] = values[key]
    }
    socket = initSocket()
    app.config.globalProperties.$socket = socket
    window.socket = socket
    app.mount('#app')
  })
} else {
  socket = initSocket()
  app.config.globalProperties.$socket = socket
  window.socket = socket
  app.mount('#app')
}