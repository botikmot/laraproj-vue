<template>
    <v-card class="task" @dblclick="viewDetails">
      <div class="flex justify-between">
        <v-chip size="small" :color="priorityColor"> 
          {{ taskProps.task.priority == 'low' ? 'Low' : taskProps.task.priority == 'medium' ? 'Medium' : 'High' }} Priority
        </v-chip>
        <v-icon 
          v-if="authStore.user.id == taskProps.task.user_id" 
          size="x-small" 
          class="cursor-pointer" 
          color="grey"
          @click="removeTask"
        >mdi-close</v-icon>
      </div>
      <div class="py-1">{{ taskProps.task.name }}</div>

      <hr />

      <div class="flex justify-between pt-1">
        <div class="flex mt-1">
            <v-icon size="18" class="text-gray-400">mdi-comment-outline</v-icon>
            <div v-if="taskProps.task.comments" class="text-xs pl-1 text-gray-500">{{ taskProps.task.comments.length }}</div>
            <v-icon size="16" class="text-gray-400 ml-3">mdi-paperclip</v-icon>
        </div>
        <div class="flex">
          <div v-if="taskProps.task.users.length > 0">
            <v-avatar
                v-for="(user, i) in taskProps.task.users"
                :key="i"
                :class="`flex ${i != 0 ? '-ml-3' : ''}`"
                size="25"
                elevation="10" 
                :image="getProfileImage(user)"
                color="info"
            >
                <span v-if="!getProfileImage(user)" class="text-xs">{{ getInitials(user) }}</span>
            </v-avatar>
          </div>
          <div class="pl-2">
            <v-btn variant="flat" @click.stop="assignUser = true" size="25" icon="mdi-plus"></v-btn>
            <v-dialog width="500" v-model="assignUser">
                <user-assigned-modal @closeDialog="getDialogValue" :taskId="taskProps.task.id"></user-assigned-modal>
            </v-dialog>
          </div>
        </div>
      </div>


      <v-dialog width="700" v-model="viewTask"> 
        <task-details :task="taskProps.task"></task-details>
      </v-dialog>
    </v-card>
  </template>
  
  <script setup>
    import { ref, watch, computed } from 'vue'
    import { useAuthStore } from '../../store/auth'
    import { useProjectStore } from '../../store/project'
    import TaskDetails from './TaskDetails.vue'
    import { BASE_IMAGE_URL } from "../../constant"
    import UserAssignedModal from './UserAssignedModal.vue'

    const taskProps = defineProps(['task'])
    const authStore = useAuthStore()
    const projectStore = useProjectStore()
    const viewTask = ref(false)
    const assignUser = ref(false)

    const priorityColor = computed(() => {
      if(taskProps.task.priority == 'low'){
        return 'success'
      }else if(taskProps.task.priority == 'medium'){
        return 'info'
      }else {
        return 'red'
      }
    })


    const viewDetails = () => {
      viewTask.value = true
    }

    const removeTask = async () => {
      await projectStore.removeTask(taskProps.task.id)
    }


    const getProfileImage = (data) => {
        let image = null
        if(data.profile && data.profile.profile_photo){
            image = BASE_IMAGE_URL + data.profile.profile_photo;
        }
        return image
    }

    const getInitials = (user) => {
      const words = user.name.split(' ')
      const initials = words.map(word => word.charAt(0).toUpperCase())
      return initials.join('')
    }

    const getDialogValue = () => {
        assignUser.value = false
    }

  </script>
  
  <style>
  .task {
    /* background-color: #f8f8f8; */
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  </style>
  