# QuotationsTab.vue
<template>
	<div class="bg-white rounded-lg border">
		<!-- Header -->
		<div class="flex items-center justify-between mt-6 mb-4 px-6">
			<h2 class="text-lg font-medium text-gray-900">Quotations</h2>
			<Button variant="solid" size="sm" @click="handleNewQuotation">
				<template #default>
					<div class="flex items-center gap-2">
						<FeatherIcon name="plus" class="w-4 h-4" />
						<span>New</span>
					</div>
				</template>
			</Button>
		</div>

		<!-- Quotations Table -->
		<div v-if="quotationResource.loading" class="flex justify-center py-12">
			<LoadingIndicator />
		</div>

		<div v-else class="overflow-x-auto min-h-[60vh]">
			<!-- Table Header -->
			<div class="border-b min-w-[800px]">
				<div class="flex items-center px-6 py-2">
					<div class="flex-1 grid grid-cols-5 gap-4">
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2"
						>
							<FeatherIcon name="user" class="w-4 h-4" />
							Party
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="dollar-sign" class="w-4 h-4" />
							Grand Total
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="check-circle" class="w-4 h-4" />
							Status
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="info" class="w-4 h-4" />
							Additional Info
						</div>
					</div>
				</div>
			</div>

			<!-- Table Body -->
			<div class="divide-y">
				<template
					v-for="status in ['Final', 'Submitted', 'Draft', 'Rejected']"
					:key="status"
				>
					<template v-if="quotationsByStatus[status]?.length">
						<!-- Status Group Header -->
						<div
							class="group bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer px-6 py-2 min-w-[800px]"
							@click="toggleStatusCollapse(status)"
						>
							<div class="flex items-center gap-2">
								<FeatherIcon
									:name="
										statusCollapsed[status] ? 'chevron-right' : 'chevron-down'
									"
									class="w-4 h-4 text-gray-500"
								/>
								<Badge
									:variant="
										getStatusVariant(status) === 'gray' ? 'solid' : 'subtle'
									"
									:theme="getStatusVariant(status)"
								>
									{{ status }}
								</Badge>
								<span class="text-sm text-gray-600">
									({{ quotationsByStatus[status]?.length || 0 }})
								</span>
							</div>
						</div>

						<!-- Quotations in this status -->
						<template v-if="!statusCollapsed[status]">
							<div
								v-for="quotation in quotationsByStatus[status]"
								:key="quotation.name"
								class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
								@click="navigateToQuotation(quotation)"
							>
								<div class="flex items-center px-6 py-3">
									<div class="flex-1 grid grid-cols-5 gap-4">
										<!-- Party -->
										<div class="flex col-span-2">
											<Avatar
												v-if="getPartyData(quotation.party)?.image"
												:image="getPartyData(quotation.party)?.image"
												size="3xl"
												shape="square"
												class="mr-2 border border-gray-300"
											/>
											<div class="flex flex-col">
												<div class="flex items-center gap-2">
													<div class="text-sm text-gray-900">
														{{ quotation.party }}
													</div>
												</div>
												<div
													class="text-sm text-gray-500 flex items-center"
												>
													{{ quotation.name }}
												</div>
												<div
													class="text-sm text-gray-400 flex items-center"
												>
												{{ formatDate(quotation.date) }}
												</div>
											</div>
										</div>

										<!-- Grand Total -->
										<div
											class="text-sm text-gray-900 font-medium flex items-center"
										>
											{{ formatCurrency(quotation.grand_total) }}
										</div>
										<!-- Status -->
										<div class="flex items-center">
											<Badge
												:variant="
													getStatusVariant(quotation.status) === 'gray'
														? 'solid'
														: 'subtle'
												"
												:theme="getStatusVariant(quotation.status)"
											>
												{{ quotation.status }}
											</Badge>
										</div>
										<!-- Additional Info -->
										<div class="flex items-center">
											<div
												v-if="
													quotation.status === 'Final' &&
													quotation.signed_document
												"
												class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
												@click="
													openSignedDocument(
														quotation.signed_document,
														$event,
													)
												"
											>
												<FeatherIcon name="file-text" class="w-4 h-4" />
												View Signed Document
											</div>
											<div
												v-if="
													quotation.status === 'Rejected' &&
													quotation.reject_reason
												"
												class="text-sm text-gray-600 italic"
											>
												{{ quotation.reject_reason }}
											</div>
										</div>
									</div>
								</div>
							</div>
						</template>
					</template>
				</template>

				<!-- Empty State -->
				<div
					v-if="!filteredQuotations.length"
					class="flex flex-col items-center justify-center py-12 min-w-[800px]"
				>
					<FeatherIcon name="file-text" class="w-12 h-12 text-gray-400 mb-4" />
					<p class="text-base font-medium text-gray-900">No Quotations Found</p>
					<p class="text-sm text-gray-600">There are no quotations created yet.</p>
				</div>
			</div>
		</div>

		<!-- Warning Dialogs -->
		<Dialog
			v-if="showNoClientDialog"
			v-model="showNoClientDialog"
			:options="noClientDialogOptions"
		/>

		<Dialog
			v-if="showNotLockedDialog"
			v-model="showNotLockedDialog"
			:options="notLockedDialogOptions"
		/>

		<!-- New Quotation Dialog -->
		<Dialog v-model="showNewQuotationDialog" :options="newQuotationDialogOptions">
    <template #body-content>
      <div class="space-y-6">
        <!-- Step Indicator -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-around">
            <div 
              v-for="(step, index) in ['Date', 'Specifications', 'Scope', 'Notes', 'Review']" 
              :key="step"
              class="flex items-center space-x-2"
              :class="currentStep === index ? 'text-gray-900' : 'text-gray-500'"
            >
              <span 
                class="relative flex h-7 w-7 items-center justify-center rounded-full border-2"
                :class="currentStep === index ? 'text-white bg-gray-900 bg-gray-200' : 'border-gray-300 bg-white'"
              >
                {{ index + 1 }}
              </span>
              <span class="font-medium text-sm">{{ step }}</span>
            </div>
          </div>
        </div>

        <!-- Step 1: Date Selection -->
        <div v-if="currentStep === 0" class="space-y-4">
          <FormControl
            :type="'date'"
            :ref_for="true"
            size="sm"
            variant="subtle"
            :disabled="false"
            label="Date"
            v-model="formData.date"
            :default-value="formData.date"
          />
        </div>

        <!-- Step 2: Specifications -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Aluminum</label>
            <TextInput
              v-model="formData.specifications.aluminum"
              placeholder="Enter aluminum specifications"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Glass</label>
            <TextInput
              v-model="formData.specifications.glass"
              placeholder="Enter glass specifications"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Finishes</label>
            <TextInput
              v-model="formData.specifications.finishes"
              placeholder="Enter finish specifications"
            />
          </div>
        </div>

        <!-- Step 3: Scope Selection -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="scope in scopes"
              :key="scope.id"
              class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
            >
              <Checkbox
                size="sm"
                v-model="formData.scopes[scope.id]"
                :label="scope.label"
              />
            </div>
          </div>
        </div>

        <!-- Step 4: Notes & Exclusions -->
        <div v-if="currentStep === 3" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <TextEditor
              editor-class="h-32 overflow-y-auto border rounded-lg p-2"
              :content="formData.notes"
              placeholder="Add any additional notes..."
              @change="(val) => formData.notes = val"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Exclusions</label>
            <TextEditor
              editor-class="h-32 overflow-y-auto border rounded-lg p-2"
              :content="formData.exclusions"
              placeholder="Add exclusions..."
              @change="(val) => formData.exclusions = val"
            />
          </div>
        </div>

        <!-- Step 5: Review -->
        <div v-if="currentStep === 4" class="space-y-4">
          <TextEditor
            editor-class="h-[500px] overflow-y-auto border rounded-lg p-2"
            :content="generatedContent"
            @change="(val) => formData.quotation_details = val"
          />
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-between w-full">
        <Button
          v-if="currentStep > 0"
          variant="subtle"
          @click="currentStep--"
        >
          Back
        </Button>
        <div class="flex gap-2">
          <Button
            variant="subtle"
            @click="showNewQuotationDialog = false"
          >
            Cancel
          </Button>
          <Button
            v-if="currentStep < 4"
            variant="solid"
            @click="currentStep++"
          >
            Next
          </Button>
          <Button
            v-else
            variant="solid"
            theme="green"
            :loading="quotationResource.insert.loading"
            @click="createQuotation"
          >
            Create Quotation
          </Button>
        </div>
      </div>
    </template>
  </Dialog>
	</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
	Avatar,
	Badge,
	FeatherIcon,
	Button,
	Dialog,
	FormControl,
	LoadingIndicator,
	TextInput,
	Checkbox,
	TextEditor
} from 'frappe-ui'

