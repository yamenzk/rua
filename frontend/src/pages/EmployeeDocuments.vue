<template>
	<div class="">
	  <!-- Combined Header and Navigation Card -->
	  <div class="bg-white rounded-lg border">
		<div class="sticky top-0 z-10 bg-white">
		  <div class="px-6 py-3">
			<div class="flex flex-col space-y-4">
			  <!-- Title and Actions -->
			  <div class="flex items-center justify-between">
				<div>
				  <h2 class="text-lg font-medium text-gray-900">Documents</h2>
				  <p class="text-sm text-gray-500">Upload and manage your documents</p>
				</div>
				<div class="flex gap-2">
				  <Button
					v-if="selectedDocuments.length > 0"
					variant="subtle"
					@click="showMergeDialog = true"
					class="bg-primary-50 text-primary-700 hover:bg-primary-100"
				  >
					<div class="flex items-center gap-2">
					  <FeatherIcon name="file-text" class="w-4 h-4" />
					  <span class="hidden sm:inline">Merge Selected</span>
					  <span class="inline-flex items-center justify-center w-5 h-5 text-xs bg-primary-100 text-primary-800 rounded-full">
						{{ selectedDocuments.length }}
					  </span>
					</div>
				  </Button>
				  <Button variant="solid" @click="showUploadDialog = true">
					<div class="flex items-center gap-2">
					  <FeatherIcon name="upload" class="w-4 h-4" />
					  <span class="hidden sm:inline">Upload</span>
					</div>
				  </Button>
				</div>
			  </div>
  
			  <!-- Tags Navigation -->
			  <div class="flex items-center gap-2 overflow-x-auto">
				<!-- All Documents Tab -->
				<div 
				  @click="selectedTag = 'All'"
				  class="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer select-none transition-colors"
				  :class="[
					selectedTag === 'All' 
					  ? 'bg-gray-900 text-white' 
					  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
				  ]"
				>
				  <span class="text-sm whitespace-nowrap">📄 All Documents</span>
				</div>
  
				<!-- Regular Tags -->
				<div 
				  v-for="tag in uniqueTags"
				  :key="tag"
				  v-show="tag !== 'Expired Documents'"
				  @click="selectedTag = tag"
				  class="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer select-none transition-colors"
				  :class="[
					selectedTag === tag 
					  ? 'bg-gray-900 text-white' 
					  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
				  ]"
				>
				  <span class="text-sm whitespace-nowrap">
					{{ recommendedTags[tag] || '🏷️' }}
					{{ tag }}
				  </span>
				</div>
  
				<!-- Expired Documents Tab -->
				<div 
				  @click="selectedTag = 'Expired Documents'"
				  class="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer select-none transition-colors"
				  :class="[
					selectedTag === 'Expired Documents'
					  ? 'bg-red-600 text-white'
					  : hasExpiredDocuments
						? 'bg-red-50 hover:bg-red-100 text-red-600'
						: 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
				  ]"
				>
				  <span class="text-sm whitespace-nowrap flex items-center gap-2">
					🗑️ Expired Documents
					<span
					  v-if="hasExpiredDocuments"
					  class="inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full"
					  :class="[
						selectedTag === 'Expired Documents'
						  ? 'bg-red-500 text-white'
						  : 'bg-red-100 text-red-700'
					  ]"
					>
					  {{ expiredDocumentsCount }}
					</span>
				  </span>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
  
	  <!-- Document Grid Card -->
	  <div class="">
		<div class="p-6">
		  <!-- Document Grid -->
		  <div
			v-if="filteredDocuments.length"
			class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
		  >
			<div
				v-for="doc in filteredDocuments"
				:key="doc.name"
				class="document-card group bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col"
				:class="{ 'ring-2 ring-gray-900': isSelected(doc) }"
				:data-document-id="doc.name"
				@dblclick="handleCardInteraction(doc, $event)"
			>
				<!-- Document Preview -->
				<div class="aspect-[4/3] rounded-t-lg overflow-hidden bg-gray-100 relative">
					<div class="absolute top-2 left-2">
							<div
								class="px-2 py-1 mt-2 rounded-full w-fit text-xs font-medium"
								:class="getExpiryStatusClass(doc.expiry_date)"
							>
								{{ getExpiryStatus(doc.expiry_date) }}
							</div>
						</div>
					<!-- Document Preview -->
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

						<!-- Video Preview -->
						<div v-else-if="isVideoFile(doc.document)" class="w-full h-full">
							<video
								:src="doc.document"
								controls
								class="w-full h-full object-contain"
							>
								Your browser does not support the video tag.
							</video>
						</div>

						<!-- Audio Preview -->
						<div
							v-else-if="isAudioFile(doc.document)"
							class="w-full h-full flex items-center justify-center"
						>
							<audio :src="doc.document" controls class="w-4/5">
								Your browser does not support the audio tag.
							</audio>
						</div>

						<!-- PDF Preview -->
						<div v-else-if="isPdfFile(doc.document)" class="w-full h-full">
							<iframe
								:src="doc.document"
								class="w-full h-full"
								type="application/pdf"
								frameborder="0"
							></iframe>
						</div>

						<!-- Microsoft Office Preview -->
						<div v-else-if="isMicrosoftFile(doc.document)" class="w-full h-full">
							<iframe
								:src="getMicrosoftPreviewUrl(doc.document)"
								class="w-full h-full"
								frameborder="0"
								allowfullscreen
							></iframe>
						</div>

						<!-- Fallback Icon -->
						<div v-else class="text-gray-400">
							<FeatherIcon :name="getFileIcon(doc.document)" class="w-16 h-16" />
						</div>
					</div>
				</div>

				<!-- Document Info -->
				<div class="p-4 space-y-2 flex flex-col justify-between flex-grow">
					<!-- Document Title and Type -->
					<div class="flex items-center gap-2">
						<FeatherIcon
							:name="getFileIcon(doc.document)"
							class="w-4 h-4 text-gray-400"
						/>
						<h3 class="font-medium text-gray-900">{{ doc.document_name }}</h3>
					</div>

					<!-- Enhanced Tags Display -->
					<div class="flex flex-wrap gap-1">
						<span
							v-for="tag in doc.tags?.split(',')"
							:key="tag"
							class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
						>
							<span v-if="recommendedTags[tag.trim()]">{{
								recommendedTags[tag.trim()]
							}}</span>
							<span>{{ tag.trim() }}</span>
						</span>
					</div>

					<div class="text-sm text-gray-500 space-y-1" v-if='doc.document_number'>
						<div class="flex items-center justify-between flex-grow">
							<div
								class="flex items-center gap-2 cursor-pointer hover:text-gray-700"
								@click="copyDocNumber(doc)"
							>
								<FeatherIcon name="hash" class="w-4 h-4" />
								<span>{{ doc.document_number || '' }}</span>
							</div>
							<span v-if="doc.showCopied" class="text-xs text-green-600"
								>Copied!</span
							>
						</div>
						
					</div>

					<!-- Action Buttons -->
					<div class="flex justify-center gap-2 pt-2 border-t">
						<button
							@click.stop="openDocument(doc.document)"
							class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
							title="View"
						>
							<FeatherIcon name="eye" class="w-4 h-4" />
						</button>
						<button
							@click.stop="downloadDocument(doc.document)"
							class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
							title="Download"
						>
							<FeatherIcon name="download" class="w-4 h-4" />
						</button>
						<button
							@click.stop="showQrCode(doc)"
							class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
							title="QR Code"
						>
							<FeatherIcon name="maximize" class="w-4 h-4" />
						</button>
						<button
							@click.stop="shareDocument(doc)"
							class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
							title="Share"
							v-if="canShare"
						>
							<FeatherIcon name="share-2" class="w-4 h-4" />
						</button>
						<button
							@click.stop="deleteDocument(doc)"
							class="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
							title="Delete"
						>
							<FeatherIcon name="trash-2" class="w-4 h-4" />
						</button>
						<div>
							<label class="cursor-pointer">
								<input
									type="checkbox"
									:checked="isSelected(doc)"
									@change="toggleSelection(doc)"
									class="w-4 h-4 rounded border-gray-400 text-gray-900 focus:ring-gray-900"
								/>
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-12">
			<FeatherIcon name="file" class="mx-auto h-12 w-12 text-gray-400" />
			<h3 class="mt-2 text-sm font-medium text-gray-900">No documents</h3>
			<p class="mt-1 text-sm text-gray-500">
				{{
					selectedTag === 'All'
						? 'Get started by uploading a new document.'
						: `No documents found with tag "${selectedTag}".`
				}}
			</p>
		</div>
	</div>
