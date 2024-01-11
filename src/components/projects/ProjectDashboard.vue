<template>
    <v-main>
      <v-container>
        <v-row>
            <v-col class="flex justify-between">
                <div>Project Dashboard</div>
                <v-btn @click="newProject = true" prepend-icon="mdi-plus">
                    New Project
                </v-btn>
                <v-dialog width="500" v-model="newProject">
                    <create-project-modal @closeDialog="getDialogValue"></create-project-modal>                   
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
          <v-col
            v-for="(project, i) in projects"
            :key="i"
            cols="4"
          >
            <v-card @click="getProject(project.id)" height="100">
                <v-card-title>{{ project.name }}</v-card-title>
                <v-card-subtitle>{{ project.description }}</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
</template>

<script setup>
import { onMounted, computed, ref } from "vue"
import CreateProjectModal from './CreateProjectModal.vue'
import { useProjectStore } from "../../store/project"
import router  from '../../router'

const newProject = ref(false)
const projectStore = useProjectStore()
//const route = useRoute()

const projects = computed(() => {
    return projectStore.projects
})

const getDialogValue = () => {
  newProject.value = false
}

const getProject = async (id) => {
  await projectStore.getProject(id)
}

onMounted(() => {
  projectStore.getProjects()
})
</script>