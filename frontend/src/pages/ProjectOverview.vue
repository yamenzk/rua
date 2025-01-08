<template>
  <div class="space-y-8" v-if="projectResource">
    <!-- Hero Image Section -->
    <div class="relative h-64 md:h-96">
      <div 
        class="w-full h-full"
        :class="{ 'cursor-pointer': isManager }"
        @click.stop="isManager && handleImageClick()"
      >
        <img
          v-if="project?.image"
          :src="project.image"
          :alt="project?.project_name"
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
                  {{ project?.project_name }}
                </h1>
                <div 
                  class="flex items-center mt-2 text-white/80"
                  :class="{ 'cursor-pointer hover:text-white': isManager }"
                  @click="isManager && openLocationDialog()"
                >
                  <FeatherIcon name="map-pin" class="w-4 h-4 mr-1" />
                  <span class="text-sm">{{ project?.location || 'Add location' }}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold">{{ project?.completion_percentage || 0 }}%</div>
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
        <p class="text-gray-900 whitespace-pre-wrap">{{ project?.description || 'No description available' }}</p>
      </div>

      <!-- Key Details -->
      <div class="bg-white rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Contract Value -->
          <div>
            <div class="text-sm font-medium text-gray-500 mb-1">Contract Value</div>
            <div class="text-xl font-semibold text-gray-900">
              {{ formatCurrency(project?.contract_value) }}
            </div>
          </div>

          <!-- Status -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm font-medium text-gray-500 mb-1">Status</div>
            <div class="flex items-center">
              <div 
                class="w-2 h-2 rounded-full mr-2"
                :class="{
                  'bg-purple-500': project?.status === 'Tender',
                  'bg-blue-500': project?.status === 'Job In Hand',
                  'bg-yellow-500': project?.status === 'In Progress',
                  'bg-green-500': project?.status === 'Completed',
                  'bg-red-500': project?.status === 'Cancelled'
                }"
              ></div>
              <span class="text-gray-900">{{ project?.status || 'Not Set' }}</span>
            </div>
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
            docname: project?.name,
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  FeatherIcon, 
  LoadingIndicator, 
  Dialog, 
  Button, 
  FormControl, 
  FileUploader,
  toast
} from 'frappe-ui'
import { session } from '../data/session'

const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  projectResource: {
    type: Object,
    required: true
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

// Form values
const newImage = ref(null)
const newName = ref('')
const newLocation = ref('')
const nameError = ref('')
const isUploading = ref(false)
const uploadedResult = ref(null)

async function handleUploadSuccess(result) {
  uploadedResult.value = result
}

async function updateImage() {
  if (!uploadedResult.value?.file_url) return
  
  try {
    isUploading.value = true
    await props.projectResource.setValue.submit({
      image: uploadedResult.value.file_url
    })
    await props.projectResource.reload()
    showImageDialog.value = false
    newImage.value = null
    uploadedResult.value = null
  } catch (error) {
    console.error('Failed to update project image:', error)
  } finally {
    isUploading.value = false
  }
}

// Dialog open handlers with initial values
function openNameDialog() {
  if (!isManager.value) {
    toast.error('Only managers can edit project name')
    return
  }
  newName.value = props.project?.project_name || ''
  showNameDialog.value = true
}

function openLocationDialog() {
  if (!isManager.value) {
    toast.error('Only managers can edit project location')
    return
  }
  newLocation.value = props.project?.location || ''
  showLocationDialog.value = true
}

function handleImageClick() {
  if (!isManager.value) {
    return
  }
  showImageDialog.value = true
}

// Update handlers
async function updateName() {
  if (!newName.value.trim()) {
    nameError.value = 'Project name is required'
    return
  }

  try {
    await props.projectResource.setValue.submit({
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
      location: newLocation.value
    })
    showLocationDialog.value = false
    newLocation.value = ''
  } catch (error) {
    console.error('Failed to update location:', error)
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

function formatCurrency(value) {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}
</script>