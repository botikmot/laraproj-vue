import { defineStore } from 'pinia';
import axios from "axios";

export const useMainStore = defineStore("main", {
    state: () => ({
        mainAlert: null,
        presentationsData: null,
    }),
    getters: {
        alert: (state) => state.mainAlert,
        presentations: (state) => state.presentationsData
    },
    actions: {
        setAlert(data) {
            this.mainAlert = data
            setTimeout(() => {
                this.mainAlert = null
            }, 3000)
        },
        async getPresentations() {
            await axios.get('/api/presentations')
            .then(response => {
                const dataPresentations = response.data.presentations
                dataPresentations.forEach(element => {
                    element.slides = JSON.parse(element.slides)
                });
                this.presentationsData = dataPresentations
            })
            .catch(error => {
                // Handle errors
            });
        }
    }
});