<!--
 * @Description: 收件地址设置
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-13 11:16:05
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-28 15:47:31
-->
<template>
  <div class="main-css">
    <avue-crud
      ref="params"
      :data="tableList"
      :page="page"
      :option="listOpt"
      @search-change="searchChange"
      @search-reset="resetList"
      @row-save="addFun"
      @row-del="deleteView"
      @row-update="updateFun"
      @export-excel="outExcel"
      :tableLoading="loading"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <!-- 搜索插槽 -->
      <!-- 下拉搜索 -->
      <template slot="nameOrPhoneOrAddressSearch">
        <el-select v-model="nameOrPhoneOrAddress" popper-class="mailing-popper">
          <el-option :label="$lang('姓名')" value="name"></el-option>
          <el-option :label="$lang('联系方式')" value="phone"></el-option>
          <el-option :label="$lang('详细地址')" value="address"></el-option>
        </el-select>
      </template>
      <!-- 模糊搜索框 -->
      <template slot="nameOrPhoneOrAddressValueSearch">
        <el-input
          v-model="nameOrPhoneOrAddressValue"
          clearable
          :maxlength="nameOrPhoneOrAddress === 'address' ? 50 : 20"
          :placeholder="$lang(nameOrPhoneOrAddress === 'name' ? '请输入姓名' : nameOrPhoneOrAddress === 'phone' ? '请输入联系方式' : '请输入详细地址')"
        ></el-input>
      </template>

      <template slot="provCityAreaForm" slot-scope="{row}">
        <BaseAddress :provCityArea.sync="row.provCityArea" :rowData="row" :addressType="2" :isSplit="false"></BaseAddress>
      </template>

      <template slot="contactsForm" slot-scope="{ row }">
        <el-input
            size="medium"
            v-model="row.contacts"
            :placeholder="$lang('请输入')"
            :onkeyup="(row.contacts = row.contacts && row.contacts.replace(/[^\d+]/g, '') || '')"
            maxlength="17"
            clearable
        ></el-input>
      </template>

      <!-- 列表插槽 -->
      <!-- 设置默认 -->
      <template slot="setDefault" slot-scope="{ row }">
        <el-switch
          v-model="row.defaultaddress"
          @change="rowSetDefaultChange(row)"
          active-color="#e60012"
          inactive-color="#9499A3"
          active-value="1"
          inactive-value="0"
          class="mailing-switch"
        ></el-switch>
      </template>
    </avue-crud>
  </div>
