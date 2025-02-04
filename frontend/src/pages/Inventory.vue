<template>
  <div class="space-y-6">
    <!-- Floating Top Right Actions (Optional) -->
    <div class="fixed top-16 right-4 z-10 flex items-center gap-2">
      <!-- Add any specific inventory actions if needed -->
    </div>

    <!-- Floating Filters Toolbar -->
    <div class="fixed bottom-4 right-4 z-10 mb-4 flex items-center justify-between gap-2 p-4 bg-gray-200/60 backdrop-blur-sm w-fit rounded-lg">
      <div class="flex items-center gap-2">
        <!-- Brand Filter -->
        <div class="relative">
          <select 
            v-model="filters.brand"
            class="
              appearance-none bg-white border border-gray-300 
              rounded-lg py-2 px-3 pr-8 leading-tight 
              focus:outline-none focus:border-gray-500 focus:ring-gray-900
              text-sm
            "
          >
            <option value="">All Brands</option>
            <option 
              v-for="brand in brandOptions" 
              :key="brand.value" 
              :value="brand.value"
            >
              {{ brand.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <FeatherIcon name="chevron-down" class="h-4 w-4" />
          </div>
        </div>

        <!-- View Mode Toggle -->
        <div class="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
          <button 
            @click="viewMode = 'compact'"
            class="p-1.5 rounded transition-colors"
            :class="viewMode === 'compact' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'"
          >
            <FeatherIcon name="list" class="w-4 h-4" />
          </button>
          <button 
            @click="viewMode = 'detailed'"
            class="p-1.5 rounded transition-colors"
            :class="viewMode === 'detailed' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'"
          >
            <FeatherIcon name="grid" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Inventory Grid -->
    <div v-if="inventoryResource.loading" class="flex justify-center py-12 px-6">
      <LoadingIndicator />
    </div>
    
    <div v-else-if="!filteredItems.length" class="text-center py-12 px-6">
      <FeatherIcon name="package" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-base font-medium text-gray-900">No items found</p>
      <p class="text-sm text-gray-600">
        {{ filters.search ? 'Try adjusting your search or filters' : 'Get started by adding a new item' }}
      </p>
    </div>

    <div v-else class="grid gap-6 px-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
      <div
        v-for="item in filteredItems"
        :key="item.name"
        class="
			  bg-white rounded-2xl transition-all duration-300 
			  transform hover:-translate-y-2 
			  overflow-hidden group
			  border border-gray-100 cursor-pointer
			"
        @click="openItemDetails(item)"
      >
        <!-- Compact View -->
        <template v-if="viewMode === 'compact'">
          <div class="flex items-center p-4 gap-4">
            <div 
              class="p-2 rounded-lg shrink-0"
              :class="item.qty > 0 ? 'bg-green-50' : 'bg-red-50'"
            >
              <FeatherIcon 
                name="box" 
                class="w-5 h-5"
                :class="item.qty > 0 ? 'text-green-600' : 'text-red-600'"
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-semibold text-gray-900 truncate">{{ item.item }}</h3>
                  <p class="text-sm text-gray-500 truncate">{{ item.brand }}</p>
                </div>
                <div 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="item.qty > 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'"
                >
                  {{ item.qty }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Detailed View -->
        <template v-else>
          <div class="relative bg-gray-50 h-48 flex items-center justify-center">
            <div 
              class="p-4 rounded-lg"
              :class="item.qty > 0 ? 'bg-green-50' : 'bg-red-50'"
            >
              <FeatherIcon 
                name="box" 
                class="w-12 h-12"
                :class="item.qty > 0 ? 'text-green-600' : 'text-red-600'"
              />
            </div>
            <div class="absolute top-3 right-3">
              <div 
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="item.qty > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'"
              >
                {{ item.qty > 0 ? 'In Stock' : 'Out of Stock' }} {{ item.qty > 0 ? '('+item.qty+')' : '' }}
              </div>
            </div>
          </div>

          <div class="p-4 space-y-3">
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ item.item }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2">{{ item.description }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <FeatherIcon name="tag" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">{{ item.brand }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <FeatherIcon name="maximize" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">{{ item.length }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <FeatherIcon name="droplet" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">{{ item.finish }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  <Dialog
      v-model="showNewItemDialog"
      :options="{
        title: 'Add New Item',
        size: 'lg',
      }"
    >
      <template #body-content>
        <div class="space-y-6">
          <!-- Header Section -->
          <div class="relative pb-6 mb-6 border-b">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-gray-50">
                  <FeatherIcon 
                    name="package" 
                    class="w-5 h-5 text-gray-600"
                  />
                </div>
                <div>
                  <div class="text-sm text-gray-600">New Inventory Item</div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <!-- Left Column: Basic Info -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-900">Basic Information</h3>
              <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                <FormControl
                  type="text"
                  label="Item Code"
                  v-model="newItem.item"
                  required
                />
                <FormControl
                  type="text"
                  label="Brand"
                  v-model="newItem.brand"
                  required
                />
                <FormControl
                  type="text"
                  label="Description"
                  v-model="newItem.description"
                  required
                />
              </div>
            </div>

            <!-- Right Column: Specifications -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-900">Specifications</h3>
              <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                <FormControl
                  type="text"
                  label="Length"
                  v-model="newItem.length"
                />
                <FormControl
                  type="text"
                  label="Finish"
                  v-model="newItem.finish"
                />
                <FormControl
                  type="number"
                  label="Initial Quantity"
                  v-model="newItem.qty"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-2">
          <Button variant="subtle" @click="showNewItemDialog = false">Cancel</Button>
          <Button 
            variant="solid" 
            :loading="creating"
            :disabled="!isValidNewItem"
            @click="createItem"
          >
            <template #prefix>
              <FeatherIcon name="plus" class="w-4 h-4" />
            </template>
            Create Item
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- Update Quantity Dialog -->
    <Dialog
      v-model="showUpdateDialog"
      :options="{
        title: selectedItem ? `Update ${selectedItem.item}` : 'Update Item',
        size: 'md',
      }"
    >
      <template #body-content>
        <div v-if="selectedItem" class="space-y-6">
          <!-- Header with Item Info -->
          <div class="relative pb-6 mb-6 border-b">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg" :class="getQtyStatusClass(selectedItem.qty)">
                  <FeatherIcon 
                    name="box" 
                    class="w-5 h-5"
                    :class="selectedItem.qty > 0 ? 'text-green-600' : 'text-red-600'"
                  />
                </div>
                <div>
                  <Badge
                    size="lg"
                    :variant="selectedItem.qty > 0 ? 'subtle' : 'solid'"
                    :theme="selectedItem.qty > 0 ? 'green' : 'red'"
                  >
                    {{ selectedItem.qty > 0 ? 'In Stock' : 'Out of Stock' }}
                  </Badge>
                  <div class="mt-1 text-xs text-gray-500">
                    Current Quantity: {{ selectedItem.qty }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Item Details -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">Item Details</h3>
            <div class="p-4 bg-gray-50 rounded-lg space-y-3">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-white">
                  <FeatherIcon 
                    name="tag" 
                    class="w-4 h-4 text-gray-400"
                  />
                </div>
                <div>
                  <div class="text-xs text-gray-500">Brand</div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ selectedItem.brand }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-white">
                  <FeatherIcon 
                    name="maximize" 
                    class="w-4 h-4 text-gray-400"
                  />
                </div>
                <div>
                  <div class="text-xs text-gray-500">Length</div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ selectedItem.length }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-white">
                  <FeatherIcon 
                    name="droplet" 
                    class="w-4 h-4 text-gray-400"
                  />
                </div>
                <div>
                  <div class="text-xs text-gray-500">Finish</div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ selectedItem.finish }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quantity Update -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">Update Quantity</h3>
            <div class="p-4 bg-gray-50 rounded-lg">
              <FormControl
                type="number"
                label="New Quantity"
                v-model="updateQty"
                required
              />
            </div>
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-2">
          <Button variant="subtle" @click="showUpdateDialog = false">Cancel</Button>
          <Button 
            variant="solid" 
            :loading="updating"
            :disabled="!isValidUpdate"
            @click="updateItem"
          >
            <template #prefix>
              <FeatherIcon name="save" class="w-4 h-4" />
            </template>
            Update Quantity
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model="showDeleteDialog"
      :options="{
        title: 'Delete Item',
        size: 'sm',
        icon: {
          name: 'alert-triangle',
          appearance: 'danger'
        }
      }"
    >
      <template #body-content>
        <div class="space-y-4">
          <p class="text-gray-600">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-white">
                <FeatherIcon name="package" class="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ itemToDelete?.item }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ itemToDelete?.brand }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-2">
          <Button variant="subtle" @click="showDeleteDialog = false">Cancel</Button>
          <Button 
            variant="solid" 
            theme="red"
            :loading="deleting"
            @click="deleteItem"
          >
            <template #prefix>
              <FeatherIcon name="trash-2" class="w-4 h-4" />
            </template>
            Delete Item
          </Button>
        </div>
      </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, inject, h } from 'vue'
