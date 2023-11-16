<template>
    <div>
        <v-card
            class="mx-auto"
            max-width="344"
            title="Reset Password"
        >
            <v-container>
                <div v-if="authStatus" class="text-green-500 text-lg">{{ authStatus }}</div>
            <v-text-field
                v-model="formData.password"
                color="primary"
                label="Password"
                type="password"
                placeholder="Enter your password"
                variant="underlined"
            ></v-text-field>
            <div v-if="authErrors.password" class="text-red-500 text-sm">{{ authErrors.password[0] }}</div>
            <v-text-field
                v-model="formData.password_confirmation"
                color="primary"
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                variant="underlined"
            ></v-text-field>
            <div v-if="authErrors.password_confirmation" class="text-red-500 text-sm">{{ authErrors.password_confirmation[0] }}</div>
            <div v-if="authErrors.email" class="text-red-500 text-sm">{{ authErrors.email[0] }}</div>
            </v-container>

            <v-divider></v-divider>
            
            <v-card-actions>
            <v-spacer></v-spacer>
            
            <v-btn
                @click="resetPassword($route.query.email, $route.params.token)" 
                color="success"
                :loading="formData.loading"
            >
                Reset Password

                <v-icon icon="mdi-chevron-right" end></v-icon>
            </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
import { reactive, computed } from 'vue'

const authStore = useAuthStore()

const formData = reactive({
    password_confirmation: '',
    password: '',
    loading: false,
  })

const authErrors = computed(() => {
  return authStore.errors
})

const authStatus = computed(() => {
  return authStore.status
})

const resetPassword = async (email, token) => {
    const data = {
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        email, token
    }
    formData.loading = true
    const authStore = useAuthStore()
    await authStore.resetPassword(data)
    formData.loading = false
}

</script>
