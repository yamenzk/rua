<template>
  <div class="flex">
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
        transition-all 
        duration-200 
        ease-in-out
        flex 
        items-center 
        gap-3
        text-gray-500
        hover:text-gray-900
        focus:outline-none
        border-0
        outline-none
        group
      "
      :class="{
        'text-gray-900 font-semibold': modelValue === button.value,
      }"
    >
      <FeatherIcon 
        :name="button.icon" 
        class="w-4 h-4 transition-colors duration-200"
        :class="{
          'text-gray-900': modelValue === button.value,
          'text-gray-500 group-hover:text-gray-700': modelValue !== button.value
        }"
      />
      <span>{{ button.label }}</span>
      
      <!-- Animated Indicator -->
      <div 
        v-if="modelValue === button.value"
        class="
          absolute 
          bottom-0 
          left-0 
          right-0 
          h-0.5 
          bg-gray-900 
          scale-x-0 
          origin-center
          animate-expand
        "
      ></div>
      
      <!-- Count Indicator -->
      <span 
        v-if="getTabCount(button.value)"
        class="
          ml-2 
          inline-flex 
          items-center 
          justify-center
          min-w-[20px]
          h-5 
          px-1.5 
          rounded-full 
          text-xs 
          font-semibold
          transition-all
          duration-200
        "
        :class="getCountClasses(button.value)"
      >
        {{ getTabCount(button.value) }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'

const props = defineProps({
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

function getCountClasses(tabValue) {
  switch (tabValue) {
    case 'received':
      return 'bg-green-100 text-green-900'
    case 'paid':
      return 'bg-red-100 text-red-900'
    case 'additional':
      return 'bg-orange-100 text-orange-900'
    default:
      return 'bg-gray-200 text-gray-900'
  }
}

defineEmits(['update:modelValue'])
</script>

<style scoped>
@keyframes expand {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.animate-expand {
  animation: expand 0.3s ease-out forwards;
}
</style>