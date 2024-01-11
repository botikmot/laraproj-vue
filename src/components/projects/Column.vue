<template>
    <div class="column">
      <div class="flex justify-between">
        <h2 class="font-bold">{{ columnProps.column.name }}</h2>
        <v-menu
          transition="scale-transition"
          v-if="authStore.user.id == columnProps.column.user_id"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              class=""
              color="info"
              size="30"
              variant=""
              icon="mdi-dots-vertical"
              v-bind="props"
            ></v-btn>
          </template>

          <v-list>
            <v-list-item @click="removeColumn(columnProps.column.id)">
              <v-list-item-title>Remove</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <draggable 
        :list="columnProps.column.tasks"
        group="tasks"
        :itemKey="id"
        @change="handleBoardUpdate"
      >
        <template v-slot:item="{ element }">
            <task :task="element" />
        </template>
      </draggable>
      <div>
        <v-btn variant="flat" @click="newTask = true" block><v-icon>mdi-plus</v-icon></v-btn>
        <v-dialog width="500" v-model="newTask"> 
            <add-task-modal @closeDialog="getDialogValue" :status="columnProps.column.id" :index="columnProps.column.tasks ? columnProps.column.tasks.length : 0"></add-task-modal>            
        </v-dialog>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import Task from "./Task.vue";
  import draggable from "vuedraggable";
  import AddTaskModal from "./AddTaskModal.vue"
  import { useAuthStore } from '../../store/auth'
  import { useProjectStore } from '../../store/project'

  const authStore = useAuthStore()
  const columnProps = defineProps(['column'])
  const newTask = ref(false)
  const projectStore = useProjectStore()

  const handleBoardUpdate = async (event) => {
      // Check for the moved or added 
      columnProps.column.tasks.forEach((task, i) => {
        task.index = i
      })
      console.log('event', event)
      if (event.added) {
        const newColumnId = columnProps.column.id;
        const data = {
          name: event.added.element.name,
          status_id: newColumnId,
          index: event.added.newIndex,
          tasks: columnProps.column.tasks
        }
        await projectStore.updateTask(data, event.added.element.id)

      }else if(event.moved){

        const data = {
          name: event.moved.element.name,
          status_id: columnProps.column.id,
          index: event.moved.newIndex,
          tasks: columnProps.column.tasks
        }
        await projectStore.updateTask(data, event.moved.element.id)
      }
  }

  const getDialogValue = () => {
    newTask.value = false
  }

  const removeColumn = async (id) => {
    await projectStore.removeColumn(id)
  }

</script>
  
  <style>
  .column {
    min-width: 340px;
    max-width: 340px;
    flex: 1;
    margin: 10px;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  </style>
  