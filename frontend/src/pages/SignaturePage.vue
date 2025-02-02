<template>
	<div class="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
		<!-- Floating Container -->
		<div class="container mx-auto max-w-xl px-4 py-8 flex-1 flex items-center">
			<div class="w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
				<!-- Header Section -->
				<div class="bg-gray-900 text-white p-6 flex items-center space-x-4">
					<img
						src="/logo.png"
						alt="Company Logo"
						class="h-10 w-auto object-contain invert"
						@error="$event.target.style.display = 'none'"
					/>
					<div>
						<h1 class="text-2xl font-bold">Sign Document</h1>
						<p class="text-sm text-gray-300 truncate max-w-full">
							{{ docInfo?.doctype.replace('RUA ', '') }} - {{ docInfo?.docname }}
						</p>
					</div>
				</div>

				<!-- Loading State -->
				<div v-if="loading" class="p-8 text-center">
					<div class="flex justify-center items-center space-x-3">
						<div class="animate-spin">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-8 w-8 text-gray-900"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</div>
						<p class="text-gray-600">Loading document...</p>
					</div>
				</div>

				<!-- Error State -->
				<div v-else-if="error" class="p-6 bg-red-50">
					<div class="flex items-start space-x-4 text-red-700">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<div>
							<h3 class="font-semibold">Something went wrong</h3>
							<p class="text-sm">{{ error }}</p>
						</div>
					</div>
				</div>

				<!-- Success State -->
				<div v-else-if="success" class="p-8 text-center">
					<div class="flex flex-col items-center space-y-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-16 w-16 text-green-500"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
						<h2 class="text-2xl font-bold text-green-700">
							Document Signed Successfully
						</h2>
						<p class="text-gray-600">You can now close this window.</p>
					</div>
				</div>

				<!-- Signature Capture -->
				<div v-else class="p-6 space-y-6">
					<div
						class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden"
					>
						<VueSignaturePad
							ref="signaturePad"
							width="100%"
							height="250px"
							:options="{
								penColor: 'rgb(17, 24, 39)',
								backgroundColor: 'rgb(249, 250, 251)',
							}"
							:maxWidth="2"
							:minWidth="2"
							@endStroke="handleEndStroke"
							class="cursor-crosshair"
						/>
					</div>

					<div class="space-y-4">
						<div class="text-center">
							<p class="text-sm text-gray-600">
								Sign within the box above. Make sure your signature is clear and
								legible.
							</p>
						</div>

						<div class="flex justify-between space-x-4">
							<Button
								variant="outline"
								size="md"
								class="flex-1 border-gray-900 text-gray-900 hover:bg-gray-100"
								@click="handleClear"
							>
								<template #prefix>
									<FeatherIcon name="trash-2" class="w-4 h-4" />
								</template>
								<span>Clear</span>
							</Button>

							<Button
								variant="solid"
								size="md"
								class="flex-1 bg-gray-900 enabled:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
								:loading="isSubmitting"
								:disabled="isSubmitting || !canSubmit"
								@click="handleSubmit"
							>
								<template #prefix>
									<FeatherIcon name="check" class="w-4 h-4" />
								</template>
								<span>Submit Signature</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Subtle Footer -->
		<footer class="text-center text-gray-500 text-xs py-4">
			<p>© Rua Company Aluminum & Glass L.L.C O.P.C </p>
		</footer>
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { VueSignaturePad } from '@selemondev/vue3-signature-pad'
import { Button, FeatherIcon, LoadingIndicator } from 'frappe-ui'

const route = useRoute()
const token = route.params.token
const apiKey = ref(route.query.ak)
const apiSecret = ref(route.query.as)

// State management
const loading = ref(true)
const error = ref('')
const success = ref(false)
const isSubmitting = ref(false)
const docInfo = ref(null)
const canSubmit = ref(false)

// Refs
const signaturePad = ref(null)

