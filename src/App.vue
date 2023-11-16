<script setup>
  import { onMounted } from 'vue'
  import Navbar from './components/Navbar.vue'
  import { useAuthStore } from './store/auth';
  import Alert from './components/Alert.vue';

  const authStore = useAuthStore()

  onMounted(async () => {
    // Send a heartbeat to the server periodically (e.g., every minute)
    setInterval(() => {
      // Send a request to the server to indicate that the user is still active
      // This could be an API endpoint specifically for heartbeats
      authStore.userheartBeat()
    }, 60000) // 60 seconds
    
    await authStore.sessionStatus()
  })

</script>

<template>
  <v-app>
    <!-- <v-container> -->
      <Navbar />
      <main class="mt-16 h-100">
          <router-view></router-view>
      </main>
    <!-- </v-container> -->
    <alert></alert>
  </v-app>
</template>

<style scoped>

</style>
