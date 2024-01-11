<template>
    <v-main class="chat-container" ref="chatContainer" @scroll="checkLoadMoreMessages">
        <v-row v-if="loading">
            <v-col class="flex justify-center">
                <v-img height="200" src="/animated-loading-bar.gif"></v-img>
            </v-col>
        </v-row>
        <div v-for="(group, date) in groupMessages" :key="date">
            <hr class="my-2 border-b mx-3 mt-6">
            <div class="flex justify-center py-3">
                <div class="text-sm font-bold -mt-8 bg-white px-3 text-gray-400">{{ date }}</div>
            </div>
            <v-row v-for="(message, i) in group" :key="i" :justify="`${ userProps.user.id == message.user_id ? 'end' : 'start'}`">
                <v-col cols="12" class="flex">
                    <v-badge
                            v-if="userProps.user.id !== message.user_id"
                            bordered
                            bottom
                            color="green"
                            dot
                            class="mt-5 ml-3"
                            offset-y="28"
                        >
                        <v-tooltip :text="message.user.name">
                            <template v-slot:activator="{ props }">
                                <v-avatar
                                    v-bind="props"
                                    class=""
                                    size="36"
                                    elevation="10" 
                                    :image="getProfileImage(message)"
                                    color="info"
                                >
                                    <span v-if="!getProfileImage(message)" class="">{{ getChatInitials(message.user) }}</span>
                                </v-avatar>
                            </template>
                        </v-tooltip>
                    </v-badge>
                    <v-spacer v-if="userProps.user.id == message.user_id"></v-spacer>
                    <v-card :class="`mt-5 ${ userProps.user.id == message.user_id ? 'mr-3' : 'ml-3'} `" max-width="70%" :color="`${ userProps.user.id == message.user_id ? 'blue' : ''}`" :dark="`${ userProps.user.id == message.user_id ? true : false}`">
                        <v-list-item three-line>
                            <v-list-item-content>
                                <div class="mb-2">
                                {{ message.content }}
                                </div>
                                <div class="mb-2" v-if="message.attachments.length > 0">
                                    <v-avatar
                                        v-for="image in message.attachments"
                                        :key="image"
                                        size="150"
                                        rounded="0"
                                        class="mr-2"
                                        :image="BASE_IMAGE_URL + '/' + image.path"
                                    >
                                    </v-avatar>
                                </div>
                                <div>
                                    <div class="flex justify-between">
                                        <div class="text-xs flex">
                                            <v-icon :class="`${ userProps.user.id == message.user_id ? '' : 'text-gray-400'}`" size="15" icon="mdi-clock"></v-icon>
                                            <span :class="`pl-1 ${ userProps.user.id == message.user_id ? '' : 'text-gray-400'}`">{{ formatDate(message.created_at) }}</span>
                                        </div>
                                        <div class="ml-16 text-xs">
                                            <div class="flex" v-if="message.seen_by && message.seen_by.length > 0">
                                                <v-avatar
                                                    v-for="(user, i) in message.seen_by"
                                                    :key="i"
                                                    :class="`users-list d-flex text-center relative ${i != 0 ? '-ml-1' : ''}`"
                                                    size="15"
                                                    :image="imagePath(user)"
                                                    color="info"
                                                >
                                                    <span v-if="!imagePath(user)" class="">{{ getChatInitials(user) }}</span>
                                                </v-avatar>
                                            </div>
                                            <v-icon v-else :class="`${ userProps.user.id == message.user_id ? '' : 'text-gray-400'}`">mdi-check-all</v-icon>
                                        </div>
                                    </div>
                                </div>  
                            </v-list-item-content>
                        </v-list-item>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </v-main>
</template>

<script setup>
import { useChatStore } from '../../store/chat'
import { onMounted, ref, computed, nextTick, watch } from "vue"
import { BASE_IMAGE_URL } from "../../constant"
import moment from 'moment'

const userProps = defineProps(['user'])
const chatStore = useChatStore()
const chatContainer = ref(null)
const currentScrollPosition = ref(0)

const messages = computed(() => {
    return chatStore.messages
})

const loading = computed(() => {
    return chatStore.loading
})

const newAddedMEssage = computed(() => {
    return chatStore.messageAdded
})

const currentChatId = computed(() => {
    return chatStore.chatId
})

const allLoaded = computed(() => {
    return chatStore.allLoaded
})

const reversedMessages = computed(() => {
    if(messages.value){
        return messages.value.slice().reverse()
    }else{
        return messages.value
    }
})


const groupMessages = computed(() => {
    if(reversedMessages.value){
        return reversedMessages.value.reduce((result, message) => {
            const messageDate = new Date(message.created_at).toDateString();
            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let groupDate;

            if (messageDate === today) {
            groupDate = 'Today';
            } else if (messageDate === yesterday.toDateString()) {
            groupDate = 'Yesterday';
            } else {
            groupDate = new Date(message.created_at).toLocaleDateString();
            }

            if (!result[groupDate]) {
            result[groupDate] = [];
            }

            result[groupDate].push(message);
            return result;
        }, {})
    }else{
        return []
    }
})

watch(() => newAddedMEssage.value, (value) =>{
    scrollToBottom();
})


const getProfileImage = (data) => {
    let image = null
    if(data.user.profile && data.user.profile.profile_photo){
        image = BASE_IMAGE_URL + data.user.profile.profile_photo;
    }
    return image
}

const imagePath = (data) => {
  let image = null
  if(data.profile && data.profile.profile_photo){
    image = BASE_IMAGE_URL + data.profile.profile_photo;
  }
  return image
}

const getChatInitials = (user) => {
  const words = user.name.split(' ')
  const initials = words.map(word => word.charAt(0).toUpperCase())
  return initials.join('')
}


const scrollToBottom = () => {
    nextTick(() => {
        const containerElement = chatContainer.value?.$el || chatContainer.value;
        if (containerElement) {
            containerElement.scrollTop = containerElement.scrollHeight;
        }
    });
}

const formatDate = (date) => {
    return moment(date).fromNow(true)
}

const checkLoadMoreMessages = async () => {
    const containerElement = chatContainer.value?.$el || chatContainer.value
    if(containerElement.scrollTop === 0 && !allLoaded.value && containerElement.scrollHeight > containerElement.clientHeight){
        currentScrollPosition.value = containerElement.scrollHeight;
        await chatStore.getChatMessages(currentChatId.value, false)
        nextTick(() => {
            containerElement.scrollTop = containerElement.scrollHeight - currentScrollPosition.value
        })
    }
}


onMounted(() => {
    scrollToBottom();
})

</script>

<style scoped>
.chat-container {
    height: 93dvh !important;
    overflow: auto;
}
</style>