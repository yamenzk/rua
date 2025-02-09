# SignDocument.vue
<template>
	<Dialog
		v-model="showDialog"
		:options="{
			title: getDialogTitle,
			size: 'md',
			actions: [
				{
					label: signatureUrl ? 'Close' : 'Submit',
					variant: 'solid',
					loading: isSubmitting,
					onClick: signatureUrl ? () => (showDialog = false) : handleSubmit,
					disabled: isSubmitting || (!signatureUrl && !passcode),
				},
			],
		}"
	>
		<template #body-content>
			<div class="space-y-6">
				<!-- Error Alert -->
				<div v-if="error" class="bg-red-50 px-4 py-3 rounded">
					<div class="flex">
						<FeatherIcon name="alert-circle" class="h-5 w-5 text-red-400" />
						<div class="ml-3">
							<p class="text-sm text-red-600">{{ error }}</p>
						</div>
					</div>
				</div>

				<!-- Success State -->
				<div v-if="showSuccessAnimation || signatureUrl" class="relative min-h-[400px]">
					<!-- Initial Success Animation -->
					<Transition
						enter="transition duration-500 ease-out"
						enter-from="opacity-0 scale-95"
						enter-to="opacity-100 scale-100"
						leave="transition duration-300 ease-in"
						leave-from="opacity-100 scale-100"
						leave-to="opacity-0 scale-95"
					>
						<div
							v-if="showSuccessAnimation"
							class="absolute inset-0 flex flex-col items-center justify-center"
						>
							<SuccessAnimation
								class="w-96 h-96"
								@animation-complete="handleAnimationComplete"
							/>
						</div>
					</Transition>

					<!-- Success Message and Signature -->
					<Transition
						enter="transition-all duration-700 delay-500"
						enter-from="opacity-0 translate-y-4"
						enter-to="opacity-100 translate-y-0"
					>
						<div v-if="showSignature" class="space-y-6">
							<!-- Success Message -->
							<div class="text-center space-y-2">
								<h3 v-if="props.isEmployee" class="text-xl font-medium text-gray-900">
									Signature registered successfully.
								</h3>
                <h3 v-else class="text-xl font-medium text-gray-900">
                  Document Successfully Signed!
                </h3>
								<p v-if="!props.isEmployee" class="text-sm text-gray-600">
									Your signature has been securely recorded and the document has
									been updated.
								</p>
                <p v-else class="text-sm text-gray-600">
                  Signature saved. To use it as a passcode, add a document number from employee documents.
                </p>
							</div>

							<!-- Divider with icon -->
							<div class="relative">
								<div class="absolute inset-0 flex items-center">
									<div class="w-full border-t border-gray-200"></div>
								</div>
								<div class="relative flex justify-center">
									<span class="bg-white px-2">
										<FeatherIcon
											name="pen-tool"
											class="h-5 w-5 text-gray-400"
										/>
									</span>
								</div>
							</div>

							<!-- Signature Display with Frame -->
							<div class="transform transition-all duration-500 hover:scale-[1.02]">
								<div
									class="border-2 border-gray-100 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
								>
									<div class="text-xs text-gray-500 mb-2">Your Signature:</div>
									<img
										:src="signatureUrl"
										alt="Signature"
										class="max-w-full h-auto mx-auto"
									/>
								</div>
							</div>
						</div>
					</Transition>
				</div>

				<!-- Sign Document Content -->
				<Transition
					enter="transition-all duration-300"
					enter-from="opacity-0"
					enter-to="opacity-100"
					leave="transition-all duration-300"
					leave-from="opacity-100"
					leave-to="opacity-0"
				>
					<div v-if="!showSuccessAnimation && !signatureUrl" class="space-y-6">
						<!-- QR Code Section -->
						<div class="flex flex-col items-center space-y-4">
							<img
								v-if="qrCodeUrl"
								:src="qrCodeUrl"
								alt="Scan to sign"
								class="w-48 h-48"
							/>
							<div v-else class="w-48 h-48 flex items-center justify-center">
								<LoadingIndicator />
							</div>
							<div class="space-y-2 text-center">
								<p class="text-sm text-gray-600">
									{{
										isEmployee
											? 'Scan to create employee signature'
											: 'Scan the QR code to continue signing on your device.'
									}}
								</p>
								<a
									v-if="signUrl"
									:href="signUrl"
									@click.prevent="openSigningPage"
									class="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
								>
									<FeatherIcon name="external-link" class="w-4 h-4" />
									<span>Open signing page</span>
								</a>
							</div>
						</div>

						 <!-- Passcode Input - Only show if not employee signature -->
  <div v-if="!isEmployee" class="space-y-2">
    <FormControl
      type="text"
      ref_for
      size="sm"
      variant="subtle"
      placeholder="Document Number"
      :disabled="false"
      label="or enter a signature number"
      v-model="passcode"
      @keyup.enter="handleSubmit"
    />
  </div>
					</div>
				</Transition>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import QRCode from 'qrcode'
