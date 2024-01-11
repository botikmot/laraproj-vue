<template>
    <v-navigation-drawer
      color="grey-lighten-3"
      rail
    >
      <!-- <v-divider class="mx-3 my-3"></v-divider> -->

      <v-btn
        class="d-block mx-auto my-5"
        color="info"
        @click="newMember = true"
        variant=""
        icon="mdi-account-plus"
      ></v-btn>
      <v-dialog width="500" v-model="newMember">
          <add-member-modal @closeDialog="getDialogValue"></add-member-modal>
      </v-dialog>

    </v-navigation-drawer>
</template>

<script setup>
import { computed, ref } from "vue"
import AddMemberModal from './AddMemberModal.vue'

const newMember = ref(false)


const getDialogValue = () => {
      newMember.value = false
  }

</script>