</div>

		<!-- Update Dialog -->
		<Dialog
			v-model="showEditDialog"
			:options="{
				title: 'Edit Document',
				size: 'lg',
			}"
		>
			<template #body-content>
				<div v-if="editingDocument" class="space-y-4">
					<!-- Document Preview -->
					<div
						class="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
					>
						<div class="text-gray-400 flex flex-col items-center">
							<FeatherIcon
								:name="getFileIcon(editingDocument.document)"
								class="w-16 h-16"
							/>
							<p class="mt-1 text-sm text-gray-900">
								{{ editingDocument.document_name }}
							</p>
						</div>
					</div>

					<!-- Edit Form -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormControl
							type="text"
							label="Document Name"
							required
							v-model="editingDocument.document_name"
						/>

						<FormControl
							type="text"
							label="Document Number"
							v-model="editingDocument.document_number"
						/>

						<FormControl
							type="text"
							label="Place of Issue"
							v-model="editingDocument.place_of_issue"
						/>

						<FormControl
							type="date"
							label="Issue Date"
							required
							v-model="editingDocument.issue_date"
						/>

						<FormControl
							type="date"
							label="Expiry Date"
							required
							v-model="editingDocument.expiry_date"
						/>

						<div class="md:col-span-2 space-y-2">
							<FormControl
								type="text"
								label="Tags (comma separated)"
								v-model="editingDocument.tags"
							/>

							<!-- Recommended Tags -->
							<div class="space-y-2">
								<label class="text-sm text-gray-600">Recommended Tags</label>
								<div class="flex flex-wrap gap-2">
									<button
										v-for="(emoji, tag) in recommendedTags"
										:key="tag"
										@click="addTagToEditingDoc(tag)"
										class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
										:class="{
											'opacity-50 cursor-not-allowed':
												hasTagInEditingDoc(tag),
										}"
										:disabled="hasTagInEditingDoc(tag)"
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
					<Button variant="subtle" @click="showEditDialog = false"> Cancel </Button>
					<Button variant="solid" @click="saveDocumentChanges"> Save Changes </Button>
				</div>
			</template>
		</Dialog>

		<!-- Upload Dialog -->
		<Dialog
			v-model="showUploadDialog"
			:options="{
				title: 'Upload Document',
				size: 'lg',
			}"
		>
			<template #body-content>
				<div class="space-y-4">
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
										Supported formats: Images, PDFs, Office files, Audio, and
										Video (up to 5MB)
									</div>
								</div>
								<div v-else class="w-full">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center space-x-2">
											<FeatherIcon
												name="file"
												class="w-4 h-4 text-gray-400"
											/>
											<span class="text-sm text-gray-900">{{
												file.name
											}}</span>
										</div>
										<button
											v-if="!uploading"
											class="text-sm text-red-500 hover:text-red-700"
											@click.stop="newDocument.file = null"
										>
											Remove
										</button>
									</div>
									<div
										v-if="uploading"
										class="w-full bg-gray-200 rounded-full h-2"
									>
										<div
											class="bg-blue-500 h-2 rounded-full transition-all duration-300"
											:style="{ width: progress + '%' }"
										></div>
									</div>
								</div>
							</div>
							<div v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</div>
						</div>
					</FileUploader>

					<!-- Document Details Form -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormControl
							type="text"
							label="Document Name"
							required
							v-model="newDocument.document_name"
						/>

						<FormControl
							type="text"
							label="Document Number"
							v-model="newDocument.document_number"
						/>

						<FormControl
							type="date"
							label="Issue Date"
							v-model="newDocument.issue_date"
						/>

						<FormControl
							type="date"
							label="Expiry Date"
							v-model="newDocument.expiry_date"
						/>

						<!-- Enhanced Tags Input -->
						<!-- Enhanced Tags Input -->
						<div class="md:col-span-2 space-y-2">
							<FormControl
								type="text"
								label="Tags (comma separated)"
								placeholder="e.g. Personal, Identity"
								v-model="newDocument.tags"
							/>

							<!-- Recommended Tags -->
							<div class="space-y-2">
								<label class="text-sm text-gray-600">Recommended Tags</label>
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
					<Button variant="subtle" @click="showUploadDialog = false"> Cancel </Button>
					<Button
						variant="solid"
						:loading="uploading"
						:disabled="!canSubmit"
						@click="submitDocument"
					>
						Upload Document
					</Button>
				</div>
			</template>
		</Dialog>

		<!-- QR Code Dialog -->
		<Dialog
			v-model="showQrDialog"
			:options="{
				title: 'Document QR Code',
				size: 'sm',
			}"
		>
			<template #body-content>
				<div class="flex flex-col items-center space-y-4">
					<img
						v-if="selectedDoc"
						:src="getQrCodeUrl(selectedDoc.document)"
						:alt="'QR Code for ' + selectedDoc.document_name"
						class="w-48 h-48"
					/>
					<p class="text-sm text-gray-500 text-center">
						Scan this QR code to access the document
					</p>
				</div>
			</template>

			<template #actions>
				<div class="flex justify-end">
					<Button variant="subtle" @click="showQrDialog = false"> Close </Button>
				</div>
			</template>
		</Dialog>

		<!-- Merge Dialog -->
		<Dialog
			v-model="showMergeDialog"
			:options="{
				title: 'Merge Documents',
				size: 'lg',
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<p class="text-sm text-gray-500">
						Drag and drop to reorder documents. The final PDF will be merged in this
						order.
					</p>

					<!-- Draggable Document List -->
					<VueDraggable
						v-model="selectedDocuments"
						:item-key="'name'"
						class="space-y-2"
						handle=".drag-handle"
					>
						<template #item="{ element: doc }">
							<div
								class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
								:class="{
									'opacity-50': !isValidFileType(doc.document),
								}"
							>
								<button
									class="drag-handle cursor-move text-gray-400 hover:text-gray-600"
								>
									<FeatherIcon name="menu" class="w-4 h-4" />
								</button>
								<FeatherIcon
									:name="getFileIcon(doc.document)"
									class="w-4 h-4"
									:class="
										isValidFileType(doc.document)
											? 'text-gray-400'
											: 'text-red-400'
									"
								/>
								<div class="flex-1 min-w-0">
									<span class="block text-sm font-medium text-gray-700 truncate">
										{{ doc.document_name }}
									</span>
									<span
										v-if="!isValidFileType(doc.document)"
										class="text-xs text-red-500"
									>
										Unsupported file type
									</span>
								</div>
								<button
									@click="toggleSelection(doc)"
									class="text-gray-400 hover:text-gray-600"
								>
									<FeatherIcon name="x" class="w-4 h-4" />
								</button>
							</div>
						</template>
					</VueDraggable>
					<!-- Document Count -->
					<div class="text-sm text-gray-500">
						{{ validDocumentsCount }} document{{
							validDocumentsCount !== 1 ? 's' : ''
						}}
						will be merged
					</div>

					<div class="flex items-center justify-between pt-4 border-t">
						<!-- File Name Input -->
						<div class="flex-1 max-w-xs">
							<FormControl
								type="text"
								label="Output File Name"
								v-model="mergeFileName"
								placeholder="merged_documents.pdf"
							/>
						</div>
					</div>
				</div>
			</template>

			<template #actions>
				<div class="flex justify-end gap-2">
					<Button variant="subtle" @click="showMergeDialog = false"> Cancel </Button>
					<Button
						variant="solid"
						:loading="merging"
						:disabled="!canMerge"
						@click="mergeDocuments"
					>
						{{ merging ? 'Merging...' : 'Merge & Download' }}
					</Button>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Button, Dialog, FileUploader, FormControl, FeatherIcon } from 'frappe-ui'
