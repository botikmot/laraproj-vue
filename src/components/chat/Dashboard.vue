<template>
    <v-container class="h-100">
        <v-row>
            <!-- Button to Toggle Sidebar (Medium Screens) -->
            <v-col cols="12" sm="6" md="3" class="d-md-none">
                <v-btn @click="toggleSidebar" class="mt-2">
                {{ sidebarVisible ? "Hide Sidebar" : "Show Sidebar" }}
                </v-btn>
            </v-col>
        </v-row>
        <v-row class="h-100">
            <!-- Left Sidebar (Medium Screens) -->
            <v-col
                cols="12"
                sm="6"
                md="3"
                :class="{ 'd-none d-md-block': !sidebarVisible }"
                class="sidebar"
            >
                <left-sidebar :user="user"></left-sidebar>
            </v-col>
            <!-- Chat Container -->
            <v-col cols="12" sm="12" md="6">
                <chat-container :user="user"></chat-container>
            </v-col>
            <!-- Right Sidebar (Medium Screens) -->
            <v-col
                cols="12"
                sm="6"
                md="3"
                :class="{ 'd-none d-md-block': !sidebarVisible }"
                class="sidebar"
            >
                <chat-description :user="user"></chat-description>
            </v-col>
        </v-row>
  </v-container>
</template>

<script setup>
import { useGroupStore } from '../../store/group'
import { useChatStore } from '../../store/chat'
import { ref, onBeforeMount, onMounted, computed, onBeforeUnmount } from "vue"
import LeftSidebar from './MemberList.vue';
import ChatContainer from './ChatContainer.vue';
import ChatDescription from './ChatDescription.vue'
import pusher from '../../pusher'

const groupStore = useGroupStore()
const chatStore = useChatStore()
const user = ref(null)
const sidebarVisible = ref(false)


const onlinechannel = pusher.subscribe('useronline-channel');
onlinechannel.bind('online-users', (data) => {
    // Handle the received message here
    //groupStore.setOnlineStatus(data.user)
    chatStore.setOnlineStatus(data.user)
});

const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value
}

onBeforeUnmount(() => {
    const userData = localStorage.getItem('user_data')
    if(userData){
        const user_data = JSON.parse(userData)
        groupStore.removeUserToGroupsActivity(user_data.id)
        console.log('Component onBeforeRouteLeave hook is called');
    }
})

onBeforeMount(() => {
    const userData = localStorage.getItem('user_data')
    if(userData){
        user.value = JSON.parse(userData)
    }
    groupStore.userGroups()
    groupStore.getPrivateMessages()
})

onMounted(async () => {
    //await groupStore.subscribeToPusherChannels();
    //listenForNewMessage()
})

</script>

<style scoped>
.sidebar {
  transition: transform 0.3s ease-in-out;
  transform: translateX(0);
}

.sidebar-hidden {
  transform: translateX(-100%);
}
</style>