<template>
    <v-card class="pa-3">
        <div class="flex pb-2 justify-between">
            <div class="flex">
                <v-avatar v-if="profileImagePath" :image="profileImagePath"></v-avatar>
                <v-avatar
                    v-else
                    color="info"
                    >
                    <span class="">{{ getInitials() }}</span>
                </v-avatar>
                <div>
                    <div class="font-bold pl-3 text-sm"> {{ userProps.user.profile ? userProps.user.profile.first_name + ' ' + userProps.user.profile.last_name : user.name }}</div>
                    <div class="text-xs text-gray-400 pl-3">{{ userProps.user.email }}</div>
                </div>
            </div>
            <v-btn icon="mdi-dots-horizontal" variant="plain"></v-btn>
        </div>
        <hr>
        <div class="mt-3">
            <div class="flex justify-between">
                <div class="text-sm font-semibold pt-3 pl-2">Rooms</div>
                <v-btn size="small" color="blue" icon="mdi-plus" variant="text"></v-btn>
            </div>
            <div>
                <v-list
                    :lines="false"
                    density="compact"
                    nav
                    >
                    <v-list-item
                        v-for="(item, i) in myGroups"
                        :key="i"
                        :value="item"
                        :title="item.name"
                        @click="showChat(item)"
                        color="blue"
                        :subtitle="getSubtitle(item)"
                    >
                        <template v-slot:prepend>
                            <v-badge dot bordered offset-x="2" offset-y="23" :color="getStatus(item)">
                                <v-avatar
                                    size="small"
                                    color="info"
                                    >
                                    <span class="text-xs">{{ getGroupInitials(item) }}</span>
                                </v-avatar>
                            </v-badge>
                        </template>
                        <template v-if="item.unread_messages.length > 0"  v-slot:append>
                            <v-badge
                            color="error"
                            :content="item.unread_messages.length"
                            inline
                            ></v-badge>
                        </template>

                    </v-list-item>
                </v-list>
            </div>
        </div>
        <div class="mt-3">
            <div class="flex justify-between">
                <div class="text-sm font-semibold pt-3 pl-2">Private</div>
                <v-btn size="small" color="blue" icon="mdi-plus" variant="text"></v-btn>
            </div>
            <div>
                <v-list
                    :lines="false"
                    density="compact"
                    nav
                    >
                    <v-list-item
                        v-for="(item, i) in privateMessages"
                        :key="i"
                        :value="item"
                        :title="item.name"
                        color="blue"
                        @click="getRecipientMessages(item)"
                        :subtitle="getRecipientSubtitle(item)"
                    >
                        <template v-slot:prepend>
                            <v-badge dot bordered offset-x="2" offset-y="30" :color="`${item.online ? 'success' : ''}`">
                                <v-avatar v-if="imagePath(item)" :image="imagePath(item)"></v-avatar>
                                <v-avatar
                                    v-else
                                    color="info"
                                    >
                                    <span class="">{{ getInitials(item) }}</span>
                                </v-avatar>
                            </v-badge>
                            <!-- <v-avatar
                                size="small"
                                color="info"
                                >
                                <span class="text-xs">{{ getGroupInitials(item) }}</span>
                            </v-avatar> -->
                        </template>

                    </v-list-item>
                </v-list>
            </div>
        </div>
    </v-card>
</template>

<script setup>
import { computed, ref, onBeforeMount } from "vue"
import { BASE_IMAGE_URL } from '../../constant'
import { useGroupStore } from '../../store/group'

const userProps = defineProps(['user'])
const groupStore = useGroupStore()

const profileImagePath = computed(() => {
    if(userProps.user.profile && userProps.user.profile.profile_photo){
        return BASE_IMAGE_URL + userProps.user.profile.profile_photo;
    }else{
        return null
    }
})

const imagePath = (user) => {
    if(user.profile && user.profile.profile_photo){
        return BASE_IMAGE_URL + user.profile.profile_photo;
    }else{
        return null
    }
}

const messageLoading = computed(() => {
    return groupStore.loading
})

const myGroups = computed(() => {
    return groupStore.groups
})

const privateMessages = computed(() => {
    return groupStore.myPrivateMessages
})

const getRecipientMessages = async (user) => {
    groupStore.getRecipientMessages(user)
}

const getInitials = () => {
    const words = userProps.user.name.split(' ')
    const initials = words.map(word => word.charAt(0).toUpperCase())
    return initials.join('')
}

const getGroupInitials = (group) => {
    const words = group.name.split(' ')
    const initials = words.map(word => word.charAt(0).toUpperCase())
    return initials.join('')
}

const getSubtitle = (item) => {
    let latestMessage = ''    
    if (item.latest_message && item.latest_message.content.length > 25) {
        latestMessage = item.latest_message.content.substring(0, 25) + '..';
    }else{
        latestMessage = item.latest_message ? item.latest_message.content : ''
    }
    return latestMessage
}

const getRecipientSubtitle = (item) => {
    let latestMessage = ''    
    if (item.latest_message && item.latest_message.length > 25) {
        latestMessage = item.latest_message.substring(0, 25) + '..';
    }else{
        latestMessage = item.latest_message ? item.latest_message : ''
    }
    return latestMessage
}

const showChat = (group) => {
    if(messageLoading.value){
        return
    }
    groupStore.getGroupMessages(group.id)
}

const getStatus = (group) => {
    const onlineCount = group.users.reduce((count, user) => user.online ? count + 1 : count, 0)
    return onlineCount > 1 ? 'success' : ''
}


onBeforeMount(() => {
    //groupStore.getGroupMessages()
})

</script>