<template>
    <div 
      class="relative" 
      ref="containerRef"
      :data-autocomplete-id="componentId"
    >
      <!-- Input field -->
      <div
        class="relative w-full cursor-text rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900"
        @click="showOptions = true"
        :data-autocomplete-id="componentId"
      >
        <div class="flex items-center px-3 py-2">
          <!-- Prefix slot (for icons/avatars) -->
          <slot name="prefix"></slot>
          
          <!-- Input -->
          <input
            ref="inputRef"
            type="text"
            class="w-full border-0 p-0 focus:ring-0"
            :placeholder="placeholder"
            :value="displayValue"
            @input="handleInput"
            @focus="handleFocus"
            @keydown.down.prevent="handleArrowDown"
            @keydown.up.prevent="handleArrowUp"
            @keydown.enter.prevent="selectHighlighted"
            @keydown.esc="showOptions = false"
          />
  
          <!-- Clear button -->
          <button
            v-if="modelValue && allowClear"
            type="button"
            class="ml-2 text-gray-400 hover:text-gray-500"
            @click.stop="clearValue"
          >
            <FeatherIcon name="x" class="h-4 w-4" />
          </button>
  
          <!-- Dropdown indicator -->
          <button 
            type="button"
            class="ml-2 text-gray-400 hover:text-gray-500"
            @click.stop="toggleOptions"
          >
            <FeatherIcon 
              :name="showOptions ? 'chevron-up' : 'chevron-down'" 
              class="h-4 w-4" 
            />
          </button>
        </div>
      </div>
  
      <!-- Dropdown -->
      <Teleport to="body">
        <div
          v-if="showOptions"
          class="fixed z-[9999] bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 rounded-md"
          :style="dropdownStyles"
          :data-dropdown-id="componentId"
          @mousedown.stop
        >
          <div v-if="filteredOptions.length === 0" class="px-4 py-2 text-sm text-gray-500">
            No options found
          </div>
          <div
            v-else
            class="max-h-60 overflow-auto"
          >
            <button
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              type="button"
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              :class="{
                'bg-gray-100': highlightedIndex === index
              }"
              @click="selectOption(option)"
              @mouseover="highlightedIndex = index"
            >
              <div class="flex items-center">
                <!-- Item prefix slot -->
                <slot name="item-prefix" :option="option"></slot>
                
                <!-- Main content slot or default label -->
                <slot name="item" :option="option">
                  <span>{{ option.label }}</span>
                </slot>
              </div>
            </button>
          </div>
        </div>
      </Teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
  import { FeatherIcon } from 'frappe-ui'
  
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select an option'
    },
    allowClear: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  // Refs
  const componentId = ref(`autocomplete-${Math.random().toString(36).slice(2)}`)
  const containerRef = ref(null)
  const inputRef = ref(null)
  const showOptions = ref(false)
  const searchQuery = ref('')
  const highlightedIndex = ref(0)
  const dropdownStyles = ref({
    width: '0px',
    top: '0px',
    left: '0px'
  })
  
  // Computed
  const displayValue = computed(() => {
    if (!props.modelValue) return searchQuery.value
    const option = props.options.find(opt => opt.value === props.modelValue)
    return option ? option.label : searchQuery.value
  })
  
  const filteredOptions = computed(() => {
    const query = searchQuery.value.toLowerCase()
    return props.options.filter(option => 
      option.label.toLowerCase().includes(query)
    )
  })
  
  // Methods
  function updateDropdownPosition() {
    if (!containerRef.value || !showOptions.value) return
  
    const rect = containerRef.value.getBoundingClientRect()
    dropdownStyles.value = {
      width: rect.width + 'px',
      top: (rect.bottom + window.scrollY + 4) + 'px',
      left: (rect.left + window.scrollX) + 'px'
    }
  }
  
  function handleInput(event) {
    searchQuery.value = event.target.value
    showOptions.value = true
    highlightedIndex.value = 0
    
    // If input is cleared, also clear the selected value
    if (!event.target.value) {
      emit('update:modelValue', '')
    }
  }
  
  function handleFocus() {
    showOptions.value = true
    searchQuery.value = ''
    nextTick(() => {
      updateDropdownPosition()
    })
  }
  
  function selectOption(option) {
    emit('update:modelValue', option.value)
    searchQuery.value = option.label
    showOptions.value = false
  }
  
  function clearValue() {
    emit('update:modelValue', '')
    searchQuery.value = ''
  }
  
  function toggleOptions() {
    showOptions.value = !showOptions.value
    if (showOptions.value) {
      searchQuery.value = ''
      inputRef.value?.focus()
      nextTick(() => {
        updateDropdownPosition()
      })
    }
  }
  
  function handleArrowDown() {
    if (!showOptions.value) {
      showOptions.value = true
      return
    }
    highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length
  }
  
  function handleArrowUp() {
    if (!showOptions.value) {
      showOptions.value = true
      return
    }
    highlightedIndex.value = (highlightedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
  }
  
  function selectHighlighted() {
    if (showOptions.value && filteredOptions.value[highlightedIndex.value]) {
      selectOption(filteredOptions.value[highlightedIndex.value])
    }
  }
  
  function handleGlobalClick(event) {
    // If dropdown is not shown, nothing to do
    if (!showOptions.value) return
  
    // Get references to our component elements
    const container = containerRef.value
    const dropdown = document.querySelector(`[data-dropdown-id="${componentId.value}"]`)
    
    // Check if click is inside container or dropdown
    const isClickInsideContainer = container?.contains(event.target)
    const isClickInsideDropdown = dropdown?.contains(event.target)
  
    if (!isClickInsideContainer && !isClickInsideDropdown) {
      showOptions.value = false
    }
  }
  
  // Watchers
  watch(showOptions, (newValue) => {
    if (newValue) {
      nextTick(() => {
        updateDropdownPosition()
        window.addEventListener('scroll', updateDropdownPosition, true)
        window.addEventListener('resize', updateDropdownPosition)
      })
    } else {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  })
  
  // Lifecycle hooks
  onMounted(() => {
    document.addEventListener('mousedown', handleGlobalClick)
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
  })
  
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleGlobalClick)
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
  })
  </script>