</template>
<script>
import mixin from '@/mixins/mixin'
import { RULES } from '@public/utils/rules.js'
// import { DICT } from '@/@public/utils/dict.js';
import { receivingAddress } from '@/api/index.js'
import { RESPONSE_CODE } from '@public/http/config'
import BaseAddress from '@/components/base/BaseAddress.vue'
export default {
  name: 'ReceivingAddress',
  components: {
    BaseAddress
  },
  mixins: [mixin],
  data() {
    return {
      COM_HTTP: receivingAddress,
      nameOrPhoneOrAddress: 'name', // 查询内容下拉
      nameOrPhoneOrAddressValue: '', // 模糊查询数据
      provCityArea: '',
      page: {
        size: 50, // 每页显示多少条
        sizes: [50, 100, 200]
      }
    }
  },
  computed: {
    renderHeader() {
      return (h, { column, index }) => {
        const numble = column.label.length // 表头字数
        const size = 8 // 字体尺寸
        const newMinWidth = numble * size
        const oldMinWidth = column.minWidth
        column.minWidth = oldMinWidth > newMinWidth ? oldMinWidth : newMinWidth // 计算宽度
        return h('div', { class: 'table-head', style: { width: '100%' }}, [column.label])
      }
    },
    listOpt() {
      const that = this
      return {
        addBtn: true, // 新增按钮
        exportBtn: true, // 导出按钮
        menuWidth: 100, // 操作宽度
        search: true, // 是否搜索
        menu: true, // 操作
        editBtn: true, // 编辑按钮
        delBtn: true, // 删除按钮
        viewBtn: false, // 查看按钮
        column: [
          {
            label: '',
            hide: true,
            search: true,
            searchslot: true,
            prop: 'nameOrPhoneOrAddress',
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '',
            hide: true,
            search: true,
            searchslot: true,
            prop: 'nameOrPhoneOrAddressValue',
            addDisplay: false,
            editDisplay: false
          },
          {
            label: that.$lang('设为默认'),
            prop: 'setDefault',
            slot: true,
            addDisplay: false,
            editDisplay: false,
            renderHeader: that.renderHeader
          },
          {
            label: that.$lang('设为默认'),
            prop: 'defaultaddress',
            formSort: 15,
            type: 'switch',
            valueDefault: '0',
            dicData: [
              { value: '0', label: that.$lang('禁用'), name: '禁用' },
              { value: '1', label: that.$lang('启用'), name: '启用' }
            ],
            hide: true
          },
          {
            label: that.$lang('姓名'),
            prop: 'name',
            rules: [
              {
                required: true,
                message: that.$lang('请输入姓名'),
                trigger: ['blur', 'change']
              }
            ],
            maxlength: 50,
            formSort: 0,
            renderHeader: that.renderHeader,
            minWidth: 150
          },
          {
            label: that.$lang('联系方式'),
            prop: 'contacts',
            formslot: true,
            rules: [
              {
                required: true,
                message: that.$lang('请输入联系方式'),
                trigger: ['blur', 'change']
              },
              RULES.idnPhone,
              RULES.idnOnlyNumber
            ],
            formSort: 1,
            renderHeader: that.renderHeader,
            minWidth: 150,
            // change(e) {
            //   if (e.value) {
            //     setTimeout(() => {
            //       that.$refs.params.tableForm.contacts = e.value.replace(/[^\d+]/g, '')
            //     }, 0)
            //   }
            // }
          },
          {
            label: that.$lang('省份'),
            prop: 'prov',
            addDisplay: false,
            editDisplay: false,
            renderHeader: that.renderHeader,
            minWidth: 170
          },
          {
            label: that.$lang('城市'),
            prop: 'city',
            addDisplay: false,
            editDisplay: false,
            renderHeader: that.renderHeader,
            minWidth: 170
          },
          {
            label: that.$lang('地区'),
            prop: 'area',
            addDisplay: false,
            editDisplay: false,
            renderHeader: that.renderHeader,
            minWidth: 170
          },
          {
            label: that.$lang('详细地址'),
            prop: 'address',
            type: 'textarea',
            minRows: 1,
            maxRows: 3,
            maxlength: 250,
            span: 24,
            disabled: that.entrust === '1', // 被委托，不能填写详细地址
            formSort: 3,
            rules:
              that.entrust !== '1'
                ? [
                  {
                    required: true,
                    message: that.$lang('请输入详细地址'),
                    trigger: ['blur', 'change']
                  },
                  RULES.lengTwoThousandFifty,
                  RULES.letterOverTen
                ]
                : [],
            renderHeader: that.renderHeader,
            minWidth: 400
          },
          {
            label: that.$lang('目的地'),
            prop: 'provCityArea',
            hide: true,
            formslot: true,
            span: 16,
            rules: [
              {
                required: true,
                message: that.$lang('请输入目的地'),
                trigger: ['blur', 'change']
              }
            ],
            type: 'select',
            formSort: 2
          }
        ]
      }
    }
  },
  mounted() {
    this.$refs.params.titleInit(this.$lang(this.$route.meta.title) + ' - ')
  },
  activated() {
    if (!this.isShowFirst) {
      this.$nextTick().then(res => {
        this.searchFun()
      })
    }
    this.isShowFirst = false
  },
  methods: {
    // 列表切换默认
    async rowSetDefaultChange(val) {
      // todo: 此处调用设置默认接口
      try {
        val.provCityArea = `${val.prov}${val.city ? '/' + val.city : ''}${val.area ? '/' + val.area : ''}`
        const res = await this.COM_HTTP.reqUpdate(val)
        const { code, msg } = res
        if (code === RESPONSE_CODE.SUCCESS) {
          this.$message.success(msg)
          this.searchFun()
        } else {
          this.$message.error(msg)
          // 设置失败 还原选项按钮
          val.defaultaddress = val.defaultaddress === '1' ? '0' : '1'
        }
      } catch (error) {
        this.$message.error(this.$lang('设置失败'))
      }
    },
    // 重置
    resetList() {
      this.nameOrPhoneOrAddress = 'name'
      this.nameOrPhoneOrAddressValue = ''
    },
    // 参数处理
    searchFunParamsHandle(params) {
      params[this.nameOrPhoneOrAddress] = this.nameOrPhoneOrAddressValue
      // 类型：1寄件 ，2收件
      params.type = 2
      params.current = this.page.current
      params.size = this.page.size
      return Object.assign(params)
    },
    // 加入导出参数
    getParamForOutExcel() {
      const params = {}
      params[this.nameOrPhoneOrAddress] = this.nameOrPhoneOrAddressValue
      params.current = this.page.current
      params.size = this.page.size
      params.columnNames = [this.$lang('是否默认'), this.$lang('姓名'), this.$lang('联系方式'), this.$lang('省份'), this.$lang('城市'), this.$lang('地区'), this.$lang('详细地址')]
      params.sort = ['defaultaddress', 'name', 'contacts', 'prov', 'city', 'area', 'address']
      return params
    },
    // 删除前置方法
    beforeDelteView(params) {
      params.provCityArea = `${params.prov}${params.city ? '/' + params.city : ''}${params.area ? '/' + params.area : ''}`
    }
  }
}
</script>

<style lang="scss">
.mailing-switch{
  .el-switch__core{
    width: 36px !important;
    height: 18px !important;
  }
  .el-switch__core::after{
    width: 14px;
    height: 14px;
  }
}
.mailing-switch.is-checked .el-switch__core::after{
  margin-left: -15px;
}
.mailing-popper.el-popper[x-placement^=bottom]{
  margin-top: 4px;
}
</style>
