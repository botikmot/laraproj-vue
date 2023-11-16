<template>
    <div>
        <v-card
        class="mx-auto pa-12 pb-8"
        elevation="8"
        max-width="448"
        rounded="lg"
      >
        <div v-if="authStatus" class="text-green-500 text-lg">{{ authStatus }}</div>
        <div class="text-subtitle-1 text-medium-emphasis">Email</div>

        <v-text-field
          density="compact"
          placeholder="Email address"
          type="email"
          v-model="formData.email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
        ></v-text-field>
        <div v-if="authErrors.email" class="text-red-500 text-sm">{{ authErrors.email[0] }}</div>
        <v-btn
          @click="onSubmit"
          block
          class="mb-8"
          :loading="formData.loading"
          color="blue"
          size="large"
          variant="tonal"
        >
          Submit
        </v-btn>
      </v-card>
    </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
import { reactive, computed } from 'vue'

const authStore = useAuthStore()

const formData = reactive({
    email: '',
    loading: false,
})

const authErrors = computed(() => {
    return authStore.errors
})

const authStatus = computed(() => {
    return authStore.status
})

const onSubmit = async () => {
    formData.loading = true
    await authStore.forgotPassword(formData.email)
    formData.loading = false
}

</script>