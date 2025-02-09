<!-- ProjectChat.vue -->
<template>
	<div class="h-full flex flex-col bg-gray-50">
	  <!-- Scrollable Messages Container -->
	  <div
		ref="chatContainer"
		class="flex-1 overflow-y-auto px-4 py-6 space-y-4"
		:style="{ paddingBottom: `${inputHeight}px` }"
	  >
		<!-- Empty State -->
		<template v-if="!messages?.length">
		  <div class="flex flex-col items-center justify-center h-full text-center space-y-4">
			<div class="bg-white rounded-full p-6 shadow-md">
			  <FeatherIcon 
				name="message-circle" 
				class="w-16 h-16 text-gray-900 animate-pulse" 
			  />
			</div>
			<div>
			  <h3 class="text-xl font-semibold text-gray-900 mb-2">
				No Messages Yet
			  </h3>
			  <p class="text-sm text-gray-600 max-w-xs">
				Start the conversation by sending a message or referencing project documents.
			  </p>
			</div>
		  </div>
		</template>
  
		<!-- Messages -->
		<template v-else>
		  <template v-for="message in messages" :key="message.name">
			<!-- System Messages -->
			<div 
			  v-if="message.type !== 'Chat Message'" 
			  class="flex justify-center"
			>
			  <div 
				class="max-w-xl w-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
			  >
				<div 
				  class="px-6 py-4 bg-gradient-to-br relative"
				  :class="getSystemMessageGradient(message.type)"
				>
				  <div class="absolute top-0 left-0 right-0 h-1" :class="getSystemMessageGradient(message.type)"></div>
				  
				  <div class="flex items-center space-x-4">
					<div 
					  class="rounded-full p-2 bg-white/20 backdrop-blur-sm"
					>
					  <FeatherIcon
						:name="getSystemMessageIcon(message.type)"
						class="w-6 h-6 text-white"
					  />
					</div>
					
					<div class="flex-1">
					  <p 
						class="text-white text-sm leading-relaxed"
						v-html="formatMessageWithReferences(
						  message.message,
						  false,
						  true
						)"
					  ></p>
					</div>
				  </div>
				  
				  <div class="mt-3 flex justify-between items-center text-white/80">
					<div class="flex items-center space-x-2 text-xs">
					  <FeatherIcon name="clock" class="w-4 h-4" />
					  <span>
						{{ formatDate(message.timestamp, DATE_FORMATS.SHORT_DATE_TIME) }}
					  </span>
					</div>
					
					<template v-if="parseMessageAction(message.message)">
					  <a 
						:href="parseMessageAction(message.message).url"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-all"
					  >
						<span class="text-xs font-medium">
						  {{ parseMessageAction(message.message).label }}
						</span>
						<FeatherIcon name="arrow-right" class="w-4 h-4" />
					  </a>
					</template>
				  </div>
				</div>
			  </div>
			</div>
  
			<!-- Chat Messages -->
			<div 
			  v-else 
			  class="flex items-end space-x-3"
			  :class="message.user === session.user ? 'flex-row-reverse space-x-reverse' : ''"
			>
			  <Avatar
				:image="message.employee_image"
				:label="message.employee_name"
				size="md"
				class="flex-shrink-0"
			  />
			  
			  <div 
				class="max-w-[70%] space-y-1.5"
				:class="message.user === session.user ? 'items-end' : 'items-start'"
			  >
				<div 
				  class="text-xs font-medium text-gray-600"
				  :class="message.user === session.user ? 'text-right' : 'text-left'"
				>
				  {{ message.employee_name }}
				</div>
				
				<div 
				  class="rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words"
				  :class="
					message.user === session.user
					  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-none'
					  : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-200 text-white rounded-bl-none'
				  "
				  v-html="formatMessageWithReferences(
					message.message,
					message.user === session.user
				  )"
				></div>
				
				<div 
				  class="text-xs text-gray-500"
				  :class="message.user === session.user ? 'text-right' : 'text-left'"
				>
				  {{ formatDate(message.timestamp, DATE_FORMATS.SHORT_DATE_TIME) }}
				</div>
			  </div>
			</div>
		  </template>
		</template>
	  </div>
  
	  <!-- Input Area -->
	  <div 
		ref="inputArea"
		class="sticky bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40"
	  >
		<form 
		  @submit.prevent="sendMessage" 
		  class="flex items-center space-x-2 p-4"
		>
		  <div class="flex-1 relative">
			<input
			  ref="inputRef"
			  v-model="newMessage"
			  type="text"
			  placeholder="Type your message... (Use # for references, @ for mentions)"
			  class="w-full py-2.5 px-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
			  :disabled="messages?.insert?.loading"
			  @input="handleInput"
			  @keydown="handleKeydown"
			/>
  
			<!-- References Autocomplete -->
			<div 
			  v-if="showReferencesList && filteredReferences.length"
			  class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50"
			>
			  <div class="p-2">
				<div 
				  v-for="ref in filteredReferences" 
				  :key="ref.name"
				  @click="selectReference(ref)"
				  class="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group"
				>
				  <div class="flex items-center space-x-3">
					<Badge
					  :label="stripRUAPrefix(ref.doctype)"
					  size="sm"
					  variant="outline"
					  theme="gray"
					/>
					<div>
					  <div class="flex items-center space-x-2">
						<span class="font-medium text-gray-800 group-hover:text-primary-600">
						  {{ ref.name }}
						</span>
						<span class="text-xs text-gray-500">
						  {{ ref.party }}
						</span>
					  </div>
					</div>
				  </div>
				  <span class="text-xs text-gray-500">
					{{ formatDate(ref.date, DATE_FORMATS.SHORT_DATE) }}
				  </span>
				</div>
			  </div>
			</div>
  
			<!-- Users Autocomplete -->
			<div 
			  v-if="showUsersList && filteredUsers.length"
			  class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50"
			>
			  <div class="p-2">
				<div 
				  v-for="user in filteredUsers" 
				  :key="user.name"
				  @click="selectUserMention(user)"
				  class="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group"
				>
				  <div class="flex items-center space-x-3">
					<Avatar
					  :image="user.image"
					  :label="user.employee_name"
					  size="sm"
					/>
					<div>
					  <span class="font-medium text-gray-800 group-hover:text-primary-600">
						{{ user.employee_name }}
					  </span>
					  <div class="text-xs text-gray-500">
						{{ user.name }}
					  </div>
					</div>
				  </div>
				</div>
			  </div>
			</div>
		  </div>
  
		  <Button
			type="submit"
			variant="solid"
			theme="gray"
			class="rounded-full p-6 flex items-center justify-center"
			:loading="messages?.insert?.loading"
			:disabled="isSubmitDisabled"
		  >
			<FeatherIcon name="send" class="w-6 h-6" />
		  </Button>
		</form>
	  </div>
	</div>
  </template>

