# ProjectOverview.vue
<template>
	<div v-if="!projectResource?.doc" class="flex min-h-screen items-center justify-center">
		<LoadingIndicator />
	</div>

	<div v-else class="min-h-screen bg-gray-50 pb-8 transition-all duration-300">
		<!-- Hero Section with Image Carousel -->
		<div class="relative bg-white shadow-sm">
			<div class="h-64 w-full md:h-80">
				<!-- Image Carousel -->
				<div
					class="relative h-full w-full"
					@click.ctrl="handleImageClick()"
					@mouseenter="pauseAutoSlide"
					@mouseleave="resumeAutoSlide"
				>
					<TransitionGroup name="fade">
						<img
							v-for="(image, index) in allProjectImages"
							:key="image"
							:src="image"
							:alt="projectResource.doc?.project_name"
							class="absolute h-full w-full object-cover transition-opacity duration-500"
							:class="index === currentImageIndex ? 'opacity-100' : 'opacity-0'"
							@error="$event.target.style.display = 'none'"
						/>
					</TransitionGroup>

					<!-- Fallback for no images -->
					<div
						v-if="!allProjectImages.length"
						class="flex h-full w-full items-center justify-center bg-gray-100"
					>
						<FeatherIcon name="image" class="h-12 w-12 text-gray-400" />
					</div>

					<!-- Navigation Controls -->
					<template v-if="allProjectImages.length > 1">
						<!-- Arrow Buttons -->
						<button
							@click.stop="previousImage"
							class="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white transition-colors hover:bg-black/40"
						>
							<FeatherIcon name="chevron-left" class="h-5 w-5" />
						</button>
						<button
							@click.stop="nextImage"
							class="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white transition-colors hover:bg-black/40"
						>
							<FeatherIcon name="chevron-right" class="h-5 w-5" />
						</button>

						<!-- Indicators -->
						<div
							class="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2"
						>
							<button
								v-for="(_, index) in allProjectImages"
								:key="index"
								@click.stop="currentImageIndex = index"
								class="h-1.5 rounded-full transition-all duration-300"
								:class="[
									index === currentImageIndex
										? 'w-6 bg-white'
										: 'w-1.5 bg-white/60 hover:bg-white/80',
								]"
							/>
						</div>
					</template>

					<!-- Info Overlay -->
					<div
						class="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent"
					>
						<div class="absolute bottom-0 w-full p-6">
							<div class="flex items-end justify-between gap-4">
								<div class="flex-1">
									<h1 class="text-xl font-bold text-white md:text-2xl">
										{{ projectResource.doc?.project_name }}
									</h1>
									<div
										v-if="projectResource.doc?.location"
										class="mt-2 flex items-center text-white/80"
									>
										<FeatherIcon
											name="map-pin"
											class="mr-1.5 h-4 w-4 flex-shrink-0"
										/>
										<span class="text-sm">{{
											projectResource.doc?.location
										}}</span>
									</div>
								</div>
								<div class="text-right">
									<div class="text-2xl font-bold text-white md:text-3xl">
										{{ Math.round(projectResource.doc?.completion || 0) }}%
									</div>
									<div class="text-sm text-white/80">Complete</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="mx-auto px-4 pt-8 transition-all duration-300 sm:px-6 lg:px-8">
      <!-- About & Description -->
			<div class="mb-8">
				<h2 class="text-lg font-medium text-gray-900">About this Project</h2>
				<p class="mt-4 whitespace-pre-wrap text-gray-600">
					{{ projectResource.doc?.description || 'No description available' }}
				</p>
			</div>

			<!-- Project Stats Cards -->
			<div class="mb-8">
				<h2 class="mb-4 text-lg font-medium text-gray-900">Financial Overview</h2>
        <!-- Desktop Grid View -->
        <div class="hidden md:grid gap-4 auto-rows-fr"
        style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
    <!-- Contract Value Card -->
    <div class="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-sm">
      <div class="text-sm font-medium text-blue-100">Contract Value</div>
      <div class="mt-2 text-2xl font-semibold text-white">
        {{ formatCurrency(projectResource.doc?.contract_value) }}
      </div>
      <div class="mt-1 text-xs text-blue-100">Total Project Value</div>
    </div>

    <!-- Project Cost Card -->
    <div class="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-sm">
      <div class="text-sm font-medium text-red-100">Project Cost</div>
      <div class="mt-2 text-2xl font-semibold text-white">
        {{ formatCurrency(projectResource.doc?.project_cost) }}
      </div>
      <div class="mt-1 text-xs text-red-100">Estimated Cost</div>
    </div>

    <!-- Additional Expenses Card -->
    <div class="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-sm">
      <div class="text-sm font-medium text-orange-100">Additional Expenses</div>
      <div class="mt-2 text-2xl font-semibold text-white">
        {{ formatCurrency(projectResource.doc?.additional_expenses) }}
      </div>
      <div class="mt-1 text-xs text-orange-100">Extra Costs</div>
    </div>

    <!-- Project Profit Card -->
    <div class="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-sm">
      <div class="text-sm font-medium text-green-100">Project Profit</div>
      <div class="mt-2 text-2xl font-semibold text-white">
        {{ formatCurrency(calculateProfit) }}
      </div>
      <div class="mt-1 text-xs text-green-100">Expected Profit</div>
    </div>

    <!-- Total Invoiced Card -->
    <div class="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-sm">
      <div class="text-sm font-medium text-purple-100">Total Invoiced</div>
      <div class="mt-2 text-2xl font-semibold text-white">
        {{ formatCurrency(projectResource.doc?.total_invoiced) }}
      </div>
      <div class="mt-1 text-xs text-purple-100">Amount Invoiced</div>
    </div>

    <!-- Total Received Card -->
    <div class="rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 p-6 shadow-sm">
      <div class="text-sm font-medium text-teal-100">Total Received</div>
      <div class="mt-2 text-2xl font-semibold text-white">
        {{ formatCurrency(projectResource.doc?.total_received) }}
      </div>
      <div class="mt-1 text-xs text-teal-100">Amount Received</div>
    </div>
  </div>
				<!-- Mobile Scrollable View -->
				<div class="md:hidden">
					<div class="flex w-full overflow-x-auto pb-4 scrollbar-hide">
						<div class="flex gap-4">
							<!-- Contract Value Card -->
							<div
								class="min-w-[280px] rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-sm"
							>
								<div class="text-sm font-medium text-blue-100">Contract Value</div>
								<div class="mt-2 text-2xl font-semibold text-white">
									{{ formatCurrency(projectResource.doc?.contract_value) }}
								</div>
								<div class="mt-1 text-xs text-blue-100">Total Project Value</div>
							</div>

							<!-- Project Cost Card -->
							<div
								class="min-w-[280px] rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-sm"
							>
								<div class="text-sm font-medium text-red-100">Project Cost</div>
								<div class="mt-2 text-2xl font-semibold text-white">
									{{ formatCurrency(projectResource.doc?.project_cost) }}
								</div>
								<div class="mt-1 text-xs text-red-100">Estimated Cost</div>
							</div>

							<!-- Additional Expenses Card -->
							<div
								class="min-w-[280px] rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-sm"
							>
								<div class="text-sm font-medium text-orange-100">
									Additional Expenses
								</div>
								<div class="mt-2 text-2xl font-semibold text-white">
									{{ formatCurrency(projectResource.doc?.additional_expenses) }}
								</div>
								<div class="mt-1 text-xs text-orange-100">Extra Costs</div>
							</div>

							<!-- Project Profit Card -->
							<div
								class="min-w-[280px] rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-sm"
							>
								<div class="text-sm font-medium text-green-100">
									Project Profit
								</div>
								<div class="mt-2 text-2xl font-semibold text-white">
									{{ formatCurrency(calculateProfit) }}
								</div>
								<div class="mt-1 text-xs text-green-100">Expected Profit</div>
							</div>

							<!-- Total Invoiced Card -->
							<div
								class="min-w-[280px] rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-sm"
							>
								<div class="text-sm font-medium text-purple-100">
									Total Invoiced
								</div>
								<div class="mt-2 text-2xl font-semibold text-white">
									{{ formatCurrency(projectResource.doc?.total_invoiced) }}
								</div>
								<div class="mt-1 text-xs text-purple-100">Amount Invoiced</div>
							</div>

							<!-- Total Received Card -->
							<div
								class="min-w-[280px] rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 p-6 shadow-sm"
							>
								<div class="text-sm font-medium text-teal-100">Total Received</div>
								<div class="mt-2 text-2xl font-semibold text-white">
									{{ formatCurrency(projectResource.doc?.total_received) }}
								</div>
								<div class="mt-1 text-xs text-teal-100">Amount Received</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			

			<!-- Parties Sections -->
			<div class="space-y-8">
				<!-- Clients -->
				<section>
					<h2 class="mb-4 text-lg font-medium text-gray-900">Clients</h2>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<template v-if="clients.length">
							<div v-for="client in clients" :key="client.name">
								<PartyCard
									:party="client"
									:project-resource="projectResource"
									party-type="Client"
								/>
							</div>
						</template>
						<PartyCard
							:project-resource="projectResource"
							party-type="Client"
							:show-add-button="true"
						/>
					</div>
				</section>

				<!-- Suppliers -->
				<section>
					<h2 class="mb-4 text-lg font-medium text-gray-900">Suppliers</h2>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<template v-if="suppliers.length">
							<div v-for="supplier in suppliers" :key="supplier.name">
								<PartyCard
									:party="supplier"
									:project-resource="projectResource"
									party-type="Supplier"
								/>
							</div>
						</template>
						<PartyCard
							:project-resource="projectResource"
							party-type="Supplier"
							:show-add-button="true"
						/>
					</div>
				</section>

				<!-- Consultants -->
				<section>
					<h2 class="mb-4 text-lg font-medium text-gray-900">Consultants</h2>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<template v-if="consultants.length">
							<div v-for="consultant in consultants" :key="consultant.name">
								<PartyCard
									:party="consultant"
									:project-resource="projectResource"
									party-type="Consultant"
								/>
							</div>
						</template>
						<PartyCard
							:project-resource="projectResource"
							party-type="Consultant"
							:show-add-button="true"
						/>
					</div>
				</section>
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
						private: false,
					}"
					@success="handleUploadSuccess"
					v-slot="{ openFileSelector, file, uploading, progress, error }"
				>
					<div
						class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-900 transition-colors cursor-pointer"
						@click="openFileSelector"
						@dragover.prevent="$event.currentTarget.classList.add('border-gray-900')"
						@dragleave.prevent="
							$event.currentTarget.classList.remove('border-gray-900')
						"
						@drop.prevent="handleDrop($event)"
					>
						<div class="flex flex-col items-center justify-center space-y-2">
							<div v-if="!file" class="text-center">
								<FeatherIcon
									name="upload-cloud"
									class="w-8 h-8 text-gray-400 mx-auto mb-2"
								/>
								<div class="text-sm font-medium text-gray-900">
									Click to upload an image
								</div>
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
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FeatherIcon, LoadingIndicator, Dialog, Button, FileUploader } from 'frappe-ui'
import PartyCard from '@/components/project/PartyCard.vue'
import { documentResource } from '@/data/document'
import { formatCurrency } from '@/utils/format'

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
		},
	},
	isCollapsed: {
		type: Boolean,
		default: false,
	},
})

