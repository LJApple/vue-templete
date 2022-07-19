import Vue from 'vue'
import VueI18n from 'vue-i18n'
// import locale from 'element-ui/lib/locale'
import langs from './langs'
import store from '@store'
import * as constants from '@public/utils/const'

Vue.use(VueI18n)

const lang = constants.LANG_ELEMENT_MAP[store.state.base.lang]
const i18n = new VueI18n({
  locale: lang || process.env.VUE_APP_I18N_LOCALE || 'zh-cn', // 初始未选择默认 en 英文
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'zh-cn',
  messages: { ...langs }
})

// locale.i18n((key, value) => i18n.t(key, value)) // 兼容element
export default i18n
