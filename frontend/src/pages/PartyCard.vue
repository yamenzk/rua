# PartyCard.vue
<template>
  <div class="relative group">
    <!-- Add Button Card -->
    <div v-if="showAddButton" class="h-full">
      <div 
        class="group flex items-center space-x-3 rounded border border-gray-200 bg-white px-4 py-4 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer min-h-[4.5rem]"
        @click="openPartyDialog"
      >
        <div class="flex-shrink-0">
          <div class="w-9 h-9 rounded bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
            <FeatherIcon name="plus" class="w-4 h-4 text-gray-600" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-900">Add {{ partyType }}</div>
          <div class="text-xs text-gray-500">Click to add new {{ partyType.toLowerCase() }}</div>
        </div>
      </div>
    </div>

    <!-- Party Card -->
    <div v-else>
      <div
        class="group flex items-center space-x-3 rounded border border-gray-200 bg-white px-4 py-4 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer min-h-[4.5rem] relative"
        @click="showDetails"
      >
        <div class="flex-shrink-0">
          <div v-if="party?.image" class="w-9 h-9 rounded overflow-hidden">
            <img 
              :src="party.image" 
              :alt="party.name"
              class="w-full h-full object-cover"
              @error="$event.target.style.display='none'"
            />
          </div>
          <div v-else class="w-9 h-9 rounded bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
            <FeatherIcon name="user" class="w-4 h-4 text-gray-600" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <div class="text-sm font-medium text-gray-900 truncate">{{ party?.name }}</div>
            <div :class="typeColorClasses" class="w-2 h-2 rounded-full flex-shrink-0 absolute top-2 right-2"></div>
          </div>
          <div class="text-xs text-gray-500">{{ party?.type }}</div>
        </div>
      </div>
    </div>

    <!-- Party Details Dialog -->
    <Dialog
      v-model="showDialog"
      :options="{
        title: party?.name,
        size: 'md',
      }"
    >
      <template #body-content>
        <div class="space-y-6">
          <!-- Party Image -->
          <div class="flex justify-center">
            <div v-if="party?.image" class="w-24 h-24 rounded-full overflow-hidden">
              <img 
                :src="party.image" 
                :alt="party.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <FeatherIcon name="user" class="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <!-- Party Details -->
          <div class="grid grid-cols-1 gap-4">
            <div v-if="party?.phone" class="flex items-center space-x-2">
              <FeatherIcon name="phone" class="w-4 h-4 text-gray-400" />
              <a 
                :href="'tel:' + party.phone"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ party.phone }}
              </a>
            </div>
            
            <div v-if="party?.email" class="flex items-center space-x-2">
              <FeatherIcon name="mail" class="w-4 h-4 text-gray-400" />
              <a 
                :href="'mailto:' + party.email"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ party.email }}
              </a>
            </div>

            <div v-if="party?.trn" class="flex items-center space-x-2">
              <FeatherIcon name="hash" class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">TRN: {{ party.trn }}</span>
            </div>

            <div v-if="party?.emirate" class="flex items-center space-x-2">
              <FeatherIcon name="map-pin" class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">{{ party.emirate }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #actions>
        <div class="flex justify-between w-full">
          <Button
            v-if="isManager"
            variant="danger"
            :loading="removing"
            @click="confirmRemove"
          >
            Remove Party
          </Button>
          <Button
            variant="subtle"
            @click="showDialog = false"
          >
            Close
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- Confirm Remove Dialog -->
    <Dialog
      v-model="showConfirmDialog"
      :options="{
        title: 'Remove Party',
        size: 'sm',
      }"
    >
      <template #body-content>
        <p class="text-gray-600">
          Are you sure you want to remove {{ party?.name }} from this project?
        </p>
      </template>
      <template #actions>
        <div class="flex justify-end gap-2">
          <Button
            variant="subtle"
            @click="showConfirmDialog = false"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            :loading="removing"
            @click="removeParty"
          >
            Remove
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- Add Party Dialog -->
    <Dialog
      v-model="showPartyDialog"
      :options="{
        title: `Add ${partyType}`,
        size: 'lg',
      }"
    >
      <template #body-content>
        <div v-if="partyList.loading" class="flex justify-center py-8">
          <LoadingIndicator />
        </div>
        <div v-else class="space-y-4">
          <!-- Search -->
          <FormControl
            type="text"
            placeholder="Search parties..."
            v-model="searchQuery"
          />

          <!-- Party List with Virtual Scrolling -->
          <div class="h-[60vh] overflow-y-auto pr-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="partyOption in filteredParties"
                :key="partyOption.name"
                class="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                @click="selectParty(partyOption)"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div v-if="partyOption.image" class="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        :src="partyOption.image" 
                        :alt="partyOption.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div v-else class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <FeatherIcon name="user" class="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium">{{ partyOption.name }}</h3>
                    <p class="text-xs text-gray-500">{{ partyOption.type }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  FeatherIcon, 
  Dialog, 
  Button, 
  FormControl, 
  LoadingIndicator,
} from 'frappe-ui'
import { session } from '../data/session'
import { partyResource } from '../data/party'

