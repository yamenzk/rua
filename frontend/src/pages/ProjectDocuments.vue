<template>
  <div class="space-y-8 px-6" v-if="projectResource">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <div class="text-gray-700">
          <p class="font-medium">Loading documents...</p>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Tabs in scrollable container -->
      <div class="relative">
        <div class="overflow-x-auto scrollbar-hide">
          <div class="flex space-x-2 py-2 min-w-max">
            <TabButtons
              :buttons="[
                { 
                  label: 'Quotations', 
                  value: 'quotations',
                  icon: 'file-text'
                },
                { 
                  label: 'Proformas', 
                  value: 'proformas',
                  icon: 'clipboard'
                },
                { 
                  label: 'Invoices', 
                  value: 'invoices',
                  icon: 'file'
                },
                { 
                  label: 'RFQs', 
                  value: 'rfqs',
                  icon: 'help-circle'
                },
                { 
                  label: 'Purchase Orders', 
                  value: 'purchaseOrders',
                  icon: 'shopping-cart'
                },
                { 
                  label: 'Payments', 
                  value: 'payments',
                  icon: 'credit-card'
                },
              ]"
              v-model="currentTab"
              class="w-full"
            >
              <template #button="{ button, active }">
                <div class="flex items-center gap-2">
                  <FeatherIcon 
                    :name="button.icon" 
                    class="w-4 h-4"
                  />
                  <span>{{ button.label }}</span>
                </div>
              </template>
            </TabButtons>
          </div>
        </div>
      </div>

      <!-- Dynamic Header -->
      <div class="flex items-center justify-between mt-6 mb-4">
        <h2 class="text-lg font-medium text-gray-900">
          {{ currentTabSingular }}s
        </h2>
        <Button
          v-if="isManager"
          variant="solid"
          size="sm"
          @click="handleNewDocument"
        >
          <template #default>
            <div class="flex items-center gap-2">
              <FeatherIcon name="plus" class="w-4 h-4" />
              <span>Add New {{ currentTabSingular }}</span>
            </div>
          </template>
        </Button>
      </div>

      <!-- Quotations Tab -->
      <ListView
      v-if="currentTab === 'quotations'"
  class="min-h-[500px]"
  :columns="[
    {
      label: 'Party',
      key: 'party',
      icon: 'user',
      width: '250px',
      getLabel: ({ row }) => row.party,
      prefix: ({ row }) => {
        const parties = typeof props.projectResource.doc.parties === 'string' 
          ? JSON.parse(props.projectResource.doc.parties) 
          : props.projectResource.doc.parties
        const partyData = parties.find(p => p.name === row.party)
        return h(Avatar, {
          shape: 'circle',
          image: partyData?.image,
          size: 'sm'
        })
      }
    },
    {
      label: 'Date',
      key: 'date',
      icon: 'calendar',
      width: '150px',
      getLabel: ({ row }) => new Date(row.date).toLocaleDateString()
    },
    {
      label: 'Grand Total',
      key: 'grand_total',
      icon: 'dollar-sign',
      width: '200px',
      getLabel: ({ row }) => formatCurrency(row.grand_total)
    },
    {
      label: 'Status',
      key: 'status',
      icon: 'check',
      width: '150px',
      getLabel: ({ row }) => row.final ? 'Final' : (row.status || 'Draft'),
    }
  ]"
  :rows="quotations?.data || []"
  :options="{
    showTooltip: true,
    resizeColumn: true,
    emptyState: {
      description: 'No quotations found'
    }
  }"
  row-key="name"
