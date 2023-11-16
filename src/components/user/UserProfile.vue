<template>
    <div>
        <v-card
            class="mx-auto"
            max-width="344"
            title="User Profile"
        >
            <v-container>
            <v-text-field
                v-model="formData.first_name"
                color="primary"
                label="First Name"
                variant="underlined"
            ></v-text-field>
            <div v-if="authErrors.first_name" class="text-red-500 text-sm">{{ authErrors.first_name[0] }}</div>
            <v-text-field
                v-model="formData.last_name"
                color="primary"
                label="Last Name"
                variant="underlined"
            ></v-text-field>
            <v-text-field
                v-model="formData.address"
                color="primary"
                label="Address"
                variant="underlined"
            ></v-text-field>
            <v-text-field
                v-model="formData.phone_number"
                color="primary"
                label="Phone number"
                variant="underlined"
            ></v-text-field>
            <v-text-field
                type="date"
                v-model="formData.birthday"
                color="primary"
                label="Birthday"
                variant="underlined"
            ></v-text-field>
            <v-textarea 
                v-model="formData.bio"
                color="primary"
                label="Bio"
                rows="3"
                variant="underlined"
            ></v-textarea>
            <v-file-input
                :rules="rules"
                accept="image/png, image/jpeg, image/bmp"
                placeholder="Pick an avatar"
                prepend-icon="mdi-camera"
                @change="handleFileUpload"
                label="Avatar"
            >                
            </v-file-input>
            <div v-if="authErrors.photo" class="text-red-500 text-sm">{{ authErrors.photo[0] }}</div>
            </v-container>

            <v-divider></v-divider>

            <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                @click="updateProfile" 
                color="success"
                :loading="formData.loading"
            >
                Update Profile

                <v-icon icon="mdi-chevron-right" end></v-icon>
            </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
import { useAuthStore } from '../../store/auth';
import { ref, reactive, computed, onMounted } from 'vue'

const authStore = useAuthStore()

const formData = reactive({
    first_name: '',
    last_name: '',
    address: '',
    phone_number: '',
    birthday: '',
    bio: '',
    loading: false,
    photo: null,
})

const rules = ref([
    value => {
    return !value || !value.length || value[0].size < 2000000 || 'Avatar size should be less than 2 MB!';
    }
])

const handleFileUpload = (event) => {
    formData.photo = event.target.files[0];
}

const authErrors = computed(() => {
    return authStore.errors
})

const updateProfile = async () => {
    const profileData = new FormData();
    profileData.append('first_name', formData.first_name);
    profileData.append('last_name', formData.last_name);
    profileData.append('address', formData.address);
    profileData.append('phone_number', formData.phone_number);
    profileData.append('birthday', formData.birthday);
    profileData.append('bio', formData.bio);
    // Add other profile fields
    if(formData.photo){
        profileData.append('photo', formData.photo); // 'selectedFile' is the file from file input
    }
    // Send data to your Laravel backend using Axios or another HTTP library
    formData.loading = true
        await authStore.updateProfile(profileData)
    formData.loading = false
}

onMounted(() => {
    const user = localStorage.getItem('user_data')
    if(user) {
        const authUser = JSON.parse(user)
        if(authUser.profile){
            formData.first_name = authUser.profile.first_name
            formData.last_name = authUser.profile.last_name
            formData.address = authUser.profile.address
            formData.phone_number = authUser.profile.phone_number
            formData.birthday = authUser.profile.birthday
            formData.bio = authUser.profile.bio
        }
    }
    
})

</script>