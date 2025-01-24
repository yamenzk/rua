<template>
	<Dialog v-model="show" :options="dialogOptions">
		<template #body-content>
			<div class="space-y-6">
				<!-- Party Selection -->
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">Party</label>
					<div class="relative">
						<Combobox v-model="formData.party">
							<div class="relative">
								<ComboboxInput
									:display-value="(party) => party?.name || ''"
									class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
									@change="query = $event.target.value"
									placeholder="Select a party"
								/>
								<ComboboxButton
									class="absolute inset-y-0 right-0 flex items-center pr-2"
								>
									<FeatherIcon
										name="chevron-down"
										class="h-4 w-4 text-gray-400"
									/>
								</ComboboxButton>
							</div>
							<ComboboxOptions
								class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
							>
								<div
									v-if="filteredParties.length === 0"
									class="relative cursor-default select-none py-2 px-4 text-gray-700"
								>
									No parties found.
								</div>
								<ComboboxOption
									v-for="party in filteredParties"
									:key="party.name"
									:value="party"
									v-slot="{ selected, active }"
								>
									<div
										:class="[
											'relative cursor-pointer select-none py-2 px-4',
											active ? 'bg-gray-50' : '',
										]"
									>
										<div class="flex items-center">
											<Avatar
												v-if="party.image"
												:image="party.image"
												size="sm"
												shape="circle"
												class="mr-2"
											/>
											<span
												:class="[
													'block truncate',
													selected ? 'font-semibold' : '',
												]"
											>
												{{ party.name }}
											</span>
										</div>
									</div>
								</ComboboxOption>
							</ComboboxOptions>
						</Combobox>
					</div>
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
						/>
					</div>
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
import { ref, computed } from 'vue'
import { Dialog, Avatar, FeatherIcon } from 'frappe-ui'
import {
	Combobox,
	ComboboxInput,
	ComboboxButton,
	ComboboxOptions,
	ComboboxOption,
} from '@headlessui/vue'
import { getCurrentDubaiDate } from '@/utils/format'

const props = defineProps({
	modelValue: Boolean,
	projectResource: {
		type: Object,
		required: true,
	},
})

const emit = defineEmits(['update:modelValue', 'submit'])

// State
const query = ref('')
const isSubmitting = ref(false)
const formData = ref({
	party: null,
	date: getCurrentDubaiDate(),
	amount: 0,
	bank: '',
	reference_no: '',
	remarks: '',
	claim_date: getCurrentDubaiDate(),
})

// Computed Properties
const show = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
})

const filteredParties = computed(() => {
	const parties = props.projectResource.doc?.parties
		? typeof props.projectResource.doc.parties === 'string'
			? JSON.parse(props.projectResource.doc.parties)
			: props.projectResource.doc.parties
		: []

	return query.value === ''
		? parties
		: parties.filter((party) => party.name.toLowerCase().includes(query.value.toLowerCase()))
})

const isFormValid = computed(() => {
	return formData.value.party && formData.value.amount > 0 && formData.value.date
})

const dialogOptions = computed(() => ({
	title: 'New Payment Receipt',
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

async function handleSubmit() {
	if (!isFormValid.value) return

	try {
		isSubmitting.value = true

		const data = {
			project: props.projectResource.doc.name,
			party: formData.value.party.name,
			date: formData.value.date,
			amount: formData.value.amount,
			bank: formData.value.bank,
			reference_no: formData.value.reference_no,
			remarks: formData.value.remarks,
			type: 'Receive',
			naming_series: 'RC-REC-.YY.',
			doctype: 'RUA Payment',
			status: 'Draft',
      claim_date: formData.value.claim_date,
		}

		emit('submit', data)
	} finally {
		isSubmitting.value = false
	}
}
</script>
