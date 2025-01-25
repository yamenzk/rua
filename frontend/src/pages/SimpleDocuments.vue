<template>
    <div class="space-y-6">
      <!-- Header with Search and Upload -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <FormControl
            type="search"
            size="sm"
            variant="subtle"
            placeholder="Search documents..."
            v-model="search"
            class="w-64"
          />
        </div>
        <Button variant="solid" @click="showUploadDialog = true">
          <template #prefix>
            <FeatherIcon name="upload" class="w-4 h-4" />
          </template>
          Upload
        </Button>
      </div>
  
      <!-- Tags Navigation -->
      <div class="flex space-x-4 overflow-x-auto pb-2">
        <button
          @click="selectedTag = 'All'"
          class="px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors"
          :class="[
            selectedTag === 'All'
              ? 'border-2 border-gray-900 text-gray-900'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >
          📄 All
        </button>
  
        <button
          v-for="tag in uniqueTags"
          :key="tag"
          @click="selectedTag = tag"
          class="px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors"
          :class="[
            selectedTag === tag
              ? 'border-2 border-gray-900 text-gray-900'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >
          <span class="inline-flex items-center gap-1">
            <span>{{ recommendedTags[tag] || '🏷️' }}</span>
            <span>{{ tag }}</span>
          </span>
        </button>
      </div>
  
      <!-- Document Grid -->
      <div v-if="documentResource.loading" class="flex justify-center py-12">
        <LoadingIndicator />
      </div>
  
      <div v-else-if="!filteredDocuments.length" class="text-center py-12">
        <FeatherIcon name="file" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-base font-medium text-gray-900">No documents found</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ search ? 'Try adjusting your search' : 'Start by uploading a new document' }}
        </p>
      </div>
  
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.name"
          class="group bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
        >
          <!-- Preview -->
          <div class="aspect-[4/3] rounded-t-lg overflow-hidden bg-gray-100 relative">
            <div class="w-full h-full flex items-center justify-center">
              <!-- Image Preview -->
              <div v-if="isImageFile(doc.document)" class="w-full h-full">
                <img
                  :src="doc.document"
                  :alt="doc.document_name"
                  class="w-full h-full object-cover"
                  @error="handlePreviewError"
                />
              </div>
  
              <!-- PDF Preview -->
              <div v-else-if="isPdfFile(doc.document)" class="w-full h-full">
                <iframe
                  :src="doc.document"
                  class="w-full h-full"
                  frameborder="0"
                ></iframe>
              </div>
  
              <!-- Fallback Icon -->
              <div v-else class="text-gray-400">
                <FeatherIcon :name="getFileIcon(doc.document)" class="w-16 h-16" />
              </div>
            </div>
          </div>
  
          <!-- Document Info -->
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-2">
              <FeatherIcon
                :name="getFileIcon(doc.document)"
                class="w-4 h-4 text-gray-400"
              />
              <h3 class="font-medium text-gray-900 truncate">{{ doc.document_name }}</h3>
            </div>
  
            <!-- Tags -->
            <div class="flex flex-wrap gap-1" v-if="doc.tags">
              <span
                v-for="tag in doc.tags.split(',')"
                :key="tag"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
              >
                <span v-if="recommendedTags[tag.trim()]">{{ recommendedTags[tag.trim()] }}</span>
                <span>{{ tag.trim() }}</span>
              </span>
            </div>
  
            <!-- Actions -->
            <div class="flex justify-center gap-2 pt-2 border-t">
              <button
                @click="openDocument(doc.document)"
                class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title="View"
              >
                <FeatherIcon name="eye" class="w-4 h-4" />
              </button>
              <button
                @click="downloadDocument(doc.document)"
                class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title="Download"
              >
                <FeatherIcon name="download" class="w-4 h-4" />
              </button>
              <button
                @click="openEditDialog(doc)"
                class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title="Edit"
              >
                <FeatherIcon name="edit-2" class="w-4 h-4" />
              </button>
              <button
                @click="deleteDocument(doc)"
                class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title="Delete"
              >
                <FeatherIcon name="trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Upload Dialog -->
      <Dialog
        v-model="showUploadDialog"
        :options="{
          title: 'Upload Document',
          size: 'lg',
        }"
      >
        <template #body-content>
          <div class="space-y-6">
            <!-- File Upload -->
            <FileUploader
              v-model="newDocument.file"
              :upload-args="{
                is_private: 0,
              }"
              @success="handleUploadSuccess"
              v-slot="{ openFileSelector, file, uploading, progress, error }"
            >
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-900 transition-colors cursor-pointer"
                @click="openFileSelector"
              >
                <div class="flex flex-col items-center justify-center space-y-2">
                  <div v-if="!file" class="text-center">
                    <FeatherIcon
                      name="upload-cloud"
                      class="w-8 h-8 text-gray-400 mx-auto mb-2"
                    />
                    <div class="text-sm font-medium text-gray-900">
                      Click to upload a document
                    </div>
                    <div class="text-xs text-gray-500">
                      Supported formats: Images, PDFs, Office files, and CAD drawings
                    </div>
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
                        @click.stop="newDocument.file = null"
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
                </div>
                <div v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</div>
              </div>
            </FileUploader>
  
            <!-- Document Details -->
            <div class="space-y-4">
              <FormControl
                type="text"
                label="Document Name"
                v-model="newDocument.document_name"
                required
              />
  
              <div class="space-y-2">
                <FormControl
                  type="text"
                  label="Tags (comma separated)"
                  v-model="newDocument.tags"
                  placeholder="e.g. Drawings, Specifications"
                />
  
                <div class="space-y-2">
                  <label class="text-sm text-gray-600">Common Tags</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="(emoji, tag) in recommendedTags"
                      :key="tag"
                      @click="addTag(tag)"
                      class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                      :class="{ 'opacity-50 cursor-not-allowed': hasTag(tag) }"
                      :disabled="hasTag(tag)"
                    >
                      <span>{{ emoji }}</span>
                      <span>{{ tag }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
  
        <template #actions>
          <div class="flex justify-end gap-2">
            <Button variant="subtle" @click="showUploadDialog = false">Cancel</Button>
            <Button
              variant="solid"
              :loading="uploading"
              :disabled="!isValidNewDocument"
              @click="submitDocument"
            >
              Upload Document
            </Button>
          </div>
        </template>
      </Dialog>
  
      <!-- Edit Dialog -->
      <Dialog
        v-model="showEditDialog"
        :options="{
          title: 'Edit Document',
          size: 'md',
        }"
      >
        <template #body-content>
          <div v-if="editingDocument" class="space-y-4">
            <FormControl
              type="text"
              label="Document Name"
              required
              v-model="editingDocument.document_name"
            />
  
            <div class="space-y-2">
              <FormControl
                type="text"
                label="Tags"
                v-model="editingDocument.tags"
              />
  
              <div class="space-y-2">
                <label class="text-sm text-gray-600">Common Tags</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(emoji, tag) in recommendedTags"
                    :key="tag"
                    @click="addTagToEditingDoc(tag)"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                    :class="{ 'opacity-50 cursor-not-allowed': hasTagInEditingDoc(tag) }"
                    :disabled="hasTagInEditingDoc(tag)"
                  >
                    <span>{{ emoji }}</span>
                    <span>{{ tag }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
  
        <template #actions>
          <div class="flex justify-end gap-2">
            <Button variant="subtle" @click="showEditDialog = false">Cancel</Button>
            <Button variant="solid" @click="saveDocumentChanges">Save Changes</Button>
          </div>
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import {
    Button,
    FormControl,
    Dialog,
    FeatherIcon,
    FileUploader,
    LoadingIndicator,
  } from 'frappe-ui'
  import { documentResource } from '@/data/document'
  
  const props = defineProps({
    sourceType: {
      type: String,
      required: true
    },
    sourceName: {
      type: String,
      required: true
    }
  })
  
  // Recommended tags - customize these based on your needs
  const recommendedTags = {
    'Drawings': '📐',
    'Specifications': '📋',
    'Reports': '📊',
    'Contracts': '📝',
    'Approvals': '✅',
    'Correspondence': '✉️',
    'Photos': '📸',
    'Presentations': '📢'
  }
  
  // State
  const search = ref('')
  const selectedTag = ref('All')
  const showUploadDialog = ref(false)
  const showEditDialog = ref(false)
  const uploading = ref(false)
  const editingDocument = ref(null)
  
  const newDocument = ref({
    file: null,
    document_name: '',
    tags: '',
    document: null
  })
  
  // Load documents for this source
  documentResource.filters = [
    ['source_doctype', '=', props.sourceType],
    ['for_docname', '=', props.sourceName]
  ]
  documentResource.reload()
  
  // Computed
  const filteredDocuments = computed(() => {
    if (!documentResource.data) return []
  
    let docs = documentResource.data
  
    // Search filter
    if (search.value) {
      const searchTerm = search.value.toLowerCase()
      docs = docs.filter(doc => 
        doc.document_name.toLowerCase().includes(searchTerm) ||
        doc.tags?.toLowerCase().includes(searchTerm)
      )
    }
  
    // Tag filter
    if (selectedTag.value !== 'All') {
      docs = docs.filter(doc => {
        const docTags = doc.tags?.split(',').map(t => t.trim())
      return docTags?.includes(selectedTag.value)
    })
  }

  return docs
})

const uniqueTags = computed(() => {
  if (!documentResource.data) return []
  
  const allTags = documentResource.data.flatMap(doc => 
    doc.tags?.split(',').map(tag => tag.trim())
  ) || []

  return [...new Set(allTags.filter(Boolean))].sort()
})

const isValidNewDocument = computed(() => {
  return newDocument.value.document && newDocument.value.document_name
})

// Methods
function isImageFile(url) {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext))
}

