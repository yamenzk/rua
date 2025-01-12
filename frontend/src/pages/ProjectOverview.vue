# ProjectOverview.vue
<template>
  <!-- Loading State -->
  <div v-if="!props.projectResource?.doc" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>
  <div class="space-y-8" v-if="projectResource">
    <!-- Hero Image Section -->
    <div class="relative h-64 md:h-96">
      <div 
        class="w-full h-full"
        :class="{ 'cursor-pointer': isManager }"
        @click.stop="isManager && handleImageClick()"
      >
        <img
          v-if="props.projectResource.doc?.image"
          :src="props.projectResource.doc.image"
          :alt="props.projectResource.doc?.project_name"
          class="w-full h-full object-cover"
          @error="$event.target.style.display='none'"
        />
        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
          <FeatherIcon name="image" class="w-12 h-12 text-gray-400" />
        </div>
        
        <!-- Hover overlay -->
        <div 
          v-if="isManager"
          class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <div class="text-white flex items-center">
            <FeatherIcon name="edit-2" class="w-5 h-5 mr-2" />
            <span>Change Image</span>
          </div>
        </div>
        
        <!-- Completion overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div class="w-full p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h1 
                  class="text-2xl font-bold"
                  :class="{ 'cursor-pointer': isManager }"
                  @click="isManager && openNameDialog()"
                >
                  {{ props.projectResource.doc?.project_name }}
                </h1>
                <div 
                  class="flex items-center mt-2 text-white/80"
                  :class="{ 'cursor-pointer hover:text-white': isManager }"
                  @click="isManager && openLocationDialog()"
                >
                  <FeatherIcon name="map-pin" class="w-4 h-4 mr-1" />
                  <span class="text-sm">{{ props.projectResource.doc?.location || 'Add location' }}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold">{{ props.projectResource.doc?.completion_percentage || 0 }}%</div>
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
        <p class="text-gray-900 whitespace-pre-wrap">{{ props.projectResource.doc?.description || 'No description available' }}</p>
      </div>

      <!-- Key Details -->
      <div class="mb-8">
        <h3 class="text-sm font-medium text-gray-500 mb-4">Project Overview</h3>
        <div class="flex overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 space-x-4">
          <!-- Contract Value Card -->
          <div 
            class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-blue-500 to-blue-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between"
            :class="{ 'cursor-pointer hover:shadow-lg transition-shadow': isManager }"
            @click="isManager && openContractValueDialog()"
          >
            <div class="text-sm font-bold text-blue-200">Contract Value</div>
            <div>
              <div class="text-2xl font-bold text-blue-100">
                {{ formatCurrency(props.projectResource.doc?.contract_value) }}
              </div>
              <div class="text-xs text-blue-200 mt-1">Total Project Value</div>
            </div>
          </div>

          <!-- Project Cost Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-red-500 to-red-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-red-200">Project Cost</div>
            <div>
              <div class="text-2xl font-bold text-red-100">
                {{ formatCurrency(450000) }}
              </div>
              <div class="text-xs text-red-200 mt-1">Estimated Cost</div>
            </div>
          </div>

          <!-- Additional Expenses Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-orange-500 to-orange-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-orange-200">Additional Expenses</div>
            <div>
              <div class="text-2xl font-bold text-orange-100">
                {{ formatCurrency(32000) }}
              </div>
              <div class="text-xs text-orange-200 mt-1">Extra Costs</div>
            </div>
          </div>

          <!-- Project Profit Card -->
          <div class="min-w-[200px] max-w-[300px] bg-gradient-to-br from-green-500 to-green-800 rounded-lg p-6 shadow-md h-32 flex flex-col justify-between">
            <div class="text-sm font-medium text-green-200">Project Profit</div>
            <div>
              <div class="text-2xl font-bold text-green-100">
                {{ formatCurrency(props.projectResource.doc?.contract_value - 450000 - 32000) }}
              </div>
              <div class="text-xs text-green-200 mt-1">Expected Profit</div>
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
              :project-resource="props.projectResource"
              party-type="Client"
              :show-add-button="!client && isManager"
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
                :project-resource="props.projectResource"
                party-type="Supplier"
              />
            </div>
          </template>
          <div v-if="isManager" class="min-w-[250px]">
            <PartyCard 
              :project-resource="props.projectResource"
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
              :project-resource="props.projectResource"
              :project="props.projectResource.doc"
              party-type="Consultant"
              :show-add-button="!consultant && isManager"
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
            docname: props.projectResource.doc?.name,
            fieldname: 'image',
            private: false
          }"
          @success="handleUploadSuccess"
          v-slot="{ openFileSelector, file, uploading, progress, error }"
        >
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
            @click="openFileSelector"
            @dragover.prevent="$event.currentTarget.classList.add('border-blue-500')"
            @dragleave.prevent="$event.currentTarget.classList.remove('border-blue-500')"
            @drop.prevent="handleDrop($event, openFileSelector)"
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
                    class="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
        <Button
          variant="subtle"
          @click="showImageDialog = false"
        >
          Cancel
        </Button>
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

  <!-- Project Name Dialog -->
  <Dialog
    v-model="showNameDialog"
    :options="{
      title: 'Update Project Name',
      size: 'sm',
    }"
  >
    <template #body-content>
      <FormControl
        type="text"
        label="Project Name"
        v-model="newName"
        :error="nameError"
      />
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button
          variant="subtle"
          @click="showNameDialog = false"
        >
          Cancel
        </Button>
        <Button
          :loading="projectResource.setValue.loading"
          @click="updateName"
        >
          Update Name
        </Button>
      </div>
    </template>
  </Dialog>

  <!-- Location Dialog -->
  <Dialog
    v-model="showLocationDialog"
    :options="{
      title: 'Update Project Location',
      size: 'sm',
    }"
  >
    <template #body-content>
      <FormControl
        type="text"
        label="Location"
        v-model="newLocation"
      />
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button
          variant="subtle"
          @click="showLocationDialog = false"
        >
          Cancel
        </Button>
        <Button
          :loading="projectResource.setValue.loading"
          @click="updateLocation"
        >
          Update Location
        </Button>
      </div>
    </template>
  </Dialog>

  <!-- Contract Value Dialog -->
  <Dialog
    v-model="showContractValueDialog"
    :options="{
      title: 'Update Contract Value',
      size: 'sm',
    }"
  >
    <template #body-content>
      <FormControl
        type="number"
        label="Contract Value"
        v-model="newContractValue"
      />
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button
          variant="subtle"
          @click="showContractValueDialog = false"
        >
          Cancel
        </Button>
        <Button
          :loading="projectResource.setValue.loading"
          @click="updateContractValue"
        >
          Update Value
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  FeatherIcon, 
  LoadingIndicator,
  Dialog, 
  Button, 
  FormControl, 
  FileUploader
} from 'frappe-ui'
import { session } from '../data/session'
import PartyCard from './PartyCard.vue'

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'setValue' in value
    }
  }
})

