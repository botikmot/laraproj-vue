import { defineStore } from 'pinia'
import axios from "axios"
import pusher from '../pusher'
import { useAuthStore } from './auth'

export const useGroupStore = defineStore("group", {
    state: () => ({
        groupErrors: [],
        myGroups: [],
        groupMessages: [],
        allUsers: [],
        newAddedMessage: false,
        messageLoading: false,
        currentGroup: null,
        recipient: null,
        groupMessagePage: 1,
        myGroup: null,
        privateMessages: [],
        messagesAllLoaded: false,
        totalUnreads: 0,
    }),
    getters: {
        errors: (state) => state.groupErrors,
        groups: (state) => state.myGroups,
        messages: (state) => state.groupMessages,
        users: (state) => state.allUsers,
        messageAdded: (state) => state.newAddedMessage,
        loading: (state) => state.messageLoading,
        groupId: (state) => state.currentGroup,
        group: (state) => state.myGroup,
        allLoaded: (state) => state.messagesAllLoaded,
        myPrivateMessages: (state) => state.privateMessages,
        recipientData: (state) => state.recipient
    },
    actions: {
        async createGroup(data) {
            try {
                this.groupErrors = [];
                const response = await axios.post('/api/create-group', data)
                console.log(response)
            } catch (error) {
                if(error.response.status === 422){  
                    this.groupErrors = error.response.data.errors
                    setTimeout(() =>{
                        this.groupErrors = []
                    }, 3000)
                }
            }
        },
        async userGroups() {
            try {
                const response = await axios.get('/api/groups')
                this.myGroups = response.data.groups 
                return this.myGroups
            } catch (error) {
                console.log(error)
                return []
            }
        },
        async sendGroupMessage(data, id) {
            try {
                const response = await axios.post(`/api/group-message/${id}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                console.log('send message to group', response)
            } catch (error) {
                console.log(error)
            }
        },
        async getGroupMessages(id) {
            if (!id) {
                console.log('No group id');
                return
            }
            if(this.currentGroup !== id){
                this.groupMessages = []
                this.groupMessagePage = 1
                this.messagesAllLoaded = false
                this.currentGroup = id
                this.myGroup = this.myGroups.find(item => item.id === id)
            }
            this.recipient = null
            try {
                this.messageLoading = true
                const response = await axios.get(`/api/group-messages/${id}?page=${this.groupMessagePage}`)
                const newMessages = response.data.messages.data
                console.log('messages list', response.data)
                if (newMessages.length) {
                    this.groupMessages = this.groupMessages.concat(newMessages)
                    this.groupMessagePage++
                    this.messageLoading = false
                }else{
                    this.messagesAllLoaded = true
                    this.messageLoading = false
                }

                const item = this.myGroups.find(item => item.id == id)
                if (item) {
                    const unreads = item.unread_messages.length
                    this.totalUnreads -= unreads

                    const result = document.title.includes('(')
                        ? document.title.split('(')[0].trim()
                        : document.title

                    document.title = this.totalUnreads > 0
                        ? `${result} (${this.totalUnreads})`
                        : result
                    item.unread_messages = []
                } 

            } catch (error) {
                console.log(error)
            }
        },
        async getAllUsers() {
            try {
                const response = await axios.get('/api/all-users')
                this.allUsers = response.data.users
            } catch (error) {
                console.log(error)
            }
        },
        async addMember(data, id) {
            try {
                const response = await axios.post(`/api/add-member/${id}`, data)
                console.log('add member', response)
            } catch (error) {
                console.log(error)
            }
        },
        addNewMessage(data, groupId){
            console.log('current group', this.currentGroup)
            if(this.currentGroup == groupId) {
                this.groupMessages.unshift(data)
                this.newAddedMessage = true
                setTimeout(() => {
                    this.newAddedMessage = false
                },2000)
            }
            const item = this.myGroups.find(item => item.id == groupId)
            if(item){ 
                item.latest_message.content = data.content
                if(item.id != this.currentGroup){
                    item.unread_messages.push(data)
                    this.totalUnreads++
                    const result = document.title.includes('(')
                        ? document.title.split('(')[0].trim()
                        : document.title
                    document.title = result + ' (' + this.totalUnreads + ')'
                }
                
            }
        },
        addNewPrivateMessage(data, recipientId){
            console.log('this.recipient.id', this.recipient.id)
            console.log('recipientId', recipientId)
            if(this.recipient.id == recipientId){
                this.groupMessages.unshift(data)
                this.newAddedMessage = true
                setTimeout(() => {
                    this.newAddedMessage = false
                },2000)
            }
        },
        async sendPrivateMessage(data, id) {
            try {
                const response = await axios.post(`/api/send-private-message/${id}`, data)
                console.log('send private message', response)
            } catch (error) {
                console.log(error)
            }
        },
        async getRecipientMessages(user){
            try {
                this.myGroup = user
                this.currentGroup = null
                this.recipient = user
                const response = await axios.get(`/api/get-recipient-messages/${user.id}`)
                console.log('recipient messages', response.data)
                this.groupMessages = response.data.recipientMessages.data
            } catch (error) {
                console.log(error)
                // Handle any errors here
            }
        },
        async getPrivateMessages(){
            try {
                const response = await axios.get('/api/get-private-messages')
                console.log('recipients', response.data.privateMessages)
                this.privateMessages = response.data.privateMessages
                return this.privateMessages
            } catch (error) {
                console.log(error)
                // Handle any errors here
                return []
            }
        },
        async getRecipients(){
            try {
                const response = await axios.get('/api/get-recipients')
                console.log('recipients', response.data.recipients)
                this.privateMessages = response.data.recipients
            } catch (error) {
                console.log(error)
                // Handle any errors here
            }
        },
        async removeUserToGroupsActivity(id){
            try {
                const response = await axios.post('/api/remove-user-from-group-activity', { userId: id })
                this.groupMessages = []
                this.currentGroup = null
                this.myGroup = null
            } catch (error) {
                console.log(error)
                // Handle any errors here
            }
        },
        setOnlineStatus(data){
            this.myGroups.forEach(item => {
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
                const myGroups = await this.userGroups();
                this.totalUnreads = 0
                myGroups.forEach(group => {
                    const channelName = `group.${group.id}`;
                    const channel = pusher.subscribe(channelName);
                    channel.bind('group-message', (data) => {
                        // Handle the received message here
                        // Add the message to the specific group
                        let activeusers = []
                        data.activeUsers.forEach(item =>{
                            let dataUser = {
                                user: item.user
                            }
                            if(item.user.id != data.message.user_id){
                                activeusers.push(dataUser)
                            }
                        })

                        data.message.latest_read = activeusers

                        this.groupMessages.forEach(item => {
                            item.latest_read = item.latest_read.filter(entry => {
                                // Check if the user exists in the activeUsers array
                                const userExistsInActiveUsers = activeusers.some(activeUser =>
                                    activeUser.user.id === entry.user.id
                                );
                                // Keep the user if not in activeUsers
                                return !userExistsInActiveUsers;
                            });
                        });

                        this.addNewMessage(data.message, data.groupId)
                    });

                    channel.bind('read-message', async (data) => {
                        if(data.groupId == this.currentGroup && this.groupMessages.length > 0){
                            const userExists = this.groupMessages[0].latest_read.some(entry =>
                                entry.user.id === data.user.id
                            );
                            if (!userExists) {
                                this.groupMessages[0].latest_read.push(data)
                                this.groupMessages.slice(1).forEach(item => {
                                    item.latest_read = item.latest_read.filter(entry => entry.user.id !== data.user.id);
                                })
                            }
                        }
                    });

                    this.totalUnreads = this.totalUnreads + group.unread_messages.length
                });

                const privateGroups = await this.getPrivateMessages();
                privateGroups.forEach(item => {
                    //const privateChannelName = `recipient.${item.id}`;
                    const privateChannel = pusher.subscribe('sender', 'recipient');
                    //console.log('privateChannelName',privateChannelName)
                    privateChannel.bind('private-message', (data) => {
                        console.log('private message sent-->>>', data)
                        this.addNewPrivateMessage(data.message, data.recipientId)
                    })
                })

                if(this.totalUnreads > 0){
                    const result = document.title.includes('(')
                        ? document.title.split('(')[0].trim()
                        : document.title
                    document.title = result + ' (' + this.totalUnreads + ')'
                }
            } catch (error) {
                console.log(error);
            }
        },
        

    }

})