<template>
  <v-app id="inspire">
    <!-- <v-system-bar>
      <v-spacer></v-spacer>

      <v-icon>mdi-square</v-icon>

      <v-icon>mdi-circle</v-icon>

      <v-icon>mdi-triangle</v-icon>
    </v-system-bar> -->

    <left-side-nav :user="authStore.user" @selectedChat="getSelectedChat"></left-side-nav>
    
    <left-side-drawer></left-side-drawer>

    <v-app-bar
      class="px-3"
      color="grey-lighten-4"
      flat
      height="72"
    >
      <v-avatar
        v-for="(user, i) in users"
        :key="i"
        :class="`users-list d-flex text-center relative ${i != 0 ? '-ml-4' : ''}`"
        color="blue"
        size="36"
        :image="imagePath(user)"
      >
        <span v-if="!imagePath(user)" class="">{{ getChatInitials(user) }}</span>
      </v-avatar>

      <span class="pl-3">{{ chat_name }}</span>

      <v-spacer></v-spacer>

      <v-responsive max-width="156">
        <v-text-field
          bg-color="grey-lighten-2"
          density="compact"
          flat
          hide-details
          rounded="pill"
          variant="solo-filled"
        ></v-text-field>
      </v-responsive>
    </v-app-bar>

    <message-container :user="authStore.user"></message-container>
    
    <right-side-nav></right-side-nav>
    
    <v-footer
      app
      height="72"
    >
      <div class="w-100">
        <input type="file" ref="attachments" @change="handleFiles" class="form-control-file hidden" accept="image/*, video/*" multiple>
        <div>
          <span v-if="num_attach > 0" class="text-xs font-italic pl-3 pt-2 flex">
              {{ num_attach }} {{num_attach > 1 ? 'attachments' : 'attachment'}}
          </span>
        </div>
        <v-text-field
          bg-color="grey-lighten-1"
          v-model="message"
          class="overflow-hidden"
          density="compact"
          flat
          hide-details
          rounded="pill"
          variant="solo-filled"
          @keyup.enter="submitMessage"
          append-inner-icon="mdi-attachment"
          @click:append-inner="$refs.attachments.click()"
        ></v-text-field>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from "vue"
import LeftSideNav from './LeftSideNav.vue'
import LeftSideDrawer from './LeftSideDrawer.vue'
import RightSideNav from './RightSideNav.vue'
import MessageContainer from './MessageContainer.vue'
import { useAuthStore } from '../../store/auth'
import { useChatStore } from '../../store/chat'
import { BASE_IMAGE_URL } from "../../constant"

const authStore = useAuthStore()
const chatStore = useChatStore()
const currentChat = ref(null)
const users = ref([])
const chat_name = ref('')
const message = ref('')
const attachments = ref(null)
const num_attach = ref(0)

const getSelectedChat = async (data) => {
  currentChat.value = data
  const userList = []

  await chatStore.getChatMessages(data.id, true)

  data.users.forEach(user => {
    if(authStore.user.id !== user.id){
      userList.push(user)
      if(data.private){
        data.name = user.name
      }
    }
  })
  users.value = userList
  chat_name.value = data.name ? data.name : 'No chat name'
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

const submitMessage = async () => {
  if(currentChat.value){

    let formData = new FormData()
    formData.append('content', message.value)
    for (let i = 0; i < num_attach.value; i++) {
        const file = attachments.value.files[i];
        // Ensure 'file' is a valid File object
        if (file instanceof File) {
            // Append the file with its original name and extension
            formData.append(`attachments[${i}]`, file, file.name);
        }
    }
    await chatStore.sendMessage(currentChat.value.id, formData)
    message.value = ''
    attachments.value = null
    num_attach.value = 0
  }else{
    console.log('please select a chat')
    message.value = ''
  }
  
}

const handleFiles = () => {
    attachments.value = attachments.value.files
    num_attach.value = attachments.value.length
    console.log('attach', attachments.value)
}


onMounted(() => {
  chatStore.getUserChats()
})

</script>

<style>
#inspire .v-application__wrap{
  min-height: 93dvh !important;
}
</style>