<template>
	<div class="letter-details-container bg-gray-100 min-h-screen pb-12">
		<div
			v-if="!letterResource?.doc && letterResource?.loading"
			class="flex items-center justify-center min-h-[80vh]"
		>
			<LoadingIndicator />
		</div>

		<div
			v-else-if="letterResource?.error"
			class="flex items-center justify-center min-h-[80vh] text-center text-red-600"
		>
			<div>
				<FeatherIcon name="alert-circle" class="w-12 h-12 mx-auto mb-4" />
				<p>Failed to load document details.</p>
				<p class="text-sm mt-1">
					{{ letterResource.error.message || 'Please try again.' }}
				</p>
				<Button @click="goBackToList" variant="subtle" size="sm" class="mt-4"
					>Go Back</Button
				>
			</div>
		</div>

		<div v-else-if="letterResource?.doc">
			<div class="sticky top-0 z-20 bg-white border-b shadow-sm">
				<div class="flex items-center justify-between p-4 max-w-7xl mx-auto">
					<div class="flex items-center gap-3">
						<Button
							:variant="'outline'"
							theme="gray"
							size="sm"
							icon="arrow-left"
							@click="goBackToList"
						/>

						<div class="flex flex-col">
							<h1
								class="text-lg md:text-xl font-semibold text-gray-900 truncate"
								:title="letterResource.doc.system_title || letterResource.doc.name"
							>
								{{ letterResource.doc.system_title || letterResource.doc.name }}
							</h1>
							<p class="text-xs md:text-sm text-gray-500 hidden sm:inline">
								{{
									letterResource.doc.type === 'LTR' ? 'Letter' : 'Form'
								}}
								&middot; {{ letterResource.doc.name }}
								<span
									v-if="
										letterResource.doc.title &&
										letterResource.doc.title !==
											letterResource.doc.system_title
									"
								>
									| Print Title: {{ letterResource.doc.title }}</span
								>
							</p>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<Button
							v-if="isDraft && !isEditMode"
							variant="subtle"
							theme="gray"
							size="sm"
							icon-left="edit-2"
							@click="toggleEditMode(true)"
						>
							Edit
						</Button>
						<template v-if="isEditMode">
							<Button
								variant="subtle"
								theme="gray"
								size="sm"
								@click="cancelEdit"
								:disabled="isSaving"
							>
								Cancel
							</Button>
							<Button
								:variant="'solid'"
								theme="green"
								size="sm"
								@click="saveChanges"
								:loading="isSaving"
							>
								Save
							</Button>
						</template>

						<Badge
							:theme="getStatusTheme(letterResource.doc.status)"
							variant="subtle"
							size="md"
						>
							{{ letterResource.doc.status }}
						</Badge>

						<Dropdown :options="actionDropdownOptions" placement="bottom-end">
							<Button variant="subtle" theme="gray">
								<template #icon>
									<FeatherIcon name="more-vertical" class="h-5 w-5" />
								</template>
							</Button>
						</Dropdown>
					</div>
				</div>
			</div>

			<div class="max-w-7xl mx-auto pt-2">
				<div
					v-if="letterResource.doc.status === 'Cancelled'"
					class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded m-2"
					role="alert"
				>
					<div class="flex">
						<div class="flex-shrink-0">
							<FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" />
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium">Document Cancelled</p>
							<p v-if="letterResource.doc.cancellation_reason" class="text-sm mt-1">
								Reason: {{ letterResource.doc.cancellation_reason }}
							</p>
							<p v-else class="text-sm mt-1 italic">
								No cancellation reason provided.
							</p>
						</div>
					</div>
				</div>
				<div
					v-if="letterResource.doc.status === 'Final' && !letterResource.doc.deliverable"
					class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded m-2"
					role="alert"
				>
					<div class="flex">
						<div class="flex-shrink-0">
							<FeatherIcon name="alert-triangle" class="h-5 w-5 text-yellow-400" />
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium">Deliverable Missing</p>
							<p class="text-sm mt-1">
								This document is Final, but the signed deliverable has not been
								uploaded yet.
								<button
									@click="showUploadDeliverable = true"
									class="ml-2 font-semibold underline hover:text-yellow-800"
								>
									Upload Now
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="max-w-7xl mx-auto">
				<form @submit.prevent="handleFormSubmit" class="bg-white p-6 md:p-8 h-full rounded m-2">
					<div
						v-if="isEditMode"
						class="mb-8 p-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
					>
						<h4 class="text-sm font-medium text-gray-700 md:col-span-3 mb-2">
							Language & Layout
						</h4>
						<Checkbox
							v-model="editableDoc.english"
							label="English"
							size="sm"
							@update:modelValue="handleLanguageChange"
						/>
						<Checkbox
							v-model="editableDoc.arabic"
							label="Arabic"
							size="sm"
							@update:modelValue="handleLanguageChange"
						/>
						<Checkbox
							v-model="editableDoc.two_column"
							label="Two Column Print"
							size="sm"
							:disabled="!editableDoc.english || !editableDoc.arabic"
						/>
					</div>

					<div class="space-y-6">
						<div class="view-field md:col-span-3">
							<label class="field-label">System Title (Internal)</label>
							<FormControl
								v-if="isEditMode"
								:key="'system_title-edit'"
								fieldname="system_title"
								:type="'text'"
								:value="editableDoc.system_title"
								@change="updateField('system_title', $event)"
								required
							/>
							<p v-else class="field-value">{{ editableDoc.system_title || '-' }}</p>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">Title (English)</label>
								<FormControl
									v-if="isEditMode"
									:key="'title-en-edit'"
									fieldname="title"
									:type="'text'"
									:value="editableDoc.title"
									@change="updateField('title', $event)"
								/>
								<p v-else class="field-value">{{ editableDoc.title || '-' }}</p>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl"
									>Title (Arabic)</label
								>
								<FormControl
									v-if="isEditMode"
									:key="'title-ar-edit'"
									fieldname="title_ar"
									:type="'text'"
									:value="editableDoc.title_ar"
									@change="updateField('title_ar', $event)"
									dir="rtl"
									class="text-right"
								/>
								<p v-else class="field-value text-right" dir="rtl">
									{{ editableDoc.title_ar || '-' }}
								</p>
							</div>
							<div
								class="view-field"
								:class="{
									'md:col-span-1': showEnglish && showArabic,
									'md:col-span-2': !showEnglish || !showArabic,
								}"
							>
								<label class="field-label">Date</label>
								<FormControl
									v-if="isEditMode"
									:key="'date-edit'"
									fieldname="date"
									:type="'date'"
									:value="editableDoc.date"
									@change="updateField('date', $event)"
									required
								/>
								<p v-else class="field-value">
									{{ formatDate(editableDoc.date) || '-' }}
								</p>
							</div>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">Subject (English)</label>
								<FormControl
									v-if="isEditMode"
									:key="'subject-en-edit'"
									fieldname="subject"
									:type="'text'"
									:value="editableDoc.subject"
									@change="updateField('subject', $event)"
								/>
								<p v-else class="field-value">{{ editableDoc.subject || '-' }}</p>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl"
									>Subject (Arabic)</label
								>
								<FormControl
									v-if="isEditMode"
									:key="'subject-ar-edit'"
									fieldname="subject_ar"
									:type="'text'"
									:value="editableDoc.subject_ar"
									@change="updateField('subject_ar', $event)"
									dir="rtl"
									class="text-right"
								/>
								<p v-else class="field-value text-right" dir="rtl">
									{{ editableDoc.subject_ar || '-' }}
								</p>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">To (English)</label>
								<FormControl
									v-if="isEditMode"
									:key="'to-en-edit'"
									fieldname="to"
									:type="'text'"
									:value="editableDoc.to"
									@change="updateField('to', $event)"
								/>
								<p v-else class="field-value">{{ editableDoc.to || '-' }}</p>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl">To (Arabic)</label>
								<FormControl
									v-if="isEditMode"
									:key="'to-ar-edit'"
									fieldname="to_ar"
									:type="'text'"
									:value="editableDoc.to_ar"
									@change="updateField('to_ar', $event)"
									dir="rtl"
									class="text-right"
								/>
								<p v-else class="field-value text-right" dir="rtl">
									{{ editableDoc.to_ar || '-' }}
								</p>
							</div>
						</div>

						<div
							class="grid grid-cols-2"
							:class="{ 'md:grid-cols-2 gap-6': showEnglish && showArabic }"
						>
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">Content (English)</label>
								<TextEditor
									v-if="isEditMode"
									:key="'content-en-edit'"
									:content="editableDoc.content"
									@change="updateField('content', $event)"
									:fixed-menu="true"
									editor-class="prose-sm h-[12rem] overflow-y-auto scr w-full border rounded-b-lg border-t-0 p-2"
								/>
								<div
									v-else
									class="field-value prose prose-sm max-w-none p-3 border rounded-md bg-gray-50 min-h-[100px]"
									v-html="
										editableDoc.content ||
										'<p class=\'text-gray-400 italic\'>No content</p>'
									"
								></div>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl"
									>Content (Arabic)</label
								>
								<TextEditor
									v-if="isEditMode"
									:key="'content-ar-edit'"
									:content="editableDoc.content_ar"
									@change="updateField('content_ar', $event)"
									:fixed-menu="true"
									editor-class="prose-sm h-[12rem] overflow-y-auto scr w-full border rounded-b-lg border-t-0 p-2 text-right"
									dir="rtl"
								/>
								<div
									v-else
									class="field-value prose prose-sm max-w-none p-3 border rounded-md bg-gray-50 min-h-[100px] text-right"
									dir="rtl"
									v-html="
										editableDoc.content_ar ||
										'<p class=\'text-gray-400 italic\'>لا يوجد محتوى</p>'
									"
								></div>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">Author (English)</label>
								<FormControl
									v-if="isEditMode"
									:key="'author-en-edit'"
									fieldname="author"
									:type="'text'"
									:value="editableDoc.author"
									@change="updateField('author', $event)"
								/>
								<p v-else class="field-value">{{ editableDoc.author || '-' }}</p>
							</div>
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">Signee (English)</label>
								<FormControl
									v-if="isEditMode"
									:key="'signee-en-edit'"
									fieldname="signee"
									:type="'text'"
									:value="editableDoc.signee"
									@change="updateField('signee', $event)"
								/>
								<p v-else class="field-value">{{ editableDoc.signee || '-' }}</p>
							</div>
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">Author Title (English)</label>
								<FormControl
									v-if="isEditMode"
									:key="'author-title-en-edit'"
									fieldname="author_title"
									:type="'text'"
									:value="editableDoc.author_title"
									@change="updateField('author_title', $event)"
								/>
								<p v-else class="field-value">
									{{ editableDoc.author_title || '-' }}
								</p>
							</div>
							<div v-if="showEnglish" class="view-field">
								<label class="field-label">Signee Title (English)</label>
								<FormControl
									v-if="isEditMode"
									:key="'signee-title-en-edit'"
									fieldname="signee_title"
									:type="'text'"
									:value="editableDoc.signee_title"
									@change="updateField('signee_title', $event)"
								/>
								<p v-else class="field-value">
									{{ editableDoc.signee_title || '-' }}
								</p>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl"
									>Author (Arabic)</label
								>
								<FormControl
									v-if="isEditMode"
									:key="'author-ar-edit'"
									fieldname="author_ar"
									:type="'text'"
									:value="editableDoc.author_ar"
									@change="updateField('author_ar', $event)"
									dir="rtl"
									class="text-right"
								/>
								<p v-else class="field-value text-right" dir="rtl">
									{{ editableDoc.author_ar || '-' }}
								</p>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl"
									>Signee (Arabic)</label
								>
								<FormControl
									v-if="isEditMode"
									:key="'signee-ar-edit'"
									fieldname="signee_ar"
									:type="'text'"
									:value="editableDoc.signee_ar"
									@change="updateField('signee_ar', $event)"
									dir="rtl"
									class="text-right"
								/>
								<p v-else class="field-value text-right" dir="rtl">
									{{ editableDoc.signee_ar || '-' }}
								</p>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl"
									>Author Title (Arabic)</label
								>
								<FormControl
									v-if="isEditMode"
									:key="'author-title-ar-edit'"
									fieldname="author_title_ar"
									:type="'text'"
									:value="editableDoc.author_title_ar"
									@change="updateField('author_title_ar', $event)"
									dir="rtl"
									class="text-right"
								/>
								<p v-else class="field-value text-right" dir="rtl">
									{{ editableDoc.author_title_ar || '-' }}
								</p>
							</div>
							<div v-if="showArabic" class="view-field">
								<label class="field-label text-right" dir="rtl"
									>Signee Title (Arabic)</label
								>
								<FormControl
									v-if="isEditMode"
									:key="'signee-title-ar-edit'"
									fieldname="signee_title_ar"
									:type="'text'"
									:value="editableDoc.signee_title_ar"
									@change="updateField('signee_title_ar', $event)"
									dir="rtl"
									class="text-right"
								/>
								<p v-else class="field-value text-right" dir="rtl">
									{{ editableDoc.signee_title_ar || '-' }}
								</p>
							</div>
						</div>
						<div
							v-if="!isEditMode"
							class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t mt-6"
						>
							<div>
								<h4 class="text-sm font-medium text-gray-700 mb-2">Signature</h4>
								<div
									v-if="letterResource.doc.signature"
									class="border rounded-md p-2 inline-block bg-gray-50"
								>
									<img
										:src="letterResource.doc.signature"
										alt="Signature"
										class="max-h-24 max-w-xs object-contain"
									/>
								</div>
								<p v-else class="text-sm text-gray-500 italic">
									No signature applied.
								</p>
								<Button
									v-if="isDraft"
									size="sm"
									variant="link"
									@click="showSignDialog = true"
									class="mt-2"
								>
									Apply Signature
								</Button>
							</div>
							<div>
								<h4 class="text-sm font-medium text-gray-700 mb-2">Deliverable</h4>
								<div v-if="letterResource.doc.deliverable">
									<a
										:href="letterResource.doc.deliverable"
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-blue-600 hover:underline flex items-center gap-1"
									>
										<FeatherIcon name="paperclip" class="w-4 h-4" />
										View Uploaded Deliverable
									</a>
									<Button
										v-if="isDraft || letterResource.doc.status === 'Final'"
										size="sm"
										variant="link"
										theme="gray"
										@click="showUploadDeliverable = true"
										class="mt-1 ml-2 text-gray-600 hover:text-gray-800"
									>
										Replace
									</Button>
								</div>
								<p v-else class="text-sm text-gray-500 italic">
									No deliverable uploaded.
								</p>
								<Button
									v-if="
										!letterResource.doc.deliverable &&
										(isDraft || letterResource.doc.status === 'Final')
									"
									size="sm"
									variant="link"
									@click="showUploadDeliverable = true"
									class="mt-2"
								>
									Upload Deliverable
								</Button>
							</div>
						</div>
					</div>
					<div
						v-if="saveError && isEditMode"
						class="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md"
					>
						{{ saveError }}
					</div>
				</form>
			</div>
		</div>

		<Dialog v-model="showCancelDialog" :options="cancelDialogOptions">
			<template #body-content>
				<FormControl
					label="Reason for Cancellation"
					fieldname="cancellation_reason"
					fieldtype="Small Text"
					v-model="cancellationReason"
					required
					placeholder="Please provide a reason..."
				/>
				<p v-if="cancelError" class="text-red-500 text-sm mt-2">{{ cancelError }}</p>
			</template>
		</Dialog>

		<Dialog v-model="showFinalizeDialog" :options="finalizeDialogOptions">
			<template #body-content>
				<p class="text-sm text-gray-600">
					Are you sure you want to mark this document as Final? Once finalized, it cannot
					be edited.
				</p>
				<p v-if="finalizeError" class="text-red-500 text-sm mt-2">{{ finalizeError }}</p>
			</template>
		</Dialog>

		<Dialog v-model="showUploadDeliverable" :options="uploadDeliverableDialogOptions">
			<template #body-content>
				<FileUploader
					v-model="deliverableFile"
					:upload-args="deliverableUploadArgs"
					:accept="['application/pdf', 'image/*']"
					:max-size="10000000"
					@success="handleDeliverableUploadSuccess"
					@fail="handleDeliverableUploadFail"
					v-slot="{ openFileSelector, file, uploading, progress, error }"
				>
					<div
						class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-900 transition-colors cursor-pointer"
						@click="openFileSelector"
						@dragover.prevent="$event.currentTarget.classList.add('border-gray-900')"
						@dragleave.prevent="
							$event.currentTarget.classList.remove('border-gray-900')
						"
						@drop.prevent="handleFileDrop($event, openFileSelector)"
						@dragenter.prevent
					>
						<div class="flex flex-col items-center justify-center space-y-2">
							<div v-if="!file" class="flex flex-col items-center justify-center">
								<FeatherIcon
									name="upload-cloud"
									class="w-8 h-8 text-gray-400 mx-auto mb-2"
								/>
								<div class="text-sm font-medium text-gray-900">
									Upload Signed Document
								</div>
								<div class="text-xs text-gray-500">
									PDF or Image files up to 10MB
								</div>
							</div>
							<div v-else class="w-full">
								<div class="flex items-center justify-between mb-2">
									<div class="flex items-center space-x-2 overflow-hidden">
										<FeatherIcon
											name="file"
											class="w-4 h-4 text-gray-400 flex-shrink-0"
										/>
										<span class="text-sm text-gray-900 truncate">{{
											file.name
										}}</span>
									</div>
									<button
										v-if="!uploading"
										type="button"
										class="text-sm text-red-500 hover:text-red-700 flex-shrink-0 ml-2 p-1"
										@click.stop="deliverableFile = null"
									>
										<FeatherIcon name="x" class="w-4 h-4" />
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

				<p v-if="uploadError" class="text-red-500 text-sm mt-2">{{ uploadError }}</p>
			</template>
		</Dialog>

		<SignDocument
			v-if="letterResource?.doc"
			v-model="showSignDialog"
			:doctype="'RUA Letter'"
			:docname="letterResource.doc.name"
			@signature-complete="handleSignatureComplete"
		/>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLetterResource, letterListResource } from '@/data/letter'