import { documentResource } from '@/data/document'
import { isBeforeToday, getDaysDifference } from '@/utils/format'
import VueDraggable from 'vuedraggable'
import { PDFDocument } from 'pdf-lib'
import UPNG from '@pdf-lib/upng'

const props = defineProps({
	employee: {
		type: Object,
		required: true,
	},
})

const recommendedTags = {
	Personal: '👤',
	ICP: '🛂',
	MOHRE: '💼',
	MOI: '🚒',
	Insurance: '🏥',
	Medical: '⚕️',
	Certificate: '📜',
	Resume: '📋',
	Salary: '💰',
	Bill: '🧾',
	Vehicle: '🚗',
	License: '🪪',
	Education: '🎓',
	Contract: '📝',
}

// Tag Management Functions
function addTag(newTag) {
	if (hasTag(newTag)) return

	const currentTags = newDocument.value.tags
		? newDocument.value.tags.split(',').map((t) => t.trim())
		: []

	currentTags.push(newTag)
	newDocument.value.tags = currentTags.join(', ')
}

function hasTag(tag) {
	if (!newDocument.value.tags) return false
	const currentTags = newDocument.value.tags.split(',').map((t) => t.trim())
	return currentTags.includes(tag)
}

function addTagToEditingDoc(newTag) {
	if (hasTagInEditingDoc(newTag)) return

	const currentTags = editingDocument.value.tags
		? editingDocument.value.tags.split(',').map((t) => t.trim())
		: []

	currentTags.push(newTag)
	editingDocument.value.tags = currentTags.join(', ')
}

