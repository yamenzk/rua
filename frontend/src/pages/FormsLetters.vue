<template>
  <div class="page-container p-6 bg-gray-50 min-h-screen">
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="currentTab = tab.filterType; currentStatusFilter = ''" :class="[
            currentTab === tab.filterType
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-150 flex items-center gap-2',
          ]"
          :aria-current="currentTab === tab.filterType ? 'page' : undefined"
        >
          <span>{{ tab.name }}</span>
          <Badge v-if="tab.count > 0" size="sm" variant="subtle" theme="gray">{{ tab.count }}</Badge>
        </button>
      </nav>
    </div>

    <div class="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
       <div v-if="currentTab === 'LTR' || currentTab === 'FRM'" class="inline-flex rounded-md shadow-sm bg-white border border-gray-300">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            type="button"
            @click="currentStatusFilter = status.value"
            :class="[
                'relative inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150',
                status.value === currentStatusFilter ? 'bg-gray-900 text-white hover:bg-gray-700' : 'text-gray-700 bg-white hover:bg-gray-50',
                status.value === statusOptions[0].value ? 'rounded-l-md' : '',
                status.value === statusOptions[statusOptions.length - 1].value ? 'rounded-r-md border-l border-gray-300' : '',
                status.value !== statusOptions[0].value && status.value !== statusOptions[statusOptions.length - 1].value ? 'border-l border-gray-300' : ''
            ]"
          >
            {{ status.label }}
            </button>
       </div>
       <div v-else class="flex-1"></div> <div class="inline-flex rounded-md shadow-sm bg-white border border-gray-300">
          <button
             title="Grid View"
             @click="viewMode = 'grid'"
             :class="[
                'relative inline-flex items-center px-2 py-1.5 rounded-l-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150',
                viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-700' : 'text-gray-700 bg-white hover:bg-gray-50'
             ]">
             <FeatherIcon name="grid" class="h-4 w-4" />
          </button>
          <button
            title="List View"
            @click="viewMode = 'list'"
            :class="[
                'relative inline-flex items-center px-2 py-1.5 rounded-r-md border-l border-gray-300 focus:z-10 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors duration-150',
                viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-700' : 'text-gray-700 bg-white hover:bg-gray-50'
             ]">
             <FeatherIcon name="list" class="h-4 w-4" />
          </button>
       </div>
    </div>


    <div class="space-y-6">
      <div v-if="listResource.list.loading" class="flex justify-center py-12">
        <LoadingIndicator />
      </div>

      <div v-else-if="!filteredData.length" class="text-center py-12 text-gray-500">
          <FeatherIcon :name="getEmptyIcon()" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-lg font-medium text-gray-700 mb-1">No {{ getEmptyText() }} Found</p>
          <p v-if="searchQuery" class="text-sm">Try adjusting your search query.</p>
          <p v-else-if="currentStatusFilter" class="text-sm">Try changing the status filter or create a new document.</p>
          <p v-else-if="currentTab !== 'template'" class="text-sm">Click "Create New" to get started.</p>
          <p v-else class="text-sm">Create a new template using the "Create New" button.</p>
      </div>

      <div v-else-if="viewMode === 'grid'" class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          <div
              v-for="item in filteredData"
              :key="item.name"
              class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col"
              @click="navigateToDetails(item.name)"
          >
              <div class="p-4 flex-grow">
                  <div class="flex justify-between items-start mb-2">
                      <h3 class="font-semibold text-base text-gray-900 truncate pr-2" :title="item.system_title || item.name">
                          {{ item.system_title || item.name }}
                      </h3>
                      <Badge v-if="item.status && currentTab !== 'template'" :theme="getStatusTheme(item.status)" variant="subtle" size="sm" class="flex-shrink-0">
                          {{ item.status }}
                      </Badge>
                      <Badge v-else-if="currentTab === 'template'" theme="purple" variant="subtle" size="sm" class="flex-shrink-0">
                          Template
                      </Badge>
                  </div>
                  <p v-if="item.title && item.title !== item.system_title" class="text-xs text-gray-500 mb-1 truncate" :title="item.title">
                      Print Title: {{ item.title }}
                  </p>
                   <p v-if="item.subject" class="text-sm text-gray-600 mb-3 line-clamp-2" :title="item.subject">
                      {{ item.subject }}
                  </p>
              </div>
              <div class="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
                   <span>{{ item.type === 'LTR' ? 'Letter' : (item.type === 'FRM' ? 'Form' : 'Type N/A') }}</span>
                   <span>{{ formatDate(item.modified || item.creation) }}</span>
              </div>
          </div>
      </div>

        <div v-else-if="viewMode === 'list'" class="bg-white rounded-lg border shadow-sm overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Title</th>
                        <th v-if="currentTab !== 'template'" scope="col" class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Print Title</th>
                        <th scope="col" class="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in filteredData" :key="item.name" class="hover:bg-gray-50 cursor-pointer" @click="navigateToDetails(item.name)">
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate" :title="item.system_title || item.name">{{ item.system_title || item.name }}</td>
                         <td v-if="currentTab !== 'template'" class="px-4 py-3 whitespace-nowrap text-sm">
                             <Badge :theme="getStatusTheme(item.status)" variant="subtle" size="sm">{{ item.status }}</Badge>
                         </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ item.is_template ? 'Template' : (item.type === 'LTR' ? 'Letter' : 'Form') }}</td>
                         <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate" :title="item.title">{{ item.title || '-'}}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ formatDate(item.modified || item.creation) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <NewLetterDialog
      v-model="showNewLetterDialog"
      @navigate-to-edit="navigateToDetails"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, h, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { letterListResource } from '@/data/letter';
