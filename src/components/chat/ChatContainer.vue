<template>
    <div class="relative h-100">
        <v-card class="pa-3 group-name">
            <div class="flex justify-between">
                <div class="font-bold">{{ currentGroup ? currentGroup.name : 'Select Room or User' }}</div>
            </div>
        </v-card>
        <div class="message-container border-b-2 pt-3" :style="chatContainerStyle" ref="chatMessages" @scroll="checkLoadMoreMessages">
            <div v-if="messageLoading" class="flex justify-center p-8">
                <v-progress-circular
                    :size="50"
                    color="info"
                    indeterminate
                ></v-progress-circular>
            </div>
            <div class="my-2" v-for="(message, index) in reversedMessages" :key="index">
                <template v-if="isAuthenticatedUser(message)">
                    <div class="my-2 w-100 flex justify-end relative">
                        <template v-if="message.latest_read && message.latest_read.length > 0">
                            <div class="absolute flex left-0 bottom-0 mt-2">
                                <div v-for="user in message.latest_read" :key="user.id">
                                    <div v-if="!isNotUserAuth(user)">
                                        <v-avatar v-if="profileImagePath(user)" :image="profileImagePath(user)" size="15"></v-avatar>
                                        <v-avatar v-else color="info" size="15">
                                            <span class="text-xs">{{ getInitials(user) }}</span>
                                        </v-avatar>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <span class="text-xs pr-1 pt-2" v-if="reversedMessages[index].showTimestamp">{{ formatDate(message.created_at) }}</span>
                        <div class="max-w-sm bg-blue-600 px-3 py-1 rounded-lg" @mouseover="showTimestamp(index)" @mouseout="hideTimestamp(index)">
                            <span class="text-sm text-white flex justify-end">{{ message.content }}</span>
                            <div class="w-64" v-if="message.attachments.length > 0">
                                <v-row>
                                    <v-col v-for="attachment in message.attachments" cols="12" :key="attachment">
                                        <v-img
                                            v-if="determineMediaType(attachment) == 'image' || determineMediaType(attachment) == 'video'"
                                            class="cursor-pointer"
                                            height="100"
                                            cover
                                            :src="getImageUrl(attachment.path)"
                                        ></v-img>
                                        <div v-else>
                                            <a class="text-sm text-blue-300" :href="getImageUrl(attachment.path)" target="_blank" download>{{ attachment.filename }}</a>
                                        </div>
                                    </v-col>
                                </v-row>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <template v-if="shouldDisplayUserInfo(index)">
                        <div class="flex">
                            <v-avatar size="small" v-if="profileImagePath(message)" :image="profileImagePath(message)"></v-avatar>
                            <v-avatar v-else color="info" size="small">
                                <span>{{ getInitials(message) }}</span>
                            </v-avatar>
                            <div class="pl-2">
                                <div class="font-semibold text-xs">{{ message.user.name }}</div>
                                <div class="text-xs text-gray-400">{{ message.user.email }}</div>
                            </div>
                        </div>
                    </template>
                    <div class="my-2 w-100 flex relative">
                        <div class="max-w-sm bg-gray-500 px-3 py-1 rounded-lg" @mouseover="showTimestamp(index)" @mouseout="hideTimestamp(index)">
                            <span class="text-sm text-white">{{ message.content }}</span>
                            <div class="w-64" v-if="message.attachments.length > 0">
                                <v-row>
                                    <v-col v-for="attachment in message.attachments" cols="12" :key="attachment">
                                        <v-img
                                            v-if="determineMediaType(attachment) == 'image' || determineMediaType(attachment) == 'video'"
                                            class="cursor-pointer"
                                            height="100"
                                            cover
                                            :src="getImageUrl(attachment.path)"
                                        ></v-img>
                                        <div v-else>
                                            <a class="text-sm text-blue-300" :href="getImageUrl(attachment.path)" target="_blank" download>{{ attachment.filename }}</a>
                                        </div>
                                    </v-col>
                                </v-row>
                            </div>
                        </div>
                        <span class="text-xs pl-1 pt-2 w-" v-if="reversedMessages[index].showTimestamp">{{ formatDate(message.created_at) }}</span>
                        <template v-if="message.latest_read && message.latest_read.length > 0">
                            <div class="absolute flex right-0 mt-2">
                                <div v-for="user in message.latest_read" :key="user.id">
                                    <div v-if="!isNotUserAuth(user)">
                                        <v-avatar v-if="profileImagePath(user)" :image="profileImagePath(user)" size="15"></v-avatar>
                                        <v-avatar v-else color="info" size="15">
                                            <span class="text-xs">{{ getInitials(user) }}</span>
                                        </v-avatar>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>
        <div class="absolute bottom-0 w-100 input-message">
            <v-card class="pa-3">
                <v-text-field
                    :loading="loading"
                    v-model="newMessage"
                    variant="underlined"
                    label="Type a message"
                    @keyup.enter="sendMessage"
                    hide-details
                ></v-text-field>
                <div class="flex mt-2">
                    <v-icon size="small" @click="$refs.attachments.click()" class="cursor-pointer">mdi-attachment</v-icon>
                    <v-icon size="small" class="ml-3 cursor-pointer" icon="mdi-video-image"></v-icon>
                    <v-icon size="small" class="ml-3 cursor-pointer" icon="mdi-emoticon-happy-outline"></v-icon>
                    <span v-if="num_attach > 0" class="text-xs font-italic pl-3 pt-1 flex">
                        {{ num_attach }} {{num_attach > 1 ? 'attachments' : 'attachment'}}
                    </span>
                </div>
                <input type="file" ref="attachments" @change="handleFiles" class="form-control-file hidden" accept="*" multiple>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '../../store/auth';
