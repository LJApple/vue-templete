/*
 * @Description: http请求封装
 */
import axios from 'axios'
import router from '@/router/index'
import store from '@/store'
import Vue from 'vue'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' // 是否开发环境
const self = new Vue();
// 创建axios实例
const service = axios.create()
// 设置请求的基础路径
service.defaults.withCredentials = true
// service.defaults.baseURL = 'https://test-jk.jet.co.id/yl-indonesia-vip/vip'
service.defaults.baseURL = IS_DEVELOPMENT ? '/proxyUrl' : process.env.VUE_APP_API_URL // 开发环境使用反向代理
// 超时时间
service.defaults.timeout = 80000
// request拦截器
service.interceptors.request.use(config => {
  // 获取vuex的token
  const { token = '' } = store.getters
  let lang = localStorage.getItem('lang') || store.getters.lang
  const langList = [{lang: 'CN', value: 'zh_CH'}, {lang: 'EN', value: 'en_US'}, {lang: 'YN', value: 'in_ID'}]
  const obj = langList.find(item => item.lang === lang)
  if (obj) lang = obj
  config.data = config.data || {}

  // 获取当前路由名称
  const routeName = router.history.current.name
  // 设置请求头authToken
  config.headers.authToken = token
  // 设置请求头语言
  config.headers.language = lang
  // 设置请求头routeName
  config.headers.routeName = routeName
  //  设置了缓存，如果请求参数没变又要实时返回，请在请求后面加时间戳
  config.headers['Cache-Control'] = 'max-age=2, must-revalidate'
  return config
}), error => {
  return Promise.reject(error)
}

// respone拦截器
service.interceptors.response.use((response) => {
  if (response.status === 200) {
    var res = response.data
    if (response.data.code === 149010008) {
      store.dispatch('LOGIN_OUT').then(() => {
        router.push({ name: 'Login' })
        // self.$message.error('没有访问权限，请重新登录')
      })
    }
    // else if(response.data.code === 500){
    //   store.dispatch('LOGIN_OUT').then(() => {
    //     router.push({ name: 'Login' })
    //   })
    // }
    return res
  }
}, error => {
  try {
    console.log('error.response',error.response.data.code)
    if(error.response.data.code === 500 ){
      self.$message.error(self.$lang(error.response.data.msg))
      // store.dispatch('LOGIN_OUT').then(() => {
      //   router.push({ name: 'Login' })
      //   return Promise.reject(error)
      // })
    }
    if (error.response.data.code === 401 || error.response.data.code === 403) {
      store.dispatch('LOGIN_OUT').then(() => {
        self.$message.error(self.$lang(error.response.data.msg))
        setTimeout(() => {
          // 退出
          localStorage.removeItem('account')
          router.push({ name: 'Login' })
        }, 3000)
      })
    }
  } catch (err) {
    
  }
  
})
export const get = (url, params) => service.get(url, { params })
export const post = service.post
export const put = service.put
export const del = service.delete

export default service
