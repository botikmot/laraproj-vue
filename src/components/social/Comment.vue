<template>
    <div>
        <div class="flex mt-3"> 
            <v-avatar class="mt-1" size="small" v-if="userImagePath" :image="userImagePath"></v-avatar>
            <v-avatar v-else class="mt-1" color="info" size="small">{{ getInitials() }}</v-avatar>
            <v-textarea
                v-model="comment"
                class="ml-2"
                label="Comment.."
                auto-grow
                variant="outlined"
                rows="1"
                hide-details
                density="compact"
                @click:append-inner="submitComment"
                append-inner-icon="mdi-send"
            ></v-textarea>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '../../store/auth';
import { useSocialStore } from '../../store/social';
import { BASE_IMAGE_URL } from '../../constant'
import { computed, ref } from "vue"

const authStore = useAuthStore()
const socialStore = useSocialStore()
const props = defineProps(['postid'])


const comment = ref('')

const userImagePath = computed(() => {
    if(authStore.user.profile && authStore.user.profile.profile_photo){
        return BASE_IMAGE_URL + authStore.user.profile.profile_photo;
    }else{
        return null
    }
})

const getInitials = () => {
    const words = authStore.user.name.split(' ')
    const initials = words.map(word => word.charAt(0).toUpperCase())
    return initials.join('')
}

const submitComment = async () => {
    console.log('props.postid', props.postid)
    let formData = new FormData()
    formData.append('body', comment.value)
    await socialStore.createComment(formData, props.postid)
    comment.value = ''
}

</script>