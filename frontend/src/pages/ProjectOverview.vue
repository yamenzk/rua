# ProjectOverview.vue
<template>
  <!-- Loading State -->
  <div v-if="!projectResource?.doc" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>
  <div class="space-y-8" v-else>
   <!-- Hero Image Section -->
<div class="relative h-64 md:h-96">
  <!-- Carousel -->
  <div 
    class="w-full h-full"
    @click.ctrl="handleImageClick()"
    @mouseenter="pauseAutoSlide"
    @mouseleave="resumeAutoSlide"
  >
    <!-- Images -->
    <div class="relative w-full h-full overflow-hidden">
      <TransitionGroup name="carousel">
        <img
          v-for="(image, index) in allProjectImages"
          :key="image"
          :src="image"
          :alt="projectResource.doc?.project_name"
          class="absolute w-full h-full object-cover transition-all duration-500"
          :class="index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
          @error="$event.target.style.display='none'"
        />
      </TransitionGroup>

      <!-- Fallback when no images -->
      <div 
        v-if="!allProjectImages.length" 
        class="w-full h-full bg-gray-100 flex items-center justify-center"
      >
        <FeatherIcon name="image" class="w-12 h-12 text-gray-400" />
      </div>

      <!-- Navigation Arrows (only show if multiple images) -->
      <template v-if="allProjectImages.length > 1">
        <button 
          @click.stop="previousImage"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full
                 bg-black/20 hover:bg-black/40 transition-colors text-white"
        >
          <FeatherIcon name="chevron-left" class="w-6 h-6" />
        </button>
        <button 
          @click.stop="nextImage"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full
                 bg-black/20 hover:bg-black/40 transition-colors text-white"
        >
          <FeatherIcon name="chevron-right" class="w-6 h-6" />
        </button>

        
      </template>
    </div>

    <!-- Project Info Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end z-20">
  <div class="w-full p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-white">
          {{ projectResource.doc?.project_name }}
        </h1>
        <div class="flex items-center mt-2 text-white/80" v-if="projectResource.doc?.location">
  <FeatherIcon name="map-pin" class="w-4 h-4 mr-1 flex-shrink-0" />
  <span class="text-sm truncate max-w-[170px] sm:max-w-none sm:truncate-none">
    {{ projectResource.doc?.location || '' }}
  </span>
</div>
      </div>

      <!-- Image Indicators - now inline -->
      <div v-if="allProjectImages.length > 1" 
           class="flex-1 flex justify-center items-center self-end space-x-2 hidden md:flex">
        <button
          v-for="(_, index) in allProjectImages"
          :key="index"
          @click.stop="currentImageIndex = index"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="index === currentImageIndex 
            ? 'bg-white w-4' 
            : 'bg-white/50 hover:bg-white/80'"
        />
      </div>

      <div class="flex-1 text-right text-white">
        <div class="text-3xl font-bold">{{ Math.round(projectResource.doc?.completion || 0) }}%</div>
        <div class="text-sm text-white/80">Completed</div>
      </div>
    </div>
  </div>
</div>
  </div>
