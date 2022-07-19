import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import routes from './modules/layout'

Vue.use(VueRouter)
const vm = new Vue()
const router = new VueRouter({
    // baseurl: 'test',
    // mode: '/history',
    routes
})
router.beforeEach((to, from, next) => {
    const { routeAuthList } = store.state.base
    if (store.getters.token && routeAuthList) {
        const pos = routeAuthList.indexOf(to.name) > -1
        console.log(pos, 'pos')
        // if(!pos){
        //     vm.$message.warning('没有访问该页面权限')
        //     next({name: 'login'})
        // }
        if(pos || to.name === 'index' || to.name === 'ActiveMail'){
            next()
        }else {
            // 判断是否重定向页 是否在路由权限列表 是否首页
            if (to.path.indexOf('/redirect') === -1 && !pos && to.name !== 'index') {
                vm.$message.warning(vm.$lang('没有访问该页面权限'))
                next({
                    redirect: true,
                    name: 'index'
                })
            } else {
                return
            }
        }
        //  有systemName代表不是白名单的
    } else {
        if (to.name !== 'Login') {
            if (['ForgetPassword'].includes(to.name)) {
                next()
              } else if (['ActiveMail'].includes(to.name)) {
                next()
              } else {
                next({
                        name: 'Login'
                    });
              }
        }else {
           next()
        }
    }
})

export default router
