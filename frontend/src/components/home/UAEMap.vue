<template>
  <div class="relative isolate h-[600px] overflow-hidden">
    <!-- Map Container -->
    <div class="absolute inset-0 z-0">
      <div ref="mapContainer" class="h-full w-full"></div>
    </div>

    <!-- Search and Filters Overlay -->
    <div class="relative z-[9999] mx-4 mt-4 flex items-center justify-between gap-4">
      <!-- Search -->
      <div class="relative flex-1 max-w-md">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search projects..."
          class="w-full rounded-lg border-0 bg-white/90 pl-10 pr-4 py-2 text-sm shadow-lg backdrop-blur-sm focus:ring-2 focus:ring-primary-500"
        >
        <FeatherIcon 
          name="search" 
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" 
        />
      </div>

      <!-- Filter Button -->
      <div class="relative" v-click-outside="closeFilters">
        <button 
          @click="showFilters = !showFilters"
          class="flex items-center gap-2 rounded-lg border-0 bg-white/90 px-4 py-2 text-sm shadow-lg backdrop-blur-sm hover:bg-white"
        >
          <FeatherIcon name="filter" class="h-4 w-4 text-gray-500" />
          Filters
          <span 
            v-if="activeFilters > 0"
            class="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700"
          >
            {{ activeFilters }}
          </span>
        </button>

        <!-- Filter Menu -->
        <div 
          v-show="showFilters"
          class="absolute right-0 top-full mt-2 w-64 rounded-lg border border-gray-100 bg-white p-4 shadow-lg"
        >
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Status</label>
              <div class="mt-2 space-y-2">
                <label 
                  v-for="(color, status) in statusColors" 
                  :key="status"
                  class="flex items-center gap-2"
                >
                  <input 
                    type="checkbox" 
                    v-model="selectedStatuses" 
                    :value="status"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  >
                  <div class="flex items-center gap-2">
                    <div 
                      class="h-3 w-3 rounded-full" 
                      :style="{ backgroundColor: color }"
                    ></div>
                    <span class="text-sm text-gray-600">{{ status }}</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700">Value Range</label>
              <div class="mt-2">
                <div class="flex items-center gap-2">
                  <input 
                    v-model="valueRange.min" 
                    type="number" 
                    placeholder="Min"
                    class="w-full rounded-md border-gray-200 text-sm"
                  >
                  <span class="text-gray-500">-</span>
                  <input 
                    v-model="valueRange.max" 
                    type="number" 
                    placeholder="Max"
                    class="w-full rounded-md border-gray-200 text-sm"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button 
              @click="resetFilters"
              class="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Reset
            </button>
            <button 
              @click="applyFilters"
              class="rounded bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div 
      v-if="loading"
      class="absolute inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm"
    >
      <div class="flex items-center gap-3">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
        <span class="text-sm text-gray-600">Loading projects...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { projectResource } from '@/data/project'
import { FeatherIcon } from 'frappe-ui'
import { clickOutside } from '@/directives/clickOutside' // Adjust the import path as needed


const router = useRouter()
const mapContainer = ref(null)
const map = ref(null)
const markerClusterGroup = ref(null)
const loading = ref(true)
const searchQuery = ref('')
const showFilters = ref(false)
const selectedStatuses = ref([])
const valueRange = ref({ min: null, max: null })
const vClickOutside = clickOutside

// Abu Dhabi coordinates
const ABU_DHABI_COORDS = [24.41, 54.6]

// UAE bounds
const UAE_BOUNDS = {
  north: 26.1,
  south: 22.6,
  west: 51.5,
  east: 56.4
}

const statusColors = {
  'Tender': '#9333ea',
  'Job in Hand': '#2563eb',
  'In Progress': '#eab308',
  'Completed': '#16a34a'
}

// Computed project stats
const projectStats = computed(() => [])

const activeFilters = computed(() => {
  let count = 0
  if (selectedStatuses.value.length) count++
  if (valueRange.value.min || valueRange.value.max) count++
  if (searchQuery.value) count++
  return count
})

// Filter projects based on search and filters
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    // Search filter
    if (searchQuery.value) {
      const searchLower = searchQuery.value.toLowerCase()
      if (!project.project_name.toLowerCase().includes(searchLower) &&
          !project.location?.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Status filter
    if (selectedStatuses.value.length && !selectedStatuses.value.includes(project.status)) {
      return false
    }

    // Value range filter
    if (valueRange.value.min && project.contract_value < valueRange.value.min) {
      return false
    }
    if (valueRange.value.max && project.contract_value > valueRange.value.max) {
      return false
    }

    return true
  })
})

const projects = computed(() => {
  return projectResource.data?.filter(project => {
    try {
      if (project.is_child || project.status === 'Cancelled') return false
      const coords = project.coords ? JSON.parse(project.coords) : null
      return coords && coords.lat && coords.lng
    } catch (e) {
      return false
    }
  }) || []
})

function formatCurrency(value) {
  if (!value) return 'AED 0'
  return `AED ${Math.floor(value).toLocaleString()}`
}

function calculateProgress(invoiced, received) {
  if (!invoiced || invoiced === 0) return 0
  return Math.round((received / invoiced) * 100)
}