import { FeatherIcon, LoadingIndicator, Badge, Button } from 'frappe-ui';
import { formatDate, DATE_FORMATS } from '@/utils/format';
import NewLetterDialog from '@/components/letter/NewLetterDialog.vue';

const router = useRouter();
const setHeaderAction = inject('setHeaderAction');

// --- State ---
const listResource = letterListResource;
const currentTab = ref('LTR'); // Default: 'LTR', 'FRM', 'template'
const currentStatusFilter = ref(''); // Default: '', 'Draft', 'Final', 'Cancelled'
const searchQuery = ref('');
const showNewLetterDialog = ref(false);
const viewMode = ref('grid'); // 'grid' or 'list'

// --- Computed Properties ---

// Full dataset for count calculations
const allDocs = computed(() => listResource.data || []);

// Counts for Type Tabs
const letterCount = computed(() => allDocs.value.filter(d => d.type === 'LTR' && !d.is_template).length);
const formCount = computed(() => allDocs.value.filter(d => d.type === 'FRM' && !d.is_template).length);
const templateCount = computed(() => allDocs.value.filter(d => d.is_template === 1).length);

// Type Tabs Definition including counts
const tabs = computed(() => [
    { name: 'Letters', filterType: 'LTR', count: letterCount.value },
    { name: 'Forms', filterType: 'FRM', count: formCount.value },
    { name: 'Templates', filterType: 'template', count: templateCount.value },
]);

// Status Filter Options
const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Final', value: 'Final' },
    { label: 'Cancelled', value: 'Cancelled' },
];

// Filter data based on current tab, status filter, and search query
const filteredData = computed(() => {
    let data = allDocs.value;

    // 1. Filter by Tab (Type or Template)
    if (currentTab.value === 'template') {
        data = data.filter(item => item.is_template === 1);
    } else {
        // Filter Letters or Forms (and exclude templates)
        data = data.filter(item => item.type === currentTab.value && !item.is_template);

        // 2. Filter by Status (only for LTR/FRM tabs)
        if (currentStatusFilter.value) {
            data = data.filter(item => item.status === currentStatusFilter.value);
        }
    }

    // 3. Filter by Search Query (Search across relevant fields including system_title)
    if (searchQuery.value) {
        const lowerQuery = searchQuery.value.toLowerCase();
        data = data.filter(item =>
            item.name?.toLowerCase().includes(lowerQuery) ||
            item.system_title?.toLowerCase().includes(lowerQuery) || // Added system_title
            item.title?.toLowerCase().includes(lowerQuery) ||
            item.subject?.toLowerCase().includes(lowerQuery) ||
            item.owner?.toLowerCase().includes(lowerQuery)
        );
    }

    // Sort by modification date descending (most recent first)
    data.sort((a, b) => new Date(b.modified) - new Date(a.modified));


    return data;
});

