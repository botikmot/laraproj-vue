import { defineStore } from 'pinia';
import axios from "axios";
import router from '../router';
import { useMainStore } from './main'

export const useAuthStore = defineStore("auth", {
    state: () => ({
        authUser: null,
        authErrors: [],
        authStatus: null
    }),
    getters: {
        user: (state) => state.authUser,
        errors: (state) => state.authErrors,
        status: (state) => state.authStatus,
    },
    actions: {
        async getToken() {
            await axios.get('/sanctum/csrf-cookie')
        },

        // function to call API for user's data
        async getUser() {
            const user = localStorage.getItem('user_data')
            if(user) {
                // User is already authenticated; no need to load the user again
                this.authUser = JSON.parse(user)
                return;
            }else{
                await this.getToken()
                try {
                    const response = await axios.get('/api/user');
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                    this.authUser = response.data;
                    this.isAuthenticated = true;
                    return this.authUser;
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        // Handle the 401 error here (e.g., redirect to login page)
                        console.log('Not authenticated');
                    } else {
                        // Handle other errors
                        console.error('Error fetching user data:', error);
                    }
                    this.isAuthenticated = false;
                    return 'Not authenticated';
                }
            }
        },

        // function to call API for user login
        async handleLogin(data) {
            await this.getToken();
            try {
                this.authErrors = []
                const response = await axios.post('/login', data);
                console.log('user', response.data)
                if(response.data.name){
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                    this.authUser = response.data;
                    this.isAuthenticated = true;
                    router.push('/')
                }
            } catch (error) {
                // Handle any errors here
                if(error.response.status === 422){
                    this.authErrors = error.response.data.errors
                }
            }
        },
        // function to call API for user registration
        async handleRegister(data) {
            try {
                this.authErrors = []
                const response =  await axios.post('/register', data);
                if(response.data.name){
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                    this.authUser = response.data;
                    this.isAuthenticated = true;
                    router.push('/')
                    /* router.push('/send-email-verification') */
                }
            } catch (error) {
                if(error.response.status === 422){
                    this.authErrors = error.response.data.errors
                }
            }
        },
        // function to call API for logout
        async handleLogout() {
            await axios.post('/logout');
            this.authUser = null
            localStorage.removeItem('user_data')
            router.push('/')
        },
        // function to call API for forgot password
        async forgotPassword(email) {
            let data = {
                email: email
            };
            try {
                this.authErrors = []
                const response = await axios.post('/forgot-password', data);
                this.authStatus = response.data.status
            } catch (error) {
                // Handle any errors here
                if(error.response.status === 422){
                    this.authErrors = error.response.data.errors
                }
            }
        },
        // function to call API for reset password
        async resetPassword(data) {
            try {
                this.authErrors = []
                const response = await axios.post('/reset-password', data);
                this.authStatus = response.data.status
            } catch (error) {
                // Handle any errors here
                if(error.response.status === 422){
                    this.authErrors = error.response.data.errors
                }
            }
        },
        // set errors to empty
        resetErrors() {
            this.authErrors = []
        },

        // function to call the user session, if session expired the user should logout
        async sessionStatus() {
            await axios.get('/check-session-status')
            .then(response => {
                if (response.data.sessionExpired) {
                    this.authUser = null
                    localStorage.removeItem('user_data')
                }else{
                    this.getUser()
                }
            })
            .catch(error => {
                // Handle errors
            });

        },

        // resend the email verification link
        async resendEmailVerification() {
            await axios.post('/email/verification-notification')
            .then(response => {
                console.log('resent email verification', response)
            })
            .catch(error => {
                // Handle errors
            });
        },
        async updateProfile(data) {
            const main = useMainStore()
            try {
                this.authErrors = []
                const response = await axios.post('/api/update-profile', data)
                const user = response.data.user
                localStorage.setItem('user_data', JSON.stringify(user));
                this.authUser = user
                const alert = {
                    color: 'success',
                    message: 'Profile updated successfully!'
                }
                main.setAlert(alert)
            } catch (error) {
                if(error.response.status === 422){
                    this.authErrors = error.response.data.errors
                }
            }
        },
        async userheartBeat(){
            try {
                const response = await axios.post('/api/user-heartbeat');
            } catch (error) {
                console.log(error)
                // Handle any errors here
            }
           
        }
    }
});
