'use strict'

/**
 * 转换名称首个字母为大写
 * @param { String } name 需要转换的名称
 */
export const nameToUpperCase = name => name.charAt(0).toUpperCase() + name.substr(1)

/**
 * 获取新的访问路由
 * @param {*} tabViews tabs tabs标签页路由列表
 */
export const getNewVisitedViews = tabViews => {
    return tabViews.map(item => {
      const { name, path, fullPath, meta } = item
      return {
        name,
        path, 
        fullPath,
        meta: { ...meta },
      }
    })
  }