function hasTagInEditingDoc(tag) {
	if (!editingDocument.value?.tags) return false
	const currentTags = editingDocument.value.tags.split(',').map((t) => t.trim())
	return currentTags.includes(tag)
}

// State
const selectedTag = ref('All')
const showUploadDialog = ref(false)
const showMergeDialog = ref(false)
const uploading = ref(false)
const merging = ref(false)
const selectedDoc = ref(null)
const showQrDialog = ref(false)
const selectedDocuments = ref([])
const showEditDialog = ref(false)
const editingDocument = ref(null)
const isDraggingFile = ref(false)
const mergeFileName = ref('')
const newDocument = ref({
	file: null,
	document_name: '',
	document_number: '',
	issue_date: '',
	expiry_date: '',
	tags: '',
	document: null,
})

// Check if sharing is supported
const canShare = computed(() => typeof navigator.share !== 'undefined')


// File type validation
function isValidFileType(url) {
	return isPdfFile(url) || isImageFile(url)
}

// File type detection functions
function isImageFile(url) {
	if (!url) return false
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']
	return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}

function isVideoFile(url) {
	if (!url) return false
	const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
	return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}

function isAudioFile(url) {
	if (!url) return false
	const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
	return audioExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}

function isPdfFile(url) {
	if (!url) return false
	return url.toLowerCase().endsWith('.pdf')
}

