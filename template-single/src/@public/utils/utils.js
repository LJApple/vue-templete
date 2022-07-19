import store from '@/store'
// 国际化字段收集列表
const COLLECT_LIST = window._COLLECT_LIST || []

// 国际化过滤器
export function lang(str) {
  const { langJson = {}} = store.state.base
  // 获取对应的国际化标签数据
  let label = langJson[str]
  // 如果国际化数据为true  true数据不为空，false数据为空
  if (!label) {
    if (!COLLECT_LIST.includes(str)) COLLECT_LIST.push(str)
  }

  return label || str || ''
}
