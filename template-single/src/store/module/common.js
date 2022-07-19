const themeLocal = localStorage.getItem('preTheme')
const common = {
  state: {
    nowThemeInfo: themeLocal ? themeLocal + '-theme' : 'default-theme', // 当前主题
    nowTheme: themeLocal || 'default'
  },
  mutations: {
    SET_THEMEINFO(state, theme) {
      state.nowThemeInfo = theme + '-theme'
      console.log(state.nowThemeInfo);
    },
    SET_THEME(state, theme) {
      state.nowTheme = theme
    }
  },
  actions: {
    set_themeInfo({ commit }, value) {
      window.document.body.setAttribute('data-theme', value + '-theme')
      localStorage.setItem('preTheme', value)
      commit('SET_THEMEINFO', value)
      commit('SET_THEME', value)
    }
  },
  getters: {
    nowThemeInfo: state => state.nowThemeInfo
  }
}

export default common
