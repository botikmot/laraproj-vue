<template>
    <v-card title="New Group">
        <v-card-text>
            <v-text-field hide-details v-model="name" label="Name"></v-text-field>
            <div v-if="groupErrors.name" class="text-red-500 text-sm">{{ groupErrors.name[0] }}</div>
            <v-text-field class="mt-3" v-model="description" label="Description"></v-text-field>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                :loading="loading"
                text="Create"
                @click="createGroup" 
            ></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { useGroupStore } from '../../../store/group'
import { ref, computed } from "vue"

const groupStore = useGroupStore()

const name = ref('')
const loading = ref(false)
const description = ref('')

const groupErrors = computed(() => {
    return groupStore.errors
})


const createGroup = async () => {
    const data = {
        name: name.value,
        description: description.value
    }
    loading.value = true
    await groupStore.createGroup(data)
    loading.value = false
}
</script>