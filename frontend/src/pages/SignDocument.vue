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
            onClick: signatureUrl ? () => showDialog = false : handleSubmit,
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
          <div v-if="signatureUrl" class="relative min-h-[400px]">
            <!-- Initial Success Animation -->
            <Transition
              enter="transition duration-500 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="transition duration-300 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <div v-if="showSuccessAnimation" class="absolute inset-0 flex flex-col items-center justify-center">
                <SuccessAnimation 
  class="w-96 h-96" 
  @animation-complete="() => {
    showSuccessAnimation = false
    showSignature = true
  }" 
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
                  <h3 class="text-xl font-medium text-gray-900">Document Successfully Signed!</h3>
                  <p class="text-sm text-gray-600">Your signature has been securely recorded and the document has been updated.</p>
                </div>
  
                <!-- Divider with icon -->
                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200"></div>
                  </div>
                  <div class="relative flex justify-center">
                    <span class="bg-white px-2">
                      <FeatherIcon name="pen-tool" class="h-5 w-5 text-gray-400" />
                    </span>
                  </div>
                </div>
  
                <!-- Signature Display with Frame -->
                <div class="transform transition-all duration-500 hover:scale-[1.02]">
                  <div class="border-2 border-gray-100 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
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
            <div v-if="!signatureUrl" class="space-y-6">
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
                    Scan the QR code to continue signing on your device.
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
  
              <!-- Passcode Input -->
              <div class="space-y-2">
                <FormControl
                  type="text"
                  ref_for
                  size="sm"
                  variant="subtle"
                  placeholder="COMING SOON"
                  :disabled="true"
                  label="or enter passcode"
                  v-model="passcode"
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
import {
  Dialog,
  Button,
  FormControl,
  FeatherIcon,
  LoadingIndicator,
} from 'frappe-ui'
import SuccessAnimation from './SuccessAnimation.vue'
import { getSocket } from '@/socket'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  doctype: {
    type: String,
    required: true
  },
  docname: {
    type: String,
    required: true
  }
})

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
const getDialogTitle = computed(() => {
  if (showSuccessAnimation.value) return ' '
  if (showSignature.value) return ' '
  return 'Sign Document'
})
// Inside the script setup
const openSigningPage = () => {
  if (signUrl.value) {
    window.open(signUrl.value, 'SignDocument', 'width=600,height=700,left=200,top=100')
  }
}


// Socket event handler
function handleSignatureEvent(data) {
  if (data.doctype === props.doctype && data.docname === props.docname) {
    signatureUrl.value = data.signature
    emit('signature-complete', data.signature)
    handleSuccessFlow()
  }
}

function handleSuccessFlow() {
  showSuccessAnimation.value = true
  // Wait for animation to complete before showing signature
  setTimeout(() => {
    showSuccessAnimation.value = false
    showSignature.value = true
  }, 3000) // Adjust timing based on your animation duration
}

// Watch for dialog visibility
watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal
  if (!newVal) {
    // Reset state when dialog closes
    signatureUrl.value = null
    error.value = ''
    passcode.value = ''
  }
})

watch(() => showDialog.value, (newVal) => {
  emit('update:modelValue', newVal)
  if (newVal && !signatureUrl.value) {
    initializeComponent()
  }
})

// Methods
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
        doctype: props.doctype,
        docname: props.docname,
      }),
    })
    
    const result = await response.json()
    if (!result.message?.success) {
      throw new Error(result.message?.message || 'Failed to generate token')
    }
    
    // Store token and API keys
    signatureToken.value = result.message.token
    apiKey.value = result.message.api_key
    apiSecret.value = result.message.api_secret

    // Create base URL with query parameters
    signUrl.value = `${window.location.origin}/frontend/sign/${result.message.token}?ak=${result.message.api_key}&as=${result.message.api_secret}`
    
    // Generate QR code from the complete URL
    qrCodeUrl.value = await QRCode.toDataURL(signUrl.value)
  } catch (err) {
    throw new Error('Failed to generate signature token: ' + (err.message || ''))
  }
}

async function generateQRCode() {
  try {
    if (!signatureToken.value) throw new Error('No signature token available')
    
    signUrl.value = `${window.location.origin}/frontend/sign/${signatureToken.value}?ak=${apiKey.value}&as=${apiSecret.value}`
    qrCodeUrl.value = await QRCode.toDataURL(signUrl.value)
  } catch (err) {
    throw new Error('Failed to generate QR code: ' + (err.message || ''))
  }
}

async function handleSubmit() {
  try {
    isSubmitting.value = true
    error.value = ''

    if (!passcode.value) {
      error.value = 'Please provide a passcode'
      return
    }

    const response = await fetch('/api/method/rua.api.submit_signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiKey.value}:${apiSecret.value}`
      },
      body: JSON.stringify({
        doctype: props.doctype,
        docname: props.docname,
        token: signatureToken.value,
        passcode: passcode.value,
        signature: null, // Since this is passcode submission
      }),
    })

    const result = await response.json()
    if (!result.message?.success) {
      throw new Error(result.message?.message || 'Failed to submit signature')
    }

    signatureUrl.value = result.message.signature_url
    emit('signature-complete', result.message.signature_url)
    handleSuccessFlow()

  } catch (err) {
    error.value = err?.message || 'Failed to submit signature'
    console.error('Submission error:', err)
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  // Initialize if dialog is open
  if (showDialog.value) {
    initializeComponent()
  }
  
  // Setup socket listener
  socket.on('rua:signature', handleSignatureEvent)
})

onUnmounted(() => {
  // Cleanup socket listener
  socket.off('rua:signature', handleSignatureEvent)
})

watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal
  if (!newVal) {
    signatureUrl.value = null
    error.value = ''
    passcode.value = ''
    showSuccessAnimation.value = false
    showSignature.value = false
  }
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