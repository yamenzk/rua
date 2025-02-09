# IssueReportDialog.vue
<template>
  <Dialog
    v-if="!showDetails"
    v-model="show"
    :options="{
      title: 'Issue Tracking',
      size: 'xl',
    }"
  >
    <template #body-content>
      <div class="space-y-6 p-4">
        <!-- Command bar style tabs -->
        <div class="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200"
            :class="[
              currentTab === tab.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            ]"
          >
            <div class="flex items-center justify-center gap-2">
              <FeatherIcon 
                :name="tab.id === 'existing' ? 'inbox' : 'plus-circle'"
                class="w-4 h-4" 
              />
              {{ tab.name }}
            </div>
          </button>
        </div>

        <!-- Existing Issues List -->
        <div v-if="currentTab === 'existing'" class="space-y-4">
          <div v-if="loading" class="flex justify-center py-8">
            <LoadingIndicator class="animate-pulse" />
          </div>

          <div v-else-if="!openIssues.length" class="flex flex-col items-center justify-center py-12 space-y-4">
            <div class="rounded-full bg-slate-100 p-4">
              <FeatherIcon name="inbox" class="w-8 h-8 text-slate-400" />
            </div>
            <p class="text-slate-500 text-lg">No open issues found</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="issue in openIssues"
              :key="issue.name"
              class="issue-card transform transition-all duration-200 hover:translate-x-1"
            >
              <div 
                class="p-4 rounded-lg border"
                :class="[
                  issue.type === 'Feature Request' 
                    ? 'bg-cyan-50/50 border-cyan-100 hover:bg-cyan-50'
                    : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'
                ]"
              >
                <!-- Card Header -->
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <!-- Issue Type Badge -->
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase"
                      :class="{
                        'bg-cyan-100 text-cyan-700': issue.type === 'Feature Request',
                        'bg-amber-100 text-amber-700': issue.type === 'Bug'
                      }"
                    >
                      {{ issue.type }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <FeatherIcon name="clock" class="w-4 h-4 text-slate-400" />
                    <span class="text-slate-500">
                      {{ getRelativeTime(issue.creation) }}
                    </span>
                  </div>
                </div>

                <!-- Issue Details -->
                <p 
                  class="text-slate-600 whitespace-pre-wrap"
                  :class="{
                    'text-cyan-700': issue.type === 'Feature Request',
                    'text-amber-700': issue.type === 'Bug'
                  }"
                >
                  {{ issue.details }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- New Issue Form -->
        <div v-else class="space-y-6">
          <div class="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
            <!-- Issue Type Selection -->
            <div class="p-6">
              <label class="block text-sm font-medium text-slate-700 mb-4">
                What type of issue would you like to report?
              </label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  v-for="type in issueTypes"
                  :key="type"
                  @click="formData.type = type"
                  class="relative p-4 rounded-lg border-2 transition-all duration-200"
                  :class="[
                    formData.type === type
                      ? type === 'Feature Request'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  ]"
                >
                  <div class="flex flex-col items-center gap-2">
                    <FeatherIcon 
                      :name="type === 'Feature Request' ? 'star' : 'alert-circle'"
                      class="w-6 h-6" 
                    />
                    <span class="font-medium">{{ type }}</span>
                  </div>
                  
                  <!-- Selected indicator -->
                  <div 
                    v-if="formData.type === type"
                    class="absolute top-2 right-2"
                  >
                    <FeatherIcon 
                      name="check-circle" 
                      class="w-5 h-5"
                      :class="type === 'Feature Request' ? 'text-cyan-500' : 'text-amber-500'"
                    />
                  </div>
                </button>
              </div>
            </div>

            <!-- Issue Details -->
            <div class="p-6 space-y-3">
              <label class="block text-sm font-medium text-slate-700">
                Details
              </label>
              <textarea
                v-model="formData.details"
                rows="4"
                class="w-full rounded-lg border-slate-300 placeholder-slate-400 transition-all duration-200"
                :class="[
                  formData.type === 'Feature Request'
                    ? 'focus:border-cyan-500 focus:ring-cyan-500'
                    : 'focus:border-amber-500 focus:ring-amber-500'
                ]"
                :placeholder="
                  formData.type === 'Feature Request'
                    ? 'Describe the feature you would like to see...'
                    : 'Describe the issue you are experiencing...'
                "
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="p-6 bg-slate-50">
              <div class="flex justify-end">
                <button
                  @click="submitIssue"
                  :disabled="!isFormValid || submitting"
                  class="submit-button relative px-6 py-2 rounded-lg text-white font-medium shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="[
                    formData.type === 'Feature Request'
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  ]"
                >
                  <span class="flex items-center gap-2">
                    <template v-if="submitting">
                      <LoadingIndicator class="w-5 h-5" />
                      <span>Submitting...</span>
                    </template>
                    <template v-else>
                      <FeatherIcon name="send" class="w-4 h-4" />
                      <span>Submit Issue</span>
                    </template>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Dialog, LoadingIndicator, FeatherIcon } from 'frappe-ui'
import { issueResource } from '@/data/issue'
import { getRelativeTime } from '@/utils/format.js'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

// Dialog state
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Tabs configuration
const tabs = [
  { id: 'existing', name: 'Open Issues' },
  { id: 'new', name: 'Report Issue' }
]
const currentTab = ref('existing')
const showDetails = ref(false)

// Data loading state
const loading = ref(true)
const issues = ref([])
const openIssues = computed(() => 
  issues.value.filter(issue => issue.status === 'Open')
)

// Form state
const issueTypes = ['Feature Request', 'Bug']
const formData = ref({
  type: 'Bug',
  details: '',
})
const submitting = ref(false)

const isFormValid = computed(() => 
  formData.value.type && 
  formData.value.details.trim().length > 0
)

async function fetchIssues() {
  try {
    loading.value = true
    await issueResource.reload()
    if (issueResource.data) {
      issues.value = issueResource.data
    }
  } catch (error) {
    console.error('Error fetching issues:', error)
  } finally {
    loading.value = false
  }
}

async function submitIssue() {
  if (!isFormValid.value) return
  
  submitting.value = true
  try {
    await issueResource.insert.submit({
      type: formData.value.type,
      details: formData.value.details.trim(),
      status: 'Open'
    })
    
    // Reset form and refresh issues
    formData.value.details = ''
    await fetchIssues()
    currentTab.value = 'existing'
  } catch (error) {
    console.error('Failed to submit issue:', error)
  } finally {
    submitting.value = false
  }
}

// Initial data fetch
onMounted(() => {
  fetchIssues()
})

// Refresh issues when dialog opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fetchIssues()
  }
})
</script>

<style scoped>
.issue-card {
  position: relative;
}

.issue-card::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.25rem;
  height: 2rem;
  border-radius: 1rem;
  background-color: transparent;
  transition: all 0.2s ease;
}

.issue-card:hover::before {
  background-color: currentColor;
}

</style>