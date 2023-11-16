<template>
    <v-menu
        min-width="200px"
        rounded
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-avatar
              v-if="profileImagePath"
              color="info"
              size="large"
              :image="profileImagePath"
            ></v-avatar>
            <v-avatar
              v-else
              color="info"
              size="large"
            >
              <span class="text-h5">{{ getInitials() }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
                <v-avatar
                    v-if="profileImagePath"
                    color="info"
                    :image="profileImagePath"
                >
                </v-avatar>
                <v-avatar
                    v-else
                    color="info"
                    >
                    <span class="text-h5">{{ getInitials() }}</span>
                </v-avatar>
                <h4> {{ userProps.user.profile ? userProps.user.profile.first_name :  userProps.user.name }}</h4>
                <p class="text-caption mt-1">
                    {{ userProps.user.email }}
                </p>
              <v-divider class="my-3"></v-divider>
              <v-btn
                rounded
                variant="text"
                @click="$router.push({name: 'user-profile', params: { id: authStore.user.id } })"
              >
                Profile
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn
                rounded
                variant="text"
                @click="logout"
              >
                Logout
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
import { onMounted, computed } from "vue"
import { BASE_IMAGE_URL } from '../constant'

const userProps = defineProps(['user'])
const authStore = useAuthStore()

const profileImagePath = computed(() => {
    if(userProps.user.profile && userProps.user.profile.profile_photo){
        return BASE_IMAGE_URL + userProps.user.profile.profile_photo;
    }else{
        return null
    }
})

onMounted(() => {
    //console.log('nav user', userProps)
})

const logout = async () => {
    await authStore.handleLogout()
}

const getInitials = () => {
    // Split the name into words
    const words = userProps.user.name.split(' ')
    // Extract and capitalize the first letter of each word
    const initials = words.map(word => word.charAt(0).toUpperCase())
    // Join the initials to form the full name initials
    return initials.join('')
}

</script>