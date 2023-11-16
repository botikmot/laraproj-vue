<template>
    <v-card class="pa-3 my-3">
        <div class="flex justify-between">
            <div class="flex">
                <v-avatar v-if="profileImagePath" :image="profileImagePath"></v-avatar>
                <v-avatar
                    v-else
                    color="info"
                    >
                    <span class="">{{ getInitials() }}</span>
                </v-avatar>
                <div>
                    <div class="font-bold pl-3"> {{ data.user.profile ? data.user.profile.first_name + ' ' + data.user.profile.last_name : data.user.name }}</div>
                    <div class="pl-3 text-xs text-gray-400">{{ formatDate(data.created_at) }}</div>
                </div>
            </div>
            <v-icon class="cursor-pointer" icon="mdi-dots-horizontal"></v-icon>
        </div>
        <!-- <div class="mt-3 text-sm pb-6">{{ data.content }} </div> -->
        <div class="mt-3 text-sm pb-6" v-html="convertLinks(data.content)"></div>
        <div v-if="links && links[0].image">
            <v-row>
                <v-col cols="12" class="relative">
                    <v-img
                        class="cursor-pointer"
                        height="300"
                        @click="openLink(links[0].url)"
                        cover
                        :src="links[0].image ? links[0].image : 'no-image-available.jpg'"
                    ></v-img>
                    <div class="absolute bottom-5 link-preview-desc">
                        <div class="font-semibold pl-3 text-white">{{ links[0].title }}</div>
                        <div class="text-sm pl-3 text-white">{{ links[0].desc }}</div>
                    </div>
                </v-col>
            </v-row>
        </div>
        <div v-if="attachments">
            <v-row>
                <v-col
                    v-for="(attachment, index) in computedAttachments"
                    :key="index"
                    class="px-0 py-0 z-10"
                    :cols="attachment.cols"
                >             
                    <v-row v-if="attachment.children">
                        <v-col :class="`${ i == 0 ? 'pb-0' : 'py-0'} relative`" cols="12" v-for="(item, i) in attachment.children" :key="item">
                            <video v-if="determineMediaType(item) == 'video'" ref="myVideo" :src="getImageUrl(item.path)" controls></video>
                            <v-img v-else class="cursor-pointer" height="200" @click="expandImage(item.path, i)" cover :src="getImageUrl(item.path)"></v-img>
                            <div @click="expandImage(item.path, i)" v-if="i >= 2 && data.attachments.length != 4" class="more-images-overlay cursor-pointer">
                                +{{data.attachments.length - 4}}
                            </div>
                        </v-col>
                    </v-row>
                    <div v-else>
                        <video v-if="determineMediaType(attachment) == 'video'" ref="myVideo" :src="getImageUrl(attachment.path)" controls></video>
                        <v-img
                            v-else
                            class="cursor-pointer"
                            @click="expandImage(attachment.path, index)"
                            :height="attachment.height"
                            cover
                            :src="getImageUrl(attachment.path)"
                        ></v-img>
                    </div>
                </v-col>
            </v-row>
        </div>
        <div class="mt-6">
            <div class="flex relative">
                <div v-if="isLike" class="w-10 absolute animated-heart"><v-img height="40" src="/like_animation.gif"></v-img></div>
                <v-icon v-if="data.likes_count == 0" size="x-small"></v-icon>
                <v-icon v-else size="x-small" :color="data.liked_by_user ? 'red' : 'blue'">mdi-heart</v-icon>
                <span :class="`text-xs ${data.liked_by_user ? 'text-red-600' : 'text-blue-600'}  pl-1`">{{ data.likes_count > 0 ? data.likes_count : '' }}</span>
            </div>
            <v-row>
                <v-col class="text-center">
                    <v-btn @click="likePost" block prepend-icon="mdi-thumb-up-outline"  variant="plain">Like</v-btn>
                </v-col>
                <v-col class="text-center">
                    <v-btn :disabled="loadcomments" :loading="loading" @click="fetchComments" block color="grey-darken-2" variant="plain">{{ data.comments_count > 0 ? data.comments_count : '' }} Comment{{ data.comments_count > 1 ? 's' : '' }}</v-btn>
                </v-col>
            </v-row>
            <comment-list :data="data.comments"></comment-list>
            <div @click="fetchComments" v-if="data.comment_page && data.comments_count > 5 && !data.comments_all_loaded" class="text-sm text-blue-500 cursor-pointer">{{ loading ? 'Loading comments...' : 'Load more..'}}</div>
            <comment v-if="loadcomments" :postid="data.id"></comment>
        </div>
    </v-card>