<script setup>
import { ref, onMounted, nextTick, watch, computed, onUnmounted } from 'vue'
import { session } from '@/data/session'
import { Avatar, Button, FeatherIcon, Badge } from 'frappe-ui'
import { chatResource } from '@/data/chat'
import { quotationResource } from '@/data/quotation'
import { rfqResource } from '@/data/rfq'
import { lpoResource } from '@/data/lpo'
import { invoiceResource } from '@/data/invoice'
import { employeeResource } from '@/data/employee'
import { paymentResource } from '@/data/payment'
import { purchaseReceiptResource } from '@/data/purchaseReceipt'
import { formatDate, DATE_FORMATS, getDatabaseTimestamp  } from '@/utils/format'

// Props
const props = defineProps({
	projectResource: {
		type: Object,
		required: true,
		validator: (value) => {
			return value && typeof value === 'object' && 'doc' in value
		},
	},
})

const inputArea = ref(null)
const inputHeight = ref(0)
const isMobile = ref(false)

function checkMobile() {
	isMobile.value = window.innerWidth < 768 // 768px is the md breakpoint in Tailwind
}

onMounted(() => {
	// Calculate input area height for proper padding
	if (inputArea.value) {
		inputHeight.value = inputArea.value.offsetHeight
	}

	// Initial mobile check
	checkMobile()

	// Update on resize
	window.addEventListener('resize', () => {
		updateInputHeight()
		checkMobile()
	})

	scrollToBottom()
})

