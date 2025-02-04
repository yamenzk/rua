<template>
  <Dialog
    v-if="!showDetails"
    v-model="show"
    :options="{
      title: dialogTitle,
      size: '3xl',
    }"
  >
    <template #body-content>
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingIndicator class="animate-pulse" />
      </div>
      
      <div v-else-if="!filteredUpdates.length" class="py-12 text-center">
        <div class="mx-auto max-w-md rounded-2xl bg-gray-50 p-8">
          <FeatherIcon name="inbox" class="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p class="text-lg text-gray-600">No updates available for this version</p>
        </div>
      </div>
      
      <div v-else class="grid max-h-[calc(100vh-16rem)] grid-cols-1 gap-6 overflow-y-auto p-4 md:grid-cols-2">
        
        <div 
          v-for="update in filteredUpdates" 
          :key="update.name"
          class="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 ease-in-out hover:shadow-lg hover:-translate-y-1"
          @click="openDetails(update)"
        >
          <!-- Card Header -->
          <div class="relative">
            <!-- Type Badge -->
            <div 
              class="absolute left-4 top-4 z-20 inline-flex rounded-full px-3 py-1 text-xs font-medium shadow-sm"
              :class="getTypeStyles(update.type)"
            >
              <span v-if="['Feature', 'Message'].includes(update.type)" class="absolute inset-0 rounded-full bg-gradient-to-r animate-shimmer"></span>
              <span class="relative">{{ update.type }}</span>
            </div>

            <!-- Header Image or Pattern -->
            <div class="absolute inset-0 overflow-hidden">
              <div v-if="getFirstImage(update.details)" class="h-full w-full">
                <img 
                  :src="getFirstImage(update.details)"
                  class="h-full w-full object-cover"
                  alt=""
                />
                <div class="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
              </div>
              <div v-else 
                class="h-full w-full"
                :class="getHeaderGradient(update.type)"
              >
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]"></div>
              </div>
            </div>

            <!-- Spacer for content layout -->
            <div class="h-32"></div>
          </div>

          <!-- Card Content -->
          <div class="p-6">
            <h3 class="mb-2 text-lg font-medium text-gray-900 group-hover:text-gray-700"
                :class="{
                  'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent': update.type === 'Feature',
                  'bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 bg-clip-text text-transparent': update.type === 'Message'
                }">
              {{ update.title }}
            </h3>

            <div v-if="update.details" class="mb-4 line-clamp-2 text-sm text-gray-500" v-html="stripHtml(update.details)"></div>
            
            <div class="mt-4 flex items-center justify-between">
              <button 
                class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                :class="getButtonStyles(update.type)"
                @click.stop="openDetails(update)"
              >
                View Details
                <FeatherIcon name="arrow-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <select 
                v-model="selectedVersion"
                class="rounded-lg border border-gray-200 bg-white px-3 py-1 pr-8 text-sm text-gray-600 hover:border-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              >
                <option 
                  v-for="version in availableVersions" 
                  :key="version" 
                  :value="version"
                >
                  v{{ version }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <FeatherIcon name="chevron-down" class="h-4 w-4" />
              </div>
    </template>
  </Dialog>

  <!-- Details Dialog -->
  <Dialog
    v-else
    v-model="showDetails"
    :options="{
      title: selectedUpdate?.title || 'Update Details',
      size: '3xl',
    }"
  >
    <template #body-content>
      <div v-if="selectedUpdate" class="grid max-h-[calc(100vh-24rem)] grid-cols-1 gap-6 overflow-y-auto">
        <!-- Header with Back Button and Meta -->
        <div class="flex items-center justify-between">
          <button 
            @click="closeDetails" 
            class="group flex items-center gap-2 rounded-lg px-2 py-1 text-gray-500 hover:text-gray-900"
          >
            <FeatherIcon 
              name="arrow-left" 
              class="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" 
            />
            <span class="text-sm">Back</span>
          </button>
          <div class="flex items-center gap-2">
            <span 
              class="inline-flex rounded-full px-3 py-1 text-xs font-medium shadow-sm"
              :class="getTypeStyles(selectedUpdate.type)"
            >
              <span v-if="['Feature', 'Message'].includes(selectedUpdate.type)" class="absolute inset-0 rounded-full bg-gradient-to-r animate-shimmer"></span>
              <span class="relative">{{ selectedUpdate.type }}</span>
            </span>
            <span class="text-sm text-gray-500">Version {{ selectedUpdate.version }}</span>
          </div>
        </div>

        <!-- Content -->
        <div 
          class="prose max-w-none rounded-lg bg-gray-200/50 p-6
            prose-headings:font-semibold prose-headings:text-gray-900 
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-img:rounded-lg prose-img:shadow-sm prose-img:mx-auto prose-img:max-h-[300px] prose-img:object-cover
            prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
            prose-pre:bg-gray-900/5 prose-pre:rounded-lg
            prose-code:text-gray-800 prose-code:bg-gray-100/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:space-y-1 prose-li:text-gray-600
            prose-blockquote:border-l-gray-200 prose-blockquote:text-gray-600 prose-blockquote:italic"
          :class="{
            'prose-a:text-purple-600 hover:prose-a:text-purple-500': selectedUpdate.type === 'Feature',
            'prose-a:text-teal-600 hover:prose-a:text-teal-500': selectedUpdate.type === 'Message',
            'prose-a:text-gray-600 hover:prose-a:text-gray-500': !['Feature', 'Message'].includes(selectedUpdate.type)
          }"
          v-html="selectedUpdate.details"
          v-if="selectedUpdate.details"
        ></div>
        <div v-else class="rounded-lg bg-gray-50 p-4 text-gray-500">
          No additional details available.
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-end border-t border-gray-100 bg-white px-6 py-4">
        <Button 
          variant="solid" 
          @click="closeDetails"
        >
          Close
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Dialog, LoadingIndicator, FeatherIcon, Button, Select } from 'frappe-ui'
import { updateResource } from '@/data/update'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

