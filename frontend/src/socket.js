// import { io } from 'socket.io-client'
// import { socketio_port } from '../../../../sites/common_site_config.json'
// import { getCachedListResource } from "frappe-ui/src/resources/listResource"
// import { getCachedResource } from "frappe-ui/src/resources/resources"

// export function initSocket() {
//   let host = window.location.hostname
//   let siteName = window.site_name || 'app.ruacompany.com'
//   let port = window.location.port ? `:${socketio_port}` : ''
//   let protocol = port ? 'http' : 'https'
//   let url = `${protocol}://${host}${port}/${siteName}`
  
//   let socket = io(url, {
//     withCredentials: true,
//     reconnectionAttempts: 5,
//   })

//   // Add connection event listeners
//   socket.on('connect', () => {
//     console.log('Socket connected from socket.js')
//   })

//   socket.on('connect_error', (error) => {
//     console.error('Socket connection error from socket.js:', error)
//   })

//   socket.on("rua:signature", (data) => {
//     console.log('Received signature event:', data)
//   })

//   socket.on("rua:refetch_resource", (data) => {
//     console.log('Received refetch_resource event:', data)
//     if (data.cache_key) {
//       let resource =
//         getCachedResource(data.cache_key) ||
//         getCachedListResource(data.cache_key)

//       if (resource) {
//         resource.reload()
//       }
//     }
//   })

//   return socket
// }

import { io } from 'socket.io-client'
import { socketio_port } from '../../../../sites/common_site_config.json'
import { getCachedListResource } from "frappe-ui/src/resources/listResource"
import { getCachedResource } from "frappe-ui/src/resources/resources"

let socket = null

export function initSocket() {
  if (socket) return socket // Return existing socket if already initialized
  
  let host = window.location.hostname
  let siteName = window.site_name || 'app.ruacompany.com'
  let port = window.location.port ? `:${socketio_port}` : ''
  let protocol = port ? 'http' : 'https'
  let url = `${protocol}://${host}${port}/${siteName}`
  
  socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
  })

  // Add connection event listeners
  socket.on('connect', () => {
    console.log('Socket connected from socket.js')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error from socket.js:', error)
  })

  socket.on("rua:signature", (data) => {
    console.log('Received signature event:')
  })

  socket.on("rua:refetch_resource", (data) => {
    console.log('Received refetch_resource event:', data)
    if (data.cache_key) {
      let resource =
        getCachedResource(data.cache_key) ||
        getCachedListResource(data.cache_key)

      if (resource) {
        resource.reload()
      }
    }
  })

  return socket
}

// Export the getter for the socket instance
export function getSocket() {
  if (!socket) {
    socket = initSocket()
  }
  return socket
}