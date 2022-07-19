// 基础路由
import routerArr from './index'
const Redirect = () => import( /* webpackChunkName: "layout" */ '@/views/layout/Redirect.vue')
export default [
    {
        path: '/',
        redirect: '/login',
        component: () => import('@/views/login/Login.vue')
    },
    // 登录
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/Login.vue')
    },
    {
        path: '/forgetPassword',
        name: 'ForgetPassword',
        component: () => import('@/views/login/ForgetPassword.vue')
    },
    {
        path: '/activeMail',
        name: 'ActiveMail',
        component: () => import('@/views/login/ActiveMail.vue')
    },
    // 刷新空白页
    {
        path: '/redirect',
        name: 'redirect',
        component: () => import('@/views/layout/Layout.vue'),
        children: [{
            path: '/redirect/:path*',
            component: Redirect
        }]
    },
    {
        path: '/',
        redirect: '/',
        component: () => import('@/views/layout/Layout.vue'),
        children: [
            ...routerArr
        ]
    }
]