onUnmounted(() => {
	window.removeEventListener('resize', () => {
		updateInputHeight()
		checkMobile()
	})
})

function updateInputHeight() {
	if (inputArea.value) {
		inputHeight.value = inputArea.value.offsetHeight
	}
}

// State
const newMessage = ref('')
const chatContainer = ref(null)
const showReferencesList = ref(false)
const showUsersList = ref(false)
const filteredUsers = ref([])
const filteredReferences = ref([])
const cursorPosition = ref(0)
const inputRef = ref(null)

// Computed
const messages = computed(() => {
	return (
		chatResource.data?.filter((msg) => msg.project === props.projectResource.doc?.name) || []
	)
})

const references = computed(() => {
	const projectName = props.projectResource.doc?.name
	if (!projectName) return []

	const quotations = (quotationResource.data || [])
		.filter((q) => q.project === projectName)
		.map((q) => ({
			name: q.name,
			doctype: 'RUA Quotation',
			party: q.party,
			date: q.date,
			link: `/project/${projectName}/invoicing/quotation/${q.name}`,
		}))

	const rfqs = (rfqResource.data || [])
		.filter((r) => r.project === projectName)
		.map((r) => ({
			name: r.name,
			doctype: 'RUA RFQ',
			party: r.party,
			date: r.date,
			link: `/project/${projectName}/invoicing/rfq/${r.name}`,
		}))

	const lpos = (lpoResource.data || [])
		.filter((l) => l.project === projectName)
		.map((l) => ({
			name: l.name,
			doctype: 'RUA LPO',
			party: l.party,
			date: l.date,
			link: `/project/${projectName}/invoicing/lpo/${l.name}`,
		}))

	const invoices = (invoiceResource.data || [])
		.filter((i) => i.project === projectName)
		.map((i) => ({
			name: i.name,
			doctype: 'RUA Invoice',
			party: i.party,
			date: i.date,
			link: `/project/${projectName}/invoicing/invoice/${i.name}`,
		}))
	
	const payments = (paymentResource.data || [])
	.filter((p) => p.project === projectName)
	.map((p) => ({
		name: p.name,
		doctype: 'RUA Payment',
		party: p.party,
		date: p.date,
		link: `/project/${projectName}/invoicing/payment/${p.name}`,
	}))

	const receipts = (purchaseReceiptResource.data || [])
	.filter((r) => r.project === projectName)
	.map((r) => ({
		name: r.name,
		doctype: 'RUA Purchase Receipt',
		party: r.party,
		date: r.date,
		link: `/project/${projectName}/invoicing/receipt/${r.name}`,
	}))


	return [...quotations, ...rfqs, ...lpos, ...invoices, ...payments, ...receipts]
})

const users = computed(() => {
    return (employeeResource.data || [])
        .filter((u) => u.user) // Only filter out entries without a user
        .map((u) => ({
            name: u.user,
            employee_name: u.employee_name,
            image: u.image,
            user: u.user,
        }))
})

const isMessageEmpty = computed(() => !newMessage.value || !newMessage.value.trim())
const isSubmitDisabled = computed(() => isMessageEmpty.value || chatResource.insert?.loading)

// Methods
function parseMessageAction(message) {
  try {
    // Find the JSON array pattern at the end of the message
    const match = message.match(/\[(.*?)\]$/);
    if (match) {
      // Parse just the matched array portion
      const actionData = JSON.parse(`[${match[1]}]`);
      if (Array.isArray(actionData) && actionData.length === 2) {
        return {
          label: actionData[0],
          url: actionData[1]
        }
      }
    }
  } catch (e) {
    // If parsing fails, return null
    return null
  }
  return null
}

function getSystemMessageIcon(type) {
	switch (type) {
		case 'Info':
			return 'info'
		case 'Success':
			return 'check-circle'
		case 'Danger':
			return 'alert-circle'
		case 'Warning':
			return 'alert-triangle'
		case 'Alert':
			return 'bell'
		default:
			return 'message-circle'
	}
}