import { quotationResource } from '@/data/quotation'
import { partyResource } from '@/data/party'
import { getServerDate, formatCurrency, formatDate } from '@/utils/format'

const router = useRouter()

const props = defineProps({
	projectResource: {
		type: Object,
		required: true,
		validator: (value) => {
			return value && typeof value === 'object' && 'doc' in value
		},
	},
})

// State
const showNewQuotationDialog = ref(false)
const showNoClientDialog = ref(false)
const showNotLockedDialog = ref(false)
const newQuotation = ref({
  date: getServerDate(),
  quotation_details: '',
})
const statusCollapsed = ref({
	Final: false,
	Submitted: false,
	Draft: false,
	Rejected: true,
})
const showTextEditor = ref(false)
const currentStep = ref(0)
const formData = ref({
  date: getServerDate(),
  specifications: {
    aluminum: 'GULF EXTRUSION ATTESTED SYSTEM',
    glass: 'GUARDIAN GLASS DOUBLE TEMPERED GLASS (8mm CLEAR TEMPERED GLASS + 16mm SILICONE AIR SPACER + 8mm REFLECTIVE TEMPERED GLASS)',
    finishes: 'SDF POWDER COATED'
  },
  scopes: {
    doors_windows: true,
    curtain_walls: true,
    skylight: false,
    steel: false,
    fire_rated: false,
    balcony_handrail: false,
    stair_handrail: false,
    pergola: false
  },
  notes: '',
  exclusions: `
    <ul>
      <li>ALUMINUM CLADDING</li>
      <li>DOOR CLOSER</li>
      <li>STEEL & STAINLESS STEEL WORK</li>
      <li>CAT LADDER</li>
      <li>CANOPY</li>
      <li>FIRE RATED CURTAIN WALLS</li>
      <li>DOOR & WINDOWS</li>
      <li>CRANE</li>
      <li>SCAFFOLDING</li>
      <li>CRADLE</li>
      <li>ELECTRICITY</li>
      <li>WATER</li>
      <li>ANY ITEM NOT MENTIONED OR INCLUDED IN THE ATTACHED DOCUMENTS</li>
    </ul>
  `,
  quotation_details: ''
})

