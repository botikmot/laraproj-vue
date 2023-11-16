<template>
    <div v-for="comment in comments" :key="comment">
        <div class="flex pb-2 justify-between border-b-2">
            <div class="flex">
                <v-avatar v-if="comment.user.profile && comment.user.profile.profile_photo" class="mt-2" size="small" :image="getImageUrl(comment.user.profile.profile_photo)"></v-avatar>
                <v-avatar v-else class="mt-2" size="small" color="info"> {{ getUserCommentInitials(comment.user.name) }}</v-avatar>
                <div class="pl-2">
                    <div class="text-sm font-bold pt-1 pb-0 mb-0"> {{ comment.user.profile ? comment.user.profile.first_name + ' ' + comment.user.profile.last_name : comment.user.name }}</div>
                    <span class="text-sm text-gray-500">{{ comment.body }}</span>
                </div>
            </div>
            <div>
                <span class="text-xs text-gray-400">{{ formatDate(comment.created_at) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue"
import { BASE_IMAGE_URL } from '../../constant'
import moment from "moment"


const props = defineProps(['data'])

const comments = computed(() => {
    return props.data
})

const getImageUrl = (url) => {
    return BASE_IMAGE_URL + '/' + url
}

const getUserCommentInitials = (name) => {
    const words = name.split(' ')
    const initials = words.map(word => word.charAt(0).toUpperCase())
    return initials.join('')
}

const formatDate = (date) => {
    return moment(date).fromNow()
}

</script>