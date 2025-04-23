<template>
 <Dialog v-model="showDialog" :options="dialogOptions">
     <template #body-content>
         <div class="space-y-4">
             <p class="text-sm text-gray-600">Please fill in the required information for the template:</p>
             <div v-for="field in fields" :key="field" class="space-y-1">
                 <FormControl
                    type="text"
                    :label="formatLabel(field)"
                    v-model="formData[field]"
                    required
                  />
             </div>
             <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
         </div>
     </template>
     <template #actions>
         <Button variant="subtle" @click="cancel">Cancel</Button>
         <Button variant="solid" @click="submit" :disabled="!isFormValid">Fill Blanks</Button>
     </template>
 </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Dialog, Button, FormControl } from 'frappe-ui';

const props = defineProps({
    modelValue: Boolean, // v-model for visibility
    fields: { // Array of field names like ['employee_name', 'reason']
        type: Array,
        required: true
    }
});

// Added 'cancel' to emits
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const showDialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const formData = ref({});
const error = ref('');

// Initialize formData when fields change
watch(() => props.fields, (newFields) => {
    formData.value = newFields.reduce((acc, field) => {
        acc[field] = ''; // Initialize all fields to empty
        return acc;
    }, {});
    error.value = ''; // Reset error
}, { immediate: true });

const dialogOptions = {
    title: "Fill Template Details",
    size: 'md'
};

// Format label from field_name to Title Case
function formatLabel(fieldName) {
    return fieldName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const isFormValid = computed(() => {
    // Check if all fields in the dynamic form have values
    return props.fields.every(field => formData.value[field]?.trim());
});

function cancel() {
    emit('cancel'); // Emit cancel event
    showDialog.value = false;
}

function submit() {
    if (!isFormValid.value) {
        error.value = "Please fill all fields.";
        return;
    }
    error.value = '';
    emit('submit', { ...formData.value });
    showDialog.value = false; // Close dialog on successful submit
}

</script>