function isMicrosoftFile(url) {
	if (!url) return false
	const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
	return officeExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}

// Document Selection
function isSelected(doc) {
	return selectedDocuments.value.some((d) => d.name === doc.name)
}

function toggleSelection(doc) {
	const index = selectedDocuments.value.findIndex((d) => d.name === doc.name)
	if (index === -1) {
		selectedDocuments.value.push(doc)
	} else {
		selectedDocuments.value.splice(index, 1)
	}
}

// URL Generation
function getMicrosoftPreviewUrl(url) {
	return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
}

function getQrCodeUrl(url) {
	const baseUrl = window.location.origin + url
	return `https://quickchart.io/qr?text=${encodeURIComponent(baseUrl)}&size=200`
}

// Expiry-related computed properties
const hasExpiredDocuments = computed(() => {
	return documentResource.data?.some((doc) => isExpired(doc.expiry_date)) || false
})

const expiredDocumentsCount = computed(() => {
	return documentResource.data?.filter((doc) => isExpired(doc.expiry_date)).length || 0
})

const validDocumentsCount = computed(() => {
	return selectedDocuments.value.filter((doc) => isValidFileType(doc.document)).length
})

const canMerge = computed(() => {
	return validDocumentsCount.value >= 2 && mergeFileName.value
})