import SignDocument from '@/components/common/SignDocument.vue'
import {
	Button,
	Badge,
	FeatherIcon,
	Dropdown,
	Dialog,
	FormControl,
	TextEditor,
	Checkbox,
	FileUploader,
	LoadingIndicator,
} from 'frappe-ui'
import { formatDate, getServerDate, DATE_FORMATS } from '@/utils/format'
import { cloneDeep } from 'lodash-es' // Using lodash for deep cloning

const route = useRoute()
const router = useRouter()

// --- State ---
const letterResource = ref(null)
const isEditMode = ref(false)
const editableDoc = ref({}) // Holds a copy of the doc for editing
const isSaving = ref(false)
const saveError = ref('')

// Dialog States
const showCancelDialog = ref(false)
const cancellationReason = ref('')
const cancelError = ref('')
const showFinalizeDialog = ref(false)
const finalizeError = ref('')
const showSignDialog = ref(false)
const showUploadDeliverable = ref(false)
const deliverableFile = ref(null) // For FileUploader v-model
const uploadError = ref('')

// --- Computed Properties ---
const documentId = computed(() => route.params.id)
const isDraft = computed(() => letterResource.value?.doc?.status === 'Draft')
const isFinal = computed(() => letterResource.value?.doc?.status === 'Final')
const isCancelled = computed(() => letterResource.value?.doc?.status === 'Cancelled')

