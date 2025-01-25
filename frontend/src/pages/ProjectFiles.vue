<template>
    <div class="min-h-screen bg-gray-50">
      <!-- Main Content -->
      <div class="px-4 sm:px-6 lg:px-8 py-8">
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
  import SimpleDocuments from './SimpleDocuments.vue'
  
  const props = defineProps({
    projectResource: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && typeof value === 'object' && 'doc' in value
      }
    }
  })
  
  const router = useRouter()
  </script>