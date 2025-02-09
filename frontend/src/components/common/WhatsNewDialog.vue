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
      
      <div v-else class="relative grid max-h-[calc(100vh-16rem)] grid-cols-1 gap-8 overflow-y-auto p-8 md:grid-cols-2">
        <!-- Background Pattern -->
        <div class="pointer-events-none fixed inset-0 bg-grid-pattern opacity-5"></div>
        
        <div 
          v-for="update in filteredUpdates" 
          :key="update.name"
          class="group relative cursor-pointer"
          @click="openDetails(update)"
        >
          <!-- Card Container with Tilt Effect -->
          <div class="relative transform-gpu transition-all duration-500 ease-out hover:-rotate-1 hover:scale-[1.02]">
            <!-- Main Card -->
            <div class="relative flex flex-col overflow-hidden rounded-[2rem] bg-white">
              <!-- Decorative Elements -->
              <div 
                class="absolute -right-4 -top-4 h-24 w-24 rotate-12 transform-gpu rounded-xl bg-gradient-to-br opacity-20 transition-transform duration-500 ease-out group-hover:rotate-45 group-hover:scale-150"
                :class="{
                  'from-purple-400 to-pink-400': update.type === 'Feature',
                  'from-blue-400 to-cyan-400': update.type === 'Message',
                  'from-green-400 to-teal-400': update.type === 'Fix',
                  'from-yellow-400 to-orange-400': update.type === 'UI',
                  'from-orange-400 to-amber-400': update.type === 'UX',
                  'from-violet-400 to-blue-400': update.type === 'Refactor',
                  'from-red-400 to-pink-400': update.type === 'Remove',
                  'from-gray-400 to-gray-700': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(update.type)
                }"
              ></div>

              <!-- Image Section or Placeholder -->
              <div class="relative aspect-[16/9] w-full overflow-hidden">
                <template v-if="getFirstImage(update.details)">
                  <img 
                    :src="getFirstImage(update.details)"
                    class="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                    alt=""
                  />
                  <!-- Gradient Overlay -->
                  <div 
                    class="absolute inset-0 bg-gradient-to-b"
                    :class="{
                      'from-purple-900/30 via-transparent to-white': update.type === 'Feature',
                      'from-blue-900/30 via-transparent to-white': update.type === 'Message',
                      'from-green-900/30 via-transparent to-white': update.type === 'Fix',
                      'from-yellow-900/30 via-transparent to-white': update.type === 'UI',
                      'from-orange-900/30 via-transparent to-white': update.type === 'UX',
                      'from-violet-900/30 via-transparent to-white': update.type === 'Refactor',
                      'from-red-900/30 via-transparent to-white': update.type === 'Remove',
                      'from-gray-900/30 via-transparent to-white': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(update.type)
                    }"
                  ></div>
                </template>
                <template v-else>
                  <!-- Placeholder Icon Background -->
                  <div 
                    class="flex h-full w-full items-center justify-center bg-gradient-to-br"
                    :class="{
                      'from-purple-50 to-pink-50': update.type === 'Feature',
                      'from-blue-50 to-cyan-50': update.type === 'Message',
                      'from-green-50 to-teal-50': update.type === 'Fix',
                      'from-yellow-50 to-amber-50': update.type === 'UI',
                      'from-orange-50 to-amber-50': update.type === 'UX',
                      'from-violet-50 to-blue-50': update.type === 'Refactor',
                      'from-red-50 to-pink-50': update.type === 'Remove',
                      'from-gray-50 to-gray-50': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(update.type)
                    }"
                  >
                    <FeatherIcon 
                      :name="getIconForType(update.type)"
                      class="h-12 w-12 transition-all duration-500 group-hover:scale-110"
                      :class="{
                        'text-purple-400': update.type === 'Feature',
                        'text-blue-400': update.type === 'Message',
                        'text-green-400': update.type === 'Fix',
                        'text-yellow-500': update.type === 'UI',
                        'text-orange-400': update.type === 'UX',
                        'text-violet-400': update.type === 'Refactor',
                        'text-red-400': update.type === 'Remove',
                        'text-gray-400': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(update.type)
                      }"
                    />
                  </div>
                </template>

                <!-- Type Badge -->
                <div 
                  v-if="update.type === 'Feature'"
                  class="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 via-pink-500 via-rose-500 to-purple-500 px-4 py-1.5 text-xs font-medium shadow-md animate-gradient-x bg-[length:300%_100%] ring-1 ring-white/20"
                >
                  <!-- Shimmer Effect -->
                  <div 
                    class="absolute inset-0 animate-shimmer-fast"
                    style="
                      background: linear-gradient(
                        to right,
                        transparent 0%,
                        rgba(255, 255, 255, 0.4) 50%,
                        transparent 100%
                      );
                      transform: skewX(-20deg) translateX(-100%);
                    "
                  ></div>
                  <span class="relative flex items-center gap-1.5 text-white font-semibold">
                    <span class="relative">
                      <span class="absolute inset-0 animate-ping rounded-full bg-white/30"></span>
                      <svg class="relative h-3 w-3 drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]" viewBox="0 0 24 24" fill="none">
                        <path 
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                          class="fill-white"
                        />
                      </svg>
                    </span>
                    <span class="drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]">Feature</span>
                  </span>
                </div>

                <!-- Other Type Badges -->
                <div 
                  v-else
                  class="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm"
                  :class="getTypeStyles(update.type)"
                >
                  {{ update.type }}
                </div>
              </div>
              
              <!-- Content Container -->
              <div class="relative flex flex-1 flex-col p-6">
                <!-- Title with Special Treatment for Feature -->
                <h3 
                  class="relative mt-1 line-clamp-1 text-xl font-semibold tracking-tight"
                  :class="{
                    'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent': update.type === 'Feature',
                    'text-gray-900': update.type !== 'Feature'
                  }"
                >
                  {{ update.title }}
                  <span 
                    v-if="update.type === 'Feature'"
                    class="absolute -left-6 top-1/2 h-4 w-4 -trangray-y-1/2 rounded-full bg-purple-100"
                  ></span>
                </h3>

                <!-- Description -->
                <div 
                  v-if="update.details" 
                  class="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500"
                  v-html="stripHtml(update.details)"
                ></div>

                <!-- Footer -->
                <div class="mt-6 flex items-center justify-between">
                  <!-- Version Tag -->
                  <span class="text-xs text-gray-400">v{{ update.version }}</span>
                  
                  <!-- Action Button -->
                  <button 
                    class="group/btn relative flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
                    :class="getButtonStyles(update.type)"
                    @click.stop="openDetails(update)"
                  >
                    <span class="relative z-10">View Details</span>
                    <span class="relative z-10 transition-transform duration-300 group-hover/btn:trangray-x-1">
                      <FeatherIcon name="arrow-right" class="h-4 w-4" />
                    </span>
                    <div 
                      class="absolute inset-0 -trangray-x-full transform-gpu bg-gradient-to-r transition-transform duration-300 group-hover/btn:trangray-x-0"
                      :class="{
                        'from-purple-500/10 to-pink-500/10': update.type === 'Feature',
                        'from-blue-500/10 to-cyan-500/10': update.type === 'Message',
                        'from-green-500/10 to-teal-500/10': update.type === 'Fix',
                        'from-yellow-500/10 to-orange-500/10': update.type === 'UI',
                        'from-orange-500/10 to-amber-500/10': update.type === 'UX',
                        'from-violet-500/10 to-blue-500/10': update.type === 'Refactor',
                        'from-red-500/10 to-pink-500/10': update.type === 'Remove',
                        'from-gray-500/10 to-gray-500/10': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(update.type)
                      }"
                    ></div>
                  </button>
                </div>
              </div>

              <!-- Bottom Decorative Bar -->
              <div 
                class="relative h-2 w-full overflow-hidden bg-gradient-to-r transition-all duration-500"
                :class="{
                  'animate-gradient-x bg-[length:300%_100%] from-purple-500 via-fuchsia-500 via-pink-500 via-rose-500 to-purple-500': update.type === 'Feature',
                  'from-blue-500 to-cyan-500': update.type === 'Message',
                  'from-green-500 to-teal-500': update.type === 'Fix',
                  'from-yellow-500 to-orange-500': update.type === 'UI',
                  'from-orange-500 to-amber-500': update.type === 'UX',
                  'from-violet-500 to-blue-500': update.type === 'Refactor',
                  'from-red-500 to-pink-500': update.type === 'Remove',
                  'from-gray-500 to-gray-500': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(update.type)
                }"
              >
                <!-- Shimmer Effect (only for Feature) -->
                <div 
                  v-if="update.type === 'Feature'"
                  class="absolute inset-0 animate-shimmer"
                  style="
                    background: linear-gradient(
                      to right,
                      transparent 0%,
                      rgba(255, 255, 255, 0.4) 50%,
                      transparent 100%
                    );
                    transform: skewX(-20deg);
                  "
                ></div>
              </div>
            </div>

            <!-- Feature Special Effects -->
            <div 
              v-if="update.type === 'Feature'"
              class="absolute -inset-0.5 -z-10 animate-tilt rounded-[2rem] bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-lg transition-all duration-500 group-hover:opacity-30"
            ></div>
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
              class="h-4 w-4 transition-transform duration-200 group-hover:-trangray-x-0.5" 
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
            ppink-headings:font-semibold ppink-headings:text-gray-900 
            ppink-p:text-gray-600 ppink-p:leading-relaxed
            ppink-img:rounded-lg ppink-img:shadow-sm ppink-img:mx-auto ppink-img:max-h-[300px] ppink-img:object-cover
            ppink-h1:text-xl ppink-h2:text-lg ppink-h3:text-base
            ppink-pre:bg-gray-900/5 ppink-pre:rounded-lg
            ppink-code:text-gray-800 ppink-code:bg-gray-100/80 ppink-code:px-1.5 ppink-code:py-0.5 ppink-code:rounded-md
            ppink-strong:text-gray-900 ppink-strong:font-semibold
            ppink-ul:space-y-1 ppink-li:text-gray-600
            ppink-blockquote:border-l-gray-200 ppink-blockquote:text-gray-600 ppink-blockquote:italic"
          :class="{
            'ppink-a:text-purple-600 hover:ppink-a:text-purple-500': selectedUpdate.type === 'Feature',
            'ppink-a:text-teal-600 hover:ppink-a:text-teal-500': selectedUpdate.type === 'Message',
            'ppink-a:text-gray-600 hover:ppink-a:text-gray-500': !['Feature', 'Message'].includes(selectedUpdate.type)
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
import { Dialog, LoadingIndicator, FeatherIcon, Button } from 'frappe-ui'
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
  return {
    'bg-purple-100 text-purple-700': type === 'Feature',
    'bg-blue-100 text-blue-700': type === 'Message',
    'bg-green-100 text-green-700': type === 'Fix',
    'bg-yellow-100 text-yellow-700': type === 'UI',
    'bg-orange-100 text-orange-700': type === 'UX',
    'bg-violet-100 text-violet-700': type === 'Refactor',
    'bg-red-100 text-red-700': type === 'Remove',
    'bg-gray-100 text-gray-700': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(type)
  }
}

