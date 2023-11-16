<template>
    <v-app-bar :elevation="1">
        <v-toolbar-title @click="$router.push({name: 'home'})">My files</v-toolbar-title>
        <template v-slot:append>
            <v-btn v-if="!isAuth" @click="$router.push({ name: 'login' })" icon="mdi-login"></v-btn>
            <v-btn v-if="!isAuth" @click="$router.push({name: 'register'})" icon="mdi-account-plus"></v-btn>
            <v-btn color="red" v-if="isAuth" @click="$router.push({name: 'presentation'})" icon="mdi-file-powerpoint"></v-btn>
            <v-btn color="blue" v-if="isAuth" @click="$router.push({name: 'chat'})" icon="mdi-forum"></v-btn>
            <user-menu v-if="isAuth" :user="authStore.user"></user-menu>
        </template>
    </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
import { computed } from 'vue'
import UserMenu from './UserMenu.vue';

const authStore = useAuthStore()

const isAuth = computed(() => {
    return authStore.user ? true : false
})

</script>
