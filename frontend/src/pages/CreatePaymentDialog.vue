# CreatePaymentDialog.vue
<template>
	<Dialog v-model="show" :options="dialogOptions">
		<template #body-content>
			<div v-if="!sourceDoc" class="py-8 text-center text-gray-500">Loading...</div>
			<div v-else class="space-y-6">
				<!-- Party info -->
				<div class="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
					<FeatherIcon name="user" class="w-4 h-4 text-gray-400" />
					<span class="text-sm text-gray-600">{{ sourceDoc.party }}</span>
				</div>

				<!-- Amount Input -->
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">Amount</label>
					<div class="relative">
						<div
							class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
						>
							<span class="text-gray-500 sm:text-sm">AED</span>
						</div>
						<input
							type="number"
							v-model.number="formData.amount"
							class="block w-full rounded-md border-gray-300 pl-12 pr-4 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
							placeholder="0.00"
							step="0.01"
							@input="validateAmount"
						/>
					</div>
					<p v-if="amountError" class="mt-1 text-sm text-red-600">
						{{ amountError }}
					</p>
				</div>

				<!-- Date Input -->
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">Date</label>
					<input
						type="date"
						v-model="formData.date"
						class="block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
					/>
				</div>

				<!-- Optional Fields -->

				<!-- Claim Date Input -->
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700"
						>Claim Date</label
					>
					<input
						type="date"
						v-model="formData.claim_date"
						class="block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
					/>
				</div>

				<div class="space-y-4">
					<!-- Bank -->
					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Bank (Optional)</label
						>
						<input
							type="text"
							v-model="formData.bank"
							class="mt-1 block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
							placeholder="Enter bank name"
						/>
					</div>

					<!-- Reference Number -->
					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Reference Number (Optional)</label
						>
						<input
							type="text"
							v-model="formData.reference_no"
							class="mt-1 block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
							placeholder="Enter reference number"
						/>
					</div>

					<!-- Remarks -->
					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Remarks (Optional)</label
						>
						<textarea
							v-model="formData.remarks"
							rows="3"
							class="mt-1 block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
							placeholder="Add any additional notes"
						></textarea>
					</div>
				</div>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, FeatherIcon } from 'frappe-ui'
import { useRouter } from 'vue-router'
import { paymentResource } from '@/data/payment'
import { getServerDate } from '@/utils/format'

const router = useRouter()

const props = defineProps({
	modelValue: Boolean,
	sourceDoc: {
		type: Object,
		default: null,
	},
	sourceType: {
		type: String,
		required: true,
		validator: (value) => ['RUA LPO', 'RUA Invoice'].includes(value),
	},
	paidAmount: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['update:modelValue'])

// State
const amountError = ref('')
const isSubmitting = ref(false)
const formData = ref({
	date: '',
	amount: 0,
	bank: '',
	reference_no: '',
	remarks: '',
  claim_date: '',
})

// Computed Properties
const show = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
})

const isFormValid = computed(() => {
	return (
		props.sourceDoc && formData.value.amount > 0 && !amountError.value && formData.value.date
	)
})

const dialogOptions = computed(() => ({
	title: 'Create Payment',
	size: 'md',
	actions: [
		{
			label: 'Create',
			variant: 'solid',
			loading: isSubmitting.value,
			onClick: handleSubmit,
			disabled: !isFormValid.value,
		},
	],
}))

// Methods
function validateAmount() {
  amountError.value = ''
  const remainingAmount = props.sourceDoc.grand_total - props.paidAmount

  if (formData.value.amount < 0) {
    amountError.value = 'Amount cannot be negative'
    return false
  }

  if (formData.value.amount > remainingAmount) {
    amountError.value = `Amount cannot exceed remaining balance of ${remainingAmount}`
    return false
  }

  return true
}


function resetForm() {
	const remainingAmount = props.sourceDoc?.grand_total - props.paidAmount
	formData.value = {
		date: getServerDate(),
		amount: remainingAmount,
		bank: '',
		reference_no: '',
		remarks: '',
    claim_date: getServerDate()
	}
	amountError.value = ''
	isSubmitting.value = false
}

async function handleSubmit() {
	if (!isFormValid.value || !props.sourceDoc) return

	try {
		isSubmitting.value = true

		const response = await paymentResource.insert.submit({
			project: props.sourceDoc.project,
			party: props.sourceDoc.party,
			date: formData.value.date,
			amount: formData.value.amount,
			bank: formData.value.bank,
			reference_no: formData.value.reference_no,
			remarks: formData.value.remarks,
			related_doctype: props.sourceType,
			related_docname: props.sourceDoc.name,
			type: props.sourceType === 'RUA LPO' ? 'Pay' : 'Receive',
			naming_series: props.sourceType === 'RUA LPO' ? 'RC-PAY-.YY.' : 'RC-REC-.YY.',
			doctype: 'RUA Payment',
			status: 'Draft',
      claim_date: formData.value.claim_date,
		})

		show.value = false

		// Navigate to the new Payment if created successfully
		if (response?.name) {
			router.push({
				name: 'PaymentDetails',
				params: {
					id: props.sourceDoc.project,
					paymentId: response.name,
				},
			})
		}
	} catch (error) {
		console.error('Failed to create payment:', error)
	} finally {
		isSubmitting.value = false
	}
}

// Set initial values when dialog opens and sourceDoc is available
watch(
	() => [props.modelValue, props.sourceDoc],
	([newValue, newDoc]) => {
		if (newValue && newDoc) {
			resetForm()
		}
	},
	{ immediate: true },
)
</script>
