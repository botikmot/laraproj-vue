<template>
    <v-card title="New Task">
        <v-card-text>
            <v-text-field v-model="name" @keyup.enter="submitTask" label="Task Name" variant="outlined"></v-text-field>
            
            <v-radio-group class="priority flex justify-evenly" v-model="priority" label="Priority" inline="">  
                <v-radio label="Low" value="low" color="success"></v-radio>
                <v-radio label="Medium" value="medium" color="info"></v-radio>
                <v-radio label="High" value="high" color="red"></v-radio>
            </v-radio-group>


        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="Submit"
                @click="submitTask"
            ></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useProjectStore } from '../../store/project'
import { useRoute } from 'vue-router'

const name = ref('')
const priority = ref('low')
const emit = defineEmits(['closeDialog'])
const projectStore = useProjectStore()

const statusProps = defineProps(['status', 'index'])
const route = useRoute()

const submitTask = async () => { 
    const data = {
        name: name.value,
        status_id: statusProps.status,
        index: statusProps.index,
        priority: priority.value
    }
    await projectStore.createTask(data, route.params.id)
    emit('closeDialog')
}

</script>
