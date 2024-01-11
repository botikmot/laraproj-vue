import { defineStore } from 'pinia'
import axios from "axios"
import pusher from '../pusher'

export const useChatStore = defineStore("chat", {
    state: () => ({
        myChats: [],
        chatMessages: [],
        currentChatId: null,
        newAddedMessage: false,
        chatMessagePage: 1,
        messagesAllLoaded: false,
        messageLoading: false,
        activeUsers: [],
    }),
    getters: {
        chats: (state) => state.myChats,
        messages: (state) => state.chatMessages,
        messageAdded: (state) => state.newAddedMessage,
        loading: (state) => state.messageLoading,
        chatId: (state) => state.currentChatId,
        allLoaded: (state) => state.messagesAllLoaded,
    },
    actions: {
        async createChat(data) {
            try {
                if(data.user_ids.length > 1){
                    const response = await axios.post('/api/chats/group', data)
                    console.log('group', response)
                }else{
                    const response = await axios.post(`/api/chats/private/${data.auth_id}/${data.user_ids[0]}`)
                    console.log('private', response)
                }
            } catch (error) {
                console.log(error)
            }
        },

        async getUserChats() {
            try {
                const response = await axios.get('/api/user/chats')
                console.log('my chats', response)
                response.data.forEach(data => {
                    if(data.users.length == 2){
                        data.private = true
                    }else{
                        data.private = false
                    }
                })
                
                this.myChats = response.data
            } catch (error) {
                console.log(error)
            }
        },

        async sendMessage(chat_id, data) {
            try {
                const response = await axios.post(`/api/chats/${chat_id}/send-message`, data)
                console.log('user message', response)
            } catch (error) {
                console.log(error)
            }
        },

        async getChatMessages(chat_id, sideClick) {

            if (!chat_id) {
                console.log('No chat id');
                return
            }
            if(this.currentChatId !== chat_id){
                this.chatMessages = []
                this.chatMessagePage = 1
                this.messagesAllLoaded = false
                this.currentChatId = chat_id
            }

            try {
                this.messageLoading = true
                const response = await axios.get(`/api/chats/${chat_id}/messages?page=${this.chatMessagePage}`)
                const newMessages = response.data.messages.data
                this.activeUsers = response.data.active_users
                this.newAddedMessage = true
                if (newMessages.length) {
                    if(sideClick){
                        this.chatMessages = newMessages
                    }else{
                        this.chatMessages = this.chatMessages.concat(newMessages)
                    }
                    this.chatMessagePage++
                    this.messageLoading = false
                }else{
                    this.messagesAllLoaded = true
                    this.messageLoading = false
                    console.log('all message loaded!')
                }

                if(this.chatMessagePage <= 2){
                    setTimeout(() => {
                        this.newAddedMessage = false
                    },2000)
                }

            } catch (error) {
                console.log(error)
            }
        },

        async seenMessage(chat_id, message_id) {
            try {
                const response = await axios.post(`/api/chats/${chat_id}/${message_id}/seen-message`)
                console.log('seen message', response)
            } catch (error) {
                console.log(error)
            }
        },

        setOnlineStatus(data){
            this.myChats.forEach(item => {
                console.log('online users', item)
                item.users = item.users.map(user => {
                    if (user.id === data.id) {
                        user.online = data.online;
                    }
                    return user;
                });
            });
        },

        async subscribeToPusherChannels() {
            try {
                const channel = pusher.subscribe('chat');
                channel.bind('chat-message', (data) => {
                    console.log('chat-message sent-->>', data)
                    data.message.seen_by = data.message.seen_by ? data.message.seen_by : []
                    if(this.currentChatId == data.message.chat_id){

                        this.seenMessage(this.currentChatId, data.message.id)

                        this.chatMessages.forEach(message => {
                            message.seen_by = message.seen_by.filter(obj => obj.id !== data.message.user_id)
                        })

                        this.chatMessages.unshift(data.message)

                        this.newAddedMessage = true
                        setTimeout(() => {
                            this.newAddedMessage = false
                        },2000)
                    }else{
                        this.myChats.forEach(chat => {
                            if(chat.id == data.message.chat_id){
                                console.log('notif')
                                chat.unread_messages_count++
                            }
                        })
                    }
                })

                channel.bind('read-message', async (data) => {
                    if(this.currentChatId == data.message.chat_id){
                        this.chatMessages.forEach(message => {
                            if(message.id == data.message.id){
                                message.seen_by = message.seen_by ? message.seen_by : []
                                const doesNotExist = !message.seen_by.some(obj => obj.id === data.user.id)
                                if (doesNotExist) {
                                    message.seen_by.push(data.user)
                                }
                            }else{
                                message.seen_by = message.seen_by.filter(obj => obj.id !== data.user.id);
                            }
                        })
                    }
                });


            } catch (error) {
                console.log(error)
                // Handle any errors here
            }
        }

    }
})