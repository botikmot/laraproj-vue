import { createRouter , createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

import Home from '../components/Home.vue'
const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/login',
        name: 'login',
        meta: { auth: false },
        component: () => import('../components/Login.vue')
    },
    {
        path: '/register',
        name: 'register',
        meta: { auth: false },
        component: () => import('../components/Register.vue')
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        meta: { auth: false },
        component: () => import('../components/ForgotPassword.vue')
    },
    {
        path: '/password-reset/:token',
        name: 'reset-password',
        meta: { auth: false },
        component: () => import('../components/ResetPassword.vue')
    },
    {
        path: '/send-email-verification',
        name: 'email-verification',
        meta: { auth: false },
        component: () => import('../components/EmailVerification.vue')
    },
    {
        path: '/user',
        name: 'user',
        meta: { auth: true },
        children : [
            {
                path: '/user-profile/:id',
                name: 'user-profile',
                meta: { auth: true },
                component: () => import('../components/user/UserProfile.vue')
            }
        ]
    },
    {
        path: '/presentation',
        name: 'presentation',
        meta: { auth: true },
        component: () => import('../components/presentation/Dashboard.vue')
    },
    {
        path: '/groups',
        name: 'groups',
        meta: { auth: true },
        component: () => import('../components/groups/Index.vue'),
    },
    {
        path: '/channel/:id',
        name: 'group-channel',
        meta: { auth: true },
        component: () => import('../components/groups/GroupChannel.vue'),
    },
    {
        path: '/chat',
        name: 'chat',
        meta: { auth: true },
        component: () => import('../components/chat/Dashboard.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    authStore.resetErrors()
    const user = localStorage.getItem('user_data')    
    if (to.meta.auth === false) {  
        if (user) {
            next({ name: 'home' });
        } else {
            next();
        }
    } else {
        if (!user && to.meta.auth === true) {
            next({ name: 'login' });
        } else {
            next();
        }
    }
});
  

export default router