// Image upload state
const showImageDialog = ref(false)
const newImage = ref(null)
const isUploading = ref(false)
const uploadedResult = ref(null)

// Computed properties for filtering parties
const clients = computed(() => {
	if (!props.projectResource.doc?.parties) return []
	const parties =
		typeof props.projectResource.doc.parties === 'string'
			? JSON.parse(props.projectResource.doc.parties)
			: props.projectResource.doc.parties
	return parties?.filter((p) => p.type === 'Client') || []
})

const allProjectImages = computed(() => {
	const mainImage = props.projectResource.doc?.image
	return mainImage ? [mainImage, ...projectImages.value] : projectImages.value
})

const suppliers = computed(() => {
	if (!props.projectResource.doc?.parties) return []
	const parties =
		typeof props.projectResource.doc.parties === 'string'
			? JSON.parse(props.projectResource.doc.parties)
			: props.projectResource.doc.parties
	return (
		parties?.filter((p) =>
			['Supplier: Glass', 'Supplier: Cladding', 'Supplier: Aluminum', 'Supplier'].includes(
				p.type,
			),
		) || []
	)
})

const consultants = computed(() => {
	if (!props.projectResource.doc?.parties) return []
	const parties =
		typeof props.projectResource.doc.parties === 'string'
			? JSON.parse(props.projectResource.doc.parties)
			: props.projectResource.doc.parties
	return parties?.filter((p) => p.type === 'Consultant') || []
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
		['tags', 'like', '%Project Image%'],
	]

	try {
		await documentResource.reload()
		if (documentResource.data) {
			projectImages.value = documentResource.data.map((doc) => doc.document).filter(Boolean)
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
	currentImageIndex.value =
		currentImageIndex.value === 0
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
			image: uploadedResult.value.file_url,
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
</script>