</div>

    <!-- Project Details -->
    <div class="px-6">
      <!-- Description -->
      <div class="mb-8">
        <h3 class="text-sm font-medium text-gray-500 mb-2">About this Project</h3>
        <p class="text-gray-900 whitespace-pre-wrap">{{ projectResource.doc?.description || 'No description available' }}</p>
      </div>

      <!-- Key Details -->
      <div class="mb-8">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Project Overview</h3>
        <div class="flex overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 space-x-4">
          <!-- Contract Value Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-blue-500 to-blue-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-bold text-blue-200">Contract Value</div>
            <div>
              <div class="text-2xl font-bold text-blue-100">
                {{ formatCurrency(projectResource.doc?.contract_value) }}
              </div>
              <div class="text-xs text-blue-200 mt-1">Total Project Value</div>
            </div>
          </div>

          <!-- Project Cost Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-red-500 to-red-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-red-200">Project Cost</div>
            <div>
              <div class="text-2xl font-bold text-red-100">
                {{ formatCurrency(projectResource.doc?.project_cost) }}
              </div>
              <div class="text-xs text-red-200 mt-1">Estimated Cost</div>
            </div>
          </div>

          <!-- Additional Expenses Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-orange-500 to-orange-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-orange-200">Additional Expenses</div>
            <div>
              <div class="text-2xl font-bold text-orange-100">
                {{ formatCurrency(projectResource.doc?.additional_expenses) }}
              </div>
              <div class="text-xs text-orange-200 mt-1">Extra Costs</div>
            </div>
          </div>

          <!-- Project Profit Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-green-500 to-green-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-green-200">Project Profit</div>
            <div>
              <div class="text-2xl font-bold text-green-100">
                {{ formatCurrency(calculateProfit) }}
              </div>
              <div class="text-xs text-green-200 mt-1">Expected Profit</div>
            </div>
          </div>

          <!-- Total Invoiced Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-purple-500 to-purple-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-purple-200">Total Invoiced</div>
            <div>
              <div class="text-2xl font-bold text-purple-100">
                {{ formatCurrency(projectResource.doc?.total_invoiced) }}
              </div>
              <div class="text-xs text-purple-200 mt-1">Amount Invoiced</div>
            </div>
          </div>

          <!-- Total Received Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-teal-500 to-teal-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-teal-200">Total Received</div>
            <div>
              <div class="text-2xl font-bold text-teal-100">
                {{ formatCurrency(projectResource.doc?.total_received) }}
              </div>
              <div class="text-xs text-teal-200 mt-1">Amount Received</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Client Section -->
      <div class="mb-8">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Client</h3>
        <div class="w-full">
          <div class="max-w-sm">
            <PartyCard 
              :party="client" 
              :project-resource="projectResource"
              party-type="Client"
              :show-add-button="!client"
            />
          </div>
        </div>
      </div>

      <!-- Suppliers Section -->
      <div class="mb-8">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Suppliers</h3>
        <div class="flex overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 space-x-4">
          <template v-if="suppliers.length">
            <div 
              v-for="supplier in suppliers" 
              :key="supplier.name"
              class="min-w-[250px]"
            >
              <PartyCard 
                :party="supplier"
                :project-resource="projectResource"
                party-type="Supplier"
              />
            </div>
          </template>
          <div class="min-w-[250px]">
            <PartyCard 
              :project-resource="projectResource"
              party-type="Supplier"
              :show-add-button="true"
            />
          </div>
        </div>
      </div>

      <!-- Consultant Section -->
      <div class="mb-8">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Consultant</h3>
        <div class="w-full">
          <div class="max-w-sm">
            <PartyCard 
              :party="consultant" 
              :project-resource="projectResource"
              party-type="Consultant"
              :show-add-button="!consultant"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Upload Dialog -->
  <Dialog
    v-model="showImageDialog"
    :options="{
      title: 'Update Project Image',
      size: 'sm',
    }"
  >
    <template #body-content>
      <div class="space-y-4">
        <FileUploader
          v-model="newImage"
          :accept="['image/*']"
          :max-size="5000000"
          :upload-args="{
            doctype: 'RUA Project',
            docname: projectResource.doc?.name,
            fieldname: 'image',
            private: false
          }"
          @success="handleUploadSuccess"
          v-slot="{ openFileSelector, file, uploading, progress, error }"
        >
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-900 transition-colors cursor-pointer"
            @click="openFileSelector"
            @dragover.prevent="$event.currentTarget.classList.add('border-gray-900')"
            @dragleave.prevent="$event.currentTarget.classList.remove('border-gray-900')"
            @drop.prevent="handleDrop($event)"
          >
            <div class="flex flex-col items-center justify-center space-y-2">
              <div v-if="!file" class="text-center">
                <FeatherIcon name="upload-cloud" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div class="text-sm font-medium text-gray-900">Click to upload an image</div>
                <div class="text-xs text-gray-500">or drag and drop</div>
              </div>
              <div v-else class="w-full">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <FeatherIcon name="file" class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-900">{{ file.name }}</span>
                  </div>
                  <button 
                    v-if="!uploading" 
                    class="text-sm text-red-500 hover:text-red-700"
                    @click.stop="newImage = null"
                  >
                    Remove
                  </button>
                </div>
                <div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    :style="{ width: progress + '%' }"
                  ></div>
                </div>
              </div>
              <div v-if="error" class="text-sm text-red-500">{{ error }}</div>
            </div>
          </div>
        </FileUploader>
        <div class="text-sm text-gray-500">
          Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
        </div>
      </div>
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button variant="subtle" @click="showImageDialog = false">Cancel</Button>
        <Button
          :loading="isUploading"
          :disabled="!uploadedResult?.file_url"
          @click="updateImage"
        >
          Update Picture
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.carousel-enter-active,
.carousel-leave-active {
  transition: all 0.5s ease;
}

