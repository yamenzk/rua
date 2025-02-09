# PartyCard.vue
<template>
  <div class="group relative">
    <!-- Add Button Card -->
    <div v-if="showAddButton" class="h-full">
      <button 
        class="flex h-full w-full items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-left transition-all hover:border-gray-400 hover:bg-gray-50"
        @click="openPartyDialog"
      >
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
          <FeatherIcon name="plus" class="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <div class="text-sm font-medium text-gray-900">Add {{ partyType }}</div>
          <div class="text-xs text-gray-500">Click to add new {{ partyType.toLowerCase() }}</div>
        </div>
      </button>
    </div>

    <!-- Party Card -->
    <div v-else>
      <button
        class="flex w-full items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50"
        @click="showDetails"
      >
        <!-- Avatar/Image -->
        <div class="relative flex-shrink-0">
          <div v-if="party?.image" class="h-10 w-10 overflow-hidden rounded-lg">
            <img 
              :src="party.image" 
              :alt="party.name"
              class="h-full w-full object-cover"
              @error="$event.target.style.display='none'"
            />
          </div>
          <div v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <FeatherIcon name="user" class="h-5 w-5 text-gray-500" />
          </div>
          
          <!-- Status Indicator -->
          <div 
            :class="typeColorClasses" 
            class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white"
          ></div>
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="truncate text-sm font-medium text-gray-900">{{ party?.name }}</h3>
          </div>
          <div class="mt-0.5 flex items-center gap-2">
            <span class="text-xs text-gray-500">{{ party?.type }}</span>
            <!-- <div v-if="party?.email" class="flex items-center gap-1 text-xs text-gray-500">
              <span>•</span>
              <span class="truncate">{{ party?.email }}</span>
            </div> -->
          </div>
        </div>

        <FeatherIcon name="chevron-right" class="h-4 w-4 flex-shrink-0 text-gray-400" />
      </button>
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
            <div v-if="party?.image" class="h-24 w-24 overflow-hidden rounded-lg">
              <img 
                :src="party.image" 
                :alt="party.name"
                class="h-full w-full object-cover"
              />
            </div>
            <div v-else class="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
              <FeatherIcon name="user" class="h-12 w-12 text-gray-400" />
            </div>
          </div>

          <!-- Party Info -->
          <div class="space-y-4 rounded-lg bg-gray-50 p-4">
            <div v-if="party?.phone" class="flex items-center gap-3">
              <FeatherIcon name="phone" class="h-4 w-4 text-gray-400" />
              <a 
                :href="'tel:' + party.phone"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                {{ party.phone }}
              </a>
            </div>
            
            <div v-if="party?.email" class="flex items-center gap-3">
              <FeatherIcon name="mail" class="h-4 w-4 text-gray-400" />
              <a 
                :href="'mailto:' + party.email"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                {{ party.email }}
              </a>
            </div>

            <div v-if="party?.trn" class="flex items-center gap-3">
              <FeatherIcon name="hash" class="h-4 w-4 text-gray-400" />
              <span class="text-sm text-gray-600">TRN: {{ party.trn }}</span>
            </div>

            <div v-if="party?.emirate" class="flex items-center gap-3">
              <FeatherIcon name="map-pin" class="h-4 w-4 text-gray-400" />
              <span class="text-sm text-gray-600">{{ party.emirate }}</span>
            </div>
          </div>
        </div>
      </template>
      
      <template #actions>
        <div class="flex w-full justify-between">
          <Button
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

    <!-- Add Party Dialog -->
    <Dialog
      v-model="showPartyDialog"
      :options="{
        title: `Add ${partyType}`,
        size: 'lg',
      }"
    >
      <template #body-content>
        <div v-if="partyList.loading" class="flex items-center justify-center py-8">
          <LoadingIndicator />
        </div>
        <div v-else class="space-y-4">
          <!-- Search -->
          <FormControl
            type="text"
            placeholder="Search parties..."
            v-model="searchQuery"
          >
            <template #prefix>
              <FeatherIcon name="search" class="h-4 w-4 text-gray-400" />
            </template>
          </FormControl>

          <!-- Party List -->
          <div class="h-[60vh] overflow-y-auto pr-2">
            <div class="grid gap-2">
              <button
                v-for="partyOption in filteredParties"
                :key="partyOption.name"
                class="flex w-full items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-primary-200 hover:bg-primary-50"
                @click="selectParty(partyOption)"
              >
                <div class="relative flex-shrink-0">
                  <div v-if="partyOption.image" class="h-10 w-10 overflow-hidden rounded-lg">
                    <img 
                      :src="partyOption.image" 
                      :alt="partyOption.name"
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <FeatherIcon name="user" class="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="truncate text-sm font-medium text-gray-900">
                      {{ partyOption.name }}
                    </h3>
                  </div>
                  <div class="mt-0.5 flex items-center gap-2">
                    <span class="text-xs text-gray-500">{{ partyOption.type }}</span>
                    <div v-if="partyOption.email" class="flex items-center gap-1 text-xs text-gray-500">
                      <span>•</span>
                      <span class="truncate">{{ partyOption.email }}</span>
                    </div>
                  </div>
                </div>

                <FeatherIcon name="plus" class="h-4 w-4 flex-shrink-0 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Confirm Remove Dialog -->
    <Dialog
      v-model="showConfirmDialog"
      :options="{
        title: 'Remove Party',
        size: 'sm',
        icon: {
          name: 'alert-triangle',
          appearance: 'danger'
        }
      }"
    >
      <template #body-content>
        <p class="text-sm text-gray-600">
          Are you sure you want to remove <span class="font-medium">{{ party?.name }}</span> from this project?
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
import { partyResource } from '@/data/party'


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
  showPartyDialog.value = true
}

function confirmRemove() {
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
    //console.error('Failed to remove party:', error)
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
    //console.error('Failed to add party:', error)
  }
}
</script>