function createPopupContent(project) {
  const receivedProgress = calculateProgress(project.total_invoiced, project.total_received)
  
  return `
    <div class="max-w-sm overflow-hidden rounded-lg bg-white shadow-lg">
      ${project.image ? `
        <div class="relative h-48">
          <img 
            src="${project.image}" 
            alt="${project.project_name}"
            class="h-full w-full object-cover"
            onerror="this.style.display='none'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
      ` : ''}
      
      <div class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <span 
            class="rounded-full px-3 py-1 text-xs font-medium"
            style="background-color: ${statusColors[project.status]}20; color: ${statusColors[project.status]}"
          >
            ${project.status}
          </span>
          <span class="text-sm text-gray-500">#${project.serial_number || ''}</span>
        </div>

        <h3 class="mb-2 text-lg font-semibold text-gray-900">${project.project_name}</h3>
        <p class="mb-4 text-sm text-gray-500">${project.location || 'Location not specified'}</p>

        <div class="mb-4">
          <div class="mb-1 flex items-center justify-between text-sm">
            <span class="text-gray-600">Project Progress</span>
            <span class="font-medium text-primary-600">${receivedProgress}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-gray-100">
            <div 
              class="h-full rounded-full bg-primary-600 transition-all duration-500"
              style="width: ${receivedProgress}%"
            ></div>
          </div>
        </div>

        <div class="space-y-2 border-t pt-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Contract Value</span>
            <span class="font-medium">${formatCurrency(project.contract_value)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Total Received</span>
            <span class="font-medium">${formatCurrency(project.total_received)}</span>
          </div>
        </div>

        <button
          onclick="window.location.href='/project/${project.name}/overview'"
          class="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          View Details
        </button>
      </div>
    </div>
  `
}

function closeFilters() {
  showFilters.value = false
}

function resetFilters() {
  selectedStatuses.value = []
  valueRange.value = { min: null, max: null }
  searchQuery.value = ''
}

function applyFilters() {
  showFilters.value = false
  updateMarkers()
}

function updateMarkers() {
  if (!map.value || !markerClusterGroup.value) return

  markerClusterGroup.value.clearLayers()

  filteredProjects.value.forEach(project => {
    try {
      const coords = JSON.parse(project.coords)
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 8,
        fillColor: statusColors[project.status] || '#6b7280',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })

      // Add pulse animation
      const pulseIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color: ${statusColors[project.status]}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })

      const pulseMarker = L.marker([coords.lat, coords.lng], { icon: pulseIcon })
      
      // Add popup
      const popup = L.popup({
        maxWidth: 400,
        className: 'custom-popup'
      }).setContent(createPopupContent(project))

      marker.bindPopup(popup)

      // Add hover effect
      marker.on('mouseover', function() {
        this.setStyle({
          radius: 12,
          fillOpacity: 1
        })
      })

      marker.on('mouseout', function() {
        this.setStyle({
          radius: 8,
          fillOpacity: 0.8
        })
      })

      markerClusterGroup.value.addLayer(marker)
    } catch (e) {
      console.error('Error adding marker:', e)
    }
  })
}

// Watch for changes in filtered projects
watch([filteredProjects], () => {
  updateMarkers()
})

onMounted(async () => {
  if (!mapContainer.value) return

  // Initialize map without zoom controls
  map.value = L.map(mapContainer.value, {
    maxBounds: [
      [UAE_BOUNDS.south, UAE_BOUNDS.west],
      [UAE_BOUNDS.north, UAE_BOUNDS.east]
    ],
    minZoom: 7,
    maxBoundsViscosity: 1.0,
    zoomControl: false // Remove zoom controls
  })

  // Add modern light theme tile layer
  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    attribution: ' RUA Company',
    maxZoom: 20,
  }).addTo(map.value)

  // Initialize marker cluster group
  markerClusterGroup.value = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    removeOutsideVisibleBounds: true,
    animate: true,
    maxClusterRadius: 40, // Smaller clusters for better visibility
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      let size;
      if (count < 10) size = 40;
      else if (count < 100) size = 46;
      else size = 52;

      return L.divIcon({
        html: `<div class="marker-cluster marker-cluster-medium" style="width: ${size}px; height: ${size}px"><div><span>${count}</span></div></div>`,
        className: 'custom-cluster-marker',
        iconSize: L.point(size, size)
      });
    }
  })

  map.value.addLayer(markerClusterGroup.value)
  map.value.setView(ABU_DHABI_COORDS, 11)

  // Initial markers update
  updateMarkers()
  loading.value = false
})
</script>

<style scoped>
.custom-marker {
  position: relative;
}

.marker-pin {
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  background: #00cae9;
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -15px 0 0 -15px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: rotate(-45deg) scale(1);
    opacity: 1;
  }
  70% {
    transform: rotate(-45deg) scale(1.3);
    opacity: 0.5;
  }
  100% {
    transform: rotate(-45deg) scale(1);
    opacity: 1;
  }
}

.custom-popup {
  margin-bottom: 60px;
}

:deep(.leaflet-popup-content-wrapper) {
  padding: 0;
  overflow: hidden;
}

:deep(.leaflet-popup-content) {
  margin: 0;
}

:deep(.leaflet-container) {
  font-family: inherit;
}

.marker-cluster-medium {
  border-radius: 50%;
  background-color: rgba(var(--primary-600-rgb), 0.2);
}

.marker-cluster-medium div {
  background-color: rgba(var(--primary-600-rgb), 0.95);
  width: 85%;
  height: 85%;
  border-radius: 50%;
  margin: 7.5%;
  text-align: center;
  border: 2px solid white;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.marker-cluster-medium div:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.marker-cluster span {
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 12px;
}

:deep(.custom-cluster-marker) {
  background: none;
  border: none;
}

:deep(.leaflet-marker-icon) {
  background: none !important;
  border: none !important;
}

:deep(.leaflet-pane) {
  z-index: 1;
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 1000;
}

:deep(.leaflet-popup) {
  z-index: 1001;
}

:deep(.leaflet-control) {
  z-index: 1002;
}

.custom-cluster-marker {
  background: none;
}

:deep(.leaflet-control-attribution) {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  padding: 2px 8px;
  border-radius: 4px;
  margin: 4px;
}
</style>