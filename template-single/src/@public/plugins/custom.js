/*
* @desc 将第三方插件注册到Vue原型中，组件内可直接使用 this.xxx来调用组件
* @update --
*/
import { bus} from '../utils/common'
import * as filters from '@public/utils/filters.js'
import getLodop from './lodopFuncs'

export default {
  customPlugin: {
    install (Vue, options) {
      // 将第三方插件注册到Vue原型中，组件内可直接使用 this.xxx来调用组件
      Object.assign(Vue.prototype, {
        $bus: bus,
        $lang: filters.lang,
        $getLodop: getLodop
      })
    }
  }
}
