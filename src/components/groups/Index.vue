<template>
    <v-container>
        <div class="flex justify-between">
            <div class="text-lg font-bold">My Groups</div>
            <div>
                <v-btn @click="isActive = true" text="Create Group"></v-btn>
                <v-dialog width="500" v-model="isActive">
                    <creat-group-modal></creat-group-modal>
                </v-dialog>
            </div>
        </div>
        <div class="mt-3 flex">
            <v-row>
                <v-col cols="12" sm="6" md="4" lg="3" v-for="group in myGroups" :key="group">
                    <group-card :data="group"></group-card>
                </v-col>
            </v-row>
        </div>

    </v-container>
</template>

<script setup>
import CreatGroupModal from './modal/CreatGroupModal.vue';
import GroupCard from './GroupCard.vue'
import { useGroupStore } from '../../store/group'
import { ref, onMounted, computed } from "vue"

const groupStore = useGroupStore()
const isActive = ref(false)
const sidebarVisible = ref(false)

const myGroups = computed(() => {
    return groupStore.groups
})

onMounted(() => {
    groupStore.userGroups()
})

</script>

<style scoped>
.sidebar {
  transition: transform 0.3s ease-in-out;
  transform: translateX(0);
}

.sidebar-hidden {
  transform: translateX(-100%);
}
</style>