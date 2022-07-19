<!--
 * @Description: 权限设置
 * @Author: JX
 * @Date: 2021-07-12 10:49:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-18 17:34:24
-->
<template>
  <div class="authorityManagement">
    <div class="main-css" v-show="!authVisible">
      <avue-crud
        ref="params"
        :data="tableList"
        :page="page"
        :option="listOpt"
        :tableLoading="loading"
        @size-change="sizeChange"
        @current-change="currentChange"
        @search-change="searchChange"
      >
        <template slot="menuLeft">
          <div class="headBox">
            <el-button @click="authView('ADD', {})">{{ $lang('新增用户') }}</el-button>
          </div>
        </template>
        <template slot="menu" slot-scope="scope">
          <div class="menuSlot">
            <span @click="authView('EDIT', scope.row)"><i class="iconfont icon-icon_bianji"></i></span>
            <span @click="resetView(scope.row.loginCode)"><i class="iconfont icon-icon_zhongzhimima"></i></span>
            <span @click="deleteView(scope.row.loginCode)"><i class="iconfont icon-icon_shanchu"></i></span>
          </div>
        </template>
      </avue-crud>
      <el-dialog :title="$lang('重置密码')" width="720px" :visible.sync="resetPassword" v-if="resetPassword" :close-on-click-modal="false">
        <el-form class="passwod-ruleForm" ref="passwordForm" :rules="rules" :model="passwordData" label-position="right" label-suffix=" :">
          <div class="inputBox">
            <el-form-item :label="$lang('密码')" prop="newPassword">
              <!-- <el-input v-model="passwordData.newPassword" class="el-input-new" show-password></el-input> -->
              <el-input v-model="passwordData.newPassword" class="el-input-new" :type="passwordType" @blur="onBlur">
                <i slot="suffix" class="iconfont" :class="passwordIcon" @click="changePasswordType(passwordData.newPassword)" v-if="passwordData.newPassword"></i>
              </el-input>
            </el-form-item>
          </div>
          <div class="inputBox">
            <el-form-item :label="$lang('确认密码')" prop="confirmPassword">
              <!-- <el-input v-model="passwordData.confirmPassword" class="el-input-new" show-password></el-input> -->
              <el-input v-model="passwordData.confirmPassword" class="el-input-new" :type="passwordTypeTwo" @blur="onBlurTwo">
                <i slot="suffix" class="iconfont" :class="passwordIconTwo" @click="changePasswordTypeTwo(passwordData.confirmPassword)" v-if="passwordData.confirmPassword"></i>
              </el-input>
            </el-form-item>
          </div>
          <div class="dialog-footer">
            <el-button @click="cancelSave">{{ $lang('取消') }}</el-button>
            <el-button type="primary" class="butSuss" :loading="saveLoading" @click="resetPass()">{{ $lang('保存') }}</el-button>
          </div>
        </el-form>
      </el-dialog>
    </div>
    <!-- 权限弹框 -->
    <div v-if="authVisible">
      <div class="back-to-list">
        <span @click="closedCallback" class="back-to-list_click"><span class="iconfont icon-tongyong-fanhui" style="margin-right: 8px"></span> {{ $lang('返回上一页') }}</span>
      </div>
      <div class="edit-content" v-loading="authLoading">
        <!-- <div class="content-title">{{authDialogText}}</div> -->
        <div class="dialogContent">
          <div class="contentLeft">
            <p class="authority_title">{{ $lang('用户信息') }}</p>
            <el-form class="demo-ruleForm" ref="authForm" :rules="rules" :model="authRowData" label-position="right" label-suffix=" :">
              <el-form-item :label="$lang('登录账号')" prop="loginCode">
                <el-input class="el-input-new" v-model="authRowData.loginCode" :disabled="true"></el-input>
              </el-form-item>
              <el-form-item :label="$lang('密码')" prop="loginPassword" v-if="authDialogType === 'ADD'" class="loginPassword">
                <el-input v-model="authRowData.loginPassword" class="el-input-new" :type="passwordType" @blur="onBlur">
                  <i slot="suffix" class="iconfont" :class="passwordIcon" @click="changePasswordType(authRowData.loginPassword)" v-if="authRowData.loginPassword"></i>
                </el-input>
              </el-form-item>
              <el-form-item :label="$lang('姓名')" prop="name">
                <el-input v-model="authRowData.name" class="el-input-new" maxlength="50"></el-input>
              </el-form-item>
              <el-form-item :label="$lang('联系方式')" prop="mobile">
                <el-input v-model="authRowData.mobile" class="el-input-new" :onkeyup="(authRowData.mobile = authRowData.mobile.replace(/[^\d+]/g, ''))"></el-input>
              </el-form-item>
              <el-form-item :label="$lang('查看订单')" prop="queryRule">
                <el-select v-model="authRowData.queryRule" size="medium" :placeholder="$lang('请选择')" class="el-select-new">
                  <el-option v-for="item in queryRuleList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$lang('邮箱')" prop="mail">
                <el-input v-model="authRowData.mail" class="el-input-new" maxlength="50"></el-input>
              </el-form-item>
              <el-form-item :label="$lang('备注')" prop="note">
                <el-input type="textarea" v-model="authRowData.note" maxlength="100" show-word-limit :placeholder="$lang('请输入备注')" autocomplete="off" class="el-input-new">
                </el-input>
              </el-form-item>
              <el-form-item class="switchLady" :label="$lang('启用状态')" prop="state">
                <el-switch v-model="authRowData.state" :active-value="1" :inactive-value="0" active-color="#E60012" inactive-color="#9499A3"></el-switch>
              </el-form-item>
            </el-form>
          </div>
          <div class="contentRight">
            <p class="authority_title">{{ $lang('权限设置') }}</p>
            <div class="authority">
              <!-- 这里要为了样式改造 -->
              <el-tree
                :data="lisData"
                show-checkbox
                default-expand-all
                node-key="resourceCode"
                ref="tree"
                highlight-current
                :props="defaultProps"
                class="authorityTree tree-line"
                @check="checkClick"
                :index="0"
                :check-strictly="true"
              >
              </el-tree>
            </div>
          </div>
        </div>
      </div>
      <div class="edit-footer-buttons">
        <div class="dialog-footer dialog-footerNew">
          <el-button @click="cancelcall">{{ $lang('取消') }}</el-button>
          <el-button type="primary" class="butSuss" :loading="saveLoading" @click="saveAdd()">{{ $lang('保存') }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import { DICT } from '@/@public/utils/dict'
import { RULES } from '@/@public/utils/rules'
import { authorityManagement } from '@/api/index.js'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import { CryptoUtil } from '@/utils/crypto'
import { mapGetters } from 'vuex'

const treeDataObj = {}
export default {
  name: 'AuthoritySetting',
  mixins: [mixin],
  components: {},
  data() {
    return {
      COM_HTTP: authorityManagement,
      isShowFirst: true,
      authVisible: false, // 新增 or 修改弹窗展示状态
      authDialogType: '', // 弹窗type
      authDialogText: '', // 新增 or 修改弹窗标题
      resetPassword: false, // 重置密码弹窗展示状态
      thisCheck: {}, // 当前选中项数据
      checkedList: [], // 当前所有选中项List
      lisData: [], // 全部的权限List
      saveLoading: false,
      authLoading: false,
      // 权限设置右侧表单数据
      authRowData: {
        loginCode: '',
        name: '',
        loginPassword: '',
        state: 1,
        note: '',
        mobile: '',
        mail: '',
        queryRule: '1',
      },
      // 重置密码弹窗表单数据
      passwordData: {
        newPassword: '',
        confirmPassword: '',
        loginCode: '',
      },
      defaultProps: {
        children: 'childResources',
        label: 'resourceName',
      },
      checkStrictly: false,
      tableList: [], // 列表数据
      passwordType: 'password',
      passwordIcon: 'icon-zujian_ico_mingwen',
      passwordTypeTwo: 'password',
      passwordIconTwo: 'icon-zujian_ico_mingwen',
      queryRuleList: [
        {
          value: '1',
          label: this.$lang('全部订单'),
        },
        {
          value: '2',
          label: this.$lang('自己的订单'),
        },
      ],
    }
  },
  computed: {
    ...mapGetters({ user: 'user', lang: 'lang' }),
    renderHeader() {
      return (h, { column, index }) => {
        const numble = column.label.length // 表头字数
        const size = 8 // 字体尺寸
        const newMinWidth = numble * size
        const oldMinWidth = column.minWidth
        column.minWidth = oldMinWidth > newMinWidth ? oldMinWidth : newMinWidth // 计算宽度
        return h('div', { class: 'table-head', style: { width: '100%' } }, [column.label])
      }
    },
    rules() {
      return {
        loginCode: [RULES.required, RULES.lengthTwenty],
        loginPassword: [RULES.required, RULES.noBlankSpace, RULES.lengthEightToEighteen, RULES.letternew, RULES.Specialcharacters, RULES.noBlankSpace],
        name: [RULES.required],
        note: [RULES.lengthOneHundred],
        mail: [RULES.email],
        mobile: [RULES.required, RULES.idnPhone, RULES.idnOnlyNumber],
        queryRule: [RULES.required],
        newPassword: [RULES.required, RULES.noBlankSpace, RULES.lengthEightToEighteen, RULES.letternew, RULES.Specialcharacters, RULES.noBlankSpace],
        confirmPassword: [
          RULES.required,
          RULES.noBlankSpace,
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordData.newPassword) {
                callback(this.$lang('两次密码输入不一致') + '!')
              } else {
                callback()
              }
            },
          },
        ],
      }
    },
    listOpt() {
      const that = this
      return {
        menu: true,
        // menuWidth: that.lang === 'YN' ? 235 : 200, // 操作宽度
        exportBtn: false, // 默认有导出本页 和 导出全部选项
        resetBtn: false,
        importBtn: false, // 导入
        // fixHeight: 20,
        search: true, // 查询、清空按钮，默认展示在右边
        searchExtend: false, // 搜索条件与表格间的插槽
        searchMore: false, // 是否需要展开收起
        tableCustom: false, // 是否需要自定义列
        isShowFirst: true,
        viewBtn: false,
        addBtn: false,
        editBtn: false,
        delBtn: false,
        column: [
          {
            label: '登录账号',
            prop: 'loginCode',
            search: true,
            sort: 0,
            renderHeader: that.renderHeader,
            searchPlaceholder: '输入登录账号',
          },
          {
            label: '姓名',
            prop: 'name',
            search: true,
            sort: 1,
            renderHeader: that.renderHeader,
            searchPlaceholder: '输入姓名',
          },
          {
            label: '联系方式',
            prop: 'mobile',
            search: true,
            sort: 2,
            renderHeader: that.renderHeader,
            searchPlaceholder: '输入联系方式',
            minWidth: 150,
          },
          {
            label: '查看订单',
            prop: 'queryRule',
            renderHeader: that.renderHeader,
            formatter: row => {
              const map = {
                1: that.$lang('全部订单'),
                2: that.$lang('自己的订单'),
              }
              return map[row.queryRule] || that.$lang('全部订单')
            },
          },
          {
            label: '邮箱',
            prop: 'mail',
            search: false,
            sort: 3,
            renderHeader: that.renderHeader,
          },
          {
            label: '是否启用',
            prop: 'state',
            dicData: DICT.enbStatusAuth,
            search: true,
            type: 'switch',
            formatter: row => {
              const map = {
                1: this.$lang('启用'),
                0: this.$lang('禁用'),
              }
              return map[row.state]
            },
            viewslot: true,
            sort: 4,
            renderHeader: that.renderHeader,
          },
          {
            label: '备注',
            prop: 'note',
            search: false,
            sort: 5,
            renderHeader: that.renderHeader,
          },
          {
            label: '创建时间',
            prop: 'creatDate',
            search: false,
            type: 'datetime',
            disabled: true,
            viewDisplay: false,
            searchClearable: false,
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            hide: false,
            sort: 6,
            renderHeader: that.renderHeader,
          },
        ],
      }
    },
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    // 切换密码显示隐藏
    changePasswordType(value) {
      if (!value || value === 0) {
        this.$message.error(this.$lang('密码为空'))
        return
      }
      if (this.passwordType === 'text') {
        this.passwordType = 'password'
        this.passwordIcon = 'icon-zujian_ico_mingwen'
      } else {
        this.passwordType = 'text'
        this.passwordIcon = 'icon-zujian_ico_anwen'
      }
    },
    changePasswordTypeTwo(value) {
      if (!value || value === 0) {
        this.$message.error(this.$lang('密码为空'))
        return
      }
      if (this.passwordTypeTwo === 'text') {
        this.passwordTypeTwo = 'password'
        this.passwordIconTwo = 'icon-zujian_ico_mingwen'
      } else {
        this.passwordTypeTwo = 'text'
        this.passwordIconTwo = 'icon-zujian_ico_anwen'
      }
    },
    // 密码失焦事件
    onBlur() {
      this.passwordType = 'password'
      this.passwordIcon = 'icon-zujian_ico_mingwen'
    },
    onBlurTwo() {
      this.passwordTypeTwo = 'password'
      this.passwordIconTwo = 'icon-zujian_ico_mingwen'
    },
    cancelcall() {
      this.$confirm(this.$lang('您确定要取消保存此数据吗？'), this.$lang('取消确认'), {
        confirmButtonText: this.$lang('确定'),
        cancelButtonText: this.$lang('取消'),
        iconClass: 'el-icon-warning-outline',
        type: 'warning',
        confirmButtonClass: 'comfirm-btn',
        closeOnClickModal: false,
      }).then(() => {
        this.closedCallback()
      })
    },
    closedCallback() {
      this.authVisible = false // 关闭新增 or 编辑弹窗
      this.lisData = [] // 清空权限组
      // 清空表单
      this.authRowData = {
        loginCode: '',
        name: '',
        loginPassword: '',
        state: 1,
        note: '',
        mobile: '',
        mail: '',
        queryRule: '1',
      }
    },
    cancelSave() {
      this.$confirm(this.$lang('您确定要取消保存此数据吗？'), this.$lang('取消确认'), {
        confirmButtonText: this.$lang('确定'),
        cancelButtonText: this.$lang('取消'),
        iconClass: 'el-icon-warning-outline',
        type: 'warning',
        confirmButtonClass: 'comfirm-btn',
        closeOnClickModal: false,
      }).then(() => {
        this.resetPassword = false
      })
    },
    // 查询参数处理
    searchFunParamsHandle(params) {
      params.current = this.page.current
      params.size = this.page.size
      return params
    },
    // 权限控制
    checkClick(data, check) {
      const parentData = treeDataObj[data.parentid]
      const checkedBoolean = check.checkedKeys.indexOf(data.resourceCode) !== -1
      if (data.resourceType === 1) {
        data.childResources.map(v => {
          this.$refs.tree.setChecked(v.resourceCode, checkedBoolean)
          v.childResources.map(vl => {
            this.$refs.tree.setChecked(vl.resourceCode, checkedBoolean)
          })
        })
      }
      if (checkedBoolean && parentData) {
        this.$refs.tree.setChecked(parentData.resourceCode, true)
        if (treeDataObj[parentData.parentid]) {
          this.$refs.tree.setChecked(treeDataObj[parentData.parentid].resourceCode, true)
        }
      }
    },
    /**
     * @Description: 初始化选中状态
     * @param {String} [list] - 全部的权限数据
     */
    initCheckCodeStatus(list) {
      list.forEach(item => {
        item.resourceName = this.$lang(item.resourceName)
        item.checked = false
        // 便利选中id集合，重置checked状态
        this.checkedList.forEach(son => {
          if (item.resourceCode === son) {
            if (item.childResources && item.childResources.length > 0) {
              item.checked = '2'
            } else {
              item.checked = true
            }
            setTimeout(() => {
              this.bottomToTop(this.lisData, item)
            }, 0)
          }
        })
        // 如果有子元素递归初始化对应checked状态
        if (item.childResources) {
          this.initCheckCodeStatus(item.childResources)
        }
      })
    },
    /**
     * @Description: 从下往上递归遍历,对父级进行状态变更
     * @param {String} [list] - 全部的权限数据
     * @param {String} [item] - 当前选中数据
     */
    bottomToTop(list, item) {
      const rev = (data, pCode) => {
        for (let i = 0, length = data.length; i < length; i++) {
          const node = data[i]

          // 递归遍历全部数据, 有元素和被选中元素父ID相当则进入逻辑
          if (node.id === pCode) {
            // 若其中一项为 true，说明数据中有一条被选中,则返回true
            const somes = node.childResources.some(sl => sl.checked === true || sl.checked === '2')
            // 若全部为true,说明数据中全部被选中,则返回true；
            const everys = node.childResources.every(sl => sl.checked === true)
            // 如果somes为false 说明没有数据父级为false, 如果somes为true并且everys为false说明有部分被选中
            if (somes) {
              everys ? (node.checked = true) : (node.checked = '2')
              this.checkedList.push(node.resourceCode)
            } else {
              node.checked = false
              this.checkedList = this.checkedList.filter(val => val !== node.resourceCode)
            }
            rev(list, node.parentid)
            break
          } else {
            if (node.childResources) {
              rev(node.childResources, pCode)
            }
          }
        }
      }
      rev(list, item.parentid) // 全部的权限数据,当前数据的父ID
    },
    /**
     * @Description: 保存当前数据
     */
    saveAdd() {
      const childrenList = this.$refs.tree.getCheckedKeys()
      const fatherList = this.$refs.tree.getHalfCheckedKeys()
      // eslint-disable-next-line
      let checkedList = childrenList.concat(fatherList)
      if (checkedList.includes('myWaybill') && !checkedList.includes('myWaybill_QUERY')) {
        // 我的运单 菜单与查询功能关联
        checkedList.push('myWaybill_QUERY')
      }
      if (checkedList.includes('monthlyStatement') && !checkedList.includes('myWamonthlyStatement_QUERY')) {
        // 月结对账单 菜单与查询功能关联
        checkedList.push('myWamonthlyStatement_QUERY')
      }

      this.$refs['authForm'].validate(async valid => {
        this.saveLoading = true
        try {
          if (valid) {
            const { companyId, loginCode, loginPassword, mail, mobile, name, newMenuId, note, state, queryRule } = this.authRowData
            const params = {
              companyId,
              loginCode,
              loginPassword,
              mail,
              mobile,
              name,
              newMenuId,
              note,
              state,
              queryRule,
              ...{ newMenuId: checkedList.toString() },
            }
            if (this.authDialogType === 'ADD') {
              params.loginPassword = CryptoUtil.rsaEncrypt(params.loginPassword) // 加密操作
            }
            const { code, data, msg } = await this.COM_HTTP.reqSaveOrUpdate(params)
            if (code === RESPONSE_SUCCESS && data) {
              this.saveLoading = false
              this.closedCallback()
              this.$message.success(this.authDialogType === 'ADD' ? this.$lang('新增成功') : this.$lang('修改成功'))
              setTimeout(() => {
                this.searchFun() // 成功
              }, 0)
            } else {
              this.saveLoading = false
              this.$message.error(msg)
            }
          } else {
            return false
          }
        } finally {
          this.saveLoading = false
        }
      })
    },
    /**
     * @Description: 重置密码弹窗
     */
    resetView(loginCode) {
      this.passwordData = {}
      this.passwordData.loginCode = loginCode
      this.resetPassword = true
    },
    /**
     * @Description: 重置密码 reqResetPass
     */
    resetPass() {
      this.$refs['passwordForm'].validate(async valid => {
        this.saveLoading = true
        try {
          if (valid) {
            const params = this.deepClone(this.passwordData)
            params.newPassword = CryptoUtil.rsaEncrypt(params.newPassword)
            params.confirmPassword = CryptoUtil.rsaEncrypt(params.confirmPassword)
            const { code, msg } = await this.COM_HTTP.reqResetPass(params)
            if (code === RESPONSE_SUCCESS) {
              this.saveLoading = false
              this.$message.success(msg)
              this.resetPassword = false
              this.searchFun() // 成功之后触发查询
            } else {
              this.saveLoading = false
              this.$message.error(msg)
            }
          } else {
            return false
          }
        } finally {
          this.saveLoading = false
        }
      })
    },
    /**
     * @Description: 新增/编辑弹窗
     */
    async authView(type, { loginCode = '' }) {
      this.authVisible = true // 弹窗是否显示
      this.authDialogType = type // 用于设置密码是否展示
      // mouted加载主页面数据以后，隐藏的弹出框并没有编译渲染进dom里面。
      this.$nextTick(() => {
        this.$refs.authForm.resetFields()
        this.checkedList = []
      })
      this.authLoading = true
      // 弹窗标题
      const titleMap = { EDIT: this.$lang('修改用户'), ADD: this.$lang('新增用户') }
      const httpMap = { EDIT: 'reqQueryDetail', ADD: 'getNewAccount' }
      this.authDialogText = titleMap[type]
      // 获取全部权限树
      const { data, code, msg } = await this.COM_HTTP.getMenuList()
      if (code === RESPONSE_SUCCESS) {
        // 不展示权限管理
        const temp = data.menuResourceVos || []
        this.lisData = []
        temp.map(item => {
          item.resourceName = this.$lang(item.resourceName)
          treeDataObj[item.id] = item
          if (item.childResources.length > 0) {
            item.childResources.forEach(ele => {
              treeDataObj[ele.id] = ele
              ele.resourceName = this.$lang(ele.resourceName)
              console.log(ele.resourceName);
              if (ele.childResources.length > 0) {
                ele.childResources = ele.childResources.filter((element, index) => {
                  if (element.resourceCode !== 'myWaybill_QUERY' && element.resourceCode !== 'myWamonthlyStatement_QUERY') {
                    treeDataObj[element.id] = element
                    element.resourceName = this.$lang(element.resourceName)
                    return true
                  } else {
                    return false
                  }// ele.childResources.splice(index, 1)
                })
              }
            })
          }
          if (item.resourceCode !== 'authorityManagement') {
            this.lisData.push(item)
          }
        })
        console.log(this.lisData);
      } else {
        this.$message.error(msg)
      }
      // 编辑和新增的请求参数
      const params = type === 'EDIT' ? `loginCode=${loginCode}` : {}
      const res = await this.COM_HTTP[httpMap[type]](params)
      if (res.code === RESPONSE_SUCCESS) {
        if (type === 'EDIT') {
          // 如果查看订单queryRule这个参数为空，编辑展示默认为全部订单1
          if (!res.data.queryRule) {
            this.authRowData = { ...res.data, queryRule: '1' }
          } else {
            this.authRowData = { ...res.data }
          }
          console.log(this.authRowData)
          // 把账户对应权限-newMenuId变成数组，绑定到checkedList
          this.checkedList = (res.data.newMenuId && res.data.newMenuId.split(',')) || []
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys(this.checkedList)
          })
          this.initCheckCodeStatus(this.lisData) // 初始化选中的数据状态
          this.lisData = this.deepClone(this.lisData) // 深拷贝对权限树进行更新
        } else {
          this.authRowData.loginCode = res.data || ''
          console.log('ADD', this.authRowData)
        }
        // 计算宽度
        const labels = Array.from(document.getElementsByClassName('el-tree-node__label'))
        labels.forEach(item => {
          // 判断文字的宽度，超过宽度自动变宽
          const labelWidth = item.style.width || item.clientWidth || item.offsetWidth || item.scrollWidth
          if (labelWidth > 72) {
            const num = labelWidth % 72 === 0 ? Math.floor(labelWidth / 72) : Math.floor(labelWidth / 72) + 1
            item.parentElement.style.width = 92 * num + 20 + 'px'
          }
        })
        this.authLoading = false
      } else {
        this.$message.error(res.msg)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.authorityManagement {
  position: relative;
  ::v-deep.avue-crud__search .el-form-item {
    min-width: 192px;
  }
}
::-webkit-scrollbar {
  width: 6px;
  height: 1px;
}
.headBox {
  button {
    min-width: 80px;
    height: 36px;
    opacity: 1;
    background: #e60012;
    border-radius: 8px;
    color: #fff;
    border: none;
  }
}
.back-to-list {
  height: 60px;
  line-height: 60px;
  padding: 0 20px 0;
  border-radius: 12px;
  background-color: #fff;
  font-size: 18px;
  color: #242628;
  .back-to-list_click {
    cursor: pointer;
  }
}
.edit-content {
  padding: 20px;
  border-radius: 12px;
  background-color: #fff;
  margin-top: 10px;
  .content-title {
    font-size: 24px;
    color: #242628;
    font-weight: 700;
  }
}
.dialogContent {
  height: calc(100vh - 270px);
  overflow-y: scroll;
  // margin-top: 20px;
  margin-bottom: 160px;
  display: flex;
  .contentLeft,
  .contentRight {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    height: max-content;
    p {
      color: #4c4d57;
      font-size: 16px;
    }
    .authority_title {
      height: 48px;
      background-color: #f7f7f7;
      border-radius: 8px 8px 0 0;
      color: #4c4d57;
      font-size: 14px;
      padding-left: 12px;
      line-height: 48px;
      font-weight: 600;
    }
  }
  .contentLeft {
    width: 330px;
    margin-right: 20px;
    flex: 1;
    .demo-ruleForm {
      margin: 0 20px;
      margin-top: 20px;
      overflow-y: auto;
      ::v-deep .el-form-item__label {
        line-height: 21px;
      }
      ::v-deep .el-form-item {
        margin-bottom: 30px;
      }
      .switchLady ::v-deep .el-switch {
        top: -10px;
      }
      .loginPassword {
        margin-bottom: 25px !important;
      }
    }
    .el-input-new {
      width: 220px;
      ::v-deep .el-input__inner {
        height: 36px;
      }
      ::v-deep textarea {
        height: 124px;
      }
    }
    .el-select-new {
      width: 100%;
    }
  }
  .contentRight {
    width: calc(100% - 330px);
    .authority {
      padding: 0 30px;
      border-radius: 8px;
      margin-top: 20px;
      overflow: hidden;
      ::v-deep .el-checkbox__label {
        color: #4c4d57;
      }
      ::v-deep .el-checkbox__inner {
        width: 17px;
        height: 17px;
        border-radius: 4px;
      }
      ::v-deep .el-checkbox__inner::after {
        height: 7px;
        left: 5px;
        top: 2px;
        border: 2px solid #fff;
        border-left: 0;
        border-top: 0;
      }
      ::v-deep .el-checkbox__inner::before {
        height: 3px;
        top: 6px;
      }
      .menuBox-main {
        padding-bottom: 16px;
        overflow: auto;
        &::-webkit-scrollbar {
          height: 6px;
        }
        .menuBox {
          display: flex;
          .menu_title {
            margin-top: 35px;
            margin-left: 40px;
            display: flex;
          }
        }
      }

      .authority_but {
        margin-left: 45px;
        display: flex;
        ::v-deep .el-checkbox__label {
          color: #61666d;
          font-weight: 400;
        }
        div {
          margin-right: 40px;
        }
      }
    }
  }
}
.authority-top {
  margin-top: 6px;
}
.menuSlot {
  display: flex;
  justify-content: space-between;
  // flex-wrap: wrap;
  span {
    color: #e60012;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    // margin-right: 30px;
    word-wrap: normal;
  }
  span:last-child {
    margin-right: 0;
  }
}
.passwod-ruleForm {
  overflow: hidden;
  .inputBox {
    width: 220px;
    display: inline-block;
    margin-right: 20px;
    ::v-deep .el-input__inner {
      height: 36px;
    }
  }
  .dialog-footer {
    margin-top: 60px;
    text-align: center;
    button {
      height: 36px;
      border-radius: 8px;
    }
    .butSuss {
      background: #e60012;
      border-radius: 8px;
      color: #fff;
      margin-left: 20px;
    }
  }
}
.edit-footer-buttons {
  width: calc(100% - 240px);
  padding: 20px 0;
  border-radius: 12px;
  background: #ffffff;
  position: fixed;
  bottom: 20px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);
  z-index: 2;
  box-sizing: border-box;
  .dialog-footer {
    margin-left: 20px;
    button {
      min-width: 160px;
      height: 40px;
      border-radius: 4px;
    }
    .butSuss {
      background: #e60012;
      border-radius: 8px;
      color: #fff;
      margin-left: 20px;
    }
  }
  .dialog-footerNew {
    display: flex;
    justify-content: center;
  }
}
</style>

