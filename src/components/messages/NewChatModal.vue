<template> 
    <v-card title="New Chat">
        <v-card-text>
            <v-select
                v-model="selectedUsers"
                multiple
                chips
                clearable
                label="Select Users"
                :items="items"
                item-title="name"
                item-value="id"
                variant="outlined"
            ></v-select>

            <v-text-field v-if="selectedUsers && selectedUsers.length > 1" v-model="name" label="Name" variant="outlined"></v-text-field>

        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="Submit"
                @click="submitUsers"
            ></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { useGroupStore } from "../../store/group"
import { onBeforeMount, computed, ref } from "vue"
import { useChatStore } from "../../store/chat"

const selectedUsers = ref(null)
const name = ref('')
const groupStore = useGroupStore()
const chatStore = useChatStore()

const emit = defineEmits(['closeDialog'])

const userIdProps = defineProps(['userId'])

const items = computed(() => {
    return groupStore.users
})

const submitUsers = async () => {
    console.log('userIdProps', userIdProps)
    const data = {
        name: name.value,
        user_ids: selectedUsers.value,
        auth_id: userIdProps.userId
    }
    console.log(data)
    await chatStore.createChat(data)
    emit('closeDialog')
}


onBeforeMount(() => {
    groupStore.getAllUsers()
})
</script>