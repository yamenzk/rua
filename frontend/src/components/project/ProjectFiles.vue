<template>
    <div class="min-h-screen bg-gray-50">
      <!-- Main Content -->
      <div>
          <SimpleDocuments 
            v-if="projectResource.doc"
            :source-type="'RUA Project'"
            :source-name="projectResource.doc.name"
          />
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import SimpleDocuments from '@/components/project/SimpleDocuments.vue'
  
  const props = defineProps({
    projectResource: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && typeof value === 'object' && 'doc' in value
      }
    },
  isCollapsed: {
    type: Boolean,
    default: false
  }
  })
  
  const router = useRouter()
  </script>