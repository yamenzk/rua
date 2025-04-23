<template>
  <div class="px-6 py-4">
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="currentTab = tab.filterValue"
          :class="[
            currentTab === tab.filterValue
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none',
          ]"
          :aria-current="currentTab === tab.filterValue ? 'page' : undefined"
        >
          {{ tab.name }}
           <Badge v-if="getTabCount(tab.filterValue)" variant="subtle" theme="gray" class="ml-2">
            {{ getTabCount(tab.filterValue) }}
           </Badge>
        </button>
      </nav>
    </div>

    <div>
       <div v-if="listResource.loading" class="flex justify-center py-10">
         <LoadingIndicator />
       </div>
       <div v-else-if="filteredLetters.length === 0" class="text-center py-10 text-gray-500">
         No {{ getCurrentTabName() }} found{{ searchQuery ? ' matching your search' : '' }}.
       </div>
       <div v-else class="space-y-3">
          <div
            v-for="letter in filteredLetters"
            :key="letter.name"
            class="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
            @click="viewDetails(letter.name)"
          >
            <div class="flex justify-between items-start gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <Badge v-if="currentTab !== 'template'" :theme="letter.type === 'LTR' ? 'blue' : 'purple'" variant="subtle">{{ letter.type }}</Badge>
                         <Badge v-if="letter.is_template && currentTab !== 'template'" theme="gray" variant="outline" size="sm">Template</Badge>
                        <span class="font-semibold text-gray-900 truncate">{{ letter.title || letter.name }}</span>
                    </div>
                    <p v-if="letter.subject" class="text-sm text-gray-600 truncate">{{ letter.subject }}</p>
                     <p class="text-xs text-gray-400 mt-1">
                        {{ letter.name }} • {{ formatDate(letter.date || letter.creation) }}
                    </p>
                </div>
                 <Badge v-if="currentTab !== 'template'" :theme="getStatusTheme(letter.status)" variant="subtle">{{ letter.status || 'Draft' }}</Badge>
            </div>
          </div>
       </div>
    </div>

    <NewLetterStartDialog
        v-model="showNewLetterDialog"
        @navigate-to-detail="navigateToNewDetail"
     />

  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { letterResource } from '@/data/letter' // Use your actual path
import NewLetterStartDialog from '@/components/letters/NewLetterStartDialog.vue' // Adjust path for the NEW dialog
import {
  Button,
  Badge,
  FeatherIcon,
  LoadingIndicator,
  FormControl,
  // debounce // Import if you use debounced search
} from 'frappe-ui'
import { formatDate, getStatusTheme } from '@/utils/format' // Assuming utils

const router = useRouter()
const listResource = letterResource // Alias for clarity
const currentTab = ref('LTR') // Default to Letters ('LTR', 'FRM', 'template')
const searchQuery = ref('')
const showNewLetterDialog = ref(false)

const tabs = [
  { name: 'Letters', filterValue: 'LTR' },
  { name: 'Forms', filterValue: 'FRM' },
  { name: 'Templates', filterValue: 'template' }, // New tab
]

// --- Header Action Injection ---
const setHeaderAction = inject('setHeaderAction')

onMounted(() => {
  setHeaderAction(() => h('div', {
    class: 'flex items-center justify-between gap-4 flex-1 px-2'
  }, [
    // Page Title (Moved from template)
    h('h1', { class: 'text-xl font-semibold text-gray-900 hidden md:block' }, 'Letters & Forms'), // Hide on small screens if needed

    // Search Field
    h('div', { class: 'relative flex-1 max-w-md' }, [ // Adjusted max-width
      h('div', { class: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3' }, [
        h(FeatherIcon, { name: 'search', class: 'h-4 w-4 text-gray-400' })
      ]),
      h('input', {
        type: 'search', // Use search type
        placeholder: `Search ${getCurrentTabName().toLowerCase()}...`, // Dynamic placeholder
        value: searchQuery.value,
        onInput: (e) => searchQuery.value = e.target.value,
        class: `block w-full rounded-xl border-0 py-2 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 transition-all duration-200 bg-white/50 hover:bg-white sm:text-sm sm:leading-6`
      })
    ]),

    // New Button
    h('button', {
      class: `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition duration-200 ease-in-out shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2`,
      onClick: () => showNewLetterDialog.value = true
    }, [
      h(FeatherIcon, { name: 'plus', class: 'h-4 w-4' }),
      h('span', { class: 'hidden sm:inline' }, 'Create New')
    ])
  ]))

  // Load data on mount
  listResource.reload()
})

// --- Computed Properties ---
const getTabCount = (tabFilterValue) => {
    if (!listResource.data) return 0;
    if (tabFilterValue === 'template') {
        return listResource.data.filter(l => l.is_template === 1).length;
    }
    // Count non-templates for LTR/FRM tabs
    return listResource.data.filter(l => l.type === tabFilterValue && !l.is_template).length;
}

const filteredLetters = computed(() => {
  if (!listResource.data) return []

  let items = [];
  if (currentTab.value === 'template') {
      items = listResource.data.filter(l => l.is_template === 1);
  } else {
      // Filter by type (LTR or FRM) and ensure it's NOT a template
      items = listResource.data.filter(l => l.type === currentTab.value && !l.is_template);
  }


  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(l =>
      l.name?.toLowerCase().includes(query) ||
      l.title?.toLowerCase().includes(query) ||
      l.subject?.toLowerCase().includes(query) ||
      (l.to && l.to.toLowerCase().includes(query)) || // Check if 'to' exists
      (l.content && l.content.toLowerCase().includes(query)) // Basic content search
    )
  }
  // Default sort by creation desc is handled by resource
  return items
})

// --- Methods ---
function getCurrentTabName() {
    return tabs.find(t => t.filterValue === currentTab.value)?.name || 'Items';
}

function viewDetails(id) {
  router.push({ name: 'LetterDetails', params: { id } })
}

function navigateToNewDetail(newDocId) {
    if (newDocId) {
        router.push({ name: 'LetterDetails', params: { id: newDocId }, query: { edit: 'true' } });
    }
}

// Watch currentTab to potentially clear search or reload (if needed)
watch(currentTab, () => {
    searchQuery.value = ''; // Clear search when changing tabs
    // listResource.reload() // Reload if filters were server-side
})

</script>