async function sendMessage() {
	if (!newMessage.value.trim() || !chatResource) return

	try {
		await chatResource.insert.submit({
			project: props.projectResource.doc.name,
			user: session.user,
			message: newMessage.value.trim(),
			type: 'Chat Message',
			timestamp: getDatabaseTimestamp(),
		})

		newMessage.value = ''
		scrollToBottom()
	} catch (error) {
		console.error('Failed to send message:', error)
	}
}

function filterUsers(searchTerm) {
    filteredUsers.value = users.value.filter(
        (user) => 
            // Filter out current user only in the autocomplete dropdown
            user.user !== session.user &&
            (user.employee_name.toLowerCase().includes(searchTerm) ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.user.toLowerCase().includes(searchTerm))
    )
}

function handleInput(event) {
	const text = event.target.value
	cursorPosition.value = event.target.selectionStart

	// Check for reference mentions
	const lastIndexOfHash = text.lastIndexOf('#', cursorPosition.value)
	if (lastIndexOfHash !== -1) {
		const nextSpace = text.indexOf(' ', lastIndexOfHash)
		const searchEnd = nextSpace === -1 ? text.length : nextSpace
		if (cursorPosition.value > lastIndexOfHash && cursorPosition.value <= searchEnd) {
			const searchTerm = text.slice(lastIndexOfHash + 1, searchEnd).toLowerCase()
			filterReferences(searchTerm)
			showReferencesList.value = true
			showUsersList.value = false
			return
		}
	}

	// Check for user mentions
	const lastIndexOfAt = text.lastIndexOf('@', cursorPosition.value)
	if (lastIndexOfAt !== -1) {
		const nextSpace = text.indexOf(' ', lastIndexOfAt)
		const searchEnd = nextSpace === -1 ? text.length : nextSpace
		if (cursorPosition.value > lastIndexOfAt && cursorPosition.value <= searchEnd) {
			const searchTerm = text.slice(lastIndexOfAt + 1, searchEnd).toLowerCase()
			filterUsers(searchTerm)
			showUsersList.value = true
			showReferencesList.value = false
			return
		}
	}

	showReferencesList.value = false
	showUsersList.value = false
}

function selectUserMention(user) {
    const text = newMessage.value
    const lastAt = text.lastIndexOf('@', cursorPosition.value)
    const nextSpace = text.indexOf(' ', lastAt)
    const searchEnd = nextSpace === -1 ? text.length : nextSpace

    // Use user.user (email) as the mention value
    newMessage.value = text.slice(0, lastAt) + '@' + user.user + text.slice(searchEnd)
    showUsersList.value = false

    // Focus back on input
    nextTick(() => {
        inputRef.value.focus()
    })
}

function handleKeydown(event) {
	// Handle references autocomplete
	if (showReferencesList.value) {
		if (event.key === 'Escape') {
			showReferencesList.value = false
			event.preventDefault()
		} else if (event.key === 'Tab') {
			if (filteredReferences.value.length > 0) {
				selectReference(filteredReferences.value[0])
				event.preventDefault()
			}
		}
	}

	// Handle users autocomplete
	if (showUsersList.value) {
		if (event.key === 'Escape') {
			showUsersList.value = false
			event.preventDefault()
		} else if (event.key === 'Tab') {
			if (filteredUsers.value.length > 0) {
				selectUserMention(filteredUsers.value[0])
				event.preventDefault()
			}
		}
	}
}

function filterReferences(searchTerm) {
	filteredReferences.value = references.value.filter(
		(ref) =>
			ref.name.toLowerCase().includes(searchTerm) ||
			ref.party.toLowerCase().includes(searchTerm) ||
			ref.doctype.toLowerCase().includes(searchTerm),
	)
}

function selectReference(ref) {
	const text = newMessage.value
	const lastHash = text.lastIndexOf('#', cursorPosition.value)
	const nextSpace = text.indexOf(' ', lastHash)
	const searchEnd = nextSpace === -1 ? text.length : nextSpace

	newMessage.value = text.slice(0, lastHash) + '#' + ref.name + text.slice(searchEnd)
	showReferencesList.value = false

	// Focus back on input
	nextTick(() => {
		inputRef.value.focus()
	})
}

