<template>
  <div class="relative h-screen w-full overflow-hidden">
    <!-- Background Video -->
    <video
      class="absolute top-0 left-0 w-full h-full object-cover"
      autoplay
      loop
      muted
      playsinline
    >
      <source :src="loginVideo" type="video/webm" />
    </video>

    <!-- Overlay -->
    <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full px-4">
      <!-- Logo -->
      <div class="mb-8">
        <img
          :src="loginLogo"
          alt="Rua Company Logo"
          class="w-48 h-auto"
        />
      </div>

      <!-- Login Card -->
      <Card class="w-full max-w-md backdrop-blur-sm bg-white/90">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome Back
          </h2>

          <form class="space-y-4" @submit.prevent="submit">
            <div class="space-y-2">
              <Input
                required
                name="email"
                type="text"
                placeholder="majd@ruacompany.com"
                label="User ID"
                class="w-full"
              />
            </div>

            <div class="space-y-2">
              <Input
                required
                name="password"
                type="password"
                placeholder="••••••"
                label="Password"
                class="w-full"
              />
            </div>

            <Button
              :loading="session.login.loading"
              variant="solid"
              class="w-full py-2.5"
            >
              Login
            </Button>
          </form>
        </div>
      </Card>

      <!-- Footer -->
      <div class="mt-8 text-center text-white absolute bottom-5">
        <p class="text-sm">
          © 2025 Rua Company. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { session } from '../data/session'
import loginVideo from '../assets/login.webm'
import loginLogo from '../assets/login_logo.png'

function submit(e) {
  let formData = new FormData(e.target)
  session.login.submit({
    email: formData.get('email'),
    password: formData.get('password'),
  })
}
</script>