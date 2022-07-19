import * as Types from '../mutation-types'
import { Globalization } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
let lang = localStorage.getItem('lang') || 'YN'
// 获取本地国际化json
const langJsonStr = localStorage.getItem(`LangJson${lang}`) || "";
const langJson = (langJsonStr && JSON.parse(langJsonStr)) || {};
const Freight_List = 'Freight_List' //运费计算
const Receive_List = "Receive_List" //收件信息
const Sender_List = "Sender_List"//寄件信息
const CargoIn_List = "CargoIn_List"//货物信息
const CostInfo_List = "CostInfo_List"//费用信息

const base = {
    state:{
        user: JSON.parse(localStorage.getItem('userData')) || null, // 用户信息
        token: localStorage.getItem('JT_TOKEN') || '',
        lang,// 语言
        langJson, // 当前国际化JSON对象
        langList: [], // 国际化语言列表，后端获取
        tableHeight: 0,
        menu: JSON.parse(localStorage.getItem('MENU')) || null, // 系统菜单 
        routeAuthList: JSON.parse(localStorage.getItem('routeAuthList')) || null, // 系统菜单
        btnList:JSON.parse(localStorage.getItem('BTNLIST')) || {},//按钮
        freightlist: {},
        receiveList: {},
        senderList : {},
        cargoInList: {},
        costInfoList: {},
        indexBoxAlert: false, // 首页弹窗
    },
    mutations:{
      // 设置国际化
      SET_LANG: (state, data) => {
        if (data !== state.lang) {
          localStorage.setItem("lang", data);
          state.lang = data;
          location.reload();
        }
      },
      // 本地lang
      SET_DEFAULT_LANG: (state, data) => {
        localStorage.setItem("lang", data);
        state.lang = data;
      },
      // 设置国家语言列表
      SET_LANG_LIST: (state, data) => {
        state.langList = data;
      },
      // 设置国际化数据-全
      SET_LANG_JSON_ALL: (state, data) => {
        state.langJsonAll = data || {}
        localStorage.setItem('LANG_JSON_ALL', JSON.stringify(data))
      },
      // 本地langjson 数据
      SET_LANG_JSON: (state, data) => {
        state.langJson = data;
        localStorage.setItem(`LangJson${state.lang}`, JSON.stringify(data));
      },
      // 用户信息
      [Types.SET_USER]: (state, data) => {
        state.user = data
        localStorage.setItem('userData', JSON.stringify(data))
      },
      // 用户token
      [Types.SET_TOKEN]: (state, data) => {
        state.token = data
        localStorage.setItem('JT_TOKEN', data)
      },
      // 用户系统菜单
      [Types.SET_MENU]: (state, data) => {
        state.menu = data
        localStorage.setItem('MENU', JSON.stringify(data))
      },
      // 设置按钮权限
      [Types.SET_BTNLIST]:(state,data) =>{
        state.btnList = data
        localStorage.setItem('BTNLIST', JSON.stringify(data))
      },
      // 设置页面权限
      [Types.SET_PAGELIST]:(state,data) =>{
        state.routeAuthList = data
        localStorage.setItem('routeAuthList', JSON.stringify(data))
      },
      // 退出
      [Types.LOGIN_OUT]: state => {
          // 退出登录，清楚本地缓存
          localStorage.removeItem('userData')
          localStorage.removeItem('JT_TOKEN')
          localStorage.removeItem('VISITED_VIEWS')
          localStorage.removeItem('MENU') 
          localStorage.removeItem('routeAuthList')
          localStorage.removeItem('BTNLIST')
          state.token = ''
          state.user = {}
          state.freightlist = {},
          state.receiveList =  {},
          state.senderList = {},
          state.cargoInList = {},
          state.costInfoList = {}
      },
      SET_TABLE_HEIGHT: (state, data) => {
        state.tableHeight = data
      },
      Freight_List: (state, data) => {
        state.freightlist = Object.assign({},state.freightlist, data);
      },
      Receive_List: (state, data) => {
        state.receiveList = Object.assign({},state.receiveList, data);
      },
      Sender_List: (state, data) => {
        state.senderList = Object.assign({},state.senderList, data);
      },
      CargoIn_List: (state, data) => {
        state.cargoInList = Object.assign({},state.cargoInList, data);
      },
      CostInfo_List: (state, data) => {
        state.costInfoList = Object.assign({},state.costInfoList, data);
      },
      SET_BOX_ALERT: (state, data) => {
        console.log('SET_BOX_ALERT', data);
        state.indexBoxAlert = data;
      },
    },
    actions:{
         // 登录初始化
        [Types.LOGIN_INIT]({ commit } = {}, value) {
          console.log(value, 'value')
           const { user, token , menu, routeAuthList} = value
           commit('SET_USER', user)
           commit('SET_TOKEN', token)
           commit('SET_MENU',menu)
           commit('SET_PAGELIST',routeAuthList)
           commit('SET_BOX_ALERT',true)
        },
        // 退出
        [Types.LOGIN_OUT]({ commit } = {}) {
              commit('LOGIN_OUT')
              commit('tags/LOGIN_OUT', {}, {root: true})
        },
        setTableHeight: ({ commit } = {}, value) => {
            commit('SET_TABLE_HEIGHT', value)
        },
        [Types.SET_BTNLIST]({ commit } = {},value) {
          commit('SET_BTNLIST', value)
      },
        [Types.SET_PAGELIST]({ commit } = {},value) {
          commit('SET_PAGELIST', value)
        },
        [Freight_List]({ commit } = {},value) {
          commit('Freight_List', value)
        },
        [Receive_List]({ commit } = {},value) {
          commit('Receive_List', value)
        },
        [Sender_List]({ commit } = {},value) {
          commit('Sender_List', value)
        },
        [CargoIn_List]({ commit } = {},value) {
          commit('CargoIn_List', value)
        },
        [CostInfo_List]({ commit } = {},value) {
          commit('CostInfo_List', value)
        },
        // 获取国际化数据
        async getLangJSON({ commit, state } = {}) {
          return new Promise(async (resolve, reject) => {
            try {
              const { code, data, msg } = await Globalization.getLangJson()
              if (code === RESPONSE_CODE.SUCCESS) {
                if (data) {
                  const langJsonAll = data
                  const result = {}
                  let lang = 'lang3'
                  switch (state.lang) {
                    case 'CN':
                      // 中文
                      lang = 'lang1'
                      break;
                    case 'EN':
                      // 英文
                      lang = 'lang2'
                      break;
                    case 'YN':
                      // 印尼
                      lang = 'lang3'
                      break;
                    default:
                      break;
                  }
                  data.forEach(item => {
                    result[item.strId] = item[lang]
                  })
                  commit('SET_LANG_JSON', result)
                  commit('SET_LANG_JSON_ALL', langJsonAll)
                }
              } else {
                console.warn('getLangJSON::warn', code, msg)
              }
              resolve()
            } catch (error) {
              console.error('getLangJSON::error', error)
              // 特殊场景-异常之后保持程序继续运行
              resolve()
            }
          })
        },
        // 切换语言
        setLang({ commit, state } = {}, value) {
          //  本地保存当前使用的语言
          commit('SET_LANG', value)
        },
        // 页面初始化加载数据
        initData({dispatch, state} = {}) {
          // 获取国际化json
          dispatch('getLangJSON')
        },
    },
    getters: {
        user: state => state.user,
        token: state => state.token || '',
        lang: state => state.lang,
        tableHeight: state => state.tableHeight,
        menu:state => state.menu,
        btnList:state => state.btnList,
        routeAuthList:state => state.routeAuthList,
        freightlist:status => status.freightlist,
        receiveList:status => status.receiveList,
        senderList:status => status.senderList,
        cargoInList:status => status.cargoInList,
        costInfoList:status => status.costInfoList
    },

    
}
export default base
