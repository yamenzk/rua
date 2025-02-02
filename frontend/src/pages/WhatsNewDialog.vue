<template>
    <!-- Main What's New Dialog -->
    <Dialog
      v-if="!showDetails"
      v-model="show"
      :options="{
        title: `What's new in  ${selectedVersion ? 'v' + selectedVersion : ''}`,
        size: '3xl',
      }"
    >
      <template #actions>
        <div class="flex justify-between items-center w-full">
          <select 
            v-model="selectedVersion"
            class="pl-2 pr-8 py-1 text-sm rounded-md bg-white/50 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40"
          >
            <option 
              v-for="version in availableVersions" 
              :key="version" 
              :value="version"
            >
              v{{ version }}
            </option>
          </select>
        </div>
      </template>
  
      <template #body-content>
        <div v-if="loading" class="flex justify-center py-12">
          <LoadingIndicator class="animate-pulse" />
        </div>
        
        <div v-else-if="!filteredUpdates.length" class="text-center py-12">
          <div class="glass-panel p-8 rounded-2xl">
            <p class="text-gray-500 text-lg">No updates available for this version</p>
          </div>
        </div>
        
        <div v-else class="space-y-6 max-h-[70vh] overflow-y-auto p-8 updates-container">
          <div 
            v-for="(update, index) in filteredUpdates" 
            :key="update.name"
            class="update-card cursor-pointer"
            :style="{ '--delay': `${index * 0.1}s` }"
            @click="openDetails(update)"
          >
            <!-- Glass morphism card with animated border -->
            <div 
    class="glass-card group"
    :class="[
      'glass-card--' + update.type.toLowerCase(),
      { 'featured': ['Feature', 'Message'].includes(update.type) }
    ]"
  >
              <!-- Animated background elements -->
              <div class="card-effects">
                <div class="effect-circle"></div>
                <div class="effect-lines"></div>
              </div>
              
              <!-- Card content -->
              <div class="card-content">
                <div class="flex items-start justify-between">
                  <div class="flex-1 space-y-3">
                    <!-- Type badge with glow effect only for features -->
                    <span 
      class="type-badge"
      :class="getTypeStyles(update.type)"
    >
      <span v-if="['Feature'].includes(update.type)" class="badge-glow"></span>
      {{ update.type }}
    </span>
                    
                    <!-- Title with gradient text for features -->
                    <h3 
      class="text-lg font-medium transition-colors duration-300"
      :class="[
        ['Feature', 'Message'].includes(update.type)
          ? 'gradient-text' 
          : 'text-gray-900 group-hover:text-gray-700'
      ]"
    >
      {{ update.title }}
    </h3>
                  </div>
                  
                  <!-- Animated view details button -->
                  <button 
                    @click.stop="openDetails(update)"
                    class="details-button group"
                    :class="getButtonStyles(update.type)"
                  >
                    <span>View Details</span>
                    <FeatherIcon 
                      name="chevron-right" 
                      class="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" 
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  
    <!-- Details Dialog with enhanced styling -->
    <Dialog
      v-else
      v-model="showDetails"
      :options="{
        title: selectedUpdate?.title,
        size: '3xl',
      }"
      @close="closeDetails"
    >
      <template #body-content>
        <div v-if="selectedUpdate" class="space-y-6">
          <!-- Update metadata with glass effect -->
          <div class="glass-panel p-4 rounded-xl">
            <div class="flex items-center justify-between relative">
              <!-- Back button -->
              <button 
                @click="closeDetails" 
                class="absolute left-0 -ml-2 p-2 rounded-full hover:bg-gray-100/50 transition-colors duration-300 group"
              >
                <FeatherIcon 
                  name="arrow-left" 
                  class="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-300" 
                />
              </button>
              
              <!-- Centered content -->
              <div class="flex-1 flex items-center justify-center space-x-6">
                <span 
                  class="type-badge"
                  :class="getTypeStyles(selectedUpdate.type)"
                >
                  <span v-if="selectedUpdate.type === 'Feature'" class="badge-glow"></span>
                  {{ selectedUpdate.type }}
                </span>
                <span class="version-tag">Version {{ selectedUpdate.version }}</span>
              </div>
            </div>
          </div>
  
          <!-- Details content with enhanced typography -->
          <div 
            class="prose prose-lg max-w-none overflow-y-auto max-h-[60vh] update-content glass-panel p-6 rounded-xl"
            v-html="selectedUpdate.details"
            v-if="selectedUpdate.details"
          ></div>
          <div v-else>
            No details available.
          </div>
        </div>
      </template>
  
      <template #actions>
        <div class="flex justify-end">
          <Button 
            variant="solid" 
            class="back-button" 
            @click="closeDetails"
          >
            Back to Updates
          </Button>
        </div>
      </template>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import { Dialog, LoadingIndicator, FeatherIcon, Button } from 'frappe-ui'
  import { updateResource } from '@/data/update'
  
  const props = defineProps({
    modelValue: Boolean
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  // State management
  const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  const loading = ref(true)
  const updates = ref([])
  const showDetails = ref(false)
  const selectedUpdate = ref(null)
  const selectedVersion = ref(null)
  
  // No need for custom title computed property anymore
  
  // Compare versions using semantic versioning logic
  function compareVersions(a, b) {
    const partsA = a.split('.').map(Number)
    const partsB = b.split('.').map(Number)
    
    for (let i = 0; i < 3; i++) {
      const partA = partsA[i] || 0
      const partB = partsB[i] || 0
      
      if (partA !== partB) {
        return partB - partA // Higher version first
      }
    }
    return 0
  }
  
  // Computed properties
  const availableVersions = computed(() => {
    if (!updates.value.length) return []
    return [...new Set(updates.value.map(u => u.version))].sort(compareVersions)
  })
  
  // Watch for updates to set initial version
  watch(() => updates.value, (newUpdates) => {
    if (newUpdates.length && !selectedVersion.value) {
      selectedVersion.value = availableVersions.value[0]
    }
  }, { immediate: true })
  
  const sortedUpdates = computed(() => {
  const typeOrder = {
    'Feature': 0,
    'Message': 1,
    'UI': 2,
    'UX': 3,
    'Fix': 4,
    'Refactor': 5,
    'Remove': 6
  }

  return [...updates.value].sort((a, b) => {
    const typeDiff = (typeOrder[a.type] ?? 999) - (typeOrder[b.type] ?? 999)
    if (typeDiff !== 0) return typeDiff
    return parseFloat(b.version) - parseFloat(a.version)
  })
})
  
  const filteredUpdates = computed(() => {
    if (!selectedVersion.value) return sortedUpdates.value
    return sortedUpdates.value.filter(update => update.version === selectedVersion.value)
  })
  
  // Methods
  async function fetchUpdates() {
    try {
      loading.value = true
      await updateResource.reload()
      if (updateResource.data) {
        updates.value = updateResource.data
        if (!selectedVersion.value && updates.value.length) {
          selectedVersion.value = availableVersions.value[0]
        }
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
  
  function getTypeStyles(type) {
  const styles = {
    'Feature': 'bg-gradient-to-r from-purple-400/20 to-pink-400/20 text-purple-700',
    'Message': 'bg-gradient-to-r from-sky-400/20 to-cyan-400/20 text-sky-700',
    'Fix': 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-700',
    'UX': 'bg-gradient-to-r from-orange-400/20 to-red-400/20 text-orange-700',
    'UI': 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-700',
    'Remove': 'bg-gradient-to-r from-red-400/20 to-rose-400/20 text-red-700',
    'Refactor': 'bg-gradient-to-r from-blue-400/20 to-indigo-400/20 text-blue-700'
  }
  return styles[type] || 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 text-gray-700'
}

function getButtonStyles(type) {
  const styles = {
    'Feature': 'text-purple-600 hover:text-purple-800',
    'Message': 'text-sky-600 hover:text-sky-800',
    'Fix': 'text-yellow-600 hover:text-yellow-800',
    'UX': 'text-orange-600 hover:text-orange-800',
    'UI': 'text-green-600 hover:text-green-800',
    'Remove': 'text-red-600 hover:text-red-800',
    'Refactor': 'text-blue-600 hover:text-blue-800'
  }
  return styles[type] || 'text-gray-600 hover:text-gray-800'
}
  
  onMounted(() => {
    fetchUpdates()
  })
  </script>
  
  <style scoped>
  /* Base glass effect */
  .glass-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  /* Update cards */
  .update-card {
    opacity: 0;
    transform: translateY(20px);
    animation: slideIn 0.5s ease forwards;
    animation-delay: var(--delay);
  }
  
  .glass-card {
    position: relative;
    padding: 1.5rem;
    border-radius: 1rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }
  
  .glass-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }
  
  /* Card effects */
  .card-effects {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .glass-card:hover .card-effects {
    opacity: 1;
  }
  
  .effect-circle {
    position: absolute;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
    animation: moveAround 8s linear infinite;
  }
  
  .effect-lines {
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.1) 0px,
      rgba(255,255,255,0.1) 1px,
      transparent 1px,
      transparent 4px
    );
    animation: moveLines 20s linear infinite;
  }
  
  /* Type badges */
  .type-badge {
    position: relative;
    display: inline-flex;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    overflow: hidden;
  }
  
  .badge-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    transform: translateX(-100%);
    animation: shine 3s infinite;
  }
  
  /* Featured card styles */
  .featured {
    background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1));
  }
  
  .gradient-text {
    background: linear-gradient(90deg, #8B5CF6, #EC4899);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 600;
  }
  
  /* Button styles */
  .details-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .back-button {
    position: relative;
    overflow: hidden;
  }
  
  .back-button::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    animation: shine 3s infinite;
  }
  
  /* Custom scrollbar */
  .updates-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(229,231,235,0.5) transparent;
  }
  
  .updates-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .updates-container::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .updates-container::-webkit-scrollbar-thumb {
    background-color: rgba(229,231,235,0.5);
    border-radius: 3px;
  }
  
  /* Animations */
  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    50%, 100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes moveAround {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  
  @keyframes moveLines {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }
  
  /* Update content styles */
  .update-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
    transition: transform 0.3s ease;
  }
  
  .update-content :deep(img:hover) {
    transform: scale(1.02);
  }
  
  .update-content :deep(p) {
    margin: 1.25rem 0;
    line-height: 1.8;
  }
  
  .version-tag {
    font-family: monospace;
    font-size: 0.875rem;
    color: #6B7280;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    background: rgba(243,244,246,0.8);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(229,231,235,0.4);
  }

  .glass-card--message {
  background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(6,182,212,0.1));
}

.glass-card--message .gradient-text {
  background: linear-gradient(90deg, #0EA5E9, #05323b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 600;
}

  </style>