import { Dialog, FormControl, FeatherIcon, LoadingIndicator } from 'frappe-ui'
import SuccessAnimation from '@/components/common/SuccessAnimation.vue'
import { getSocket } from '@/socket'
import { useRoute } from 'vue-router'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	doctype: {
		type: String,
		required: true,
	},
	docname: {
		type: String,
		required: true,
	},
	isEmployee: {
		type: Boolean,
		default: false,
	},
})

const route = useRoute()
const emit = defineEmits(['update:modelValue', 'signature-complete'])

// State
const showDialog = ref(props.modelValue)
const qrCodeUrl = ref('')
const signUrl = ref('')
const passcode = ref('')
const error = ref('')
const isSubmitting = ref(false)
const signatureToken = ref(null)
const apiKey = ref('')
const apiSecret = ref('')
const signatureUrl = ref(null)
const socket = getSocket()
const showSuccessAnimation = ref(false)
const showSignature = ref(false)
const pendingSignature = ref(null)

const getDialogTitle = computed(() => {
	if (showSuccessAnimation.value) return ' '
	if (showSignature.value) return ' '
	return 'Sign Document'
})

// Methods
const openSigningPage = () => {
	if (signUrl.value) {
		window.open(signUrl.value, 'SignDocument', 'width=600,height=700,left=200,top=100')
	}
}

const completeSignatureFlow = () => {
	//console.log('Completing signature flow')
	showSuccessAnimation.value = false
	if (pendingSignature.value) {
		signatureUrl.value = pendingSignature.value
		showSignature.value = true
		pendingSignature.value = null
	}
}

const handleAnimationComplete = () => {
	//console.log('Animation complete event received')
	completeSignatureFlow()
}

const startSuccessFlow = (signature) => {
	//console.log('Starting success flow')
	pendingSignature.value = signature
	showSuccessAnimation.value = true
	showSignature.value = false

	// Backup timeout in case animation complete event doesn't fire
	setTimeout(() => {
		if (showSuccessAnimation.value) {
			//console.log('Animation timeout triggered')
			completeSignatureFlow()
		}
	}, 2200) // 2 seconds timeout
}

function handleSignatureEvent(data) {
	if (
		data.doctype === documentInfo.value.doctype &&
		data.docname === documentInfo.value.docname
	) {
		//console.log('Signature event received')
		startSuccessFlow(data.signature)
		emit('signature-complete', data.signature)
	}
}