const scopes = ref([
  { id: 'doors_windows', label: 'ALUMINUM DOORS & WINDOWS' },
  { id: 'curtain_walls', label: 'CURTAIN WALLS' },
  { id: 'skylight', label: 'ALUMINUM SKYLIGHT' },
  { id: 'steel', label: 'STEEL' },
  { id: 'fire_rated', label: 'ANY FIRE RATED WORKS' },
  { id: 'balcony_handrail', label: 'ALUMINUM HANDRAIL FOR BALCONY AREA' },
  { id: 'stair_handrail', label: 'ALUMINUM HANDRAIL FOR STAIR' },
  { id: 'pergola', label: 'ALUMINUM PERGOLA' }
])




// Computed

const generatedContent = computed(() => {
  const clientParty = getProjectParties().find(p => p.type.toLowerCase() === 'client')
  if (!clientParty) return ''

  const specs = Object.entries(formData.value.specifications)
    .map(([key, value]) => `<li><strong>${key.toUpperCase()}: </strong>${value.toUpperCase()}</li>`)
    .join('')

  const selectedScopes = scopes.value
    .map(scope => `<p>${formData.value.scopes[scope.id] ? '☑' : '☐'} ${scope.label}</p>`)
    .join('')

  return `
    <p>TO: <strong>${clientParty.name}</strong>,</p>
    <p>SUBJECT: <strong>${props.projectResource.doc.name}</strong></p>
	<p></p>

    <p>Dear <strong>${clientParty.name}</strong>,<p>
    <p>Thank you for reaching out to us and requesting a quotation for your project...</p>
	<p></p>

    <hr><p></p>
    <p><strong>SPECIFICATIONS:</strong></p>
    <ul>${specs}</ul>

    <hr><p></p>
    <p><strong>EXCLUSIONS</strong></p>
    ${formData.value.exclusions}

    ${formData.value.notes ? `<hr><p></p><p><strong>NOTES</strong></p>${formData.value.notes}` : ''}

	<hr><p></p>
	 <p><strong>STANDARD QUALIFICATIONS</strong></p>
    <p>OUR OFFER IS PER ITEMS HAVING BEEN PRICED IN ACCORDANCE WITH YOUR RECEIVED BOQ AND DRAWING (RE-MEASURABLE AT SITE). ANY ITEMS WHICH DO NOT APPEAR IN BOQ HAVE BEEN OMITTED FROM OUR BID. ANY ADDITIONAL ITEMS WILL BE SUBJECTED TO PRICE VARIATION</p>

    <hr><p></p>
    <p><strong>SCOPE OF WORK</strong></p>
    ${selectedScopes}

	<hr><p></p>

    <p><strong>TERMS AND CONDITIONS</strong></p>
    <ul>
      <li>The proposal is strictly based on items as described in the BOQ and this letter. Items not specifically mentioned in the Bill of Quantity or this letter should not be considered as forming part of this scope of works/quotation.</li>
      <li>Cutting list will be based on the approved shop drawings.</li>
      <li>All access requirements and equipment are to be provided by the main contractor free of charge.</li>
      <li>Electricity, water, storage areas and/or adequate site offices required for the execution of project shall be provided by the main contractor.</li>
      <li>Third Party testing charges for aluminum and cladding works (if applicable) are payable for the main contractor only.</li>
      <li>Main contractor to pay for all inspection charges for aluminum, glass and cladding.</li>
      <li>We have not made any provision for carnage, monorails, cradles and scaffolding. All access requirements and equipment are to be provided by the main contractor free of charge.</li>
    </ul>

    <hr><p></p>

    <p><strong>PROPOSAL BASIS</strong></p>
    <p>THE PROPOSAL WILL BE BASED ON THE FOLLOWING DOCUMENTS</p>
    <ul>
      <li>AS PER ATTACHED BOQ</li>
      <li>AS PER ATTACHED DRAWINGS</li>
    </ul>

    <hr><p></p>

    <p><strong>DURATION</strong></p>
    <p>AS AGREED</p>

    <hr><p></p>

    <p><strong>PAYMENT TERMS</strong></p>
    <p>TO BE DISCUSSED</p>

    <hr><p></p>

    <p><strong>MAINTENANCE AND WARRANTY</strong></p>
    <p>RUA Company Aluminum And Glass L.L.C. O.P.C is pleased to offer a one-year warranty for all aluminum items supplied for this project. This warranty covers any technical faults that may occur and begins on the date of initial hand-over. Please note that damages resulting from mishandling are not covered under this maintenance guarantee. For other items such as glass, aluminum finishing, etc., our standard warranty applies. We are committed to providing top-quality products and stand behind the work that we do. If you have any questions about our warranties, please do not hesitate to ask.</p>
    <p>We are excited to work with you and look forward to a successful partnership. If you have any questions or need any additional clarification, please do not hesitate to reach out to us.</p>
    <p></p><p>Thank you for considering RUA Company Aluminum And Glass L.L.C. O.P.C for your project. We value your business and look forward to the opportunity to serve you.</p>
    <p></p><p>Best regards,<p></p>RUA Company Aluminum And Glass L.L.C. O.P.C</p>
  `
})


