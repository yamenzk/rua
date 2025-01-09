<template>
    <div class="w-full">
      <!-- Desktop Map -->
      <div 
        v-if="!isMobile" 
        class="rounded-lg overflow-hidden border bg-white w-full"
        style="height: 200px;"
      >
        <div class="w-full h-full relative">
          <div :id="mapContainerId" class="w-full h-full"></div>
          <div 
            v-if="coords" 
            class="absolute bottom-0 left-0 right-0 p-2 bg-white border-t flex justify-center"
          >
            <a 
              :href="getGoogleMapsUrl(coords)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FeatherIcon name="navigation" class="w-4 h-4" />
              Navigate
            </a>
          </div>
        </div>
      </div>
  
      <!-- Mobile Navigation Button -->
      <Teleport to="body">
        <div 
          v-if="isMobile && coords"
          class="fixed bottom-20 right-4 z-50 md:hidden"
        >
          <a 
            :href="getGoogleMapsUrl(coords)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center bg-white shadow-lg rounded-lg px-3 py-2 border"
          >
            <FeatherIcon name="navigation" class="w-4 h-4 text-blue-600" />
            <span class="ml-2 text-sm font-medium text-gray-700">Open in Maps</span>
          </a>
        </div>
      </Teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
  import { FeatherIcon } from 'frappe-ui'
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'
  import { useMediaQuery } from '@vueuse/core'
  import { nanoid } from 'nanoid'
  
  const props = defineProps({
    coords: {
      type: [String, Object],
      default: null
    },
    miniMap: {
      type: Boolean,
      default: false
    },
    isManager: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['update:coords'])
  
  // Responsive state
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // Map state
  const map = ref(null)
  const marker = ref(null)
  const mapId = `map-${nanoid()}`
  const mapContainerId = computed(() => `${mapId}-container`)
  
  // UAE bounds and Abu Dhabi coords
  const UAE_BOUNDS = {
    north: 26.1,
    south: 22.6,
    west: 51.5,
    east: 56.4
  }
  
  const ABU_DHABI_COORDS = [24.4539, 54.3773]
  
  // Computed coordinates
  const coords = computed(() => {
    if (!props.coords) return null
    try {
      return typeof props.coords === 'string' ? JSON.parse(props.coords) : props.coords
    } catch (e) {
      console.error('Failed to parse coordinates:', e)
      return null
    }
  })
  
  // Google Maps URL
  function getGoogleMapsUrl(coordinates) {
    if (!coordinates) return '#'
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
  }
  
  function destroyMap() {
    if (map.value) {
      map.value.remove()
      map.value = null
      marker.value = null
    }
  }
  
  // Initialize map
  function initializeMap() {
    // Only initialize for desktop view
    if (isMobile.value) return
    
    // Ensure old map is cleaned up
    destroyMap()
  
    const mapOptions = {
      maxBounds: [
        [UAE_BOUNDS.south, UAE_BOUNDS.west],
        [UAE_BOUNDS.north, UAE_BOUNDS.east]
      ],
      minZoom: 7,
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: true,
      maxBoundsViscosity: 1.0,
      attributionControl: false
    }
  
    // Wait for container to be available
    const container = document.getElementById(mapContainerId.value)
    if (!container) return
  
    map.value = L.map(mapContainerId.value, mapOptions)
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value)
  
    let initialCoords = ABU_DHABI_COORDS
    let initialZoom = 10
  
    if (coords.value) {
      initialCoords = [coords.value.lat, coords.value.lng]
      initialZoom = 13
    }
  
    // Initialize marker
    marker.value = L.marker(initialCoords, {
      draggable: props.isManager
    }).addTo(map.value)
  
    // Handle marker drag events for managers
    if (props.isManager) {
      marker.value.on('dragend', (event) => {
        const { lat, lng } = event.target.getLatLng()
        emit('update:coords', { lat, lng })
      })
  
      map.value.on('click', handleMapClick)
    }
  
    map.value.setView(initialCoords, initialZoom)
  
    // Force a resize to ensure proper rendering
    setTimeout(() => {
      map.value?.invalidateSize()
    }, 0)
  }
  
  // Handle map click for managers
  function handleMapClick(e) {
    const { lat, lng } = e.latlng
    
    if (marker.value) {
      marker.value.setLatLng([lat, lng])
    }
    
    emit('update:coords', { lat, lng })
  }
  
  // Watch for coordinate changes
  watch(() => coords.value, (newCoords) => {
    if (!map.value || !newCoords) return
  
    const newLatLng = [newCoords.lat, newCoords.lng]
    map.value.setView(newLatLng, map.value.getZoom())
    
    if (marker.value) {
      marker.value.setLatLng(newLatLng)
    } else {
      marker.value = L.marker(newLatLng).addTo(map.value)
    }
  }, { immediate: true })
  
  // Lifecycle hooks
  onMounted(() => {
    if (!isMobile.value) {
      nextTick(() => {
        initializeMap()
      })
    }
  })
  
  onBeforeUnmount(() => {
    destroyMap()
  })
  </script>
  
  <style scoped>
  .leaflet-control-zoom, .leaflet-control-zoom-in, .leaflet-control-zoom-out {
    display: none !important;
  }
  
  .leaflet-control-zoom a {
    display: none !important;
  }
  .leaflet-control-zoom .leaflet-bar .leaflet-control{
    display: none !important;
  }
  </style>