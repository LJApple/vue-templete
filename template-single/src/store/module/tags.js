import { getNewVisitedViews }  from '@public/utils/store'
// 初始化缓存数据
const visitedViews = localStorage.getItem('VISITED_VIEWS') 
const handerVisitedViews = (state) =>{
     // 格式化
    const visitedViews = getNewVisitedViews(state.visitedViews)
    // 写入本地缓存
    localStorage.setItem('VISITED_VIEWS', JSON.stringify(visitedViews || '[]'))
}
const tags = {
    namespaced:true,
    state:{
        visitedViews:visitedViews ? JSON.parse(visitedViews) : [],
    },
    mutations:{
        ADD_VISITED_VIEW:(state,view = {}) => {
            if (state.visitedViews.some(v => v.name === view.name)) return 
            // 加入到tag页签
            state.visitedViews.push(Object.assign({}, view,))
            // 格式化 +  写入本地缓存
            handerVisitedViews(state)
        },
        DEL_VISITED_VIEW:(state,view) =>{
            for(const [index,item] of state.visitedViews.entries()){
                if(item.name === view.name){
                    state.visitedViews.splice(index,1)
                    handerVisitedViews(state)
                }
            }
        },
        //删除当前系统的其他tag页
        DEL_OTHERS_VISITED_VIEWS:(state,view)=>{
            state.visitedViews = state.visitedViews.filter(v => {
                return v.meta.affix || v.name === view.name
            })
            handerVisitedViews(state)
        },
        //删除全部
        DEL_ALL_VISITED_VIEWS:(state)=>{
            const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
            state.visitedViews = affixTags
            handerVisitedViews(state)
        },
        LOGIN_OUT:(state)=>{
            state.visitedViews = []
        }
    },
    actions:{
        //添加tag
        addView({ dispatch }, view){
            dispatch('addVisitedView', view)
        },
        // 添加tag页（不包括路由缓存）
        addVisitedView({ commit }, view) {
            commit('ADD_VISITED_VIEW', view)
        },
         // 删除tag页
        delView({ dispatch, state }, view){
            return new Promise(resolve=>{
                dispatch('delVisitedView', view)
                resolve({
                    visitedViews: [...state.visitedViews],
                })
            })
        },
        //删除tag页2
        delVisitedView({commit,state},view){
            return new Promise(resolve=>{
                commit('DEL_VISITED_VIEW', view)
                resolve([...state.visitedViews])
            })
        },
          // 删除路由缓存
        delCachedView({commit,state},view){
            return new Promise(resolve => {
                commit('DEL_CACHED_VIEW', view)
                resolve([...state.cachedViews])
            })
        },
        //删除其他tag
        delOthersViews({ dispatch, state }, view){
            return new Promise(resolve => {
                dispatch('delOthersVisitedViews', view)
                resolve({
                  visitedViews: [...state.visitedViews],
                })
              })
        },
        //删除其他tag页路由
        delOthersVisitedViews({ commit, state }, view){
            return new Promise(resolve => {
                commit('DEL_OTHERS_VISITED_VIEWS', view)
                resolve([...state.visitedViews])
              })
        },
        //删除所有
        delAllViews({ commit, state }){
            return new Promise(resolve=>{
                commit('DEL_ALL_VISITED_VIEWS')
                resolve([...state.visitedViews])
            })
        }

    },
    getters:{
        visitedViews: state => state.visitedViews || [],
    }
}
export default tags