import {
  Button,
  FormControl,
  Dialog,
  Badge,
  FeatherIcon,
  LoadingIndicator,
} from 'frappe-ui'
import { inventoryResource } from '@/data/inventory'

// State
const filters = ref({
  search: '',
  brand: ''
})

const viewMode = ref('compact') // 'compact' or 'detailed'
const showNewItemDialog = ref(false)
const showUpdateDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedItem = ref(null)
const itemToDelete = ref(null)
const creating = ref(false)
const updating = ref(false)
const deleting = ref(false)
const updateQty = ref(0)
const setHeaderAction = inject('setHeaderAction')

const newItem = ref({
  item: '',
  description: '',
  brand: '',
  length: '',
  finish: '',
  qty: 0
})

// Computed
setHeaderAction(() => h('div', { 
  class: 'flex items-center justify-between gap-4 flex-1 px-2' 
}, [
  // Search Field
  h('div', { 
    class: 'relative flex-1 max-w-2xl'
  }, [
    h('div', {
      class: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'
    }, [
      h(FeatherIcon, {
        name: 'search',
        class: 'h-4 w-4 text-gray-400'
      })
    ]),
    h('input', {
      type: 'text',
      placeholder: 'Search items...',
      value: filters.value.search,
      onInput: (e) => filters.value.search = e.target.value,
      class: `
        block w-[180px] lg:w-full rounded-xl border-0 py-2 pl-10 pr-4 
        text-gray-900 ring-1 ring-inset ring-gray-200 
        placeholder:text-gray-400 
        focus:ring-2 focus:ring-inset focus:ring-gray-900
        transition-all duration-200
        bg-white/50 hover:bg-white
        sm:text-sm sm:leading-6
      `
    })
  ]),

  // New Item Button
  h('button', {
    class: `
      inline-flex items-center gap-2 
      rounded-xl px-4 py-2.5
      text-sm font-semibold text-white
      bg-gray-900 hover:bg-gray-800
      transition duration-200 ease-in-out
      shadow-sm hover:shadow
      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
    `,
    onClick: () => showNewItemDialog.value = true
  }, [
    h(FeatherIcon, {
      name: 'plus',
      class: 'h-4 w-4'
    }),
    h('span', {
      class: 'hidden sm:inline'
    }, 'Add Item')
  ])
]))

