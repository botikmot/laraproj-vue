<template>
    <v-card title="New Project">
        <v-card-text>
            <v-text-field v-model="name" label="Project Name" variant="outlined"></v-text-field>
            <v-text-field v-model="description" label="Description" variant="outlined"></v-text-field>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="Submit"
                @click="submitProject"
            ></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { onBeforeMount, computed, ref } from "vue"
import { useProjectStore } from "../../store/project"

const name = ref('')
const description = ref('')
const projectStore = useProjectStore()

const emit = defineEmits(['closeDialog'])


const submitProject = async () => {
    const data = {
        name: name.value,
        description: description.value,
    }
    console.log(data)
    await projectStore.createProject(data)
    emit('closeDialog')
}


</script>