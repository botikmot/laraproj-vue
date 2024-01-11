import { defineStore } from 'pinia'
import axios from "axios"
import router from '../router'
//import pusher from '../pusher'

export const useProjectStore = defineStore("project", {
    state: () => ({
        myProjects: [],
        currentProject: null,
    }),
    getters: {
        projects: (state) => state.myProjects,
        project: (state) => state.currentProject,
    },
    actions: {
        async getProjects() {
            try {
                const response = await axios.get('/api/projects')
                console.log('projects', response.data)
                this.myProjects = response.data
            } catch (error) {
                console.log(error)
            }
        },
        async createProject(data) {
            try {
                const response = await axios.post('/api/project', data)
                console.log('project', response)
                this.myProjects.push(response.data.project)
            } catch (error) {
                console.log(error)
            }
        },
        async createColumn(data, id) {
            try {
                const response = await axios.post(`/api/project-status/${id}`, data)
                console.log('column', response)
                this.currentProject.statuses.push(response.data.status)
            } catch (error) {
                console.log(error)
            }
        },
        async getProject(id) {
            try {
                router.push({ name: 'project-board', params: { id: id } })
                const response = await axios.get(`/api/project/${id}`)
                console.log('project', response)
                this.currentProject = response.data
            } catch (error) {
                console.log(error)
            }
        },
        async createTask(data,id) {
            try {
                const response = await axios.post(`/api/project/${id}/task`, data)
                console.log('task', response)
                this.currentProject.statuses.forEach(item => {
                    if(item.id == response.data.status_id){
                        item.tasks = item.tasks ? item.tasks : []
                        item.tasks.push(response.data)
                    }
                })
            } catch (error) {
                console.log(error)
            }
        },
        async removeColumn(id) {
            try {
                const response = await axios.delete(`/api/project/${id}/status`)
                console.log('remove column ->', response)
                if(response.data.success){
                    this.currentProject.statuses.forEach((item, i) => {
                        if(item.id == id){
                            this.currentProject.statuses.splice(i, 1)
                        }
                    })
                }
            } catch (error) {
                console.log(error)
            }
        },
        async addMember(data, id) {
            try {
                const response = await axios.post(`/api/project/${id}/member`, data)
                console.log('member', response)
            } catch (error) {
                console.log(error)
            }
        },
        async updateTask(data, id) {
            try {
                const response = await axios.put(`/api/project/${id}/task`, data)
                console.log('task update', response)
            } catch (error) {
                console.log(error)
            }
        },
        async removeTask(id) {
            try {
                const response = await axios.delete(`/api/project/task/${id}`)
                console.log('remove task ->', response)
                if(response.data.success){
                    this.currentProject.statuses.forEach((item, i) => {
                        item.tasks.forEach((task, n) => {
                            if(task.id == id){
                                this.currentProject.statuses[i].tasks.splice(n, 1)
                            }
                        })
                    })
                }
            } catch (error) {
                console.log(error)
            }
        },
        async addTaskComment(data, id) {
            try {
                const response = await axios.post(`/api/task/${id}/comment`, data)
                console.log('task comment', response.data.comment)
                if(response.data.success){
                    const comment = response.data.comment
                    this.currentProject.statuses.forEach((item, i) => {
                        item.tasks.forEach((task, n) => {
                            if(task.id == id){
                                this.currentProject.statuses[i].tasks[n].comments.push(comment)
                            }
                        })
                    })
                }

            } catch (error) {
                console.log(error)
            }
        },
        async assignedUsers(data, id) {
            try {
                const response = await axios.post(`/api/task/${id}/assigned`, data)
                console.log('users assigned', response)
                if(response.data.success){
                    this.currentProject.statuses.forEach((item, i) => {
                        item.tasks.forEach((task, n) => {
                            if(task.id == id){
                                response.data.task.users.forEach(user => {
                                    this.currentProject.statuses[i].tasks[n].users.push(user)
                                })                      
                            }
                        })
                    })
                }
            } catch (error) {
                console.log(error)
            }
        },


    }
})