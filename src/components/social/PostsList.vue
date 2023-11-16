<template>
    <div class="z-unset">
        <create-post></create-post>
        <div class="py-2">
            <div class="relative">
                <post-feed v-for="post in posts" :key="post.id" :data="post" @clickImage="getImage"></post-feed>
                <div v-if="loading" class="flex justify-center p-8">
                    <v-progress-circular
                        :size="50"
                        color="primary"
                        indeterminate
                    ></v-progress-circular>
                </div>
            </div>
            <div v-if="expandedImage" @click.stop="closeExpandedImage()" class="expanded-image-container">
                <v-btn size="large" class="mr-3" v-if="currentIndex != 0" @click.stop="previousImage()" icon="mdi-chevron-left"></v-btn>
                    <!-- <v-img :src="expandedImage" alt="Expanded Image" /> -->
                    <video v-if="determineMediaType(expandedImage) == 'video'" ref="myVideo" :src="expandedImage" controls></video>
                    <v-img v-else :src="expandedImage"></v-img>
                <v-btn size="large" class="ml-3" v-if="currentIndex < images.length - 1" @click.stop="nextImage()" icon="mdi-chevron-right"></v-btn>
            </div>
        </div>
    </div>
</template>

<script setup>
import CreatePost from './CreatePost.vue';
import PostFeed from './PostFeed.vue';
import { useSocialStore } from '../../store/social';
import { BASE_IMAGE_URL } from '../../constant'
import { computed, onMounted, ref } from 'vue'

const socialStore = useSocialStore()

const expandedImage = ref(null)
const currentIndex = ref(0)
const images = ref(null)

const loading = computed(() => {
    return socialStore.loading
})

const allLoaded = computed(() => {
    return socialStore.allLoaded
})

const posts = computed(() => {
    return socialStore.posts
})

const handleScroll = () => {
    let bottomOfWindow = (window.innerHeight + window.scrollY + .5) >= document.body.offsetHeight;
    if (bottomOfWindow && !loading.value && !allLoaded.value) {
        socialStore.getPosts()
    }
}

const closeExpandedImage = () => {
    expandedImage.value = null
}

const getImage = (value) => {
    images.value = value.images
    currentIndex.value = value.index
    expandedImage.value = getImageUrl(value.imageUrl)
}

const getImageUrl = (url) => {
    return BASE_IMAGE_URL + '/' + url
}

const previousImage = () => {
    if (currentIndex.value < 0) {
        currentIndex.value = images.value.length
    } else {
        currentIndex.value--
    }
    expandedImage.value = getImageUrl(images.value[currentIndex.value].path)
}

const nextImage = () => {
    if (currentIndex.value === images.value.length - 1) {
        currentIndex.value = 0
    } else {
        currentIndex.value++
    }
    expandedImage.value = getImageUrl(images.value[currentIndex.value].path)
}

const determineMediaType = (post) => {
    let imageExtensions = ["jpg", "jpeg", "png", "gif", "svg"];
    let videoExtensions = ["mp4", "avi", "mov", "mkv"];
    let mediaType = 'other';
    let fileExtension = post.split('.').pop();

    if (imageExtensions.indexOf(fileExtension) !== -1) {
        mediaType = 'image';
    } else if (videoExtensions.indexOf(fileExtension) !== -1) {
        mediaType = 'video';
    }
    return mediaType;
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

</script>