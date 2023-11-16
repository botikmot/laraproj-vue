<template>
    <div>
        <v-card
            class="mx-auto"
            max-width="344"
            title="User Registration"
        >
            <v-container>
            <v-text-field
                v-model="formData.name"
                color="primary"
                label="Name"
                variant="underlined"
            ></v-text-field>
            <div v-if="authErrors.name" class="text-red-500 text-sm">{{ authErrors.name[0] }}</div>
            <v-text-field
                v-model="formData.email"
                type="email"
                color="primary"
                label="Email"
                variant="underlined"
            ></v-text-field>
            <div v-if="authErrors.email" class="text-red-500 text-sm">{{ authErrors.email[0] }}</div>
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
            <v-checkbox
                v-model="formData.terms"
                color="secondary"
                label="I agree to site terms and conditions"
            ></v-checkbox>
            </v-container>

            <v-divider></v-divider>

            <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                @click="register" 
                color="success"
                :loading="formData.loading"
            >
                Complete Registration

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
    name: '',
    email: '',
    password: '',
    loading: false,
    terms: false,
    password_confirmation: '',
})

const authErrors = computed(() => {
    return authStore.errors
})


const register = async () => {
    const data = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
    }
    formData.loading = true
    await authStore.handleRegister(data)
    formData.loading = false
}

</script>