// State
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(true)
const updates = ref([])
const showDetails = ref(false)
const selectedUpdate = ref(null)
const selectedVersion = ref(null)

// Add this computed property after other computed properties
const dialogTitle = computed(() => {
  if (!selectedVersion.value || !availableVersions.value.length) return ''
  
  // Check if selected version is the latest version
  const isLatestVersion = selectedVersion.value === availableVersions.value[0]
  
  const prefix = isLatestVersion ? "What's new in" : "What changed in"
  return prefix + (selectedVersion.value ? ` v.${selectedVersion.value}` : '')
})


// Compare versions using semantic versioning logic
function compareVersions(a, b) {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0
    const partB = partsB[i] || 0
    if (partA !== partB) return partB - partA
  }
  return 0
}

// Computed properties
const availableVersions = computed(() => {
  if (!updates.value.length) return []
  return [...new Set(updates.value.map(u => u.version))].sort(compareVersions)
})

const filteredUpdates = computed(() => {
  if (!selectedVersion.value) return []
  return updates.value
    .filter(u => u.version === selectedVersion.value)
    .sort((a, b) => {
      const typeOrder = { 'Feature': 0, 'Message': 1, 'UI': 2, 'UX': 3, 'Fix': 4, 'Refactor': 5, 'Remove': 6 }
      return typeOrder[a.type] - typeOrder[b.type]
    })
})

// Helper function to extract first image from HTML content
function getFirstImage(html) {
  if (!html) return null
  const div = document.createElement('div')
  div.innerHTML = html
  const img = div.querySelector('img')
  return img ? img.src : null
}

// Helper function to strip HTML tags
function stripHtml(html) {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

// Type styling helpers
function getTypeStyles(type) {
  const styles = {
    'Feature': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden',
    'Message': 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white relative overflow-hidden',
    'UI': 'bg-green-500 text-white',
    'UX': 'bg-orange-500 text-white',
    'Fix': 'bg-yellow-500 text-white',
    'Refactor': 'bg-blue-500 text-white',
    'Remove': 'bg-red-500 text-white'
  }
  return styles[type] || 'bg-gray-500 text-white'
}

function getHeaderGradient(type) {
  const gradients = {
    'Feature': 'bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5',
    'Message': 'bg-gradient-to-br from-cyan-500/5 via-teal-500/5 to-green-500/5',
    'UI': 'bg-green-500/5',
    'UX': 'bg-orange-500/5',
    'Fix': 'bg-yellow-500/5',
    'Refactor': 'bg-blue-500/5',
    'Remove': 'bg-red-500/5'
  }
  return gradients[type] || 'bg-gray-500/5'
}

function getButtonStyles(type) {
  const styles = {
    'Feature': 'text-purple-600 hover:bg-purple-50',
    'Message': 'text-teal-600 hover:bg-teal-50',
    'UI': 'text-green-600 hover:bg-green-50',
    'UX': 'text-orange-600 hover:bg-orange-50',
    'Fix': 'text-yellow-600 hover:bg-yellow-50',
    'Refactor': 'text-blue-600 hover:bg-blue-50',
    'Remove': 'text-red-600 hover:bg-red-50'
  }
  return styles[type] || 'text-gray-600 hover:bg-gray-50'
}

// Methods
async function fetchUpdates() {
  loading.value = true
  try {
    await updateResource.reload()
    updates.value = updateResource.data || []
    if (availableVersions.value.length) {
      selectedVersion.value = availableVersions.value[0]
    }
  } catch (error) {
    console.error('Error fetching updates:', error)
  } finally {
    loading.value = false
  }
}

function openDetails(update) {
  selectedUpdate.value = update
  showDetails.value = true
}

function closeDetails() {
  showDetails.value = false
  selectedUpdate.value = null
}

onMounted(() => {
  fetchUpdates()
})
</script>

<style scoped>
/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

@keyframes shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.5;
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  background-size: 200% 200%;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.prose::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.prose {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Custom scrollbar for the main content */
.max-h-\[calc\(100vh-24rem\)\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[calc\(100vh-24rem\)\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[calc\(100vh-24rem\)\]::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 3px;
}

.max-h-\[calc\(100vh-24rem\)\]::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>