// Language visibility based on editableDoc (for responsive UI in edit mode AND view mode)
// Use letterResource.doc for view mode, editableDoc for edit mode
const showEnglish = computed(() =>
	isEditMode.value ? editableDoc.value.english : letterResource.value?.doc?.english,
)
const showArabic = computed(() =>
	isEditMode.value ? editableDoc.value.arabic : letterResource.value?.doc?.arabic,
)

const actionDropdownOptions = computed(() => {
	const options = []
	const docStatus = letterResource.value?.doc?.status

	// Common actions for non-cancelled
	if (docStatus !== 'Cancelled') {
		options.push({ label: 'Download PDF', icon: 'download', onClick: triggerPdfDownload })
		options.push({ label: 'Print', icon: 'printer', onClick: triggerPdfDownload }) // Usually same as download
	}

	// Draft specific actions
	if (docStatus === 'Draft') {
		options.push({
			label: 'Mark as Final',
			icon: 'check-circle',
			onClick: () => (showFinalizeDialog.value = true),
		})
		options.push({
			label: 'Cancel Document',
			icon: 'x-circle',
			onClick: () => (showCancelDialog.value = true),
			class: 'text-red-600 hover:bg-red-50',
		})
		options.push({ label: 'Duplicate', icon: 'copy', onClick: duplicateLetter })
		options.push({
			label: 'Apply Signature',
			icon: 'pen-tool',
			onClick: () => (showSignDialog.value = true),
		})
		options.push({
			label: 'Upload Deliverable',
			icon: 'upload',
			onClick: () => (showUploadDeliverable.value = true),
		})
	}

	// Final specific actions
	if (docStatus === 'Final') {
		// --- NEW ACTION ---
		options.push({
			label: 'Cancel & Duplicate',
			icon: 'copy', // Or 'repeat'
			onClick: cancelAndDuplicate, // Implement this new function below
			class: 'text-orange-600 hover:bg-orange-50', // Suggestive color
		})
		// --- END NEW ---
		options.push({
			label: letterResource.value?.doc?.deliverable
				? 'Replace Deliverable'
				: 'Upload Deliverable',
			icon: 'upload',
			onClick: () => (showUploadDeliverable.value = true),
		})
		// Note: Cancelling a 'Final' doc might usually be restricted, but this action handles it.
	}

	return options
})

