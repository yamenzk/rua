<template>
  <div class="space-y-6">
    <!-- Header with Search and Filters -->
    <div class="flex items-center gap-4 flex-wrap">
      <!-- View Toggle -->
      <div class="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          class="p-1.5 rounded transition-colors"
          :class="viewMode === 'collapsed' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'"
          @click="viewMode = 'collapsed'"
        >
          <FeatherIcon name="list" class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 rounded transition-colors"
          :class="viewMode === 'expanded' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:text-gray-800'"
          @click="viewMode = 'expanded'"
        >
          <FeatherIcon name="grid" class="w-4 h-4" />
        </button>
      </div>

      <!-- Search -->
      <FormControl
        type="search"
        size="sm"
        variant="subtle"
        placeholder="Search items..."
        v-model="filters.search"
        class="w-64"
      />

      <!-- Brand Filter -->
      <FormControl
        type="select"
        :options="brandOptions"
        size="sm"
        variant="subtle"
        placeholder="Filter by Brand"
        v-model="filters.brand"
        class="w-48"
      />

      <!-- Add New Item Button -->
      <div class="ml-auto">
        <Button variant="solid" @click="showNewItemDialog = true">
          <template #prefix>
            <FeatherIcon name="plus" class="w-4 h-4" />
          </template>
          Add Item
        </Button>
      </div>
    </div>

    <!-- Items Grid -->
    <div v-if="inventoryResource.loading" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>
    
    <div v-else-if="!filteredItems.length" class="text-center py-12">
      <FeatherIcon name="package" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-base font-medium text-gray-900">No items found</p>
      <p class="text-sm text-gray-600">
        {{ filters.search ? 'Try adjusting your search or filters' : 'Get started by adding a new item' }}
      </p>
    </div>

    <div v-else :class="[
      'grid gap-4',
      viewMode === 'collapsed' 
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8'   
        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8'
    ]">
      <!-- Item Card -->
      <div
        v-for="item in filteredItems"
        :key="item.name"
        class="group bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <!-- Collapsed View -->
        <div v-if="viewMode === 'collapsed'" class="flex items-center p-4 gap-4">
          <!-- Status Icon -->
          <div 
            class="p-2 rounded-lg shrink-0"
            :class="getQtyStatusClass(item.qty)"
          >
            <FeatherIcon 
              name="box" 
              class="w-5 h-5"
              :class="item.qty > 0 ? 'text-green-600' : 'text-red-600'"
            />
          </div>

          <!-- Item Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h3 class="font-medium text-gray-900 truncate">{{ item.item }}</h3>
                <p class="text-sm text-gray-600 truncate">{{ item.brand }}</p>
              </div>
              <Badge 
                :variant="item.qty > 0 ? 'subtle' : 'solid'" 
                :theme="item.qty > 0 ? 'green' : 'red'"
              >
                {{ item.qty }}
              </Badge>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center gap-2">
            <button
              class="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              @click="openItemDetails(item)"
            >
              <FeatherIcon name="edit-2" class="w-4 h-4" />
            </button>
            <!-- <button
              class="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              @click.stop="confirmDelete(item)"
            >
              <FeatherIcon name="trash-2" class="w-4 h-4" />
            </button> -->
          </div>
        </div>

        <!-- Expanded View -->
        <div v-else class="cursor-pointer" @click="openItemDetails(item)">
          <!-- Item Header with Icon -->
          <div class="relative h-24 bg-gray-50 border-b">
            <div class="absolute inset-0 flex items-center justify-center">
              <div 
                class="p-3 rounded-lg transition-colors"
                :class="getQtyStatusClass(item.qty)"
              >
                <FeatherIcon 
                  name="box" 
                  class="w-8 h-8 transition-colors"
                  :class="item.qty > 0 ? 'text-green-600' : 'text-red-600'"
                />
              </div>
            </div>
            <div class="absolute top-3 right-3">
              <Badge 
                :variant="item.qty > 0 ? 'subtle' : 'solid'" 
                :theme="item.qty > 0 ? 'green' : 'red'"
              >
                {{ item.qty > 0 ? 'In Stock' : 'Out of Stock' }}
              </Badge>
            </div>
          </div>

          <!-- Item Content -->
          <div class="p-4 space-y-4">
            <!-- Item Title & Description -->
            <div>
              <h3 class="font-medium text-gray-900 group-hover:text-gray-700">{{ item.item }}</h3>
              <p class="text-sm text-gray-600 line-clamp-2">{{ item.description }}</p>
            </div>

            <!-- Item Details -->
            <div class="space-y-3">
              <!-- Brand -->
              <div class="flex items-center gap-3">
                <div class="p-1.5 rounded bg-gray-50">
                  <FeatherIcon name="tag" class="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div class="text-xs text-gray-500">Brand</div>
                  <div class="text-sm font-medium text-gray-900">{{ item.brand }}</div>
                </div>
              </div>

              <!-- Length -->
              <div class="flex items-center gap-3">
                <div class="p-1.5 rounded bg-gray-50">
                  <FeatherIcon name="maximize" class="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div class="text-xs text-gray-500">Length</div>
                  <div class="text-sm font-medium text-gray-900">{{ item.length }}</div>
                </div>
              </div>

              <!-- Finish -->
              <div class="flex items-center gap-3">
                <div class="p-1.5 rounded bg-gray-50">
                  <FeatherIcon name="droplet" class="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div class="text-xs text-gray-500">Finish</div>
                  <div class="text-sm font-medium text-gray-900">{{ item.finish }}</div>
                </div>
              </div>

              <!-- Quantity -->
              <div class="flex items-center gap-3">
                <div class="p-1.5 rounded bg-gray-50">
                  <FeatherIcon 
                    name="hash" 
                    class="w-4 h-4"
                    :class="item.qty > 0 ? 'text-green-500' : 'text-red-500'"
                  />
                </div>
                <div>
                  <div class="text-xs text-gray-500">Quantity</div>
                  <div 
                    class="text-sm font-medium"
                    :class="item.qty > 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ item.qty }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="pt-4 mt-4 border-t grid grid-cols-2 gap-2">
              <Button
                variant="subtle"
                class="w-full"
                @click.stop="openItemDetails(item)"
              >
                <template #prefix>
                  <FeatherIcon name="edit-2" class="w-4 h-4" />
                </template>
                Update
              </Button>
              <Button
                variant="subtle"
                class="w-full"
                theme="red"
                @click.stop="confirmDelete(item)"
              >
                <template #prefix>
                  <FeatherIcon name="trash-2" class="w-4 h-4" />
                </template>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Item Dialog -->
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

const viewMode = ref('collapsed') // 'collapsed' or 'expanded'
const showNewItemDialog = ref(false)
const showUpdateDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedItem = ref(null)
const itemToDelete = ref(null)
const creating = ref(false)
const updating = ref(false)
const deleting = ref(false)
const updateQty = ref(0)

const newItem = ref({
  item: '',
  description: '',
  brand: '',
  length: '',
  finish: '',
  qty: 0
})

// Computed
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