// Role-based access control
const isManager = computed(() => {
  return session.userRoles.some(role => ['RUA Manager', 'RUA Project Manager'].includes(role))
})

// Dialog states
const showImageDialog = ref(false)
const showNameDialog = ref(false)
const showLocationDialog = ref(false)
const showContractValueDialog = ref(false)

// Form values
const newImage = ref(null)
const newName = ref('')
const newLocation = ref('')
const newContractValue = ref('')
const nameError = ref('')
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

// Dialog handlers
async function handleUploadSuccess(result) {
  uploadedResult.value = result
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

function handleDrop(event, openFileSelector) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    event.currentTarget.classList.remove('border-blue-500')
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
  if (!isManager.value) {
    return
  }
  showImageDialog.value = true
}

function openNameDialog() {
  if (!isManager.value) {
    return
  }
  newName.value = props.projectResource.doc?.project_name || ''
  showNameDialog.value = true
}

function openLocationDialog() {
  if (!isManager.value) {
    return
  }
  newLocation.value = props.projectResource.doc?.location || ''
  showLocationDialog.value = true
}

function openContractValueDialog() {
  if (!isManager.value) {
    return
  }
  newContractValue.value = props.projectResource.doc?.contract_value || ''
  showContractValueDialog.value = true
}

async function updateName() {
  if (!newName.value.trim()) {
    nameError.value = 'Project name is required'
    return
  }

  try {
    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      project_name: newName.value
    })
    showNameDialog.value = false
    newName.value = ''
    nameError.value = ''
  } catch (error) {
    console.error('Failed to update name:', error)
  }
}

async function updateLocation() {
  try {
    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      location: newLocation.value
    })
    showLocationDialog.value = false
    newLocation.value = ''
  } catch (error) {
    console.error('Failed to update location:', error)
  }
}

async function updateContractValue() {
  if (!newContractValue.value) return

  try {
    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      contract_value: newContractValue.value
    })
    showContractValueDialog.value = false
    newContractValue.value = ''
  } catch (error) {
    console.error('Failed to update contract value:', error)
  }
}

function formatCurrency(value) {
  if (!value) return 'AED 0'
  return `AED ${Math.floor(value).toLocaleString()}`
}
</script>