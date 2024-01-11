<template>
    <v-container>
        <v-row>
            <v-col cols="3" class="d-none d-md-block">
               Left SIdebar
            </v-col>
            <v-col cols="12" sm="12" md="6">
                <posts-list></posts-list>
            </v-col>
            <v-col cols="3" class="d-none d-md-block">
               Right SIdebar
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { useSocialStore } from '../../store/social';
import { useGroupStore } from '../../store/group'
import { useChatStore } from '../../store/chat';
import PostsList from './PostsList.vue';
import { onMounted } from 'vue'

const socialStore = useSocialStore()
//const groupStore = useGroupStore()
const chatStore = useChatStore()

onMounted(async () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    socialStore.getScrollTop(scrollTop)
    await socialStore.getPosts()
    //await groupStore.subscribeToPusherChannels()
    await chatStore.subscribeToPusherChannels()
})

</script>