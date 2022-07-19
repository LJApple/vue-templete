import oldRouter from './oldRouter' // 老系统路由
// 模块名称
const routes = [
    ...oldRouter
]
export default routes.map(item => ({
    path: item.path,
    name: item.name,
    component: item.component,
    meta: item.meta
  }))
  
