import { io } from 'socket.io-client'
import { socketio_port } from '../../../../sites/common_site_config.json'
import { getCachedListResource } from "frappe-ui/src/resources/listResource"
import { getCachedResource } from "frappe-ui/src/resources/resources"

export function initSocket() {
  let host = window.location.hostname
  let siteName = window.site_name
  let port = window.location.port ? `:${socketio_port}` : ''
  let protocol = port ? 'http' : 'https'
  let url = `${protocol}://${host}${port}/${siteName}`
  
  console.log("Initializing socket with config:", {
    host,
    siteName,
    port,
    protocol,
    url
  })

  let socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'] // explicitly specify transports
  })

  // Add connection event listeners
  socket.on('connect', () => {
    console.log('Socket connected from socket.js')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error from socket.js:', error)
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