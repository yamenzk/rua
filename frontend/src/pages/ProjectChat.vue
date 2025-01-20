<!-- ProjectChat.vue -->
<template>
	<div class="h-full flex flex-col bg-white">
		<!-- Scrollable Messages Container -->
		<div
			ref="chatContainer"
			class="flex-1 overflow-y-auto px-4 py-4"
			:style="{
				paddingBottom: '76px',
			}"
		>
			<template v-if="messages?.length">
				<div v-for="message in messages" :key="message.name">
					<!-- System Messages Template -->
<template v-if="message.type !== 'Chat Message'">
  <div class="flex justify-center my-6">
    <div class="max-w-[85%] w-full relative">
      <!-- Floating Icon -->
      <div 
        class="absolute -top-4 left-6 p-2 rounded-lg shadow-md z-10 transition-colors duration-200"
        :class="[
          message.type === 'Info' ? 'bg-blue-500' :
          message.type === 'Success' ? 'bg-green-500' :
          message.type === 'Warning' ? 'bg-yellow-500' :
          message.type === 'Danger' ? 'bg-red-500' :
          message.type === 'Alert' ? 'bg-purple-500' :
          'bg-gray-500'
        ]"
      >
        <FeatherIcon
          :name="getSystemMessageIcon(message.type)"
          class="w-5 h-5 text-white"
        />
      </div>

      <!-- Message Card -->
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 pt-6">
        <!-- Message Content -->
        <div class="mb-4 mt-2">
          <p 
            class="text-gray-700 text-sm leading-relaxed"
            v-html="formatMessageWithReferences(
              message.message,
              false,
              true
            )"
          ></p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between">
          <div class="flex items-center text-gray-500 text-sm">
            <FeatherIcon name="clock" class="w-4 h-4 mr-1" />
            {{ formatDate(message.timestamp) }}
          </div>

          <template v-if="parseMessageAction(message.message)">
            <a 
              :href="parseMessageAction(message.message).url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
              :class="[
                message.type === 'Info' ? 'bg-blue-500' :
                message.type === 'Success' ? 'bg-green-500' :
                message.type === 'Warning' ? 'bg-yellow-500' :
                message.type === 'Danger' ? 'bg-red-500' :
                message.type === 'Alert' ? 'bg-purple-500' :
                'bg-gray-500'
              ]"
            >
              {{ parseMessageAction(message.message).label }}
              <FeatherIcon name="arrow-right" class="w-4 h-4" />
            </a>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

					<!-- Chat Messages -->
					<template v-else>
						<div
							class="flex items-start gap-2 mb-4"
							:class="[
								message.user === session.user ? 'flex-row' : 'flex-row-reverse',
							]"
						>
							<Avatar
								:image="message.employee_image"
								:label="message.employee_name"
								size="sm"
								class="mt-1"
							/>
							<div
								class="flex-1 flex"
								:class="[
									message.user === session.user
										? 'justify-start'
										: 'justify-end',
								]"
							>
								<div class="max-w-[70%] space-y-1">
									<div
										class="flex items-center gap-2 px-1"
										:class="[
											message.user === session.user
												? 'flex-row'
												: 'flex-row-reverse',
										]"
									>
										<span class="text-sm font-medium text-gray-600">
											{{ message.employee_name }}
										</span>
									</div>
									<div
										:class="[
											'px-4 py-2 rounded-2xl shadow-sm',
											message.user === session.user
												? [
														'bg-blue-500 text-white rounded-tl-none',
														'bg-gradient-to-br from-blue-500 to-blue-600',
													]
												: [
														'bg-gray-100 text-gray-900 rounded-tr-none',
														'border border-gray-200',
													],
										]"
									>
										<span
											v-html="
												formatMessageWithReferences(
													message.message,
													message.user === session.user,
												)
											"
										></span>
									</div>
									<span class="text-xs text-gray-500">
										{{ formatDate(message.timestamp) }}
									</span>
								</div>
							</div>
						</div>
					</template>
				</div>
			</template>

			<!-- Empty State -->
			<div v-else class="flex flex-col items-center justify-center h-full text-center">
				<FeatherIcon name="message-circle" class="w-12 h-12 text-gray-400 mb-4" />
				<p class="text-base font-medium text-gray-900">No Messages Yet</p>
				<p class="text-sm text-gray-600">Start the conversation by sending a message.</p>
			</div>
		</div>

		<!-- Fixed Input Area -->
		<div
			ref="inputArea"
			class="fixed md:absolute left-0 right-0 bottom-[64px] md:bottom-0 bg-white border-t shadow-lg z-40"
		>
			<form @submit.prevent="sendMessage" class="flex items-center gap-3 p-4">
				<div class="flex-1 relative">
					<input
						ref="inputRef"
						v-model="newMessage"
						type="text"
						placeholder="Type your message..."
						class="w-full min-h-[44px] py-2 px-4 border border-gray-300 rounded-full transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						:disabled="messages?.insert?.loading"
						@input="handleInput"
						@keydown="handleKeydown"
					/>

					<!-- References Autocomplete -->
					<div
						v-if="showReferencesList && filteredReferences.length"
						class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50"
					>
						<div class="p-1 sm:p-2">
							<div
								v-for="ref in filteredReferences"
								:key="ref.name"
								@click="selectReference(ref)"
								class="group flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
							>
								<div class="flex items-center space-x-2 sm:space-x-3">
									<Badge
										:label="stripRUAPrefix(ref.doctype)"
										size="sm"
										:variant="'outline'"
										theme="gray"
										class="shrink-0 hidden sm:inline-flex"
									/>
									<div class="flex flex-col">
										<div class="flex items-center space-x-1.5 sm:space-x-2">
											<span
												class="font-medium text-gray-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]"
											>
												{{ ref.name }}
											</span>
											<span
												class="text-xs text-gray-500 truncate max-w-[80px] sm:max-w-[100px]"
											>
												{{ ref.party }}
											</span>
										</div>
									</div>
								</div>
								<span class="text-xs text-gray-500 shrink-0">
									{{ formatReferenceDate(ref.date) }}
								</span>
							</div>
						</div>
					</div>

					<!-- Users Autocomplete -->
					<div
						v-if="showUsersList && filteredUsers.length"
						class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50"
					>
						<div class="p-1 sm:p-2">
							<div
								v-for="user in filteredUsers"
								:key="user.name"
								@click="selectUserMention(user)"
								class="group flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
							>
								<div class="flex items-center space-x-2 sm:space-x-3">
									<Avatar
										:image="user.image"
										:label="user.employee_name"
										size="sm"
									/>
									<div class="flex flex-col">
										<span
											class="font-medium text-gray-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base"
										>
											{{ user.employee_name }}
										</span>
										<span class="text-xs text-gray-500">
											{{ user.name }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Button
					type="submit"
					:variant="'solid'"
					:ref_for="true"
					theme="gray"
					size="md"
					class="rounded-full p-[1.3rem] flex items-center justify-center"
					label="Button"
					:loading="messages?.insert?.loading"
					:disabled="isSubmitDisabled"
				>
					<FeatherIcon name="send" class="w-6 h-6 pr-1" />
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
	.filter((i) => i.project === projectName)
	.map((i) => ({
		name: i.name,
		doctype: 'RUA Payment',
		party: i.party,
		date: i.date,
		link: `/project/${projectName}/invoicing/payment/${i.name}`,
	}))

	return [...quotations, ...rfqs, ...lpos, ...invoices, ...payments]
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
function getMessageTypeClasses(type) {
    switch (type) {
        case 'Info':
            return 'bg-blue-50 border-blue-200'
        case 'Success':
            return 'bg-green-50 border-green-200'
        case 'Danger':
            return 'bg-red-50 border-red-200'
        case 'Warning':
            return 'bg-yellow-50 border-yellow-200'
        case 'Alert':
            return 'bg-purple-50 border-purple-200'
        default:
            return 'bg-gray-50 border-gray-200'
    }
}

function getMessageIconClasses(type) {
    switch (type) {
        case 'Info':
            return 'bg-blue-100'
        case 'Success':
            return 'bg-green-100'
        case 'Danger':
            return 'bg-red-100'
        case 'Warning':
            return 'bg-yellow-100'
        case 'Alert':
            return 'bg-purple-100'
        default:
            return 'bg-gray-100'
    }
}

function getMessageIconColorClass(type) {
    switch (type) {
        case 'Info':
            return 'text-blue-600'
        case 'Success':
            return 'text-green-600'
        case 'Danger':
            return 'text-red-600'
        case 'Warning':
            return 'text-yellow-600'
        case 'Alert':
            return 'text-purple-600'
        default:
            return 'text-gray-600'
    }
}

function getMessageTextClass(type) {
    switch (type) {
        case 'Info':
            return 'text-blue-800'
        case 'Success':
            return 'text-green-800'
        case 'Danger':
            return 'text-red-800'
        case 'Warning':
            return 'text-yellow-800'
        case 'Alert':
            return 'text-purple-800'
        default:
            return 'text-gray-800'
    }
}

function getActionButtonStyles(type) {
  switch (type) {
    case 'Info':
      return 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700'
    case 'Success':
      return 'bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700'
    case 'Warning':
      return 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700'
    case 'Danger':
      return 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700'
    case 'Alert':
      return 'bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700'
    default:
      return 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700'
  }
}

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

function formatDateForFrappe(date) {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function formatDate(dateString) {
	if (!dateString) return ''
	const date = new Date(dateString)
	return date.toLocaleString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
		month: 'short',
		day: 'numeric',
	})
}