// --- Methods ---

function navigateToDetails(id) {
    router.push({ name: 'LetterDetails', params: { id } });
}

function getStatusTheme(status) {
    switch (status) {
        case 'Draft': return 'orange';
        case 'Final': return 'green';
        case 'Cancelled': return 'red';
        default: return 'gray';
    }
}

function getEmptyIcon() {
     switch (currentTab.value) {
         case 'LTR': return 'mail';
         case 'FRM': return 'file-text';
         case 'template': return 'layout';
         default: return 'folder-minus'; // Changed default icon
     }
 }

 function getEmptyText() {
     // Use the tab name for consistency
     return tabs.value.find(t => t.filterType === currentTab.value)?.name || 'Items';
 }


// --- Watchers ---

watch([currentTab, currentStatusFilter], () => {
    // Data filtering is handled by computed properties.
    // No reload needed unless implementing server-side filtering/pagination.
});

// --- Lifecycle Hooks ---

onMounted(() => {
    // Set Header Action (includes search and create button - adapted style)
    setHeaderAction(() =>
        h(
            'div',
            {
                class: 'flex items-center justify-between gap-4 flex-1 px-2',
            },
            [
                // Search Field (Adapted Style)
                h(
                    'div',
                    {
                        // Use max-w from projects example or adjust if needed
                        class: 'relative flex-1 max-w-2xl',
                    },
                    [
                        // Icon Wrapper (from projects example)
                        h(
                            'div',
                            {
                                class: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
                            },
                            [
                                h(FeatherIcon, {
                                    name: 'search',
                                    class: 'h-4 w-4 text-gray-400', // Class from projects example
                                }),
                            ]
                        ),
                        // Input (Adapted Style)
                        h('input', {
                            type: 'text',
                            placeholder: `Search ${getEmptyText()}...`, // Keep dynamic placeholder
                            value: searchQuery.value,
                            onInput: (e) => (searchQuery.value = e.target.value),
                            // Apply classes from projects example input
                            class: `
                                block w-[180px] lg:w-full rounded-xl border-0 py-2 pl-10 pr-4
                                text-gray-900 ring-1 ring-inset ring-gray-200
                                placeholder:text-gray-400
                                focus:ring-2 focus:ring-inset focus:ring-gray-900
                                transition-all duration-200
                                bg-white/50 hover:bg-white
                                sm:text-sm sm:leading-6
                            `,
                        }),
                    ]
                ),

                // Create New Button (Adapted Style)
                h(
                    'button', // Use standard button element
                    {
                        // Apply classes from projects example button
                        class: `
                            inline-flex items-center gap-2
                            rounded-xl px-4 py-2.5
                            text-sm font-semibold text-white
                            bg-gray-900 hover:bg-gray-800
                            transition duration-200 ease-in-out
                            shadow-sm hover:shadow
                            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                        `,
                        // Keep original onClick logic
                        onClick: () => (showNewLetterDialog.value = true),
                    },
                    [
                        // Add icon as child (from projects example)
                        h(FeatherIcon, {
                            name: 'plus',
                            class: 'h-4 w-4',
                        }),
                        // Add text span as child (from projects example)
                        h(
                            'span',
                            {
                                class: 'hidden sm:inline',
                            },
                            'Create New' // Keep original text
                        ),
                    ]
                ),
            ]
        )
    );

    // Initial data load (keep this if it was there)
    listResource.reload();
});

</script>

<style scoped>
/* Minimal styles needed as Tailwind handles most */
.page-container {
  /* Add styles for the overall page container if necessary */
}
.line-clamp-2 {
   overflow: hidden;
   display: -webkit-box;
   -webkit-box-orient: vertical;
   -webkit-line-clamp: 2;
}

/* Ensure table layout is fixed for better column handling with truncate */
table {
    table-layout: fixed;
    width: 100%;
}
/* Give reasonable default widths, adjust as needed */
thead th:nth-child(1) { width: 35%; } /* System Title */
thead th:nth-child(2) { width: 12%; } /* Status */
thead th:nth-child(3) { width: 13%; } /* Type */
thead th:nth-child(4) { width: 25%; } /* Print Title */
thead th:nth-child(5) { width: 15%; } /* Modified */

/* Add truncate to table cells where overflow might happen */
td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


</style>