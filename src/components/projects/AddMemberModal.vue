<template> 
    <v-card title="Add Member">
        <v-card-text>
            <v-select
                v-model="selectedUser"
                clearable
                label="Select User"
                :items="items"
                item-title="name"
                item-value="id"
                variant="outlined"
            ></v-select>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="Submit"
                @click="submitMember"
            ></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { onBeforeMount, computed, ref } from "vue"
import { useGroupStore } from '../../store/group'
import { useProjectStore } from "../../store/project";
import { useRoute } from 'vue-router'

const groupStore = useGroupStore()
const selectedUser = ref(null)
const projectStore = useProjectStore()
const route = useRoute()


const emit = defineEmits(['closeDialog'])

const items = computed(() => {
    return groupStore.users
})


const submitMember = async () => {
    const data = {
        user_id: selectedUser.value
    }
    await projectStore.addMember(data, route.params.id)
    emit('closeDialog')
}



onBeforeMount(() => {
    groupStore.getAllUsers()
})

</script>