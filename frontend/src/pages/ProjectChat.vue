<!-- ProjectChat.vue -->
<template>
	<!-- Root container that takes full height of main area -->
	<div class="absolute inset-0 flex flex-col bg-white">
		<!-- Fixed Header -->
		<div class="flex-shrink-0 px-6 py-4 border-b bg-white">
			<h2 class="text-lg font-medium text-gray-900">Project Chat</h2>
		</div>

		<!-- Scrollable Messages Container -->
		<div class="flex-1 overflow-y-auto px-4 py-4 pb-[130px] md:pb-[130px]" ref="chatContainer">
			<template v-if="messages?.length">
				<div v-for="message in messages" :key="message.name">
					<!-- System Messages -->
					<template v-if="message.type !== 'Chat Message'">
						<div class="flex justify-center my-4">
							<div
								class="px-4 py-2 rounded-full text-sm"
								:class="getMessageTypeClasses(message.type)"
							>
								<div class="flex items-center gap-2">
									<FeatherIcon
										:name="getSystemMessageIcon(message.type)"
										class="w-4 h-4"
									/>
									<span
										v-html="
											formatMessageWithReferences(
												message.message,
												false,
												true,
											)
										"
									></span>
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
		<div class="absolute left-0 right-0 bottom-[64px] md:bottom-0 bg-white border-t shadow-lg">
			<form
				@submit.prevent="sendMessage"
				class="flex items-center gap-3 p-4 mx-auto max-w-6xl"
			>
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
					variant="solid"
					class="h-11 px-6 rounded-full"
					:disabled="isSubmitDisabled"
					:loading="messages?.insert?.loading"
				>
					<template #prefix>
						<FeatherIcon name="send" class="w-4 h-4" />
					</template>
					Send
				</Button>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { createResource } from 'frappe-ui'
import { session } from '@/data/session'
import { Avatar, Button, FeatherIcon, Badge } from 'frappe-ui'
import { chatResource } from '@/data/chat'
import { hasRole } from '@/data/roles'


// Props
const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  },
})

// State
const newMessage = ref('')
const chatContainer = ref(null)
const showReferencesList = ref(false)
const showUsersList = ref(false)
const filteredUsers = ref([])
const references = ref(null)
const filteredReferences = ref([])
const cursorPosition = ref(0)
const inputRef = ref(null)
const users = ref(null)

// Computed
const messages = computed(() => {
  return chatResource.data?.filter(msg => msg.project === props.projectResource.doc?.name) || []
})

const isMessageEmpty = computed(() => !newMessage.value || !newMessage.value.trim())
const isSubmitDisabled = computed(() => isMessageEmpty.value || chatResource.insert?.loading)

// Methods
function getMessageTypeClasses(type) {
	switch (type) {
		case 'Info':
			return 'bg-blue-50 text-blue-700'
		case 'Success':
			return 'bg-green-50 text-green-700'
		case 'Danger':
			return 'bg-red-50 text-red-700'
		case 'Warning':
			return 'bg-yellow-50 text-yellow-700'
		case 'Alert':
			return 'bg-purple-50 text-purple-700'
		default:
			return 'bg-gray-50'
	}
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
  const userData = users.value?.data || []
  
  filteredUsers.value = userData.filter(
    (user) =>
      user.employee_name.toLowerCase().includes(searchTerm) ||
      user.name.toLowerCase().includes(searchTerm) ||
      user.user.toLowerCase().includes(searchTerm)
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

  // Replace with the full username, but display employee name
  newMessage.value = text.slice(0, lastAt) + '@' + user.name + text.slice(searchEnd)
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
	// Adjust how we access references data
	const refData = references.value?.data || []

	filteredReferences.value = refData.filter(
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

	const refData = references.value?.data || []
	const userData = users.value?.data || []

	// Replace references first
	let formattedMessage = message.replace(/#([A-Z0-9-]+)/g, (match, reference) => {
		const ref = refData.find((r) => r.name === reference)
		if (ref) {
			return `
        <span class="inline-block align-middle mx-0.5 px-1.5 py-0.5 rounded-full text-xs ${isSystemMessage ? '' :
			isUserMessage ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-800'
		}">
          <a 
            href="${ref.link}" 
            class="${
				isUserMessage
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

	// Then replace user mentions
	formattedMessage = formattedMessage.replace(/@([A-Z0-9-]+)/g, (match, mentionName) => {
		const user = userData.find((u) => u.name === mentionName)
		if (user) {
			return `
        <span class="inline-block align-middle mx-0.5 px-1.5 py-0.5 rounded-full text-xs ${isSystemMessage ? '' : isUserMessage ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-800' }">
          <span class="flex items-center">
            <img 
              src="${user.image}" 
              alt="${user.employee_name}" 
              class="w-4 h-4 rounded-full mr-1"
            />
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

function initializeResources() {
  if (!props.projectResource?.doc?.name) return

  // Initialize users resource
  users.value = createResource({
    url: 'rua.api.get_all_users',
    method: 'GET',
    params: {
      project: props.projectResource.doc.name,
    },
    transform(response) {
      return response.data || response || []
    }
  })

  // Initialize references resource
  references.value = createResource({
    url: 'rua.api.get_project_refs',
    method: 'GET',
    params: {
      project: props.projectResource.doc.name,
    },
    transform(response) {
      return response.data || response || []
    }
  })

  // Fetch initial data
  users.value.fetch()
  references.value.fetch()
}

watch(
  () => props.projectResource.doc?.name,
  (projectName) => {
    if (projectName) {
      initializeResources()
    }
  },
  { immediate: true }
)

// Watch for new messages to scroll
watch(
  () => messages.value?.length,
  () => scrollToBottom(),
  { flush: 'post' }
)


// Initial setup
onMounted(() => {
	scrollToBottom()
})
</script>
