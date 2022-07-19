import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import resetMessage from '@/@public/utils/resetMessage';
import * as Api from '@/api'
import * as filters from '@public/utils/filters.js'
import { lang } from '@public/utils/utils.js'
import plugins from '@public/plugins/index'
import { Util } from '@/utils/utils.js'
// Avue组件库
import Avue from './components/avuex/index'
//引入样式
import '@/assets/style/reset.scss'
import('element-ui/lib/theme-chalk/index.css')
// 整体样式
import('./assets/style/index.scss')
// 图标库
import('./assets/iconfont/iconfont')
// avue样式
import('./components/avuex/styles/index.scss')
Object.keys(filters).forEach(key => Vue.filter(key, filters[key]))
// 设置elementUI版本
Util.setElVersion(store, Vue)
// 注册插件
plugins.install()
// 国际化内部实现
Vue.prototype.$lang = lang
//弹框不显示多个
Vue.prototype.$message = resetMessage
// 使用avue
Vue.use(Avue);
// 挂载全局api
Vue.prototype.$API = Api
store.dispatch('initData')
// 设置默认皮肤
window.document.body.setAttribute('data-theme', localStorage.getItem('preTheme') ? localStorage.getItem('preTheme') + '-theme' : 'default-theme')
new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