const canSubmit = computed(() => {
	return newDocument.value.document && newDocument.value.document_name
})

const uniqueTags = computed(() => {
  if (!documentResource.data) return []
  
  // Get only active (non-expired) documents
  const activeDocuments = documentResource.data.filter(doc => !isExpired(doc.expiry_date))
  
  // Get tags only from active documents
  const allTags = activeDocuments.flatMap(doc => {
    return doc.tags?.split(',').map(tag => tag.trim())
  }) || []

  // Get unique tags and sort them
  const uniqueSet = [...new Set(allTags.filter(Boolean))]

  // Filter out 'Expired Documents' and sort remaining tags
  const regularTags = uniqueSet.filter(tag => tag !== 'Expired Documents').sort()

  // If we have any expired documents, append 'Expired Documents' at the end
  if (hasExpiredDocuments.value) {
    regularTags.push('Expired Documents')
  }

  return regularTags
})
const filteredDocuments = computed(() => {
	if (!documentResource.data) return []

	// Handle expired documents view
	if (selectedTag.value === 'Expired Documents') {
		return documentResource.data.filter((doc) => isExpired(doc.expiry_date))
	}

	// Filter out expired documents from regular views
	const activeDocuments = documentResource.data.filter((doc) => !isExpired(doc.expiry_date))

	if (selectedTag.value === 'All') return activeDocuments

	return activeDocuments.filter((doc) => {
		const docTags = doc.tags?.split(',').map((t) => t.trim())
		return docTags?.includes(selectedTag.value)
	})
})

// Expiry calculation functions
function isExpired(date) {
  if (!date) return false
  return isBeforeToday(date)
}

function getDaysUntilExpiry(date) {
  if (!date) return
  return getDaysDifference(date)
}

function getExpiryStatus(date) {
  if (!date) return
  const daysUntilExpiry = getDaysUntilExpiry(date)

  if (daysUntilExpiry < 0) return 'Expired'
  if (daysUntilExpiry === 0) return 'Expires Today'
  if (daysUntilExpiry === 1) return 'Expires in 1 day'
  return `Expires in ${daysUntilExpiry} days`
}


function getExpiryStatusClass(date) {
	if (!date) return 'bg-gray-50 text-gray-700'
	const daysUntilExpiry = getDaysUntilExpiry(date)

	if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800'
	if (daysUntilExpiry <= 10) return 'bg-red-50 text-red-700'
	if (daysUntilExpiry <= 20) return 'bg-orange-100 text-orange-800'
	if (daysUntilExpiry <= 30) return 'bg-yellow-100 text-yellow-800'
	if (daysUntilExpiry <= 60) return 'bg-blue-50 text-blue-700'
	return 'bg-gray-50 text-gray-700'
}

// File Operations
function handlePreviewError(event) {
	event.target.style.display = 'none'
	event.target.parentElement.innerHTML = `
<div class="text-gray-400 flex items-center justify-center h-full">
<i data-feather="file" class="w-16 h-16"></i>
</div>
`
}

function getFileIcon(url) {
	if (!url) return 'file'
	const extension = url.split('.').pop().toLowerCase()

	const iconMap = {
		// Documents
		pdf: 'file-text',
		doc: 'file-text',
		docx: 'file-text',
		txt: 'file-text',
		// Spreadsheets
		xls: 'grid',
		xlsx: 'grid',
		// Presentations
		ppt: 'monitor',
		pptx: 'monitor',
		// Media
		mp4: 'video',
		webm: 'video',
		mp3: 'music',
		wav: 'music',
		// Images
		jpg: 'image',
		jpeg: 'image',
		png: 'image',
		gif: 'image',
		webp: 'image',
		// Archives
		zip: 'archive',
		rar: 'archive',
	}

	return iconMap[extension] || 'file'
}