async function sendMessage() {
	if (!newMessage.value.trim() || !chatResource) return

	try {
		await chatResource.insert.submit({
			project: props.projectResource.doc.name,
			user: session.user,
			message: newMessage.value.trim(),
			type: 'Chat Message',
			timestamp: formatDateForFrappe(new Date()),
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

function formatReferenceDate(dateString) {
	if (!dateString) return ''
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	})
}

function formatMessageWithReferences(message, isUserMessage = false, isSystemMessage = false) {
    if (!message) return ''

    const refData = references.value || []
    const userData = users.value || []

    const actionMatch = message.match(/\[(.*?)\]$/);
    let messageWithoutAction = message;
    if (actionMatch) {
        messageWithoutAction = message.replace(/\[(.*?)\]$/, '');
    }

    // Convert URLs to clickable links first
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g
    let processedMessage = messageWithoutAction.replace(urlRegex, (url) => {
        let linkStyle = ''
        if (isSystemMessage) {
            // System message styling (inherits text color)
            linkStyle = 'font-medium underline decoration-current/30 hover:decoration-current/60 transition-all duration-200'
        } else if (isUserMessage) {
            // User message styling (white text on dark background)
            linkStyle = 'text-white underline decoration-white/30 hover:decoration-white/60 transition-all duration-200'
        } else {
            // Regular message styling (dark text on light background)
            linkStyle = 'text-blue-500 underline decoration-blue-200/50 hover:decoration-blue-500/50 hover:text-blue-600 transition-all duration-200'
        }

        return `<a 
            href="${url}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="${linkStyle}"
        >${url}</a>`
    })

    // Handle line breaks
    processedMessage = processedMessage.replace(/\n/g, '<br>')

    // Replace references
    let formattedMessage = processedMessage.replace(/#([A-Z0-9-]+)/g, (match, reference) => {
        const ref = refData.find((r) => r.name === reference)
        if (ref) {
            return `
                <span class="inline-flex items-center align-middle px-1 py-0.5 rounded-full text-xs ${
                    isSystemMessage
                        ? 'bg-current/10'
                        : isUserMessage
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-300 text-gray-800'
                }">
                    <a 
                        href="${ref.link}" 
                        class="${
                            isSystemMessage
                                ? 'hover:underline font-medium'
                                : isUserMessage
                                    ? 'hover:underline font-medium text-white'
                                    : 'hover:underline font-medium text-gray-800'
                        }" 
                        @click.prevent="router.push('${ref.link}')"
                    >
                        ${ref.name}
                    </a>
                </span>
            `
        }
        return match
    })

    // Replace user mentions
    formattedMessage = formattedMessage.replace(/@([^\s]+)/g, (match, mentionName) => {
        const user = userData.find((u) => u.user === mentionName)
        if (user) {
            return `
                <span class="inline-flex items-center align-middle px-1 py-0.5 rounded-full text-xs ${
                    isSystemMessage
                        ? 'bg-current/10'
                        : isUserMessage
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-300 text-gray-800'
                }">
                    <span class="flex items-center">
                        ${user.image ? `
                            <img 
                                src="${user.image}" 
                                alt="${user.employee_name}" 
                                class="w-4 h-4 rounded-full mr-1"
                            />
                        ` : ''}
                        <span class="font-medium">${user.employee_name}</span>
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
@media (max-width: 767px) {
	.fixed {
		position: fixed !important;
	}
}
</style>