import { ref, computed, nextTick, onMounted, onBeforeMount, watch } from 'vue'
import { BASE_IMAGE_URL } from '../../constant'
import { useGroupStore } from '../../store/group'
import moment from 'moment'

const authStore = useAuthStore()
const newMessage = ref('')
const loading = ref(false)
const inputMessageHeight = ref(0)
const userProps = defineProps(['user'])
const groupStore = useGroupStore()
const currentScrollPosition = ref(0)
const attachments = ref(null)
const num_attach = ref(0)

const chatMessages = ref(null)

const chatContainerStyle = computed(() => {
    const screenHeight = window.innerHeight;
    return `height: calc(${screenHeight}px - ${inputMessageHeight.value}px);`;
})

const currentGroupId = computed(() => {
    return groupStore.groupId
})

const allLoaded = computed(() => {
    return groupStore.allLoaded
})

const currentGroup = computed(() => {
    return groupStore.group
})


const messages = computed(() => {
    return groupStore.messages
})

const messageLoading = computed(() => {
    return groupStore.loading
})

const reversedMessages = computed(() => {
    return messages.value.slice().reverse();
})

const newAddedMEssage = computed(() => {
    return groupStore.messageAdded
})

watch(() => messages.value, (value) =>{
    scrollToBottom()
})

watch(() => newAddedMEssage.value, (value) =>{
    scrollToBottom()
})

const profileImagePath = (data) => {
    if(data.user.profile && data.user.profile.profile_photo){
        return BASE_IMAGE_URL + data.user.profile.profile_photo;
    }else{
        return null
    }
}

const formatDate = (date) => {
    return moment(date).format('lll') //.fromNow()
}

const shouldDisplayUserInfo = (index) => {
    if (index === 0) {
        return true;
    }
    const currentSender = reversedMessages.value[index].user_id;
    return currentSender !== reversedMessages.value[index - 1].user_id;
}

const isAuthenticatedUser = (data) => {
    return data.user.id === userProps.user.id
}

const getImageUrl = (url) => {
    return BASE_IMAGE_URL + '/' + url
}