const filteredQuotations = computed(() => {
	return (
		quotationResource.data?.filter((q) => q.project === props.projectResource.doc?.name) || []
	)
})

const quotationsByStatus = computed(() => {
  if (!filteredQuotations.value?.length) return {}

  // First group by status
  const grouped = filteredQuotations.value.reduce((acc, quotation) => {
    const status = quotation.status || 'Draft'
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(quotation)
    return acc
  }, {})

  // Then sort each group by date (newest first)
  Object.keys(grouped).forEach(status => {
    grouped[status].sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
  })

  return grouped
})

// Dialog Options
const noClientDialogOptions = computed(() => ({
	title: 'Missing Client',
	message:
		'A client must be added to the project before creating a quotation. Please add a client from the project overview page.',
	size: 'sm',
	icon: {
		name: 'alert-triangle',
		appearance: 'warning',
	},
	actions: [
		{
			label: 'Go to Overview',
			variant: 'solid',
			theme: 'warning',
			onClick: () => {
				router.push(`/project/${props.projectResource.doc.name}/overview`)
			},
		},
		{
			label: 'Close',
			variant: 'subtle',
			onClick: () => (showNoClientDialog.value = false),
		},
	],
}))

const notLockedDialogOptions = computed(() => ({
	title: 'Items Not Locked',
	message:
		'The project items must be locked before creating a quotation. Please lock the items from the Items page.',
	size: 'sm',
	icon: {
		name: 'alert-triangle',
		appearance: 'warning',
	},
	actions: [
		{
			label: 'Go to Items',
			variant: 'solid',
			theme: 'warning',
			onClick: () => {
				router.push(`/project/${props.projectResource.doc.name}/items`)
			},
		},
		{
			label: 'Close',
			variant: 'subtle',
			onClick: () => (showNotLockedDialog.value = false),
		},
	],
}))

