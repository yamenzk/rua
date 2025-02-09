<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: #f3f3f3; color: #171717"
    tabindex="0"
    @keydown.space.prevent="handleReturn"
    ref="container"
  >
    <div class="text-center px-4">
      <!-- Logo with smooth fade -->
      <Transition
        appear
        enter-active-class="transition-all duration-700 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
      >
        <img 
          :src="logo"
          alt="Company Logo"
          class="h-32 w-auto mb-1 mx-auto transform-gpu"
        />
      </Transition>

      <!-- Content container -->
      <Transition
        appear
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <div class="space-y-8">
          <!-- First line -->
          <h1 class="text-6xl font-semibold transform-gpu tracking-tight">
            {{ firstLine }}
            <span 
              v-if="currentLine === 0"
              class="typing-cursor ml-0.5" 
              :class="{'cursor-blink': isFirstLineComplete}"
            >|</span>
          </h1>
          
          <!-- Second line with spacebar visualization -->
          <div 
            v-show="showSecondLine"
            class="text-xl text-gray-600"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>{{ secondLineStart }}</span>
              <Transition
                enter-active-class="transition-all duration-500 ease-in-out"
                enter-from-class="opacity-0 scale-98 translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
              >
                <div 
                v-if="showSpacebar"
                class="border-2 border-gray-300 rounded-lg px-8 py-1 text-gray-400 transition-all duration-200 cursor-pointer hover:border-gray-900 hover:text-gray-900 transform-gpu"
                :class="{'border-gray-900 text-gray-900': isSpacebarPressed}"
                @click="handleReturn"
                role="button"
                tabindex="0"
                @keydown.enter="handleReturn"
              >
                spacebar
              </div>
              </Transition>
              <span>
                {{ secondLineEnd }}
                <span 
                  v-if="currentLine === 1"
                  class="typing-cursor ml-0.5"
                  :class="{'cursor-blink': isTypingComplete}"
                >|</span>
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo.png'

const router = useRouter()
const container = ref(null)
const currentLine = ref(0)
const firstLine = ref('')
const secondLineStart = ref('')
const secondLineEnd = ref('')
const showSecondLine = ref(false)
const showSpacebar = ref(false)
const isFirstLineComplete = ref(false)
const isTypingComplete = ref(false)
const isSpacebarPressed = ref(false)

const texts = {
  firstLine: '404 Not Found.',
  secondLineStart: 'Press',
  secondLineEnd: 'to return home.'
}

let typingTimer = null
const typingSpeed = 50

const typeText = async (text, targetRef) => {
  let currentIndex = 0
  
  return new Promise((resolve) => {
    const type = () => {
      if (currentIndex <= text.length) {
        targetRef.value = text.slice(0, currentIndex)
        currentIndex++
        
        const currentChar = text[currentIndex - 1]
        let delay = typingSpeed + (Math.random() * 10 - 5)
        
        if (currentChar === ' ') {
          delay += 15
        }
        
        typingTimer = setTimeout(type, delay)
      } else {
        resolve()
      }
    }
    
    type()
  })
}

const handleReturn = () => {
  if (isTypingComplete.value) {
    isSpacebarPressed.value = true
    setTimeout(() => {
      router.push('/')
    }, 200)
  }
}

const startSequence = async () => {
  // Type first line
  currentLine.value = 0
  await typeText(texts.firstLine, firstLine)
  isFirstLineComplete.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Show second line container
  showSecondLine.value = true
  currentLine.value = 1
  
  // Type "Press"
  await typeText(texts.secondLineStart, secondLineStart)
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Show spacebar
  showSpacebar.value = true
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Type final part
  await typeText(texts.secondLineEnd, secondLineEnd)
  isTypingComplete.value = true
  
  // Focus container for spacebar detection
  container.value?.focus()
}

onMounted(() => {
  setTimeout(startSequence, 500)
})

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer)
})
</script>

<style scoped>
.cursor-blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

/* Remove focus outline but maintain accessibility */
div:focus {
  outline: none;
}

/* Only show outline when using keyboard navigation */
div:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>