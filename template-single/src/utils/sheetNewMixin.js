/*
 * @Author: hongye
 * @Description: 电子面单  新  搜索条件处理
 */
import {  OrderManageController } from '@/api'

export default {
  methods: {
    // 列表查询参数处理 后置处理器
    searchFunParamsHandle_after(params) {
      return params;
    },
    // 列表查询参数处理
    searchFunParamsHandle(params) {
      let param = {} // 接口参数

      if (this.canUsePrevListParam) {
        if (this.page.current !== this.prevListParams.current) {
          this.prevListParams.current = this.page.current
        }
        if (this.page.size !== this.prevListParams.size) {
          this.prevListParams.size = this.page.size
        }
        param = this.prevListParams
      } else {
        const setp = this.setSearchParams({}) || {} // 无效返回值则使用空对象，避免Object.assign造成异常
        param = Object.assign({ current: this.page.current, size: this.page.size }, params, setp)
        this.prevListParams = param
        this.canUsePrevListParam = true // 记录后更新状态
      }
      if (typeof this.searchFunParamsHandle_after === 'function') {
        // 后置处理器
        param = this.searchFunParamsHandle_after(param)
        // 若返回 false 直接跳出查询
        if (!param) return false;
        param = Object.assign({ current: this.page.current, size: this.page.size }, param)
      }
      /*  新面单搜索列表添加count参数  */
      // 搜索添加 count 属性
      if (this.page.current > 1 && this.page.total) {
        param.count = this.page.total
      } else {
        // 删除 count 属性
        delete param.count;
      }
      // 添加参数字符串空过滤
      let para = {}
      // 使用空参数过滤
      if (this.useFilterEmptyParam) {
        Object.entries(param).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) para[key] = value
        })
      } else {
        para = param
      }
      console.log(para, '过滤数据')
      return para
    },
    outExcelList(res) {
      // 根据当前路由设置确定文件名
      const filename = this.$lang(this.$route.meta.title) + '.xls'
      // 兼容IE的写法
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        window.navigator.msSaveOrOpenBlob(res, filename)
      } else {
        // 现代浏览器通用写法
        // 返回的数据已经是blob对象，所以无需使用new Blob([res])进行再次转换，直接创建url
        const url = window.URL.createObjectURL(new Blob([res]))
        // 创建a标签
        const elink = document.createElement('a')
        // 设置a标签隐藏
        elink.style.display = 'none'
        // 设置a标签的链接属性为url
        elink.href = url
        // 给a标签添加下载属性download （重要）
        elink.setAttribute('download', filename)
        // 添加a标签到文档节点
        document.body.appendChild(elink)
        // 触发a标签点击
        elink.click()
        // 释放URL对象
        URL.revokeObjectURL(elink.href)
        // 移除刚穿件的a标签
        document.body.removeChild(elink)
      }
    }
  }
}