const cancelDialogOptions = computed(() => ({
	title: 'Cancel Document',
	size: 'sm',
	actions: [
		{
			label: 'Cancel',
			variant: 'subtle',
			theme: 'gray',
			onClick: () => (showCancelDialog.value = false),
		},
		{
			label: 'Confirm Cancellation',
			variant: 'solid',
			theme: 'red',
			loading: isSaving.value,
			disabled: !cancellationReason.value.trim(),
			onClick: () => updateStatus('Cancelled'),
		},
	],
}))

const finalizeDialogOptions = computed(() => ({
	title: 'Finalize Document',
	size: 'sm',
	actions: [
		{
			label: 'Cancel',
			variant: 'subtle',
			theme: 'gray',
			onClick: () => (showFinalizeDialog.value = false),
		},
		{
			label: 'Confirm Finalize',
			variant: 'solid',
			theme: 'primary',
			loading: isSaving.value,
			onClick: () => updateStatus('Final'),
		},
	],
}))

const uploadDeliverableDialogOptions = computed(() => ({
	title: 'Upload Deliverable',
	size: 'md',
	primaryAction: {
		label: 'Close',
		variant: 'solid',
		theme: 'primary',
		// No explicit save needed, upload happens on success
		onClick: () => {
			showUploadDeliverable.value = false
			deliverableFile.value = null // Clear file model
			uploadError.value = ''
		},
	},
}))

