<template>
    <div>
        <v-card
        class="mx-auto pa-12 pb-8"
        elevation="8"
        max-width="448"
        rounded="lg"
      >
        <div class="text-subtitle-1 text-medium-emphasis">Account</div>

        <v-text-field
          class="mb-3"
          density="compact"
          placeholder="Email address"
          type="email"
          v-model="formData.email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          hide-details
        ></v-text-field>
        <div v-if="authErrors.email" class="text-red-500 text-sm">{{ authErrors.email[0] }}</div>
        <div v-if="authErrors.email && authErrors.email[0] == 'Your email address is not verified. Please check your email for a verification link.'" 
          class="text-blue-500 text-sm underline cursor-pointer"
          @click="resendEmailVerification"
        >Resend email verification link</div>
        <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
          Password

          <a
            class="text-caption text-decoration-none text-blue"
            rel="noopener noreferrer"
          ><router-link to="/forgot-password">
            Forgot login password?
          </router-link>
          </a>
          
        </div>

        <v-text-field
          class="mb-6"
          :append-inner-icon="formData.visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="formData.visible ? 'text' : 'password'"
          density="compact"
          v-model="formData.password"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          @keyup.enter="onSubmit"
          variant="outlined"
          @click:append-inner="formData.visible = !formData.visible"
          hide-details
        ></v-text-field>
        <div v-if="authErrors.password" class="text-red-500 text-sm">{{ authErrors.password[0] }}</div>
        <v-btn
          @click="onSubmit"
          block
          class="mb-8"
          :loading="formData.loading"
          color="blue"
          size="large"
          variant="tonal"
        >
          Log In
        </v-btn>

        <v-card-text class="text-center">
          <a
            class="text-blue text-decoration-none"
            rel="noopener noreferrer"
          ><router-link to="/register">
            Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
          </router-link>
          </a>
        </v-card-text>
      </v-card>
    </div>
</template>

<script setup>
 import { useAuthStore } from '../store/auth';
 import { reactive, computed } from 'vue'

  const authStore = useAuthStore()

  const formData = reactive({
    email: '',
    password: '',
    loading: false,
    visible: false,
  })

  const authErrors = computed(() => {
    return authStore.errors
  })

  const onSubmit = async () => {
      const data = {
            email: formData.email,
            password: formData.password
        }
      formData.loading = true
      await authStore.handleLogin(data)
      formData.loading = false
  }

</script>

