<template>
    <v-card class="pa-3">
        <div class="flex pb-2 justify-between">
            <div class="font-bold">Details</div>
        </div>
        <hr>
        <div class="mt-3">
            <v-autocomplete
                v-model="selected"
                :items="items"
                hide-details
                hide-no-data
                hide-selected
                item-value="id"
                item-title="name"
                label="Search user"
                single-line
            ></v-autocomplete>
            <v-btn @click="addMember">Add Member</v-btn>
        </div>
        <!-- <div v-if="selectedGroup">
            <p>Group Description: {{ selectedGroup.description }}</p>
        </div>
        <div v-if="selectedPrivateMessage">
            <p>Private Message Description: {{ selectedPrivateMessage.description }}</p>
        </div> -->
        <div class="mt-3">
            <div class="flex justify-between">
                <div class="text-sm font-semibold pt-3 pl-2">Members</div>
                <v-btn size="small" color="blue" icon="mdi-plus" variant="text"></v-btn>
            </div>
            <div>
                <v-list
                    :lines="false"
                    density="compact"
                    nav
                    >
                    <v-list-item
                        v-for="(item, i) in currentGroup.users"
                        :key="i"
                        :value="item"
                        :title="getName(item)"
                        color="blue"
                        :subtitle="getPosition(item)"
                    >
                        <template v-slot:prepend>
                            <v-badge dot bordered offset-x="2" offset-y="30" :color="`${item.online ? 'success' : ''}`">
                                <v-avatar v-if="profileImagePath(item)" :image="profileImagePath(item)"></v-avatar>
                                <v-avatar
                                    v-else
                                    color="info"
                                    >
                                    <span class="">{{ getInitials(item) }}</span>
                                </v-avatar>
                            </v-badge>
                        </template>

                    </v-list-item>
                </v-list>
            </div>
        </div>
    </v-card>
</template>

<script setup>
import { useGroupStore } from '../../store/group'
import { computed, ref, onBeforeMount, onMounted } from "vue"
import { BASE_IMAGE_URL } from '../../constant'

const userProps = defineProps(['user'])
const selected = ref(null)
const groupStore = useGroupStore()

const items = computed(() => {
    return groupStore.users
})

const currentGroupId = computed(() => {
    return groupStore.groupId
})

const currentGroup = computed(() => {
    return groupStore.group ? groupStore.group : []
})

const addMember = async () => {
    console.log('selected user', selected.value)
    const data = {
        user_id: selected.value
    }
    await groupStore.addMember(data, currentGroupId.value)
}

const getPosition = (user) => {

    return user.pivot.role.charAt(0).toUpperCase() + user.pivot.role.slice(1)
    //return user.online ? 'Online' : 'Offline'
}

const profileImagePath = (user) => {
    if(user.profile && user.profile.profile_photo){
        return BASE_IMAGE_URL + user.profile.profile_photo;
    }else{
        return null
    }
}

const getName = (user) => {
    let authUser = userProps.user.id == user.id ? '(You)' : ''

    if(user.profile){
        return user.profile.first_name + ' ' + user.profile.last_name + ' ' + authUser
    }else{
        return user.name
    }
}

const getInitials = (user) => {
    const words = user.name.split(' ')
    const initials = words.map(word => word.charAt(0).toUpperCase())
    return initials.join('')
}


onMounted(() => {
    //console.log('my group', currentGroup.value)
})

onBeforeMount(() => {
    groupStore.getAllUsers()
})

</script>

<style>
.v-list-item__spacer {
    width: 10px !important;
}
</style>