const deliverableUploadArgs = computed(() => ({
	doctype: 'RUA Letter',
	docname: documentId.value,
	fieldname: 'deliverable',
	is_private: 1, // Usually deliverables are private
}))

// --- Methods ---

function initializeLetterResource(id) {
	letterResource.value = createLetterResource(id)
	letterResource.value
		.reload()
		.then(() => {
			// Ensure initial editableDoc state reflects fetched data
			resetEditableDoc()
		})
		.catch((err) => console.error('Initial load failed:', err)) // Handle initial load error
}

function resetEditableDoc() {
	// Use cloneDeep to prevent reactivity issues with nested objects (like TextEditor content)
	editableDoc.value = letterResource.value?.doc ? cloneDeep(letterResource.value.doc) : {}
}

function goBackToList() {
	router.push({ name: 'FormsLetters' })
}

function getStatusTheme(status) {
	switch (status) {
		case 'Draft':
			return 'orange'
		case 'Final':
			return 'green'
		case 'Cancelled':
			return 'red'
		default:
			return 'gray'
	}
}

function toggleEditMode(edit) {
	isEditMode.value = edit
	if (edit) {
		resetEditableDoc() // Reset to current saved state when entering edit mode
	} else {
		saveError.value = '' // Clear any previous save errors
	}
}

