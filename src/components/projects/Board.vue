<template>
    <v-app class="project-board">
        <side-navigation></side-navigation>
        <v-main class="tasks-board">
            <div class="px-1">
                <div class="flex justify-between my-3">
                    <div class="px-3 text-lg font-bold">{{ project ? project.name : 'Loading board...' }}</div>
                    <v-btn v-if="project && authStore.user.id == project.user_id" @click="newColumn = true" prepend-icon="mdi-plus">
                            New Column
                    </v-btn>
                    <v-dialog width="500" v-model="newColumn">
                            <new-column-modal @closeDialog="getDialogValue"></new-column-modal>                
                    </v-dialog>
                </div>
                <div v-if="project" id="board">
                    <column v-for="column in project.statuses" :key="column.id" :column="column" />
                </div>
            </div>
        </v-main>
    </v-app>
</template>

<script setup>
    import Column from "./Column.vue"
    import NewColumnModal from "./NewColumnModal.vue"
    import SideNavigation from "./SideNavigation.vue"
    import { useAuthStore } from "../../store/auth"
    import { ref, computed, onMounted } from 'vue'
    import { useProjectStore } from "../../store/project"
    import { useRoute } from 'vue-router'
    
    const newColumn = ref(false)
    const projectStore = useProjectStore()
    const route = useRoute()
    const authStore = useAuthStore()


    const project = computed(() => {
        return projectStore.project
    })


    const getDialogValue = () => {
        newColumn.value = false
    }

    onMounted(() => {
        projectStore.getProject(route.params.id)
    })  

</script>


<style>
#board {
  display: flex;
  width: 96dvw !important;
  overflow: auto;
}

.project-board .v-application__wrap {
    min-height: 93dvh !important;
}

</style>