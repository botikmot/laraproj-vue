<template>
    <v-navigation-drawer
      color="grey-lighten-3"
      rail
    >
      <v-avatar
        v-if="profileImagePath"
        class="d-block text-center mx-auto mt-3"
        color="info"
        size="36"
        :image="profileImagePath"
      ></v-avatar>
      <v-avatar
        v-else
        class="text-center mx-auto mt-3 ml-3"
        color="info"
        size="36"
      >
        <span class="text-sm">{{ getInitials() }}</span>
      </v-avatar>

      <v-divider class="mx-3 my-3"></v-divider>

      <v-btn
        class="d-block text-center mx-auto mb-5"
        @click="newChat = true"
        size="28"
        color="success"
        variant="flat"
        icon="mdi-plus-circle-outline"
      ></v-btn>
      <v-dialog width="500" v-model="newChat">
          <new-chat-modal @closeDialog="getDialogValue" :userId="userProps.user.id"></new-chat-modal>
      </v-dialog>


      <v-list>
        <v-list-item
          v-for="(chat, i) in userChats"
          @click="initiateChat(chat)"
          :key="i"
          :value="chat"
          color="info"
          class="mb-3"
        >
          <template v-slot:prepend>
              <v-badge 
                :content="chat.unread_messages_count > 9 ? '9+' : chat.unread_messages_count" 
                :color="chat.unread_messages_count > 0 ? 'error' : checkUserOnline(chat.users) ? 'green' : ''"
                :dot="chat.unread_messages_count > 0 ? false : true"
                :offset-y="chat.unread_messages_count > 0 ? 0 : 20"
              >
                <v-avatar    
                  class="text-center relative"
                  color="blue"
                  size="28"
                  :image="imagePath(chat)"
                >
                  <span v-if="!imagePath(chat)" class="">{{ getChatInitials(chat, i) }}</span>
                </v-avatar>
              </v-badge>
          </template>
        
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { onMounted, computed, ref } from "vue"
import { BASE_IMAGE_URL } from "../../constant"
import NewChatModal from './NewChatModal.vue'
import { useChatStore } from "../../store/chat";

const userProps = defineProps(['user'])
const newChat = ref(false)
const chatStore = useChatStore()
const emit = defineEmits(['selectedChat'])

const userChats = computed(() => {
    return chatStore.chats
})


const profileImagePath = computed(() => {
  if(userProps.user && userProps.user.profile && userProps.user.profile.profile_photo){
      return BASE_IMAGE_URL + userProps.user.profile.profile_photo;
  }else{
      return null
  }
})

const imagePath = (data) => {
  let image = null
  if(data.users.length == 2){
    data.users.forEach(user => {
      if(user.id != userProps.user.id && user.profile && user.profile.profile_photo){
        image = BASE_IMAGE_URL + user.profile.profile_photo;
      }
    })
  }
  return image
}

const initiateChat = (chat) => {
  chat.unread_messages_count = 0
  emit('selectedChat', chat)
}

const getChatInitials = (chat, i) => {
    if(chat.name){
      const words = chat.name.split(' ')
      const initials = words.map(word => word.charAt(0).toUpperCase())
      return initials.join('')
    }else{
      return 'G' + i
    }
}

const getInitials = () => {
    if(userProps.user){
      // Split the name into words
      const words = userProps.user.name.split(' ')
      // Extract and capitalize the first letter of each word
      const initials = words.map(word => word.charAt(0).toUpperCase())
      // Join the initials to form the full name initials
      return initials.join('')
    }else{
      return 'N/A'
    }
}

const checkUserOnline = (users) => {
  let online = false
  users.forEach(user => {
    if(userProps.user.id != user.id){
      if(user.online){
        online = true
        return
      }
    }
  })
  return online
}

const getDialogValue = () => {
  newChat.value = false
}

</script>