// Document Actions
function openDocument(url) {
	if (!url) return

	if (isMicrosoftFile(url)) {
		window.open(getMicrosoftPreviewUrl(url), '_blank')
	} else {
		window.open(url, '_blank') //EmployeeFiles.vue
	}
}

function downloadDocument(url) {
	if (!url) return
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

// Share functionality
function showQrCode(doc) {
	selectedDoc.value = doc
	showQrDialog.value = true
}

async function shareDocument(doc) {
	if (!navigator.share) return

	try {
		await navigator.share({
			title: doc.document_name,
			text: 'Shared from RUA Company',
			url: window.location.origin + doc.document,
		})
	} catch (err) {
		if (err.name !== 'AbortError') {
			console.error('Error sharing document:', err)
		}
	}
}

async function copyDocNumber(doc) {
	if (!doc.document_number) return

	try {
		await navigator.clipboard.writeText(doc.document_number)
		// Use Vue's reactivity to add a temporary property to the document
		doc.showCopied = true
		setTimeout(() => {
			doc.showCopied = false
		}, 2000)
	} catch (err) {
		console.error('Failed to copy document number:', err)
	}
}

// Document Upload
async function handleUploadSuccess(result) {
	newDocument.value.document = result.file_url
}

async function submitDocument() {
	if (!canSubmit.value) return

	try {
		uploading.value = true
		await documentResource.insert.submit({
			source_doctype: 'RUA Employee',
			for_docname: props.employee.name,
			document_name: newDocument.value.document_name,
			document_number: newDocument.value.document_number,
			issue_date: newDocument.value.issue_date,
			expiry_date: newDocument.value.expiry_date,
			document: newDocument.value.document,
			tags: newDocument.value.tags,
		})

		// Reset form
		newDocument.value = {
			file: null,
			document_name: '',
			document_number: '',
			issue_date: '',
			expiry_date: '',
			tags: '',
			document: null,
		}

		showUploadDialog.value = false
		await documentResource.reload()
	} catch (error) {
		console.error('Error uploading document:', error)
	} finally {
		uploading.value = false
	}
}

// Update the card interaction handler
function handleCardInteraction(doc, event) {
	if (event.type === 'dblclick') {
		openEditDialog(doc)
	}
}
function setupDragDropHandlers() {
	const container = document.querySelector('.space-y-6')
	if (!container) return

	const handleDragEnter = (e) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.dataTransfer.types.includes('Files')) {
			isDraggingFile.value = true
		}
	}

	const handleDragOver = (e) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const handleDragLeave = (e) => {
		e.preventDefault()
		e.stopPropagation()
		// Only reset if we're leaving the main container, not entering a child
		if (!e.currentTarget.contains(e.relatedTarget)) {
			isDraggingFile.value = false
		}
	}

	async function handleDrop(e) {
		e.preventDefault()
		e.stopPropagation()
		isDraggingFile.value = false

		const files = Array.from(e.dataTransfer.files)
		if (files.length > 0) {
			const file = files[0]

			showUploadDialog.value = true

			await nextTick()

			const fileInput = document.querySelector('input[type="file"].hidden')

			if (fileInput) {
				const dataTransfer = new DataTransfer()
				dataTransfer.items.add(file)

				fileInput.files = dataTransfer.files
				fileInput.dispatchEvent(new Event('change', { bubbles: true }))
			}

			newDocument.value.document_name = file.name.split('.')[0]
		}
	}

	container.addEventListener('dragenter', handleDragEnter)
	container.addEventListener('dragover', handleDragOver)
	container.addEventListener('dragleave', handleDragLeave)
	container.addEventListener('drop', handleDrop)

	// Cleanup
	onUnmounted(() => {
		container.removeEventListener('dragenter', handleDragEnter)
		container.removeEventListener('dragover', handleDragOver)
		container.removeEventListener('dragleave', handleDragLeave)
		container.removeEventListener('drop', handleDrop)
	})
}

