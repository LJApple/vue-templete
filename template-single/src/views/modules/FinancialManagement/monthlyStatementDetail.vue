<!--
 * @Description: 查看运单详情
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-15 14:32:56
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-20 14:27:06
-->
<template>
  <div v-if="waybillDetailVisible" class="waybill-detail">
    <el-dialog
      :title="$lang('运单明细')"
      :visible="waybillDetailVisible"
      @close="close"
      :close-on-click-modal="false"
      top="5vh"
      class="waybillDetailVisible"
    >
      <avue-crud
        ref="params"
        :data="tableList"
        :page="page"
        :option="listOpt"
        :tableLoading="loading"
        @search-change="searchChange"
        @size-change="sizeChange"
        @current-change="currentChange"
      >
        <template slot="menuLeft">
          <div class="search-form">
            <el-input
              v-model="searchForm.waybillNo"
              :placeholder="$lang('请输入运单号')"
              clearable
            ></el-input>
            <el-button size="small" type="primary" @click="searchChange">{{
              $lang('查询')
            }}</el-button>
          </div>
        </template>
      </avue-crud>
    </el-dialog>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import { MonthlyStatement } from '@/api/index.js'
import { RESPONSE_CODE } from '@public/http/config'
export default {
  name: 'MonthlyStatementDetail',
  mixins: [mixin],
  props: {
    waybillDetailVisible: {
      type: Boolean,
      default: false
    },
    monthlyBill: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      COM_HTTP: MonthlyStatement,
      searchForm: {},
      tableList: [],
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
        menu: false,
        search: false,
        fixHeight: 30,
        column: [
          {
            label: '运单编号',
            prop: 'billNo',
            renderHeader: that.renderHeader,
            minWidth: 110
          },
          {
            label: '寄件日期',
            prop: 'sendDate',
            renderHeader: that.renderHeader,
            minWidth: 150
          },
          {
            label: '业务员',
            prop: 'postMan',
            renderHeader: that.renderHeader
          },
          {
            label: '寄件人',
            prop: 'sender',
            renderHeader: that.renderHeader
          },
          {
            label: '寄件电话',
            prop: 'senderTel',
            renderHeader: that.renderHeader
          },
          {
            label: '寄件地址',
            prop: 'senderAddr',
            renderHeader: that.renderHeader
          },
          {
            label: '收件人',
            prop: 'recipient',
            renderHeader: that.renderHeader
          },
          {
            label: '收件电话',
            prop: 'recipientTel',
            renderHeader: that.renderHeader
          },
          {
            label: '收件地址',
            prop: 'recipientAddr',
            renderHeader: that.renderHeader
          }
        ]
      }
    }
  },
  methods: {
    async searchFun() {
      const params = this.searchForm
      params.monthlyBill = this.monthlyBill
      params.size = this.page.size
      params.current = 1
      const { data, code, msg } = await this.COM_HTTP.reqDetail(params)
      if (code === RESPONSE_CODE.SUCCESS) {
        this.tableList = data.records
          ? this.formatList
            ? this.formatList(data)
            : data.records
          : []
        this.page.total = data.total || 0
        this.page.current = data.page || 1
      } else {
        this.$message.error(msg)
      }
    },
    close() {
      this.$emit('update:waybillDetailVisible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form {
  width: 100%;
  display: flex;
  justify-content: space-between;
  .el-input {
    flex: 1;
  }
  .el-button {
    margin-left: 20px;
  }
}
</style>

<style lang="scss">
.waybill-detail {
  .avue-crud__menu {
    display: block !important;
  }
  .el-dialog{
    height: calc(100vh - 13vh);
    width: 130vh;
  }
}
</style>