function updateField(key, event) {
	// For FormControl, event is the value. For TextEditor, event might be the editor content.
	const value =
		typeof event === 'object' && event !== null && event.target ? event.target.value : event
	if (editableDoc.value) {
		editableDoc.value[key] = value
	}
}

function handleLanguageChange() {
	// Ensure at least one language is selected
	if (!editableDoc.value.english && !editableDoc.value.arabic) {
		// Re-enable the one that was just disabled, maybe default to English
		nextTick(() => {
			editableDoc.value.english = 1 // Use 1 for truthy Frappe value
			console.log({
				title: 'Selection Required',
				message: 'At least one language (English or Arabic) must be selected.',
				variant: 'warning',
			})
		})
	}
	// Disable two_column if not both languages are selected
	if (!editableDoc.value.english || !editableDoc.value.arabic) {
		editableDoc.value.two_column = 0 // Use 0 for falsy Frappe value
	}
}

async function saveChanges() {
	if (!letterResource.value?.setValue) return
	isSaving.value = true
	saveError.value = ''

	try {
		// Convert checkbox values (true/false) to Frappe's expected 1/0
		const saveData = { ...editableDoc.value }
		saveData.english = saveData.english ? 1 : 0
		saveData.arabic = saveData.arabic ? 1 : 0
		saveData.two_column = saveData.two_column ? 1 : 0
		// Ensure is_template is also 0/1 if it's part of editableDoc
		if ('is_template' in saveData) {
			saveData.is_template = saveData.is_template ? 1 : 0
		}

		await letterResource.value.setValue.submit(saveData) // Send the processed data

		await letterResource.value.reload() // Reload to get fresh data
		resetEditableDoc() // Update editableDoc with fresh data
		toggleEditMode(false) // Exit edit mode
		console.log({
			title: 'Success',
			message: 'Document saved successfully.',
			variant: 'success',
		})
	} catch (err) {
		console.error('Error saving document:', err)
		saveError.value = err.message || 'Failed to save changes.'
		console.log({ title: 'Error', message: saveError.value, variant: 'danger' })
	} finally {
		isSaving.value = false
	}
}

function cancelEdit() {
	toggleEditMode(false)
	resetEditableDoc() // Discard changes by resetting editableDoc
}

async function updateStatus(newStatus) {
	if (!letterResource.value?.setValue || isSaving.value) return

	const updateData = { status: newStatus }
	cancelError.value = ''
	finalizeError.value = ''

	if (newStatus === 'Cancelled') {
		if (!cancellationReason.value.trim()) {
			cancelError.value = 'Cancellation reason is required.'
			return
		}
		updateData.cancellation_reason = cancellationReason.value
	}

	isSaving.value = true
	try {
		await letterResource.value.setValue.submit(updateData)
		await letterResource.value.reload()
		resetEditableDoc() // Update local state
		showCancelDialog.value = false // Close dialogs on success
		showFinalizeDialog.value = false
		cancellationReason.value = '' // Clear reason
		console.log({
			title: 'Status Updated',
			message: `Document marked as ${newStatus}.`,
			variant: 'success',
		})
	} catch (err) {
		console.error(`Error updating status to ${newStatus}:`, err)
		const errorMsg = err.message || `Failed to update status to ${newStatus}.`
		if (newStatus === 'Cancelled') cancelError.value = errorMsg
		if (newStatus === 'Final') finalizeError.value = errorMsg
		console.log({ title: 'Error', message: errorMsg, variant: 'danger' })
	} finally {
		isSaving.value = false
	}
}