function openEditDialog(doc) {
	editingDocument.value = { ...doc, tags: doc.tags || '' }
	showEditDialog.value = true
}

async function saveDocumentChanges() {
	try {
		await documentResource.setValue.submit({
			name: editingDocument.value.name,
			document_name: editingDocument.value.document_name,
			document_number: editingDocument.value.document_number,
			place_of_issue: editingDocument.value.place_of_issue,
			issue_date: editingDocument.value.issue_date,
			expiry_date: editingDocument.value.expiry_date,
			tags: editingDocument.value.tags,
		})

		showEditDialog.value = false
		await documentResource.reload()
	} catch (error) {
		console.error('Error updating document:', error)
	}
}

// PDF Merging
async function processImage(fileBuffer, filename) {
    if (filename.toLowerCase().endsWith('.png')) {
        const pngData = UPNG.decode(new Uint8Array(fileBuffer));
        const [width, height] = UPNG.toRGBA8(pngData)[0];
        return {
            width,
            height
        };
    } else {
        // For JPEG and other formats, create an image element to get dimensions
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height,
                });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(new Blob([fileBuffer]));
        });
    }
}

async function mergeDocuments() {
	if (selectedDocuments.value.length < 2 || !mergeFileName.value) return

	try {
		merging.value = true

		// Create a new PDF document
		const mergedPdf = await PDFDocument.create()

		// Process each document
		for (const doc of selectedDocuments.value) {
			try {
				// Fetch the document
				const response = await fetch(doc.document)
				const fileBuffer = await response.arrayBuffer()

				if (isImageFile(doc.document)) {
					// Handle image files
					const image = await processImage(fileBuffer, doc.document)
					const page = mergedPdf.addPage([image.width, image.height])

					// Draw image based on type
					if (doc.document.toLowerCase().endsWith('.png')) {
						const pngImage = await mergedPdf.embedPng(fileBuffer)
						page.drawImage(pngImage, {
							x: 0,
							y: 0,
							width: image.width,
							height: image.height,
						})
					} else {
						const jpgImage = await mergedPdf.embedJpg(fileBuffer)
						page.drawImage(jpgImage, {
							x: 0,
							y: 0,
							width: image.width,
							height: image.height,
						})
					}
				} else if (isPdfFile(doc.document)) {
					// Handle PDF files
					const srcPdf = await PDFDocument.load(fileBuffer)
					const pages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices())
					pages.forEach((page) => mergedPdf.addPage(page))
				} else {
					console.warn(`Unsupported file type for document: ${doc.document_name}`)
					continue
				}
			} catch (error) {
				console.error(`Error processing document ${doc.document_name}:`, error)
				continue
			}
		}

		// Save the merged PDF
		const mergedPdfBytes = await mergedPdf.save()

		// Create a Blob and download
		const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
		const url = URL.createObjectURL(blob)

		const link = document.createElement('a')
		link.href = url
		link.download = mergeFileName.value.endsWith('.pdf')
			? mergeFileName.value
			: `${mergeFileName.value}.pdf`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		// Clean up
		URL.revokeObjectURL(url)
		selectedDocuments.value = []
		mergeFileName.value = ''
		showMergeDialog.value = false
	} catch (error) {
		console.error('Error merging documents:', error)
	} finally {
		merging.value = false
	}
}

// Watch for employee changes and reload documents
watch(
	() => props.employee?.name,
	async (newVal) => {
		if (newVal) {
			documentResource.filters = [
				['source_doctype', '=', 'RUA Employee'],
				['for_docname', '=', newVal],
			]
			try {
				await documentResource.reload()
			} catch (error) {
				console.error('Error reloading documents:', error)
			}
		}
	},
	{ immediate: true },
)

onMounted(() => {
	setupDragDropHandlers()
})
</script>
