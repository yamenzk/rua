<template>
    <div class="flex border-b overflow-x-auto">
      <button 
        v-for="button in buttons" 
        :key="button.value"
        @click="$emit('update:modelValue', button.value)"
        class="
          relative 
          px-4 
          py-3 
          text-sm 
          font-medium 
          transition-colors 
          duration-200 
          ease-in-out
          flex 
          items-center 
          gap-2
          text-gray-600 
          hover:text-gray-900
          focus:outline-none
          group

        "
        :class="{
          'text-gray-900 font-semibold': modelValue === button.value,
          'hover:bg-gray-100': modelValue !== button.value
        }"
      >
        <FeatherIcon 
          :name="button.icon" 
          class="w-4 h-4 text-gray-500 group-hover:text-gray-700"
          :class="{
            'text-gray-700': modelValue === button.value
          }"
        />
        <span>{{ button.label }}</span>
        
        <!-- Underline effect -->
        <div 
          v-if="modelValue === button.value"
          class="
            absolute 
            bottom-0 
            left-0 
            right-0 
            h-0.5 
            bg-primary 
            transition-all 
            duration-200
          "
        ></div>
        
        <Badge 
          v-if="getTabCount(button.value)"
          :variant="'subtle'"
          :theme="getThemeForTab(button.value)"
          size="sm"
        >
          {{ getTabCount(button.value) }}
        </Badge>
      </button>
    </div>
  </template>
  
  <script setup>
  import { FeatherIcon, Badge } from 'frappe-ui'
  
  defineProps({
    buttons: {
      type: Array,
      required: true
    },
    modelValue: {
      type: String,
      required: true
    },
    getTabCount: {
      type: Function,
      default: () => 0
    }
  })
  
  function getThemeForTab(tabValue) {
    switch (tabValue) {
      case 'received':
        return 'green'
      case 'paid':
        return 'red'
      case 'additional':
        return 'orange'
      default:
        return 'gray'
    }
  }
  
  defineEmits(['update:modelValue'])
  </script>
  
  <style scoped>
  /* Additional subtle styling can be added here if needed */
  </style>