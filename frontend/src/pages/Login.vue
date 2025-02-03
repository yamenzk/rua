<template>
  <div class="min-h-screen w-full relative overflow-hidden">
    <!-- Video Background -->
    <video
      class="absolute top-0 left-0 w-full h-full object-cover"
      autoplay
      loop
      muted
      playsinline
    >
      <source :src="loginVideo" type="video/webm" />
    </video>

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-900/50 to-gray-900/50 mix-blend-multiply"></div>

    <!-- Animated Background Shapes -->
    <!-- <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-48 -left-48 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay animate-float"></div>
      <div class="absolute top-1/2 -right-48 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay animate-float-delayed"></div>
    </div> -->

    <!-- Main Content -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <!-- Left Side - Branding -->
        <div class="hidden md:flex flex-col items-center justify-center p-8 text-white">
          <img
            :src="loginLogo"
            alt="Rua Company Logo"
            class="w-48 h-auto mb-8 animate-fade-in"
          />
          <!-- <h1 class="text-3xl font-bold mb-4 animate-slide-up">Welcome to Rua</h1>
          <p class="text-lg text-center text-white/90 animate-slide-up-delayed">
            Your gateway to innovative solutions
          </p> -->
        </div>

        <!-- Right Side - Login Form -->
        <Card class="w-full backdrop-blur-xl bg-white/90 shadow-2xl animate-fade-in">
          <div class="p-8">
            <!-- Mobile Logo -->
            <div class="md:hidden flex justify-center mb-8">
              <img
                :src="loginLogo"
                alt="Rua Company Logo"
                class="w-32 h-auto invert"
              />
            </div>

            <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p class="text-gray-600 mb-8">Please sign in to continue</p>

            <form class="space-y-6" @submit.prevent="submit">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700" for="email">
                  Email Address
                </label>
                <div class="relative">
                  <input
                    v-model="email"
                    id="email"
                    name="email"
                    type="text"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700" for="password">
                  Password
                </label>
                <div class="relative">
                  <input
                    v-model="password"
                    id="password"
                    name="password"
                    type="password"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <Button
                :loading="session.login.loading"
                type="submit"
                class="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-medium hover:from-gray-800 hover:to-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200"
              >
                <span v-if="!session.login.loading">Sign In</span>
                <span v-else class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <!-- Footer -->
      <div class="absolute bottom-4 text-center w-full text-white/90">
        <p class="text-sm">
          © 2025 Rua Company. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { session, getCachedCredentials } from '../data/session'
import loginVideo from '../assets/login.webm'
import loginLogo from '../assets/login_logo.png'

const email = ref('')
const password = ref('')

onMounted(() => {
  const cached = getCachedCredentials()
  if (cached) {
    email.value = cached.email
    password.value = cached.password
  }
})

function submit(e) {
  e.preventDefault()
  session.login.submit({
    email: email.value || e.target.email.value,
    password: password.value || e.target.password.value,
  })
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 6s ease-in-out infinite;
  animation-delay: -3s;
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out;
}

.animate-slide-up-delayed {
  animation: slide-up 0.6s ease-out;
  animation-delay: 0.2s;
}
.invert {
  filter: invert(1);
}
</style>