function addWatermark() {
	if (signaturePad.value && docInfo.value?.docname) {
		try {
			const canvas = signaturePad.value.$el.querySelector('canvas')
			const ctx = canvas.getContext('2d')
			const width = canvas.width
			const height = canvas.height

			ctx.save()

			const text = docInfo.value.docname
			ctx.font = '14px Inter, sans-serif'
			ctx.fillStyle = 'rgba(100, 116, 139, 0.2)'

			ctx.rotate((-45 * Math.PI) / 180)

			const spacing = 120
			const lineSpacing = 80
			const numLines = Math.ceil((width + height) / lineSpacing) + 4

			const startX = -(width + height) * 1.2
			const startY = -(width + height) / 1.5

			for (let line = 0; line < numLines; line++) {
				const yPos = startY + line * lineSpacing
				const lineLength = (width + height) * 1.5
				const numMarks = Math.ceil(lineLength / spacing) + 4

				for (let mark = 0; mark < numMarks; mark++) {
					const xPos = startX + mark * spacing
					ctx.fillText(text, xPos, yPos)
				}
			}

			ctx.restore()
		} catch (err) {
			console.error('Error adding watermark:', err)
		}
	}
}

// Canvas content detection
function handleEndStroke() {
	if (signaturePad.value) {
		const canvas = signaturePad.value.$el.querySelector('canvas')
		const context = canvas.getContext('2d')
		const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
		const hasContent = pixels.some((pixel) => pixel !== 0)
		canSubmit.value = hasContent
	}
}

function handleClear() {
	if (signaturePad.value) {
		signaturePad.value.clearCanvas()
		canSubmit.value = false
		setTimeout(addWatermark, 100)
	}
}

async function handleSubmit() {
	if (!apiKey.value || !apiSecret.value) {
		error.value = 'Missing authentication credentials'
		console.error('Missing API keys:', { apiKey: apiKey.value, apiSecret: apiSecret.value })
		return
	}

	if (!signaturePad.value || signaturePad.value.isCanvasEmpty()) {
		error.value = 'Please provide a signature'
		return
	}

	try {
		isSubmitting.value = true
		error.value = ''

		const canvas = signaturePad.value.$el.querySelector('canvas')
		const signatureData = canvas.toDataURL('image/png')

		const response = await fetch('/api/method/rua.api.submit_signature', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `token ${apiKey.value}:${apiSecret.value}`,
			},
			body: JSON.stringify({
				doctype: docInfo.value.doctype,
				docname: docInfo.value.docname,
				signature: signatureData,
				token: token,
			}),
		})

		const result = await response.json()
		if (!result.message?.success) {
			throw new Error(result.message?.message || 'Failed to submit signature')
		}

		success.value = true

		// Auto-close after 2 seconds
		setTimeout(() => {
			window.close()
		}, 2000)
	} catch (err) {
		console.error('Submission error:', err)
		error.value = err?.message || 'Failed to submit signature'
	} finally {
		isSubmitting.value = false
	}
}

async function initializePage() {
	try {
		loading.value = true
		error.value = ''

		const response = await fetch(`/api/method/rua.api.get_signature_page?token=${token}`)
		const result = await response.json()

		if (!result.message?.success) {
			throw new Error(result.message?.message || 'Failed to load signature page')
		}

		docInfo.value = result.message.data

		// Add watermark after initialization
		setTimeout(addWatermark, 100)
	} catch (err) {
		console.error('Initialization error:', err)
		error.value = err?.message || 'Failed to load signature page'
	} finally {
		loading.value = false
	}
}

// Watch for changes in docInfo to add watermark
watch(
	() => docInfo.value,
	(newVal) => {
		if (newVal) {
			setTimeout(addWatermark, 100)
		}
	},
)

// Initialize on mount
onMounted(() => {
	if (!route.query.ak || !route.query.as) {
		error.value = 'Invalid signature URL. Missing authentication parameters.'
		return
	}

	initializePage()
})
</script>

<style scoped>
/* Custom scrollbar for wider browser support */
* {
	scrollbar-width: thin;
	scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

*::-webkit-scrollbar {
	width: 8px;
}

*::-webkit-scrollbar-track {
	background: transparent;
}

*::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.2);
	border-radius: 20px;
}
.invert {
  filter: invert(1);
}
</style>