async function duplicateLetter() {
	if (!letterResource.value?.doc) return
	isSaving.value = true // Use saving indicator for duplication process
	console.log({
		title: 'Duplicating...',
		message: 'Creating a copy of the document.',
		variant: 'info',
	})

	try {
		const templateData = { ...letterResource.value.doc }

		// --- Fields to EXCLUDE from copy ---
		const fieldsToExclude = [
			'name',
			'creation',
			'modified',
			'modified_by',
			'owner',
			'deliverable',
			'signature',
			'cancellation_reason',
			'status',
			// Add Frappe internal fields if necessary
			'idx',
			'_user_tags',
			'_comments',
			'_assign',
			'_liked_by',
			'docstatus', // Typically reset for new docs
		]

		fieldsToExclude.forEach((field) => delete templateData[field])

		// --- Fields to RESET/SET for new doc ---
		templateData.doctype = 'RUA Letter'
		templateData.status = 'Draft' // New duplicate starts as Draft
		templateData.date = getServerDate() // Set current date
		templateData.is_template = 0 // Duplicates are usually not templates by default

		if (templateData.title) {
			templateData.title = `${templateData.title} (Copy)` // Indicate it's a copy
		}
		if (templateData.title_ar) {
			templateData.title_ar = `${templateData.title_ar} (نسخة)` // Arabic copy indicator
		}

		const response = await letterListResource.insert.submit(templateData)
		const newDocName = response?.name

		if (!newDocName) {
			throw new Error('Failed to get name of the duplicated document.')
		}

		// Optionally mark the original as cancelled
		// await updateStatus('Cancelled'); // Uncomment if duplication should cancel original

		console.log({
			title: 'Success',
			message: 'Document duplicated successfully.',
			variant: 'success',
		})
		router.push({ name: 'LetterDetails', params: { id: newDocName } }) // Navigate to the new copy
	} catch (err) {
		console.error('Error duplicating document:', err)
		console.log({
			title: 'Error',
			message: err.message || 'Failed to duplicate document.',
			variant: 'danger',
		})
	} finally {
		isSaving.value = false
	}
}

function triggerPdfDownload() {
	if (!letterResource.value?.doc?.name) return

	let baseUrl = window.location.origin
	// Adjust base URL for local development if needed
	if (
		window.location.hostname === 'localhost' &&
		['8080', '5173'].includes(window.location.port)
	) {
		// Added 5173 for Vite dev server
		baseUrl = `${window.location.protocol}//${window.location.hostname}:8000` // Assuming Frappe backend runs on 8000
	}

	const docName = letterResource.value.doc.name
	const docType = 'RUA Letter'
	// Determine print format based on type or other logic if needed
	const printFormat = letterResource.value.doc.two_column ? 'RC Letter Two Column' : 'RC Letter' // Example logic
	const noLetterhead = 1
	const letterhead = 'No Letterhead'
	const lang = letterResource.value.doc.arabic && !letterResource.value.doc.english ? 'ar' : 'en' // Basic language selection

	const apiUrl = `${baseUrl}/api/method/frappe.utils.print_format.download_pdf`
	const queryParams = new URLSearchParams({
		doctype: docType,
		name: docName,
		format: printFormat,
		no_letterhead: noLetterhead,
		// letterhead: letterhead, // Often not needed if no_letterhead=1
		// settings: '{}', // Usually default is fine
		_lang: lang,
	})

	const finalUrl = `${apiUrl}?${queryParams.toString()}`
	console.log('Opening PDF download URL:', finalUrl)
	window.open(finalUrl, '_blank')
}

async function handleSignatureComplete(signatureUrl) {
	if (!letterResource.value?.setValue || !signatureUrl) return
	isSaving.value = true
	try {
		await letterResource.value.setValue.submit({ signature: signatureUrl })
		await letterResource.value.reload()
		resetEditableDoc()
		console.log({ title: 'Success', message: 'Signature applied.', variant: 'success' })
	} catch (err) {
		console.error('Failed to update signature:', err)
		console.log({ title: 'Error', message: 'Failed to save signature.', variant: 'danger' })
	} finally {
		isSaving.value = false
		showSignDialog.value = false // Close the sign dialog
	}
}

async function handleDeliverableUploadSuccess(result) {
	if (!letterResource.value?.setValue || !result?.file_url) return
	uploadError.value = ''
	isSaving.value = true // Use saving indicator for updating the field

	try {
		await letterResource.value.setValue.submit({ deliverable: result.file_url })
		await letterResource.value.reload()
		resetEditableDoc()
		console.log({
			title: 'Success',
			message: 'Deliverable uploaded and saved.',
			variant: 'success',
		})
		showUploadDeliverable.value = false // Close dialog
		deliverableFile.value = null // Clear file model
	} catch (err) {
		console.error('Failed to save deliverable URL:', err)
		uploadError.value = 'Failed to link uploaded file to document.'
		console.log({ title: 'Error', message: uploadError.value, variant: 'danger' })
	} finally {
		isSaving.value = false
	}
}

function handleFileDrop(event, openFileSelector) {
	const file = event.dataTransfer?.files?.[0]
	if (file && file.type === 'application/pdf') {
		event.currentTarget.classList.remove('border-gray-900')
		const input = document.querySelector('input[type="file"]')
		if (input) {
			const dataTransfer = new DataTransfer()
			dataTransfer.items.add(file)
			input.files = dataTransfer.files
			input.dispatchEvent(new Event('change', { bubbles: true }))
		}
	} else {
		statusError.value = 'Please upload a PDF file'
	}
}