const props = defineProps({
  party: {
    type: Object,
    default: null,
    required: false
  },
  partyType: {
    type: String,
    required: true,
    validator: (value) => ['Client', 'Supplier', 'Consultant'].includes(value)
  },
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'setValue' in value
    }
  },
  showAddButton: {
    type: Boolean,
    default: false
  }
})

// Dialog states
const showDialog = ref(false)
const showConfirmDialog = ref(false)
const showPartyDialog = ref(false)
const removing = ref(false)
const searchQuery = ref('')

// Role-based access control
const isManager = computed(() => {
  return session.userRoles.some(role => ['RUA Manager', 'RUA Project Manager'].includes(role))
})

// Party list resource
const partyList = partyResource

// Filter parties based on search and type
const filteredParties = computed(() => {
  if (!partyList.data) return []
  
  let filtered = partyList.data

  // Get current project parties
  let currentParties = props.projectResource.doc.parties
  if (typeof currentParties === 'string') {
    currentParties = JSON.parse(currentParties)
  }
  if (!Array.isArray(currentParties)) {
    currentParties = []
  }

  // Remove parties that are already in the project
  filtered = filtered.filter(party => 
    !currentParties.some(p => p.name === party.name)
  )

  // Filter by type
  if (props.partyType === 'Client') {
    filtered = filtered.filter(p => p.type === 'Client')
  } else if (props.partyType === 'Supplier') {
    filtered = filtered.filter(p => 
      ['Supplier: Glass', 'Supplier: Cladding', 'Supplier: Aluminum', 'Supplier'].includes(p.type)
    )
  } else if (props.partyType === 'Consultant') {
    filtered = filtered.filter(p => p.type === 'Consultant')
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.type.toLowerCase().includes(query)
    )
  }

  return filtered
})


const typeColorClasses = computed(() => {
  const colorMap = {
    'Supplier': 'bg-teal-500',
    'Supplier: Aluminum': 'bg-yellow-500',
    'Supplier: Glass': 'bg-blue-500',
    'Supplier: Cladding': 'bg-green-500',
    'Client': 'bg-purple-500',
    'Consultant': 'bg-pink-500'
  }
  return props.party?.type ? colorMap[props.party.type] || 'bg-gray-500' : 'bg-gray-500'
})

function showDetails() {
  showDialog.value = true
}

function openPartyDialog() {
  if (!isManager.value) {
    return
  }
  showPartyDialog.value = true
}

function confirmRemove() {
  if (!isManager.value) {
    return
  }
  showConfirmDialog.value = true
}

async function removeParty() {
  try {
    removing.value = true
    
    // Get current parties
    let currentParties = props.projectResource.doc.parties
    if (typeof currentParties === 'string') {
      currentParties = JSON.parse(currentParties)
    }
    
    // Remove the party
    const updatedParties = currentParties.filter(p => 
      !(p.name === props.party.name && p.type === props.party.type)
    )
    
    // Update the project
    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      parties: JSON.stringify(updatedParties)
    })
    
    await props.projectResource.reload()
    showConfirmDialog.value = false
    showDialog.value = false
  } catch (error) {
    console.error('Failed to remove party:', error)
  } finally {
    removing.value = false
  }
}

async function selectParty(party) {
  try {
    // Get current parties
    let currentParties = props.projectResource.doc.parties
    if (typeof currentParties === 'string') {
      currentParties = JSON.parse(currentParties)
    }
    if (!Array.isArray(currentParties)) {
      currentParties = []
    }
    
    // Create a copy of the current parties
    let updatedParties = [...currentParties]
    
    // Remove existing party of same type if it's client or consultant
    if (props.partyType !== 'Supplier') {
      updatedParties = updatedParties.filter(p => p.type !== party.type)
    }
    
    // Add new party
    updatedParties.push({
      name: party.name,
      type: party.type,
      phone: party.phone,
      email: party.email,
      trn: party.trn,
      emirate: party.emirate,
      image: party.image
    })
    
    // Update project with stringified parties
    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      parties: JSON.stringify(updatedParties)
    })
    
    await props.projectResource.reload()
    showPartyDialog.value = false
    searchQuery.value = ''
  } catch (error) {
    console.error('Failed to add party:', error)
  }
}
</script>