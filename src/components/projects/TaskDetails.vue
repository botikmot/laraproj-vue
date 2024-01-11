<template>
    <v-card :title="taskDetailProps.task.name">
<!--         <v-card-text>
            <div class="text-blue-500">{{ taskDetailProps.task.name }}</div>
        </v-card-text> -->
        <v-card-text>
            <div v-if="taskDetailProps.task.comments.length > 0">
                <div class="text-sm font-bold">Comment:</div>
                <div 
                    v-for="comment in taskDetailProps.task.comments" :key="comment"
                    class="pl-3 pt-3"
                >
                    <div class="flex">
                        <v-avatar
                            class=""
                            size="30"
                            elevation="10" 
                            :image="getProfileImage(comment)"
                            color="info"
                        >
                            <span v-if="!getProfileImage(comment)" class="">{{ getInitials(comment.user) }}</span>
                        </v-avatar>
                        <div class="pl-3 text-sm text-gray-500 pt-1">
                            {{ comment.content }}
                        </div>


                    </div> 
                </div>
            </div>
        </v-card-text>

        <hr />
        <v-card-text>
            <v-text-field
                v-model="comment"
                @keyup.enter="addComment" 
                label="Comment" 
                variant="outlined"
            ></v-text-field>
        </v-card-text>

        <!-- <v-card-actions>
            
            <v-spacer></v-spacer>

            <v-btn
                text="Submit"
                @click="submitMember"
            ></v-btn>
        </v-card-actions> -->
    </v-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useProjectStore } from '../../store/project'
import { BASE_IMAGE_URL } from "../../constant"

const taskDetailProps = defineProps(['task'])
const comment = ref('')
const projectStore = useProjectStore()



const addComment = async () => {
    const data = {
        content: comment.value
    }
    await projectStore.addTaskComment(data, taskDetailProps.task.id)
    comment.value = ''
}

const getProfileImage = (data) => {
    let image = null
    if(data.user.profile && data.user.profile.profile_photo){
        image = BASE_IMAGE_URL + data.user.profile.profile_photo;
    }
    return image
}

const getInitials = (user) => {
  const words = user.name.split(' ')
  const initials = words.map(word => word.charAt(0).toUpperCase())
  return initials.join('')
}

</script>