function handleDeliverableUploadFail(error) {
	console.error('Upload failed:', error)
	uploadError.value =
		typeof error === 'string' ? error : 'File upload failed. Check file size or type.'
	console.log({ title: 'Upload Failed', message: uploadError.value, variant: 'danger' })
	deliverableFile.value = null // Clear file model on failure
}

 function handleFormSubmit(event) {
   // This function's primary purpose is to be the target of @submit.prevent
   // It stops the default page reload without doing anything else.
   // You could add console.log here if needed:
   // console.log('Form submit event prevented. Triggered by:', event?.submitter || 'unknown');
 }

async function cancelAndDuplicate() {
	if (letterResource.value?.doc?.status !== 'Final' || isSaving.value) return

	// Optional: Add a confirmation dialog before proceeding
	// if (!confirm('Are you sure you want to cancel this final document and create a draft copy?')) {
	//     return;
	// }

	const cancellationReason = 'Cancelled for duplication' // Or prompt user
	isSaving.value = true
	// frappe.show_alert({ message: 'Processing...', indicator: 'blue' }); // Example alert

	try {
		const currentDocName = letterResource.value.doc.name
		const originalData = cloneDeep(letterResource.value.doc)

		// 1. Cancel the current document
		await letterResource.value.setValue.submit({
			status: 'Cancelled',
			cancellation_reason: cancellationReason,
		})
		// Don't necessarily need to reload here as we navigate away

		// 2. Prepare data for the new duplicate (similar to duplicateLetter)
		const payload = originalData
		const fieldsToExclude = [
			'name',
			'creation',
			'modified',
			'modified_by',
			'owner',
			'deliverable',
			'signature',
			'cancellation_reason',
			'status',
			'date', // Reset status and date
			'idx',
			'_user_tags',
			'_comments',
			'_assign',
			'_liked_by',
			'docstatus',
		]
		fieldsToExclude.forEach((field) => delete payload[field])

		payload.doctype = 'RUA Letter'
		payload.status = 'Draft' // New document is Draft
		payload.date = getServerDate() // Set new date
		payload.is_template = 0

		// Update system title for the copy
		payload.system_title = payload.system_title
			? `${payload.system_title} (Copy)`
			: `${payload.name} (Copy)`
		// Optionally update print title too if desired
		// if (payload.title) { payload.title = `${payload.title} (Copy)`; }

		// 3. Create the new draft document
		const response = await letterListResource.insert.submit(payload)
		const newDocName = response?.name

		if (!newDocName) {
			throw new Error('Failed to get the name of the duplicated document.')
		}

		// 4. Success and Navigate
		// frappe.show_alert({ message: 'Document Cancelled and Duplicate Created.', indicator: 'green' });
		router.push({ name: 'LetterDetails', params: { id: newDocName } })
	} catch (err) {
		console.error('Error during Cancel & Duplicate:', err)
		// frappe.show_alert({ message: err.message || 'Failed to cancel and duplicate.', indicator: 'red' });
		// Reload the current doc state to show potential cancellation failure
		letterResource.value.reload()
	} finally {
		isSaving.value = false
	}
}

// --- Lifecycle Hooks ---
onMounted(() => {
	if (documentId.value) {
		initializeLetterResource(documentId.value)
	}
})

// --- Watchers ---
watch(documentId, (newId, oldId) => {
	if (newId && newId !== oldId) {
		isEditMode.value = false // Exit edit mode when navigating between documents
		initializeLetterResource(newId)
	}
})

// Watch for resource changes to update editableDoc (e.g., after reload)
watch(
	() => letterResource.value?.doc,
	(newDoc) => {
		if (newDoc && !isEditMode.value) {
			// Only reset if not currently editing
			resetEditableDoc()
		}
	},
	{ deep: true },
)
</script>

<style scoped>
.letter-details-container {
	/* Add overall container styles if needed */
}
.prose {
	line-height: 1.6;
}
.prose :where(p):first-child {
	margin-top: 0;
}
.prose :where(p):last-child {
	margin-bottom: 0;
}
/* Ensure RTL text alignment in view mode */
.text-right[dir='rtl'] {
	text-align: right;
}

/* Styles for view mode fields */
.view-field {
	margin-bottom: 1rem; /* Add some space between fields */
}
.field-label {
	display: block;
	font-size: 0.875rem; /* text-sm */
	font-weight: 500; /* font-medium */
	color: #4b5563; /* text-gray-600 */
	margin-bottom: 0.25rem;
}
.field-value {
	font-size: 0.875rem; /* text-sm */
	color: #1f2937; /* text-gray-900 */
	padding: 0.5rem 0.75rem; /* Match form control padding roughly */
	border: 1px solid transparent; /* Maintain layout consistency */
	min-height: 38px; /* Match form control height */
	line-height: 1.5;
	word-wrap: break-word;
}
.field-value.prose {
	/* Specific style for HTML content */
	border: 1px solid #e5e7eb; /* border-gray-200 */
	background-color: #f9fafb; /* bg-gray-50 */
	min-height: 100px;
	padding: 0.75rem; /* p-3 */
}
</style>