const brandOptions = computed(() => {
  if (!inventoryResource.data) return []
  
  const brands = [...new Set(inventoryResource.data.map(item => item.brand))]
  return brands
    .filter(Boolean)
    .sort()
    .map(brand => ({ label: brand, value: brand }))
})

const filteredItems = computed(() => {
  if (!inventoryResource.data) return []
  
  return inventoryResource.data.filter(item => {
    const matchesSearch = !filters.value.search || 
      item.item.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      item.description.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesBrand = !filters.value.brand || item.brand === filters.value.brand
    
    return matchesSearch && matchesBrand
  })
})

const isValidNewItem = computed(() => {
  return newItem.value.item &&
    newItem.value.description &&
    newItem.value.brand &&
    newItem.value.qty >= 0
})

const isValidUpdate = computed(() => {
  return updateQty.value >= 0
})

// Methods
function getQtyStatusClass(qty) {
  return qty > 0 ? 'bg-green-50' : 'bg-red-50'
}

function openItemDetails(item) {
  selectedItem.value = item
  updateQty.value = item.qty
  showUpdateDialog.value = true
}

function confirmDelete(item) {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

async function createItem() {
  if (!isValidNewItem.value) return
  
  creating.value = true
  try {
    await inventoryResource.insert.submit({
      ...newItem.value
    })
    
    showNewItemDialog.value = false
    newItem.value = {
      item: '',
      description: '',
      brand: '',
      length: '',
      finish: '',
      qty: 0
    }
    
    await inventoryResource.reload()
  } catch (error) {
    console.error('Error creating item:', error)
  } finally {
    creating.value = false
  }
}

async function updateItem() {
  if (!isValidUpdate.value || !selectedItem.value) return
  
  updating.value = true
  try {
    await inventoryResource.setValue.submit({
      name: selectedItem.value.name,
      qty: updateQty.value
    })
    
    showUpdateDialog.value = false
    selectedItem.value = null
    updateQty.value = 0
    
    await inventoryResource.reload()
  } catch (error) {
    console.error('Error updating item:', error)
  } finally {
    updating.value = false
  }
}

async function deleteItem() {
  if (!itemToDelete.value) return

  deleting.value = true
  try {
    await inventoryResource.delete.submit(itemToDelete.value.name)
    showDeleteDialog.value = false
    itemToDelete.value = null
    await inventoryResource.reload()
  } catch (error) {
    console.error('Error deleting item:', error)
  } finally {
    deleting.value = false
  }
}
</script>
<style scoped>
/* Add any additional scoped styles if needed */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>