function getButtonStyles(type) {
  return {
    'bg-purple-50 text-purple-700': type === 'Feature',
    'bg-blue-50 text-blue-700': type === 'Message',
    'bg-green-50 text-green-700': type === 'Fix',
    'bg-yellow-50 text-yellow-700': type === 'UI',
    'bg-orange-50 text-orange-700': type === 'UX',
    'bg-violet-50 text-violet-700': type === 'Refactor',
    'bg-red-50 text-red-700': type === 'Remove',
    'bg-gray-50 text-gray-700': !['Feature', 'Message', 'Fix', 'UI', 'UX', 'Refactor', 'Remove'].includes(type)
  }
}

function getIconForType(type) {
  const icons = {
    'Feature': 'star',
    'Message': 'message-circle',
    'Fix': 'tool',
    'UI': 'layout',
    'UX': 'users',
    'Refactor': 'refresh-cw',
    'Remove': 'trash-2'
  }
  return icons[type] || 'info'
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
.bg-grid-pattern {
  background-image: radial-gradient(circle at center, currentColor 1px, transparent 1px);
  background-size: 24px 24px;
}

@keyframes tilt {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(0.5deg); }
  75% { transform: rotate(-0.5deg); }
}

.animate-tilt {
  animation: tilt 10s infinite ease-in-out;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.animate-ping {
  animation: ping 2s infinite;
}

@keyframes ping {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
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

@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-x {
  animation: gradient-x 3s ease-in-out infinite;
}

@keyframes shimmer-fast {
  0% {
    transform: skewX(-20deg) translateX(-100%);
  }
  100% {
    transform: skewX(-20deg) translateX(200%);
  }
}

.animate-shimmer-fast {
  animation: shimmer-fast 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: skewX(-20deg) translateX(-100%);
  }
  100% {
    transform: skewX(-20deg) translateX(200%);
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
</style>