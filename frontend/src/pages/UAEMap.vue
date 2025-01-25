<template>
  <div class="bg-white rounded-lg border shadow-sm relative z-0">
    <div class="p-4 border-b">
      <h2 class="text-lg font-medium text-gray-900">Rua Projects</h2>
      <p class="text-sm text-gray-500 mt-1">Map view of all active and completed projects.</p>
      
      <!-- Legend -->
      <div class="mt-3 flex flex-wrap gap-3">
        <div v-for="(color, status) in statusColors" :key="status" 
             class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full"
               :style="{ backgroundColor: color }">
          </div>
          <span class="text-sm text-gray-600">{{ status }}</span>
        </div>
      </div>
    </div>

    <div ref="mapContainer" class="w-full h-[600px] rounded-b-lg"></div>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import { projectResource } from '@/data/project'
  
  const router = useRouter()
  const mapContainer = ref(null)
  const map = ref(null)
  const markers = ref([])
  
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
  
  const projects = computed(() => {
    return projectResource.data?.filter(project => {
      try {
        // Filter out child projects, cancelled projects, and projects without coordinates
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
      <div class="p-0">
        ${project.image ? `
          <div class="relative h-40 w-full">
            <img 
              src="${project.image}" 
              alt="${project.project_name}"
              class="w-full h-full object-cover"
              onerror="this.style.display='none'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <div class="text-white font-bold">${project.project_name}</div>
                <div class="text-white/80 text-sm">${project.location || 'No location set'}</div>
              </div>
            </div>
          </div>
        ` : `
          <div class="h-40 w-full bg-gray-100 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        `}
        
        <div class="p-4 space-y-4">
          <!-- Project Status -->
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                  style="background-color: ${statusColors[project.status]}20; 
                         color: ${statusColors[project.status]}">
              ${project.status}
            </span>
            <span class="text-sm text-gray-500">
              ${project.serial_number ? `#${project.serial_number}` : ''}
            </span>
          </div>
  
          <!-- Project Progress -->
          <div>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Completion</span>
              <span class="font-medium">${Math.round(receivedProgress)}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 rounded-full h-2" 
                   style="width: ${Math.round(receivedProgress)}%">
              </div>
            </div>
          </div>
  
          <!-- Financial Details -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Contract Value:</span>
              <span class="font-medium">${formatCurrency(project.contract_value)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Total Invoiced:</span>
              <span class="font-medium">${formatCurrency(project.total_invoiced)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Total Received:</span>
              <span class="font-medium">${formatCurrency(project.total_received)}</span>
            </div>
  
            <!-- Payment Progress Bar -->
            <div>
              <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Payment Progress</span>
                <span class="font-medium">${receivedProgress}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 rounded-full h-2" 
                     style="width: ${receivedProgress}%">
                </div>
              </div>
            </div>
          </div>
  
          <!-- Action Button -->
          <button
            class="w-full px-3 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
            onclick="window.location.href='/project/${project.name}/overview'"
          >
            View Project Details
          </button>
        </div>
      </div>
    `
  }
  
  onMounted(() => {
    
    if (!mapContainer.value) return
  
    // Initialize map
    map.value = L.map(mapContainer.value, {
      maxBounds: [
        [UAE_BOUNDS.south, UAE_BOUNDS.west],
        [UAE_BOUNDS.north, UAE_BOUNDS.east]
      ],
      minZoom: 7,
      maxBoundsViscosity: 1.0
    })
  
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© RUA Company'
    }).addTo(map.value)
  
    // Set initial view to Abu Dhabi with closer zoom
    map.value.setView(ABU_DHABI_COORDS, 11)
  
    // Add project markers
    projects.value.forEach(project => {
      try {
        const coords = JSON.parse(project.coords)
        const marker = L.circleMarker([coords.lat, coords.lng], {
          radius: 8,
          fillColor: statusColors[project.status] || '#6b7280',
          color: '#000',
          weight: 2,
          opacity: 1,
          fillOpacity: 1
        }).addTo(map.value)
  
        // Create popup with maxWidth
        const popup = L.popup({
          maxWidth: 350,
          className: 'custom-popup'
        }).setContent(createPopupContent(project))
  
        marker.bindPopup(popup)
        markers.value.push(marker)
      } catch (e) {
        console.error('Error adding marker:', e)
      }
    })
  })
  </script>
  
  <style>
  .leaflet-popup-content-wrapper {
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .leaflet-popup-content {
    margin: 0;
    width: 350px !important;
  }
  
  .leaflet-popup-close-button {
    color: white !important;
  }
  
  .custom-popup .leaflet-popup-content-wrapper {
    background: white;
  }
  
  .custom-popup .leaflet-popup-tip {
    background: white;
  }
  </style>