>
<ListHeader>
    <ListHeaderItem
      v-for="column in [
        {label: 'Party', key: 'party', width: '250px', icon: 'users'},
        {label: 'Date', key: 'date', width: '150px', icon: 'calendar'},
        {label: 'Grand Total', key: 'grand_total', width: '200px', icon: 'dollar-sign'},
        {label: 'Status', key: 'status', width: '150px', icon: 'check-circle'}
      ]"
      :key="column.key"
      :item="column"
    >
      <template #prefix="{ item }">
        <FeatherIcon
          :name="item.icon"
          class="h-4 w-4"
        />
      </template>
    </ListHeaderItem>
  </ListHeader>
  <ListRows>
    <ListRow
      v-for="row in quotations?.data"
      :key="row.name"
      :row="row"
    >
      <template #cell="{ column }">
        <ListRowItem>
          <template v-if="column.key === 'party'">
            <div class="flex items-center gap-2">
              <Avatar
                v-if="row.party?.image"
                :image="row.party.image"
                size="sm"
                shape="circle"
              />
              <span>{{ row.party?.label }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'date'">
            {{ new Date(row.date).toLocaleDateString() }}
          </template>

          <template v-else-if="column.key === 'grand_total'">
            {{ row.grand_total }}
          </template>

          <template v-else-if="column.key === 'status'">
              {{ row.status.label }}
          </template>
        </ListRowItem>
      </template>
    </ListRow>
  </ListRows>
</ListView>


      <!-- Warning Dialogs -->
      <Dialog
        v-if="showNoClientDialog"
        style="z-index: 999999 !important"
        v-model="showNoClientDialog"
        :options="{
          title: 'Missing Client',
          message: 'A client must be added to the project before creating a quotation. Please add a client from the project overview page.',
          size: 'sm',
          icon: {
            name: 'alert-triangle',
            appearance: 'warning'
          },
          actions: [
            {
              label: 'Go to Overview',
              variant: 'solid',
              theme: 'warning',
              onClick: () => {
                router.push(`/project/${props.projectResource.doc.name}/overview`)
              }
            },
            {
              label: 'Close',
              variant: 'subtle',
              onClick: () => showNoClientDialog = false
            }
          ]
        }"
      />

      <Dialog
        v-if="showNotLockedDialog"
        style="z-index: 999999 !important"
        v-model="showNotLockedDialog"
        :options="{
          title: 'Items Not Locked',
          message: 'The project items must be locked before creating a quotation. Please lock the items from the Items page.',
          size: 'sm',
          icon: {
            name: 'alert-triangle',
            appearance: 'warning'
          },
          actions: [
            {
              label: 'Go to Items',
              variant: 'solid',
              theme: 'warning',
              onClick: () => {
                router.push(`/project/${props.projectResource.doc.name}/items`)
              }
            },
            {
              label: 'Close',
              variant: 'subtle',
              onClick: () => showNotLockedDialog = false
            }
          ]
        }"
      />

      <!-- New Quotation Dialog -->
      <Dialog
      v-if="showNewQuotationDialog"
      v-model="showNewQuotationDialog"
      :options="{
        title: 'New Quotation',
        size: 'lg',
        actions: [
          {
            label: 'Create',
            variant: 'solid',
            onClick: createQuotation,
            loading: quotations?.insert.loading
          },
        ],
      }"
    >
      <template #body-content>
        <div class="space-y-4">
          <!-- Date Picker -->
          <DatePicker
            v-model="newQuotation.date"
            label="Date"
            :default-value="new Date().toISOString().split('T')[0]"
            :format="(date) => date.toISOString().split('T')[0]"
          />
        </div>
      </template>
    </Dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter } from 'vue-router'
import { createListResource } from 'frappe-ui'
import { 
  TabButtons, 
  ListView,
  ListHeader,
  ListHeaderItem,
  ListRows,
  ListRow,
  ListRowItem,
  ListSelectBanner,
  Dialog,
  Avatar,
  FormControl,
  DatePicker,
  FileUploader,
  FeatherIcon,
  Button
} from 'frappe-ui'
import { session } from '../data/session'

const router = useRouter()

const props = defineProps({
  projectResource: {
    type: Object,
    required: true
  }
})

// State
const isLoading = ref(true)
const currentTab = ref('quotations')
const showNewQuotationDialog = ref(false)
const showNoClientDialog = ref(false)
const showNotLockedDialog = ref(false)
const newQuotation = ref({
  date: new Date().toISOString().split('T')[0]
})

// List Resource
const quotations = ref(null)