.carousel-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.carousel-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.carousel-enter-to,
.carousel-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  FeatherIcon, 
  LoadingIndicator,
  Dialog, 
  Button,
  FileUploader 
} from 'frappe-ui'
import PartyCard from './PartyCard.vue'
import { documentResource } from '@/data/document'

const currentImageIndex = ref(0)
const projectImages = ref([])
const autoSlideInterval = ref(null)
const isPaused = ref(false)

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'setValue' in value
    }
  }
})

// Image upload state
const showImageDialog = ref(false)
const newImage = ref(null)
const isUploading = ref(false)
const uploadedResult = ref(null)

// Computed properties for filtering parties
const client = computed(() => {
  if (!props.projectResource.doc?.parties) return null
  const parties = typeof props.projectResource.doc.parties === 'string' 
    ? JSON.parse(props.projectResource.doc.parties) 
    : props.projectResource.doc.parties
  return parties?.find(p => p.type === 'Client')
})

const allProjectImages = computed(() => {
  const mainImage = props.projectResource.doc?.image
  return mainImage 
    ? [mainImage, ...projectImages.value]
    : projectImages.value
})

const suppliers = computed(() => {
  if (!props.projectResource.doc?.parties) return []
  const parties = typeof props.projectResource.doc.parties === 'string' 
    ? JSON.parse(props.projectResource.doc.parties) 
    : props.projectResource.doc.parties
  return parties?.filter(p => 
    ['Supplier: Glass', 'Supplier: Cladding', 'Supplier: Aluminum', 'Supplier'].includes(p.type)
  ) || []
})

const consultant = computed(() => {
  if (!props.projectResource.doc?.parties) return null
  const parties = typeof props.projectResource.doc.parties === 'string' 
    ? JSON.parse(props.projectResource.doc.parties) 
    : props.projectResource.doc.parties
  return parties?.find(p => p.type === 'Consultant')
})

// Computed property for profit calculation
const calculateProfit = computed(() => {
  const contract = props.projectResource.doc?.contract_value || 0
  const cost = props.projectResource.doc?.project_cost || 0
  const expenses = props.projectResource.doc?.additional_expenses || 0
  return contract - cost - expenses
})

// Image upload handlers
async function handleUploadSuccess(result) {
  uploadedResult.value = result
}

async function fetchProjectImages() {
  documentResource.filters = [
    ['source_doctype', '=', 'RUA Project'],
    ['for_docname', '=', props.projectResource.doc?.name],
    ['tags', 'like', '%Project Image%']
  ]
  
  try {
    await documentResource.reload()
    if (documentResource.data) {
      projectImages.value = documentResource.data
        .map(doc => doc.document)
        .filter(Boolean)
      // Start autoplay after images are loaded
      startAutoSlide()
    }
  } catch (error) {
    console.error('Error fetching project images:', error)
  }
}

onMounted(() => {
  fetchProjectImages()
})

onUnmounted(() => {
  stopAutoSlide()
})


function nextImage() {
  currentImageIndex.value = (currentImageIndex.value + 1) % allProjectImages.value.length
}

function previousImage() {
  currentImageIndex.value = currentImageIndex.value === 0 
    ? allProjectImages.value.length - 1 
    : currentImageIndex.value - 1
}

function startAutoSlide() {
  if (allProjectImages.value.length <= 1) return
  
  autoSlideInterval.value = setInterval(() => {
    if (!isPaused.value) {
      nextImage()
    }
  }, 5000) // Change slide every 5 seconds
}

function stopAutoSlide() {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}

function pauseAutoSlide() {
  isPaused.value = true
}

function resumeAutoSlide() {
  isPaused.value = false
}



async function updateImage() {
  if (!uploadedResult.value?.file_url) return
  
  try {
    isUploading.value = true
    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      image: uploadedResult.value.file_url
    })
    await props.projectResource.reload()
    showImageDialog.value = false
    newImage.value = null
  } catch (error) {
    console.error('Failed to update project image:', error)
  } finally {
    isUploading.value = false
  }
}

function handleDrop(event) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    event.currentTarget.classList.remove('border-gray-900')
    const input = document.querySelector('input[type="file"]')
    if (input) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }
}

function handleImageClick() {
  showImageDialog.value = true
}

function formatCurrency(value) {
  if (!value) return 'AED 0'
  return `AED ${Math.floor(value).toLocaleString()}`
}
</script>