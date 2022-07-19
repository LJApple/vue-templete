import { RESPONSE_CODE } from '@public/http/config'
import { hasPower, interfaceWaitHandle } from '@public/utils/common'
import { mapGetters, mapActions } from 'vuex'
import { TIMEOUT_TIMES } from "@public/utils/const"
import { saveAs } from 'file-saver'
import XLSX from 'xlsx'
import axios from 'axios';

export default {
  data() {
    return {
      COM_HTTP: {},
      MODULE_ROUTER: {},
      selectedRows: [], // 当前选中行（复选框）
      loading: false, // 加载控制
      exportLoading: false, //  导出
      isShowFirst: true, // 是否一开始加载表格数据
      usePagination: true, // 是否需要分页
      page: {
        current: 1,
        size: 20,
        total: 0
      }, // 对应的分页
      tableList: [], // 表格列表数据
      delTipMsg: '确认删除该条信息？', // 删除提示语
      moduleName: this.$route.name, // 当前模块名称
      IdKey: 'id', // 当是编辑时-路由带的参数id
      dialogWidth: '', // 判断当前弹窗是多少列 现在我们规定时间三列或者四列
      userInfo: {}, // 用户信息-没用到 关于用户信息可用下面computed方法 this.user即是用户信息
      useFilterEmptyParam: false, // 是否使用过滤空参数 默认为false-不过滤，可在组件内重新定义覆盖此字段
    }
  },
  watch: {
    // '$route'() {
    //   this.loading = false
    // }
  },
  // 缓存组件-进入页面的钩子
  activated() {
  },
  computed: {
    ...mapGetters({
      user: 'user',
      visitedViews: 'tags/visitedViews'
    })
  },
  mounted() {
    if (this.isShowFirst) {
      this.$nextTick().then(res => {
        this.searchFun()
      })
    }
  },
  created() {
    this.initMixinParams()
    this.addListener()
    this.witdhLisener()
  },
  methods: {
    ...mapActions({
      delView: 'tags/delView',
      setSelectedId: 'setSelectedId'
    }),
    // tag为活动
    isActive(route) {
      return route.path === this.$route.path
    },
    toLastView(visitedViews) {
      const latestView = visitedViews.pop()
      // 设置了首页不可能删除 所以latestView一直存在
      if (latestView) {
        this.$router.push(latestView)
      } else {
        this.$router.push({ path: '/' })
      }
    },
    /**
     * @description 标签删除
     */
    removeTag(targetName) {
      console.log(targetName, 'view1')
      const tabs = this.visitedViews
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          this.closeSelectedTag(tabs[index])
        }
      })
    },
    /**
     * @description 标签删除2
     */
    closeSelectedTag(view) {
      console.log(view, 'view2')
      this.delView(view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    // 获取弹窗宽度
    witdhLisener() {
      this.isWideScreen = matchMedia('(max-width: 1440px)')
      this.widthChange(this.isWideScreen)
      // 监听窗口宽度事件（组件销毁后需移除）
      this.isWideScreen.addListener(this.widthChange)
    },
    widthChange(x) {
      this.dialogWidth = x.matches ? '720px' : '940px' // 小于1440 : 大于1440
    },
    // 初始化mixin的参数
    initMixinParams() {
      this.canUsePrevListParam = false // 是否记录列表的表单参数
      this.prevListParams = {} // 前一次搜索组件的表单参数
    },
    // 混入自定义增加参数
    setAddParams(params) { // avue新增时候 可以加入自定义参数
      return params
    },
    // 混入自定义查询参数
    setSearchParams(params) { // avue查询时候 可以加入自定义参数
      return params
    },
    // 混入自定义修改状态参数
    setEnableParams(params) { // 以前的业务类型 现在基本用不上(以前的禁用启用，在表格中显现)
      return params
    },
    // 查询成功之后调用
    searchAfterFun() { }, // 查询成功调用的方法
    // 新增tab页面
    rowAdd() { // 自定义新增调用方法
      this.$router.push(this.MODULE_ROUTER.addRouter)
    },
    // 自定义编辑调用方法
    rowEdit(row) {
      this.setSelectedId(row[this.IdKey])
      console.log(Object.assign(this.MODULE_ROUTER.editRouter, { params }), '============')
      const params = { id: row[this.IdKey] }
      this.delView(this.MODULE_ROUTER.editRouter).then(({ visitedViews }) => {
        this.$router.push(Object.assign(this.MODULE_ROUTER.editRouter, { params }))
      })
    },
    // 自定义查看tab页面
    rowView(row) {
      console.log(row)
      this.setSelectedId(row[this.IdKey])
      const params = { id: row[this.IdKey] }
      this.delView(this.MODULE_ROUTER.viewRouter).then(({ visitedViews }) => {
        this.$router.push(Object.assign(this.MODULE_ROUTER.viewRouter, { params }))
      })
    },
    // avue-新增方法
    async addFun(item, done, loading) {
      const setp = this.setAddParams({})
      const newParams = Object.assign(item, setp)
      const res = await this.COM_HTTP.reqAdd(newParams)
      loading && loading()
      if (res.code === RESPONSE_CODE.SUCCESS) {
        interfaceWaitHandle(() => {
          this.$message.success(res.msg)
          this.searchFun()
          done()
        })
      } else {
        this.$message.error(res.msg)
        // done() //去掉关闭
      }
    },
    // avue-保存并新增下一条 对应属性 saveCreate: true
    async saveCreate(form, clean, loading) {
      this.addFun(form, clean, loading)
    },
    // avue-编辑方法
    async updateFun(item, index, done, oldFormData, loading) {
      const setp = this.setAddParams({})
      const newParams = Object.assign(item, setp)
    //   const params = { newData: newParams, oldData: oldFormData }
      const params = newParams
      const res = await this.COM_HTTP.reqUpdate(params)
      loading()
      if (res.code === RESPONSE_CODE.SUCCESS) {
        // 延时1秒后关闭弹窗
        interfaceWaitHandle(() => {
          this.$message.success(res.msg)
          this.searchFun()
          done()
        })
      } else {
        this.$message.error(res.msg)
      }
    },
    // 删除提示弹窗前置方法
    beforeDelteView(row) {
    
    },
    // avue-删除提示弹窗
    async deleteView(row, index) {
      this.beforeDelteView(row)
      const delTipMsg = this.customDelMsg || this.delTipMsg || ''
      this.$confirm(this.$lang(delTipMsg), this.$lang('温馨提示'), {
        confirmButtonText: this.$lang('确定'),
        cancelButtonText: this.$lang('取消'),
        closeOnClickModal: false,
        customClass: 'common-confirm__topbar',
        confirmButtonClass: 'comfirm-btn',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            // 保存改弹窗的实例/回调到当前vue实例，用于后续关闭弹窗
            this.delConfirmInstance = instance
            this.delConfirmDone = done
            // 开始删除
            this.deleteFun(row)
          } else {
            done()
          }
        }
      }).then(async() => {}).catch()
    },
    // 删除方法
    async deleteFun(item) {
      console.log('deleteFun', item);
      try {
        const res = await this.COM_HTTP.reqDel(item)
        if (res.code === RESPONSE_CODE.SUCCESS) {
          // 延时1秒后关闭弹窗
          interfaceWaitHandle(() => {
            this.closeDelModal()
            this.$message.success(res.msg)
            this.searchFun()
            this.$emit('delete', item)
          })
        } else {
          this.$message.error(res.msg)
          this.closeDelModal()
        }
      } catch (error) { 
        this.closeDelModal()
      }
    },
    closeDelModal() {
      this.delConfirmInstance.confirmButtonLoading = false
      this.delConfirmDone()
    },
    // avue配置的prop包含range的属性处理(已经废弃-以前时间控件处理方法)
    rangHandle(params) {
      const nParams = {}
      // 处理时间段的参数 数组变为两个参数  StartTime 和 EndTime  写prop时就可以 xxx|range
      Object.entries(params).forEach(([key, val]) => {
        const flag = '|range'
        if (!this.validatenull(val)) {
          if (key.includes(flag)) {
            const [first, second] = val
            const str = key.replace(flag, '')
            const startName = str ? str + 'StartTime' : 'startTime'
            const endName = str ? str + 'EndTime' : 'endTime'
            nParams[startName] = first
            nParams[endName] = second
          } else {
            nParams[key] = val
          }
        }
      })
      return nParams
    },
    // 列表查询参数处理
    searchFunParamsHandle(params) {
      let param = {} // 接口参数
      if (this.canUsePrevListParam) {
        if (this.page.current !== this.prevListParams.current) {
          this.prevListParams.current = this.page.current
          this.prevListParams['page'] = this.prevListParams.current;
          delete this.prevListParams.current;
        }
        if (this.page.size !== this.prevListParams.size) {
          this.prevListParams.size = this.page.size
        }
        param = this.prevListParams
      } else {
        const setp = this.setSearchParams({}) || {} // 无效返回值则使用空对象，避免Object.assign造成异常
        param = Object.assign({ current: this.page.current, size: this.page.size }, params, setp)
        // param = Object.assign({ page: this.page.current, size: this.page.size }, params, setp)
        console.log('param',param)
        // param.current = page
        // console.log('param',param)
        this.prevListParams = param
        this.canUsePrevListParam = true // 记录后更新状态
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
      return para
    },
    // avue-触发按钮查询
    searchChange(params) {
      this.canUsePrevListParam = false
      this.searchFun(this.rangHandle(params), 1)
    },
    // avue-查询方法
    async searchFun(params, current) {
      this.loading = true
      if (typeof this.searchFunBefore === 'function') {
        const state = this.searchFunBefore()
        if (!state) {
          this.loading = false
          return
        }
      }
      // avue-crud的ref名称是params
      if (!params && this.$refs.hasOwnProperty('params')) {
        params = this.rangHandle(this.$refs.params.searchForm)
      }
      // 传入参数有current
      if (current) {
        this.page.current = current
      }
      const param = this.searchFunParamsHandle(params)
      if (param === false) {
        this.loading = false
        return
      }

      // 添加超时清除loading状态的定时器
      const timeState = setTimeout(() => {
        if (this.loading) this.loading = false
      }, TIMEOUT_TIMES)
      try {
        const res = await this.COM_HTTP.reqList(param)
        // 清除超时定时器
        clearTimeout(timeState)
        this.loading = false
        this.pageLoading = false
        if (res.code === RESPONSE_CODE.SUCCESS) {
          if (this.usePagination) {
            this.tableList = res.data ? (this.formatList ? this.formatList(res.data) : res.data.records) : []
            this.page.total = res.data.total || 0
            this.page.current = res.data.current || 1
          } else {
            this.tableList = this.formatList ? this.formatList(res.data) : res.data.records|| []
          }
          this.searchAfterFun()
        } else {
          this.$message.error(res.msg)
        }
      } catch (error) {
        console.error('searchFun::error', error);
        // 清除超时定时器
        clearTimeout(timeState)
        this.loading = false
        this.pageLoading = false
      }
    },
    getParamForOutExcel() {
      return
    },
    // 导出方法
    async outExcel(excelType, filenameRename) {
      // 获取参数
      const param = this.getParamForOutExcel()
      if (this.COM_HTTP.reqList) {
        this.searchFun(param)
      }
      if (typeof excelType === 'number' && !isNaN(excelType)) {
        param.excelType = excelType
        param.exportType = excelType
      }
      // 启用加载中状态
      this.loading = true
      // console.log('outExcel::params', param)
      // 调用导出api
      const res = await this.COM_HTTP.reqExcel(param)
      // 关闭加载中状态
      this.loading = false
      // 如果有返回体
      if (res) {
        const enc = new TextDecoder('utf-8')
        let errorData = { code: null }
        try {
          errorData = JSON.parse(enc.decode(new Uint8Array(res))) // 转化成json对象
        } catch (error) {
          // errorData.code = null
        }
        // 提示异常
        if (res.fail) {
          this.$message.error(res.msg)
        } else if (errorData.code) {
          this.$message.error(errorData.msg)
        } else {
          // 根据当前路由设置确定文件名
          const filename = (filenameRename || this.$lang(this.$route.meta.title)) + '.xls'
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
    },
    // 导出-new
    exportExcel(name) {
      // 排除 EventObject
      const refName = typeof name === 'string' ? name : 'params'
      // 获取当前crud组件实例
      const crud = this.$refs[refName].$el
      // 创建div元素容器
      const div = document.createElement('div')
      // 获取crud组件下表格头部的dom节点
      let header = crud.querySelector('.el-table__header-wrapper')
      // 获取crud组件下表格主体的dom节点
      let body = crud.querySelector('.el-table__body-wrapper')
      // 初始化表格头部的复选框列表
      let checkboxsHeader = []
      // 初始化表格主体的复选框列表
      let checkboxsBody = []
      // 如果表格头部存在
      if (header) {
        // 深拷贝表格头部节点（避免操作dom影响原来的dom）
        header = header.cloneNode(true)
        // 查找表格头部下所有复选框的节点
        checkboxsHeader = header.querySelectorAll('.el-table-column--selection')
      }
      if (body) {
        // 深拷贝表格主体节点（避免操作dom影响原来的dom）
        body = body.cloneNode(true)
        // 查找表格主体下所有复选框的节点
        checkboxsBody = body.querySelectorAll('.el-table-column--selection')
      }
      // 把表格中的复选框节点转换成数组
      const list = [...checkboxsHeader, ...checkboxsBody]
      // 遍历移除掉表格中的复选框节点
      list.forEach(item => item.remove())
      // 把处理过的头部|主体节点都添加到dev容器
      div.appendChild(header)
      div.appendChild(body)
      // 调用table转excel的方法 raw-不自动加工数据格式
      const wb = XLSX.utils.table_to_book(div, { raw: true })
      // 移除掉容器节点（避免内存占用）
      div.remove()
      // 把表格数据写入流
      const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
      try {
        const name = this.excelName || this.$route.meta.title
        // 下载
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), name + '.xlsx')
      } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
      // return wbout
    },
    // 启用禁用提示弹窗(已经弃用)
    async enableView(val, row) {
      const PopText1 = this.$lang(val === 1 ? '启用' : '禁用')
      const PopText2 = this.$lang('确定' + PopText1 + '该信息?')
      this.$confirm(PopText2, this.$lang('温馨提示'), {
        confirmButtonText: this.$lang('确定'),
        cancelButtonText:this.$lang('取消'),
        iconClass: 'el-icon-warning-outline',
        confirmButtonClass: 'comfirm-btn',
        type: 'warning'
      })
        .then(async () => {
          this.loading = true
          const setp = this.setEnableParams({})
          const reqParams = Object.assign({}, row, setp)
          row.isEnable = row.isEnable === 1 ? 2 : 1
          const params = {
            newData: reqParams,
            oldData: row
          }
          const { code, msg } = await this.COM_HTTP.reqUpdate(params)
          if (code === RESPONSE_CODE.SUCCESS) {
            this.searchFun()
            this.$message.success(msg)
          } else {
            this.$message.error(msg)
          }
          this.loading = false
        })
        .catch(() => {
          row.isEnable = row.isEnable === 1 ? 2 : 1
        })
    },
    // avue-选择分页条数
    sizeChange(val) {
      this.page.current = 1
      this.page.size = val
      this.searchFun()
    },
    // avue-跳转页码
    currentChange(val) {
      this.page.current = val
      this.searchFun()
    },
    // avue-重置方法回调重置页码(尽量不要用)
    resetList() {
      // this.page.current = 1
      // this.searchFun()

    },
    // avue-刷新表格
    refreshList() {
      // 清空选中的数据
      this.$refs.params && this.$refs.params.selectClear()
      // 重置页码
      this.page.current = 1
      // 请求数据
      this.searchFun()
    },
    /*
     *@Description: 按钮权限判断有权限
     *@param {arg} type
     *@return [type]
     *@Date: 2019-07-03 10:56:08
     */
    hasPower(type) {
      return hasPower(this.moduleName, type)
    },
    /*
     *@Description: 对应跳转路由
     *@param {arg} type
     *@param {arg} operationType 对应
     */
    routeDefs(moduleName, operationType, params = {}) {
      return { name: `${moduleName}${operationType}`, path: `/${moduleName}${operationType}`, params: params }
    },
    /*
     *@Description: 订阅更新列表的事件
     *@param {arg} type
     *@return [type]
     *@Date: 2019-07-25 20:53:53
     */
    addListener() {
      // 使用场景： 当是一个新开的tab时：需要调用 （this.$bus.$emit('submit-success', 'staffInfoManage') 第二个参数对应类表的路由）可以强制刷新缓存的页面
      this.$bus.$on('submit-success', name => {
        if (this.moduleName === name) {
          setTimeout(() => { this.refreshList() }, 0)
        }
      })
    },
    // 操作平台专用：运单号双击跳转到快件跟踪查询
    dbclickWaybillToSearch(waybillId) {
      this.$router.push({ name: 'trackingExpress', params: { waybillId }})
    },
    // 
    async exportExcelNew (url, opt, method) {
      let fileUrlNew = ''
      method = method || 'POST';
      let data = new FormData();
        // formData提交
        Object.keys(opt).forEach(v => {
          data.append(v, opt[v]);
      });
      await axios({
        method,
        headers: {
          authToken: localStorage.getItem('JT_TOKEN') || '',
          'Content-Type': 'multipart/form-data'
        },
        url,
        data
      }).then(res => {
        const { fileUrl = '' }  =res.data.data
        fileUrlNew = fileUrl
      }).catch(err => {
        console.log(err)
      })
      return fileUrlNew
    }
  },
  /*
   *@Description: 取消订阅事件
   *@param {arg} type
   *@return [type]
   *@Date: 2019-07-25 21:09:54
   */
  destroyed() {
    this.$bus.$off('submit-success')
    this.isWideScreen.removeListener(this.widthChange)
    this.loading = false
  }
}