const documentInfo = computed(() => {
  // First try to use props
  if (props.doctype && props.docname) {
    return {
      doctype: props.doctype,
      docname: props.docname,
    }
  }

  // Fallback to route parsing
  const path = route.path
  const segments = path.split('/')

  const doctypeMap = {
    quotation: 'RUA Quotation',
    invoice: 'RUA Invoice',
    rfq: 'RUA RFQ',
    lpo: 'RUA LPO',
    receipt: 'RUA Purchase Receipt',
    payment: 'RUA Payment',
    employee: 'RUA Employee'
  }

  // Check if we're on an employee overview page
  const overviewIndex = segments.findIndex(s => s === 'overview')
  if (overviewIndex > 0) {
    const docIdentifier = segments[overviewIndex - 2]  // 'employee'
    const docname = segments[overviewIndex - 1]        // 'RC-EMP-00003'
    const doctype = doctypeMap[docIdentifier]

    if (!doctype || !docname) {
      throw new Error('Could not determine document type or name from route')
    }

    return { doctype, docname }
  }

  // Original logic for other documents
  const docIdentifier = segments[segments.length - 2]
  const docname = segments[segments.length - 1]
  const doctype = doctypeMap[docIdentifier]

  if (!doctype || !docname) {
    throw new Error('Could not determine document type or name from route')
  }

  return { doctype, docname }
})

watch(
	() => props.modelValue,
	(newVal) => {
		showDialog.value = newVal
		if (!newVal) {
			// Reset state when dialog closes
			signatureUrl.value = null
			error.value = ''
			passcode.value = ''
			showSuccessAnimation.value = false
			showSignature.value = false
			pendingSignature.value = null
		}
	},
)

watch(
	() => showDialog.value,
	(newVal) => {
		emit('update:modelValue', newVal)
		if (newVal && !signatureUrl.value) {
			initializeComponent()
		}
	},
)

async function initializeComponent() {
	try {
		await generateToken()
		await generateQRCode()
	} catch (err) {
		error.value = err?.message || 'Failed to initialize signature component'
		console.error('Initialization error:', err)
	}
}

async function generateToken() {
	try {
		const response = await fetch('/api/method/rua.api.generate_signature_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				doctype: documentInfo.value.doctype,
				docname: documentInfo.value.docname,
			}),
		})

		const result = await response.json()
		if (!result.message?.success) {
			throw new Error(result.message?.message || 'Failed to generate token')
		}

		signatureToken.value = result.message.token
		apiKey.value = result.message.api_key
		apiSecret.value = result.message.api_secret
		signUrl.value = `${window.location.origin}/admin/sign/${result.message.token}?ak=${result.message.api_key}&as=${result.message.api_secret}`

		qrCodeUrl.value = await QRCode.toDataURL(signUrl.value)
	} catch (err) {
		throw new Error('Failed to generate signature token: ' + (err.message || ''))
	}
}

async function generateQRCode() {
	try {
		if (!signatureToken.value) throw new Error('No signature token available')

		signUrl.value = `${window.location.origin}/admin/sign/${signatureToken.value}?ak=${apiKey.value}&as=${apiSecret.value}`
		qrCodeUrl.value = await QRCode.toDataURL(signUrl.value)
	} catch (err) {
		throw new Error('Failed to generate QR code: ' + (err.message || ''))
	}
}

async function handleSubmit() {
  if (!props.isEmployee && !passcode.value) {
    error.value = 'Please enter a passcode'
    return
  }

  try {
    isSubmitting.value = true
    error.value = ''

    const response = await fetch('/api/method/rua.api.submit_signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiKey.value}:${apiSecret.value}`
      },
      body: JSON.stringify({
        doctype: documentInfo.value.doctype,
        docname: documentInfo.value.docname,
        token: signatureToken.value,
        passcode: passcode.value,
        signature: null,
        is_employee: props.isEmployee
      }),
    })

    const result = await response.json()
    if (!result.message?.success) {
      throw new Error(result.message?.message || 'Failed to submit signature')
    }

    console.log('Submit success, starting animation')
    startSuccessFlow(result.message.signature_url)

  } catch (err) {
    error.value = err?.message || 'Failed to verify passcode'
    console.error('Submission error:', err)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
	if (showDialog.value) {
		initializeComponent()
	}
	socket.on('rua:signature', handleSignatureEvent)
})

onUnmounted(() => {
	socket.off('rua:signature', handleSignatureEvent)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