</template>

<script setup>
import { computed, ref } from "vue"
import { BASE_IMAGE_URL } from '../../constant'
import moment from "moment"
import { useSocialStore } from '../../store/social';
import Comment from "./Comment.vue"
import CommentList from './CommentList.vue'

const socialStore = useSocialStore()
const props = defineProps(['data'])
const emit = defineEmits(['clickImage'])

const loading = ref(false)
const loadcomments = ref(false)
const isLike = ref(false)

const profileImagePath = computed(() => {
    if(props.data.user.profile && props.data.user.profile.profile_photo){
        return BASE_IMAGE_URL + props.data.user.profile.profile_photo;
    }else{
        return null
    }
})

const attachments = computed(() =>{
    return props.data.attachments
})

const links = computed(() => {
    return props.data.link_previews
})

const likePost = async () => {
    isLike.value = true

    setTimeout(() => {
        isLike.value = false
    }, 1000)

    await socialStore.isLikePost(props.data.id)

}

const computedAttachments = computed(() =>{
    const attachmentCount = attachments.value.length
    if (attachmentCount === 1) {
        return [{ path: attachments.value[0].path, cols: 12, height: 300 }];
      } else if (attachmentCount === 2) {
        return attachments.value.map((attachment) => ({
          path: attachment.path,
          cols: 6,
          height: 300,
        }));
      } else if (attachmentCount === 3) {
        return [
          { 
            path: attachments.value[0].path, 
            cols: 6, height: 400,
          },
          {
            cols: 6,
            children: [{ path: attachments.value[1].path},{path: attachments.value[2].path}]
          }
        ];
      } else if (attachmentCount === 4) {
        return [
          { 
            path: attachments.value[0].path, 
            cols: 8, height: 600,
          },
          {
            cols: 4,
            children: [{ path: attachments.value[1].path},{path: attachments.value[2].path},{ path: attachments.value[3].path}]
          }
        ];
      } else if (attachmentCount > 4) {
        return [
          { 
            path: attachments.value[0].path, 
            cols: 8, height: 600,
          },
          {
            cols: 4,
            children: [{ path: attachments.value[1].path},{path: attachments.value[2].path},{ path: attachments.value[3].path}]
          }
        ];
      }
})

const getInitials = () => {
    const words = props.data.user.name.split(' ')
    const initials = words.map(word => word.charAt(0).toUpperCase())
    return initials.join('')
}

const getImageUrl = (url) => {
    return BASE_IMAGE_URL + '/' + url
}

const formatDate = (date) => {
    return moment(date).fromNow()
}
 
const expandImage = function (image, index) {
    const data = { 
        imageUrl: image, 
        index: index,
        images: attachments.value
     }
    emit('clickImage', data)
}

const determineMediaType = (post) => {
    let imageExtensions = ["jpg", "jpeg", "png", "gif", "svg"];
    let videoExtensions = ["mp4", "avi", "mov", "mkv"];
    let mediaType = 'other';
    let fileExtension = post.path.split('.').pop();

    if (imageExtensions.indexOf(fileExtension) !== -1) {
        mediaType = 'image';
    } else if (videoExtensions.indexOf(fileExtension) !== -1) {
        mediaType = 'video';
    }
    return mediaType;
}

const openLink = (url) => {
    window.open(url, '_blank')
}

const convertLinks = (text) => {
    // Regular expression to match URLs
    const pattern = /https?:\/\/\S+/g;
    const replacement = '<a class="text-blue-500" href="$&" target="_blank">$&</a>';
    return text.replace(pattern, replacement);
}

const fetchComments = async () => {
    loading.value = true
    let page = props.data.comment_page ? props.data.comment_page : 1
    await socialStore.getComments(props.data.id, page)
    loading.value = false
    loadcomments.value = true
}

</script>

<style scoped>
.link-preview-desc {
    background: #8080806e;
    width: 96%;
}
</style>