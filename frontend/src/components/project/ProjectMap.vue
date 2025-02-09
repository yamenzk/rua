<template>
  <div class="w-full">
    <!-- Map Container -->
    <div class="relative overflow-hidden rounded-lg border bg-white shadow-sm">
      <!-- Map Container -->
      <div class="relative h-48 w-full sm:h-64">
        <div :id="mapContainerId" class="relative h-full w-full [&_.leaflet-pane]:z-[1]"></div>
      </div>

      <!-- Desktop Navigation Button -->
      <div 
        v-if="coords && showNavigation && !isMobile" 
        class="absolute bottom-0 left-0 right-0 z-[1000] bg-gradient-to-t from-white/95 to-white/0 p-4"
      >
        <a 
          :href="getGoogleMapsUrl(coords)"
          target="_blank"
          rel="noopener noreferrer"
          class="mx-auto flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-900/5 transition-all hover:bg-gray-50 hover:shadow-md"
        >
          <FeatherIcon name="map-pin" class="h-4 w-4 text-primary-500" />
          Open in Maps
        </a>
      </div>

      <!-- Mobile Navigation Button -->
      <Teleport to="body">
        <div 
          v-if="coords && showNavigation && isMobile"
          class="fixed bottom-20 right-4 z-50"
        >
          <a 
            :href="getGoogleMapsUrl(coords)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-lg ring-1 ring-gray-900/5 transition-all hover:shadow-md active:scale-95"
          >
            <FeatherIcon name="map-pin" class="h-4 w-4 text-primary-500" />
            Open in Maps
            <FeatherIcon name="external-link" class="h-3.5 w-3.5 text-gray-400" />
          </a>
        </div>
      </Teleport>
    </div>

    <!-- Location Setting Dialog -->
    <Dialog
      v-model="showLocationDialog"
      :options="{
        title: 'Set Project Location',
        size: 'xl',
      }"
    >
      <template #body-content>
        <div class="space-y-6">
          <!-- Manual Coordinate Inputs -->
          <div class="grid grid-cols-2 gap-4">
            <FormControl
              type="number"
              label="Latitude"
              v-model="tempCoords.lat"
              step="0.0001"
              @change="updateMapFromInputs"
            />
            <FormControl
              type="number"
              label="Longitude"
              v-model="tempCoords.lng"
              step="0.0001"
              @change="updateMapFromInputs"
            />
          </div>

          <!-- Large Map -->
          <div class="rounded-lg overflow-hidden border bg-white w-full h-[60vh]">
            <div :id="dialogMapId" class="w-full h-full"></div>
          </div>

          <!-- Instructions -->
          <div class="text-sm text-gray-600">
            <p>To set location:</p>
            <ul class="list-disc pl-5 space-y-1">
              <li>Drag the marker to the desired location</li>
              <li>Double-click anywhere on the map to move the marker</li>
              <li>Or enter coordinates manually above</li>
            </ul>
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-2">
          <Button variant="subtle" @click="closeLocationDialog">Cancel</Button>
          <Button variant="solid" @click="saveLocation">Save Location</Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { 
  FeatherIcon,
  FormControl, 
  Dialog, 
  Button 
} from 'frappe-ui'
import rua_pin from '@/assets/rua_pin.png'
import { useMediaQuery } from '@vueuse/core'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { nanoid } from 'nanoid'

const props = defineProps({
  coords: {
    type: [String, Object],
    default: null
  },
})

const emit = defineEmits(['update:coords'])
const route = useRoute()

// Responsive state
const isMobile = useMediaQuery('(max-width: 768px)')

// Map state
const map = ref(null)
const marker = ref(null)
const mapId = `map-${nanoid()}`
const mapContainerId = computed(() => `${mapId}-container`)

// Dialog map state
const showLocationDialog = ref(false)
const dialogMap = ref(null)
const dialogMarker = ref(null)
const dialogMapId = computed(() => `${mapId}-dialog`)
const tempCoords = ref({ lat: 24.4539, lng: 54.3773 })

// Show navigation only on overview page
const showNavigation = computed(() => {
  return route.path.includes('/overview')
})

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

