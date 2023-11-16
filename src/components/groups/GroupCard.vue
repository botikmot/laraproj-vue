<template>
    <v-card
        class="mx-2"
        height="150"
        color="indigo"
        variant="tonal"
        @click="$router.push({name: 'group-channel', params: { id: data.id } })"
    >
        <v-card-item>
            <div class="text-caption mb-1">
                Members: {{ data.users_count }} 
            </div>
            <div class="text-h6 mb-1">
                {{ data.name }}
            </div>
            <div class="text-caption description-container description">
                {{ data.description ? data.description : ' ' }}
            </div>
        </v-card-item>

        <v-card-actions>
            <v-btn>
            Button
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
const props = defineProps(['data'])

</script>


<style scoped>
.description-container {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