const newQuotationDialogOptions = computed(() => ({
	title: 'New Quotation',
	size: 'lg',
	actions: [
		{
			label: 'Create',
			variant: 'solid',
			onClick: createQuotation,
			loading: quotationResource.insert?.loading,
		},
	],
}))

// Methods

function getStatusVariant(status) {
	switch (status?.toLowerCase()) {
		case 'draft':
			return 'orange'
		case 'submitted':
			return 'blue'
		case 'rejected':
			return 'red'
		case 'final':
			return 'gray'
		default:
			return 'gray'
	}
}

function toggleStatusCollapse(status) {
	statusCollapsed.value[status] = !statusCollapsed.value[status]
}

function getPartyData(partyName) {
	return partyResource.data?.find((p) => p.name === partyName)
}

function navigateToQuotation(quotation) {
	router.push({
		name: 'QuotationDetails',
		params: {
			id: props.projectResource.doc.name,
			quotationId: quotation.name,
		},
	})
}

function validateAndShowQuotationDialog() {
  const parties = getProjectParties()
  const hasClient = parties.some((party) => party.type.toLowerCase() === 'client')
  
  if (!hasClient) {
    showNoClientDialog.value = true
    return
  }

  const isLocked = checkProjectLocked()
  if (!isLocked) {
    showNotLockedDialog.value = true
    return
  }

  // Reset scopes to default
  scopes.value.forEach(scope => {
    scope.selected = ['doors_windows', 'curtain_walls'].includes(scope.id)
  })
  
  showNewQuotationDialog.value = true
}

function getProjectParties() {
	try {
		return props.projectResource.doc?.parties
			? typeof props.projectResource.doc.parties === 'string'
				? JSON.parse(props.projectResource.doc.parties)
				: props.projectResource.doc.parties
			: []
	} catch (error) {
		console.error('Error parsing parties:', error)
		return []
	}
}

function checkProjectLocked() {
	const locked = props.projectResource.doc?.locked || ''
	return locked && locked !== '' && locked !== '[]' && locked !== '{}'
}

function handleNewQuotation() {
  showTextEditor.value = false
  validateAndShowQuotationDialog()
}

function openSignedDocument(url, event) {
	event.preventDefault()
	event.stopPropagation()
	window.open(url, '_blank', 'noopener,noreferrer')
}

// Watch for step changes to update quotation_details
watch(currentStep, (newStep) => {
  if (newStep === 4) { // When reaching review step
    formData.value.quotation_details = generatedContent.value
  }
})

function resetForm() {
  formData.value = {
    date: getServerDate(),
    specifications: {
      aluminum: 'GULF EXTRUSION ATTESTED SYSTEM',
      glass: 'GUARDIAN GLASS DOUBLE TEMPERED GLASS (8mm CLEAR TEMPERED GLASS + 16mm SILICONE AIR SPACER + 8mm REFLECTIVE TEMPERED GLASS)',
      finishes: 'SDF POWDER COATED'
    },
    scopes: {
      doors_windows: true,
      curtain_walls: true,
      skylight: false,
      steel: false,
      fire_rated: false,
      balcony_handrail: false,
      stair_handrail: false,
      pergola: false
    },
    notes: '',
    exclusions: `
      <ul>
        <li>ALUMINUM CLADDING</li>
        <li>DOOR CLOSER</li>
        <li>STEEL & STAINLESS STEEL WORK</li>
        <li>CAT LADDER</li>
        <li>CANOPY</li>
        <li>FIRE RATED CURTAIN WALLS</li>
        <li>DOOR & WINDOWS</li>
        <li>CRANE</li>
        <li>SCAFFOLDING</li>
        <li>CRADLE</li>
        <li>ELECTRICITY</li>
        <li>WATER</li>
        <li>ANY ITEM NOT MENTIONED OR INCLUDED IN THE ATTACHED DOCUMENTS</li>
      </ul>
    `,
    quotation_details: ''
  }
}

async function createQuotation() {
  if (!props.projectResource.doc?.name) return

  try {
    const parties = getProjectParties()
    const clientParty = parties.find((party) => party.type.toLowerCase() === 'client')

    if (!clientParty) {
      console.error('Client party not found')
      return
    }

    // Ensure we have the latest content
    const finalContent = formData.value.quotation_details || generatedContent.value

    await quotationResource.insert.submit({
      project: props.projectResource.doc.name,
      date: formData.value.date,
      party: clientParty.name,
      doctype: 'RUA Quotation',
      quotation_details: finalContent
    })

    showNewQuotationDialog.value = false
    resetForm()
    currentStep.value = 0
  } catch (error) {
    console.error('Failed to create quotation:', error)
  }
}
</script>