const sendMessage = async () => {
    if (newMessage.value) {
        if (loading.value) {
            // Prevent duplicate sending while a message is already being sent.
            return;
        }
        loading.value = true

        try {
            /* const data = {
                content: newMessage.value
            } */
            let formData = new FormData()
            formData.append('content', newMessage.value)
            //formData.append('privacy', this.privacy)
            for (let i = 0; i < num_attach.value; i++) {
                const file = attachments.value.files[i];
                // Ensure 'file' is a valid File object
                if (file instanceof File) {
                    // Append the file with its original name and extension
                    formData.append(`attachments[${i}]`, file, file.name);
                }
            }
            await groupStore.sendGroupMessage(formData, currentGroupId.value)
            newMessage.value = ""
            attachments.value = null
        } catch (error) {
            // Handle any errors that may occur during sending.
        } finally {
            // Reset the sending flag to enable the input.
            loading.value = false
        }
    }
}

const isNotUserAuth = (user) => {
    if(user.user_id == authStore.user.id){
        return true
    }else {
        return false
    }
}

const checkLoadMoreMessages = async () => {
    if(chatMessages.value.scrollTop === 0 && !allLoaded.value && chatMessages.value.scrollHeight > chatMessages.value.clientHeight){
        currentScrollPosition.value = chatMessages.value.scrollHeight;
        await groupStore.getGroupMessages(currentGroupId.value)
        nextTick(() => {
            chatMessages.value.scrollTop = chatMessages.value.scrollHeight - currentScrollPosition.value
        })

    }
}

const getInitials = (data) => {
    const words = data.user.name.split(' ')
    const initials = words.map(word => word.charAt(0).toUpperCase())
    return initials.join('')
}

const scrollToBottom = () => {
    nextTick(() => {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
    });
}

const showTimestamp = (index) => {
    reversedMessages.value[index].showTimestamp = true
}

const hideTimestamp = (index) => {
    reversedMessages.value[index].showTimestamp = false
}

const handleFiles = () => {
    attachments.value = attachments.value.files;
    num_attach.value = attachments.value.length
    console.log('attach', attachments.value);
}

const determineMediaType = (post) => {
    let imageExtensions = ["jpg", "jpeg", "png", "gif", "svg"];
    let videoExtensions = ["mp4", "avi", "mov", "mkv"];
    let fileExtensions = ["pdf", "txt", "doc", "docx"];
    let mediaType = 'other';
    let fileExtension = post.path.split('.').pop();
   
    if (imageExtensions.indexOf(fileExtension) !== -1) {
        mediaType = 'image';
    } else if (videoExtensions.indexOf(fileExtension) !== -1) {
        mediaType = 'video';
    }else if(fileExtensions.indexOf(fileExtension) !== -1){
        mediaType = 'file';
    }

    return mediaType;
}

onMounted(() => {
    const inputMessage = document.querySelector('.input-message')
    const groupName = document.querySelector('.group-name')
    const toolbar = document.querySelector('.v-toolbar')
    inputMessageHeight.value = inputMessage.offsetHeight + groupName.offsetHeight + toolbar.offsetHeight + 60
})

onBeforeMount(() => {
    
})

</script>


<style scoped>
.message-container {
  flex: 1;
  overflow-y: auto;
}

.message-bubble {
  background-color: #007BFF; /* Background color for the message bubble */
  color: white; /* Text color for the message */
  max-width: 70%; /* Adjust the maximum width as needed */
  border-radius: 12px; /* Rounded corners for the bubble */
  padding: 8px; /* Padding around the message */
  margin-top: 4px; /* Margin between messages */
  word-wrap: break-word; /* Wrap long words to the next line */
}

.message-bubble-auth {
    background-color: #007BFF;
    color: white;
    border-radius: 12px;
    padding: 8px;
    margin-top: 4px;
    word-wrap: break-word;
}


</style>

  
