<template>
    <v-card class="pa-3">
        <div class="flex justify-between pb-3">
            <div class="flex">
                <v-icon color="success" icon="mdi-pencil-plus-outline"></v-icon>
                <h3 class="pl-3 font-bold">Create Post</h3>
            </div>
            <v-icon class="cursor-pointer" icon="mdi-dots-horizontal"></v-icon>
        </div>
        <v-textarea
          label="What's on your mind?"
          auto-grow
          variant="outlined"
          rows="2"
          row-height="25"
          hide-details
          v-model="content"
          shaped
        ></v-textarea>
        <div v-if="socialErrors.content" class="text-red-500 text-sm">{{ socialErrors.content[0] }}</div>
        <div class="flex justify-between pt-3">
            <div class="flex">
                <v-chip
                    @click="$refs.attachments.click()"
                    class="mt-1"
                    size="small"
                >
                    <v-icon color="success" start icon="mdi-video-image"></v-icon>
                    Photo | Video
                </v-chip>
                <input type="file" ref="attachments" @change="handleFiles" class="form-control-file hidden" accept="image/*, video/*" multiple>
                <span v-if="num_attach > 0" class="text-xs font-italic pl-3 pt-2 flex">
                    {{ num_attach }} {{num_attach > 1 ? 'attachments' : 'attachment'}}
                </span>
            </div>
            <v-btn @click="submitPost" :loading="loading" size="small" variant="flat" color="info">Post</v-btn>
        </div>
        <div v-if="socialErrors.attachments" class="text-red-500 text-sm">{{ socialErrors.attachments[0] }}</div>
    </v-card>
</template>

<script setup>
import { useSocialStore } from '../../store/social';
import { ref, computed } from 'vue'

const socialStore = useSocialStore()

const attachments = ref(null)
const num_attach = ref(0)
const content = ref('')
const loading = ref(false)

const socialErrors = computed(() => {
    return socialStore.errors
})


const handleFiles = () => {
    attachments.value = attachments.value.files;
    num_attach.value = attachments.value.length
    console.log('attach', attachments.value);
}

const submitPost = async () => {
    let formData = new FormData()
    formData.append('content', content.value)
    //formData.append('privacy', this.privacy)
    for (let i = 0; i < num_attach.value; i++) {
        const file = attachments.value.files[i];
        // Ensure 'file' is a valid File object
        if (file instanceof File) {
            // Append the file with its original name and extension
            formData.append(`attachments[${i}]`, file, file.name);
        }
    }
    loading.value = true
    await socialStore.createPost(formData)
    attachments.value = null
    content.value = ''
    num_attach.value = 0
    loading.value = false
}
</script>