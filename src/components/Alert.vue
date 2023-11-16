<template>
    <v-snackbar
      :color="color"
      variant="outlined"
      v-model="alert"
    >
        {{ message }}
      <!-- Snackbar with <strong>outlined</strong> variant. -->
    </v-snackbar>
</template>

<script setup>
import { useMainStore } from '../store/main';
import { computed } from 'vue'

const mainStore = useMainStore()

const alert = computed(() => {
    return mainStore.alert ? true : false
})

const color = computed(() => {
    return mainStore.alert ? mainStore.alert.color : ''
})

const message = computed(() => {
    return mainStore.alert ? mainStore.alert.message : ''
})

</script>

<style>
.v-snackbar__wrapper {
  right: 0 !important;
  left: unset !important;
}
</style>