function stripRUAPrefix(doctype) {
	return doctype.replace(/^RUA\s+/, '')
}

function getSystemMessageGradient(type) {
  switch (type) {
    case 'Info': return 'from-blue-500 to-blue-600'
    case 'Success': return 'from-green-500 to-green-600'
    case 'Warning': return 'from-yellow-500 to-yellow-600'
    case 'Danger': return 'from-red-500 to-red-600'
    case 'Alert': return 'from-purple-500 to-purple-600'
    default: return 'from-gray-500 to-gray-600'
  }
}

function formatMessageWithReferences(message, isUserMessage = false, isSystemMessage = false) {
  if (!message) return ''

  const refData = references.value || []
  const userData = users.value || []

  // Extract action data if exists
  const actionMatch = message.match(/\[(.*?)\]$/);
  let messageWithoutAction = message;
  if (actionMatch) {
    messageWithoutAction = message.replace(/\[(.*?)\]$/, '');
  }

  // URL Handling
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g
  let processedMessage = messageWithoutAction.replace(urlRegex, (url) => {
    const linkClasses = isSystemMessage 
      ? 'text-white underline decoration-white/30 hover:decoration-white/60'
      : isUserMessage
        ? 'text-white underline decoration-white/30 hover:decoration-white/60'
        : 'text-gray-900 underline decoration-gray-200/50 hover:decoration-gray-500/50'

    return `<a 
      href="${url}" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="${linkClasses} transition-all duration-200"
    >${url}</a>`
  })

  // Line breaks
  processedMessage = processedMessage.replace(/\n/g, '<br>')

  // References Handling
  let formattedMessage = processedMessage.replace(/#([A-Z0-9-]+)/g, (match, reference) => {
    const ref = refData.find((r) => r.name === reference)
    if (ref) {
      const bgClasses = isSystemMessage 
        ? 'bg-white/20' 
        : isUserMessage 
          ? 'bg-white/20 text-white' 
          : 'bg-gray-200'

      const textClasses = isSystemMessage 
        ? 'text-white hover:underline' 
        : isUserMessage 
          ? 'text-white hover:underline' 
          : 'text-gray-800 hover:underline'

      return `
        <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${bgClasses}">
          <a 
            href="${ref.link}" 
            class="${textClasses} font-medium transition-all"
          >
            ${ref.name}
          </a>
        </span>
      `
    }
    return match
  })

  // User Mentions Handling
  formattedMessage = formattedMessage.replace(/@([^\s]+)/g, (match, mentionName) => {
    const user = userData.find((u) => u.user === mentionName)
    if (user) {
      const bgClasses = isSystemMessage 
        ? 'bg-white/20' 
        : isUserMessage 
          ? 'bg-white/20 text-white' 
          : 'bg-gray-200'

      const textClasses = isSystemMessage 
        ? 'text-white' 
        : isUserMessage 
          ? 'text-white' 
          : 'text-gray-800'

      return `
        <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${bgClasses}">
          <span class="flex items-center">
            ${user.image ? `
              <img 
                src="${user.image}" 
                alt="${user.employee_name}" 
                class="w-4 h-4 rounded-full mr-1.5"
              />
            ` : ''}
            <span class="font-medium ${textClasses}">
              ${user.employee_name}
            </span>
          </span>
        </span>
      `
    }
    return match
  })

  return formattedMessage
}

function scrollToBottom() {
	nextTick(() => {
		if (chatContainer.value) {
			chatContainer.value.scrollTop = chatContainer.value.scrollHeight
		}
	})
}

// Watch for new messages to scroll
watch(
	() => messages.value?.length,
	() => scrollToBottom(),
	{ flush: 'post' },
)
</script>

<style scoped>
/* Ensure the input area stays fixed to the viewport on mobile */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
@media (max-width: 767px) {
	.fixed {
		position: fixed !important;
	}
}
</style>