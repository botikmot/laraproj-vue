<template>
    <v-card title="Assigned User/s">
        <v-card-text>
            <v-select
                v-model="userAssigned"
                clearable
                multiple
                chips                
                label="Select User"
                :items="projectMembers ? projectMembers : []"
                item-title="user.name"
                item-value="user.id"
                variant="outlined"
            ></v-select>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="Submit"
                @click="submitUser"
            ></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { onBeforeMount, computed, ref } from "vue"
import { useProjectStore } from '../../store/project'

const projectStore = useProjectStore()
const userAssigned = ref([])

const emit = defineEmits(['closeDialog'])
const taskProps = defineProps(['taskId'])

const projectMembers = computed(() => {
    return projectStore.project.members
})

const submitUser = async () => {
    const data = {
        user_ids: userAssigned.value,
        task_id: taskProps.taskId
    }
    console.log('assigned user', data)
    await projectStore.assignedUsers(data, taskProps.taskId)
    emit('closeDialog')
}

</script>