function isPdfFile(url) {
  if (!url) return false
  return url.toLowerCase().endsWith('.pdf')
}

function getFileIcon(url) {
  if (!url) return 'file'
  const extension = url.split('.').pop().toLowerCase()

  const iconMap = {
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    xls: 'grid',
    xlsx: 'grid',
    ppt: 'monitor',
    pptx: 'monitor',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    dwg: 'pen-tool',  // AutoCAD drawings
    dxf: 'pen-tool',  // AutoCAD exchange format
    rvt: 'home',      // Revit files
    zip: 'archive',
    rar: 'archive'
  }

  return iconMap[extension] || 'file'
}

function handlePreviewError(event) {
  event.target.style.display = 'none'
  event.target.parentElement.innerHTML = `
    <div class="text-gray-400 flex items-center justify-center h-full">
      <i data-feather="file" class="w-16 h-16"></i>
    </div>
  `
}

function openDocument(url) {
  window.open(url, '_blank')
}

function downloadDocument(url) {
  const link = document.createElement('a')
  link.href = url
  link.download = url.split('/').pop()
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function deleteDocument(doc) {
  if (!confirm(`Are you sure you want to delete "${doc.document_name}"?`)) return

  try {
    await documentResource.delete.submit(doc.name)
    await documentResource.reload()
  } catch (error) {
    console.error('Error deleting document:', error)
  }
}

// Tag Management
function addTag(newTag) {
  if (hasTag(newTag)) return

  const currentTags = newDocument.value.tags
    ? newDocument.value.tags.split(',').map(t => t.trim())
    : []

  currentTags.push(newTag)
  newDocument.value.tags = currentTags.join(', ')
}

function hasTag(tag) {
  if (!newDocument.value.tags) return false
  const currentTags = newDocument.value.tags.split(',').map(t => t.trim())
  return currentTags.includes(tag)
}

function addTagToEditingDoc(newTag) {
  if (hasTagInEditingDoc(newTag)) return

  const currentTags = editingDocument.value.tags
    ? editingDocument.value.tags.split(',').map(t => t.trim())
    : []

  currentTags.push(newTag)
  editingDocument.value.tags = currentTags.join(', ')
}

function hasTagInEditingDoc(tag) {
  if (!editingDocument.value?.tags) return false
  const currentTags = editingDocument.value.tags.split(',').map(t => t.trim())
  return currentTags.includes(tag)
}

// Upload and Edit Functions
async function handleUploadSuccess(result) {
  newDocument.value.document = result.file_url
}

async function submitDocument() {
  if (!isValidNewDocument.value) return

  try {
    uploading.value = true
    await documentResource.insert.submit({
      source_doctype: props.sourceType,
      for_docname: props.sourceName,
      document_name: newDocument.value.document_name,
      document: newDocument.value.document,
      tags: newDocument.value.tags
    })

    // Reset form
    newDocument.value = {
      file: null,
      document_name: '',
      tags: '',
      document: null
    }

    showUploadDialog.value = false
    await documentResource.reload()
  } catch (error) {
    console.error('Error uploading document:', error)
  } finally {
    uploading.value = false
  }
}

function openEditDialog(doc) {
  editingDocument.value = { ...doc }
  showEditDialog.value = true
}

async function saveDocumentChanges() {
  if (!editingDocument.value) return

  try {
    await documentResource.setValue.submit({
      name: editingDocument.value.name,
      document_name: editingDocument.value.document_name,
      tags: editingDocument.value.tags
    })

    showEditDialog.value = false
    editingDocument.value = null
    await documentResource.reload()
  } catch (error) {
    console.error('Error updating document:', error)
  }
}
</script>