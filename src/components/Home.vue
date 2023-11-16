<template>
    <div v-if="isAuth">
      <home></home>
    </div>
    <div v-else>Home, please login</div>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
import { computed } from 'vue'
import Home from './social/Home.vue';

const authStore = useAuthStore()

const isAuth = computed(() => {
  return authStore.user
})

</script>