<style lang="scss">
.el-message-box__btns {
  text-align: center;
}
.dialogContent {
  .contentLeft {
    .el-form-item {
      margin-bottom: 20px !important;
      .el-input,
      .el-textarea {
        width: 100%;
      }
    }
  }
  .contentRight {
    [class*=' el-icon-'],
    [class^='el-icon-'] {
      font-family: 'iconfont' !important;
    }
    .el-tree-node__expand-icon.expanded {
      // 关闭旋转
      -webkit-transform: rotate(0deg);
      transform: rotate(0);
    }
    .el-icon-caret-right:before {
      content: '\e7e0';
    }
    .expanded.el-icon-caret-right:before {
      content: '\e7e1';
    }
    .el-tree-node.is-expanded > .el-tree-node__children .el-tree-node__children {
      // display: flex;
      .el-tree-node {
        display: inline-block;
        &:nth-of-type(n + 2) > .el-tree-node__content {
          padding-left: 0 !important;
        }
      }
      .el-tree-node__content {
        // float: left;
        padding-left: 20px;
        margin: 12px 0;
        margin-top: 0px;
      }
    }
    .el-tree-node__content {
      margin: 12px 0;
      margin-right: -16px;
      min-width: 92px;
    }
    // .el-tree-node__content>.el-tree-node__label{
    //    font-size: 16px;
    //   font-weight: 700;
    // }
    .el-tree-node__label {
      font-size: 16px;
      font-weight: 700;
    }
    .el-tree-node:focus > .el-tree-node__content,
    .el-tree-node__content:hover {
      background-color: rgba(255, 255, 255, 0);
    }
    .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
      background-color: rgba(255, 255, 255, 0);
    }
  }
}
.tree-line {
  .el-tree-node {
    position: relative;
    // padding-left: 16px; // 缩进量
  }
  .el-tree-node > .el-tree-node__content > .el-tree-node__label {
    font-size: 16px;
    font-weight: 700;
  }
  .el-tree-node__children {
    // padding-left: 16px; // 缩进量
    .el-tree-node > .el-tree-node__content > .el-tree-node__label {
      font-size: 12px;
      font-weight: 700;
    }
    .el-tree-node__children {
      .el-tree-node > .el-tree-node__content > .el-tree-node__label {
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  // 竖线
  // .el-tree-node::before {
  //   content: "";
  //   height: 130%;
  //   width: 1px;
  //   position: absolute;
  //   left: -3px;
  //   top: -26px;
  //   border-width: 1px;
  //   border-left: 1px solid #E8E8E8 !important;
  // }
  // 当前层最后一个节点的竖线高度固定
  .el-tree-node:last-child::before {
    height: 55px; // 可以自己调节到合适数值
  }

  // 横线
  // .el-tree-node::after {
  //   content: "";
  //   width: 44px;
  //   height: 20px;
  //   position: absolute;
  //   left: -3px;
  //   top: 12px;
  //   border-width: 1px;
  //   border-top: 1px solid #E8E8E8;
  // }

  // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
  // & > .el-tree-node::after {
  //   border-top: none;
  // }
  // & > .el-tree-node::before {
  //   border-left: none;
  // }

  // 展开关闭的icon
  .el-tree-node__expand-icon {
    // font-size: 16px;
    // 叶子节点（无子节点）
    &.is-leaf {
      color: transparent;
    }
  }
}
</style>
