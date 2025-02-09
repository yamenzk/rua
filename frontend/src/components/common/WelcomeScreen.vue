<!-- WelcomeScreen.vue -->
<template>
    <Transition
      appear
      @after-leave="onComplete"
      leave-active-class="transition-opacity duration-400 ease-in-out"
      leave-to-class="opacity-0"
    >
      <div
        v-if="stage < 2"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background-color: #f3f3f3; color: #171717"
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
              v-show="stage >= 0"
              src="/vertical_logo.png"
              alt="Company Logo"
              class="h-32 w-auto mb-12 mx-auto transform-gpu"
            />
          </Transition>
  
          <!-- Typing animation container -->
          <Transition
            appear
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
          >
            <h1 
              v-show="stage >= 1" 
              class="text-6xl font-semibold transform-gpu inline-flex items-center justify-center min-h-[4rem] tracking-tight"
            >
              <span class="typing-text">{{ displayedText }}</span>
              <span 
                class="typing-cursor ml-0.5" 
                :class="{'cursor-blink': isTypingComplete}"
              >|</span>
            </h1>
          </Transition>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  
  const props = defineProps({
    username: {
      type: String,
      required: true
    },
    onComplete: {
      type: Function,
      required: true
    }
  })
  
  const stage = ref(0)
  const displayedText = ref('')
  const isTypingComplete = ref(false)
  let typingSpeed = 50 // Faster base typing speed
  let currentTypingSpeed = typingSpeed
  
  const greeting = computed(() => `Welcome, ${props.username}.`)
  
  let timers = []
  let typingTimer = null
  
  const typeText = () => {
    const targetText = greeting.value
    let currentIndex = 0
    
    const type = () => {
      if (currentIndex <= targetText.length) {
        displayedText.value = targetText.slice(0, currentIndex)
        currentIndex++
        
        // Vary the typing speed slightly for a more natural feel
        currentTypingSpeed = typingSpeed + (Math.random() * 10 - 5)
        
        // Slow down slightly for spaces and punctuation
        if (targetText[currentIndex - 1] === ' ' || targetText[currentIndex - 1] === ',') {
          currentTypingSpeed += 15
        }
        
        typingTimer = setTimeout(type, currentTypingSpeed)
      } else {
        isTypingComplete.value = true
      }
    }
    
    type()
  }
  
  onMounted(() => {
    // Show logo immediately
    
    // Start typing animation after logo appears
    timers.push(setTimeout(() => {
      stage.value = 1
      typeText()
    }, 700))
    
    // Start fade out
    timers.push(setTimeout(() => stage.value = 2, 3500))
    
    // Complete
    timers.push(setTimeout(() => props.onComplete(), 4000))
  })
  
  onUnmounted(() => {
    timers.forEach(timer => clearTimeout(timer))
    if (typingTimer) clearTimeout(typingTimer)
  })
  </script>
  
  <style scoped>
  .typing-cursor {
    font-weight: 400;
    color: #171717;
    opacity: 1;
    animation: pulse 1.5s ease infinite;
  }
  
  .cursor-blink {
    animation: blink 1s step-end infinite;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .transform-gpu {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
  
  .typing-text {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  </style>