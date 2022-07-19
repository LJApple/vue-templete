import Vue from 'vue'
import Vuex from 'vuex'
import base from './module/base'
import tags from "./module/tags"
import common from './module/common'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    base,
    tags,
    common
  }
})
