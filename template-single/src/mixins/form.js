import { RESPONSE_CODE } from '@public/http/config'
import { mapActions, mapGetters } from 'vuex'


export default {
  data() {
    return {
      COM_HTTP: {}, // 请求
      MODULE_ROUTER: { // 路由
        listRouter: '', // 列表路由
        addRouter: '', // 列表路由
        editRouter: '', // 列表路由
        viewRouter: '', // 查看路由
        auditRouter: '' // 审核路由
      },
      fromType: 'editRouter',
      rowData: {}, // 提交参数
      keyBtn: false, // 保存loding效果
      showMsg: '确定修改该信息？',
      pageLoading: false, // 页面loading状态
    }
  },
  props: {
    id: {
      default: ''
    }
  },
  computed: {
    ...mapGetters({
      user: 'user'
    })
  },
  created() {
    if (this.id) {
      this.pageLoading = true
    }
  },
  methods: {
    ...mapActions({
      delView: 'tags/delView'
    }),
    // 表单保存前
    beforeSubmit() { },
    // 表单保存
    saveSubmit(formName, type) {
      console.log('formName', formName, this.fromType)
      // 提交前数据处理
      this.beforeSubmit()
      this.$refs[formName].validate(async valid => {
        if (valid) {
          if (this.fromType === 'editRouter') {
            // 编辑保存
            this.submitEdit()
          } else {
            // 新增保存
            this.submitForm('reqAdd', this.rowData, type)
          }
        } else {
          return false
        }
      })
    },
    // 修改信息弹窗
    submitEdit() {
      this.$confirm(this.$lang(this.showMsg), this.$lang('温馨提示'), {
        confirmButtonText: this.$lang('确定'),
        cancelButtonText: this.$lang('取消'),
        type: 'warning',
        iconClass: 'el-icon-warning-outline',
        confirmButtonClass: 'comfirm-btn',
        closeOnClickModal: false
      }).then(() => {
        const len = this.oldData ? Object.keys(JSON.parse(JSON.stringify(this.oldData))).length : 0
        const updateParams = {
          newData: this.rowData,
          oldData: this.oldData
        }
        len !== 0 ? this.submitForm('reqUpdate', updateParams) : this.submitForm('reqUpdate', this.rowData)
      })
    },
    // 提交请求（自己本地写）
    async submitForm(reqType, updateParams, type) {
      try {
        let res = {}
        this.keyBtn = true
        res = await this.COM_HTTP[reqType](updateParams)

        if (res.code !== RESPONSE_CODE.SUCCESS_COPY) {
          this.$message.warning(res.msg)
          this.keyBtn = false;
          return
        }
        if (this.fromType === 'editRouter') {
          this.updateTimer = this.$common.interfaceWaitHandle(this.goBackRefrash)
        } else {
          this.addSuccess(type)
        }
      } catch (err) {
        this.keyBtn = false;
      }
    },
    // 修改成功后返回列表页
    goBackRefrash() {
      console.log(this.MODULE_ROUTER, this.fromType, '=========')
      this.delView(this.MODULE_ROUTER[this.fromType]).then(({ visitedViews }) => {
        const pathName = this.MODULE_ROUTER.listRouter.name
        this.redirectPath(pathName)
        console.log('this.MODULE_ROUTER.listRouter.name', this.MODULE_ROUTER.listRouter.name)
        this.$bus.$emit('submit-success', this.MODULE_ROUTER.listRouter.name)
        this.$message.success(this.$lang('保存成功'))
      })
      this.keyBtn = false;
    },
    // 新增成功后询问弹窗
    addSuccess(type) {
      if (type) {
        // 保存并新增一条
        this.keyBtn = false;
        this.delView(this.MODULE_ROUTER[this.fromType]).then(({ visitedViews }) => {
          const pathName = this.MODULE_ROUTER.addRouter.name
          this.redirectPath(pathName)
          this.$bus.$emit('submit-success', this.MODULE_ROUTER.listRouter.name)
        })
      } else {
        // 保存
        this.updateTimer = this.$common.interfaceWaitHandle(this.goBackRefrash)
      }
    },
    // 跳转url
    redirectPath(pathName) {
      this.$nextTick(() => {
        this.$router.push({
          name: pathName
        })
      })
    },
    // 取消保存
    cancelSubmit() {
      this.$confirm(this.$lang('确定不保存数据情况下返回吗?'), this.$lang('温馨提示'), {
        iconClass: 'el-icon-warning-outline',
        confirmButtonText: this.$lang('确定'),
        cancelButtonText: this.$lang('取消'),
        confirmButtonClass: 'comfirm-btn',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.delView(this.MODULE_ROUTER[this.fromType]).then(({ visitedViews }) => {
          this.$router.push(this.MODULE_ROUTER.listRouter)
        })
      })
    },
    /*
     *@Description: 对应跳转路由
     *@param {arg} type
     *@param {arg} operationType 对应
    */
    routeDefs(moduleName, operationType = '', params = {}) {
      return { name: `${moduleName}${operationType}`, path: `/${moduleName}${operationType}`, params: params }
    }
  },
  destroyed() {
    this.$bus.$off('routeChange')
    clearTimeout(this.updateTimer)
  }
}