// Map initialization and cleanup
function initializeMap(containerId, mapRef, markerRef, options = {}) {
  const mapOptions = {
    maxBounds: [
      [UAE_BOUNDS.south, UAE_BOUNDS.west],
      [UAE_BOUNDS.north, UAE_BOUNDS.east]
    ],
    minZoom: 7,
    zoomControl: options.zoomControl ?? false,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: false,
    maxBoundsViscosity: 1.0,
    attributionControl: false
  }

  const container = document.getElementById(containerId)
  if (!container) return

  mapRef.value = L.map(containerId, mapOptions)

  // Add custom minimal style tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapRef.value)

  // Add custom styling to the map container
  mapRef.value.getContainer().style.background = '#f8f9fa'
  
  // Custom pane for softer borders
  mapRef.value.createPane('labels')
  mapRef.value.getPane('labels').style.zIndex = 650
  mapRef.value.getPane('labels').style.pointerEvents = 'none'

  let initialCoords = coords.value ? [coords.value.lat, coords.value.lng] : ABU_DHABI_COORDS
  let initialZoom = coords.value ? 13 : 10

  const customIcon = L.icon({
    iconUrl: rua_pin,
    iconSize: [35, 50],
    iconAnchor: [17.5, 50],
    popupAnchor: [0, -50]
  })

  markerRef.value = L.marker(initialCoords, {
    draggable: true,
    icon: customIcon
  }).addTo(mapRef.value)

  markerRef.value.on('dragend', (event) => {
    const { lat, lng } = event.target.getLatLng()
    tempCoords.value = { lat, lng }
  })

  mapRef.value.on('dblclick', (e) => {
    const { lat, lng } = e.latlng
    markerRef.value.setLatLng([lat, lng])
    tempCoords.value = { lat, lng }
  })

  mapRef.value.setView(initialCoords, initialZoom)

  setTimeout(() => {
    mapRef.value?.invalidateSize()
  }, 0)
}

function initializeMainMap() {
  initializeMap(mapContainerId.value, map, marker)
}

function initializeDialogMap() {
  initializeMap(dialogMapId.value, dialogMap, dialogMarker, { zoomControl: true })
}

function destroyMap() {
  if (map.value) {
    map.value.remove()
    map.value = null
    marker.value = null
  }
  if (dialogMap.value) {
    dialogMap.value.remove()
    dialogMap.value = null
    dialogMarker.value = null
  }
}

// Dialog handlers
function handleMapClick(event) {
  if (event.ctrlKey) {
    openLocationDialog()
  }
}

function openLocationDialog() {
  showLocationDialog.value = true
  tempCoords.value = coords.value || { lat: 24.4539, lng: 54.3773 }
  nextTick(() => {
    initializeDialogMap()
  })
}

function closeLocationDialog() {
  showLocationDialog.value = false
  if (dialogMap.value) {
    dialogMap.value.remove()
    dialogMap.value = null
    dialogMarker.value = null
  }
}

function saveLocation() {
  emit('update:coords', tempCoords.value)
  closeLocationDialog()
}

function updateMapFromInputs() {
  if (!dialogMap.value || !dialogMarker.value) return
  const newLatLng = [tempCoords.value.lat, tempCoords.value.lng]
  dialogMarker.value.setLatLng(newLatLng)
  dialogMap.value.setView(newLatLng, dialogMap.value.getZoom())
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
  nextTick(() => {
    initializeMainMap()
    // Add click handler to main map container
    const container = document.getElementById(mapContainerId.value)
    if (container) {
      container.addEventListener('click', handleMapClick)
    }
  })
})

onBeforeUnmount(() => {
  const container = document.getElementById(mapContainerId.value)
  if (container) {
    container.removeEventListener('click', handleMapClick)
  }
  destroyMap()
})
</script>

<style scoped>
/* Hide default zoom controls */
.leaflet-control-zoom,
.leaflet-control-zoom-in,
.leaflet-control-zoom-out {
  display: none !important;
}

/* Custom map styling */
:deep(.leaflet-tile-container) {
  filter: saturate(0.8) contrast(0.9);
}

:deep(.leaflet-container) {
  background: #f8f9fa;
}

:deep(.leaflet-marker-icon) {
  filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07));
}

/* Softer borders for map elements */
:deep(.leaflet-marker-pane) {
  filter: contrast(0.95);
}

:deep(.leaflet-tile-pane) {
  opacity: 0.9;
}

/* Custom popup styling */
:deep(.leaflet-popup-content-wrapper) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

:deep(.leaflet-popup-tip) {
  background: white;
}

/* Smoother transitions */
:deep(.leaflet-fade-anim .leaflet-tile) {
  will-change: opacity;
  transition: opacity 0.2s linear;
}

:deep(.leaflet-zoom-anim .leaflet-zoom-animated) {
  will-change: transform;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Minimal style overrides */
:deep(.leaflet-bar) {
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

:deep(.leaflet-bar a) {
  background: white !important;
  border: 1px solid #f1f1f1 !important;
  color: #666 !important;
}

:deep(.leaflet-bar a:hover) {
  background: #f8f9fa !important;
}

:deep(.leaflet-control-layers) {
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
  border-radius: 8px !important;
}
</style>