// Role-based access control
const isManager = computed(() => {
  return session.userRoles?.some(role => ['RUA Manager', 'RUA Project Manager'].includes(role))
})

// Computed properties for dynamic header
const currentTabSingular = computed(() => {
  switch (currentTab.value) {
    case 'quotations': return 'Quotation'
    case 'proformas': return 'Proforma'
    case 'invoices': return 'Invoice'
    case 'rfqs': return 'RFQ'
    case 'purchaseOrders': return 'Purchase Order'
    case 'payments': return 'Payment'
    default: return ''
  }
})

// Watch for dialog state changes
watch([showNoClientDialog, showNotLockedDialog, showNewQuotationDialog], ([noClient, notLocked, newQuotation]) => {
  console.log('Dialog States:', { noClient, notLocked, newQuotation })
})

// Initialize resources when project is ready
watch(() => props.projectResource.doc?.name, (newValue) => {
  if (newValue) {
    initializeResources()
  }
}, { immediate: true })

function initializeResources() {
  if (!props.projectResource.doc?.name) return
  
  quotations.value = createListResource({
    doctype: 'RUA Quotation',
    fields: ['*'],
    filters: {
      project: props.projectResource.doc.name
    },
    orderBy: 'creation desc',
    pageLength: 20
  })
  
  quotations.value.fetch()
  isLoading.value = false
}


const formatCurrency = (value) => {
  if (!value) return 'AED 0'
  return `AED ${Number(value).toLocaleString()}`
}


function validateAndShowQuotationDialog() {
  console.log('Validating quotation dialog...')
  console.log('Project Resource Doc:', props.projectResource.doc)
  
  // Check if parties exist and parse them
  let parties = []
  try {
    parties = props.projectResource.doc?.parties ? 
      (typeof props.projectResource.doc.parties === 'string' ? 
        JSON.parse(props.projectResource.doc.parties) : 
        props.projectResource.doc.parties
      ) : []

    
    console.log('Parsed parties:', parties)
  } catch (error) {
    console.error('Error parsing parties:', error)
    showNoClientDialog.value = true
    return
  }

  // Check if client exists
  const hasClient = parties.some(party => party.type.toLowerCase() === 'client')
  console.log('Has client:', hasClient)
  
  if (!hasClient) {
    showNoClientDialog.value = true
    return
  }

  // Check if items are locked
  const locked = props.projectResource.doc?.locked || ''
  const isLocked = locked && 
    locked !== '' && 
    locked !== '[]' && 
    locked !== '{}'
    
  console.log('Items locked:', isLocked, 'Locked value:', locked)

  if (!isLocked) {
    showNotLockedDialog.value = true
    return
  }

  // If all validations pass, show the new quotation dialog
  console.log('Opening new quotation dialog')
  showNewQuotationDialog.value = true
}

function handleNewDocument() {
  console.log('New document button clicked')
  switch (currentTab.value) {
    case 'quotations':
      console.log('Handling quotation creation')
      validateAndShowQuotationDialog()
      break
    // Add other cases as we implement them
  }
}

async function createQuotation() {
  if (!props.projectResource.doc?.name || !quotations.value) return
  
  try {
    const parties = typeof props.projectResource.doc.parties === 'string' 
      ? JSON.parse(props.projectResource.doc.parties) 
      : props.projectResource.doc.parties

    const clientParty = parties.find(party => party.type.toLowerCase() === 'client')
    
    if (!clientParty) {
      console.error('Client party not found')
      return
    }

    const formattedDate = newQuotation.value.date.toISOString().split('T')[0]
    
    await quotations.value.insert.submit({
      project: props.projectResource.doc.name,
      date: formattedDate,
      party: clientParty.name,
      doctype: 'RUA Quotation'
    })
    
    showNewQuotationDialog.value = false
    newQuotation.value = {
      date: new Date()
    }
    
    await quotations.value.fetch()
  } catch (error) {
    console.error('Failed to create quotation:', error)
  }
}

// Cleanup
onMounted(() => {
  if (props.projectResource.doc?.name) {
    initializeResources()
  }
})
</script>