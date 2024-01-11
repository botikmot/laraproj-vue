<template>
    <v-card title="New Column">
        <v-card-text>
            <v-text-field v-model="name" label="Column Name" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="Submit"
                @click="submitColumn"
            ></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useProjectStore } from '../../store/project'
import { useRoute } from 'vue-router'

const name = ref('')
const emit = defineEmits(['closeDialog'])
const projectStore = useProjectStore()
const route = useRoute()

const submitColumn = async () => {

    const data = {
        name: name.value
    }
    await projectStore.createColumn(data, route.params.id)
    emit('closeDialog')
}

</script>