<!--
 * @Description: 月结对账单
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-14 16:29:18
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-25 18:19:27
-->
<template>
  <div class="main-css monthly-statement">
    <avue-crud
      ref="params"
      :data="tableList"
      :page="page"
      :option="listOpt"
      :summaryMethod="summaryMethod"
      @search-change="searchChange"
      @search-reset="resetList"
      id="editAbletrendsTable"
      @export-excel="outExcel"
      @size-change="sizeChange"
      :tableLoading="loading"
      @current-change="currentChange"
      @column-checkedList="getColumn"
    >
      <template slot="customMonthSearch" v-if="customMonth">
        <el-date-picker
          v-model="selectMonth"
          type="monthrange"
          :clearable="false"
          :range-separator="$lang('至')"
          :start-placeholder="$lang('开始月份')"
          :end-placeholder="$lang('结束月份')"
          class="monthrange"
          popper-class="monthly-popper"
        ></el-date-picker>
      </template>
      <template slot="waybillDetails" slot-scope="{ row }">
        <span class="pm-click" @click="showDetail(row)"><i class="iconfont icon-icon_chakan"></i></span>
      </template>
    </avue-crud>
    <template v-if="waybillDetailVisible">
      <monthly-statement-detail
        :waybillDetailVisible.sync="waybillDetailVisible"
        :monthlyBill="monthlyBill"
      ></monthly-statement-detail>
    </template>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import { DICT } from '@public/utils/dict.js'
import monthlyStatementDetail from '@/views/modules/FinancialManagement/monthlyStatementDetail.vue'
import { MonthlyStatement } from '@/api/index.js'
import { recentMonth, formatDate } from '@/@public/utils/common.js'
import { RESPONSE_CODE } from '@public/http/config'
export default {
  name: 'MonthlyStatement',
  components: {
    monthlyStatementDetail
  },
  mixins: [mixin],
  data() {
    return {
      COM_HTTP: MonthlyStatement,
      isShowFirst: false,
      commonlyUsed: '',
      customMonth: false, // 是否自定义月份
      selectMonth: [],
      startMonth: '',
      endMonth: '',
      type: 1,
      tableList: [],
      columnList: [], // 自定义显示的列表名
      waybillDetailVisible: false,
      monthlyBill: '',
      statisticsMap: [
        {
          name: 'ticketNum',
          type: 'sum',
          label: 'ticketNum'
        },
        {
          name: 'totalMoney',
          type: 'sum',
          label: 'totalMoney'
        },
        {
          name: 'requireMoney',
          type: 'sum',
          label: 'requireMoney'
        },
        {
          name: 'paidMoney',
          type: 'sum',
          label: 'paidMoney'
        },
        {
          name: 'unPaidMoney',
          type: 'sum',
          label: 'unPaidMoney'
        },
        {
          name: 'wreckMoney',
          type: 'sum',
          label: 'wreckMoney'
        }
      ],
      defaultCommonMonth: 1,
      isVerification: ''
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
        exportBtn: true, // 默认有导出本页 和 导出全部选项
        resetBtn: true,
        search: true, // 查询、清空按钮，默认展示在右边
        tableCustom: true, // 是否需要自定义列
        menu: false,
        showSummary: true, // 显示合计
        pagination: true,
        column: [
          {
            label: '常用月',
            prop: 'commonMonth',
            hide: true,
            search: true,
            type: 'select',
            dicData: DICT.commonMonthOption,
            hasAll: false,
            searchDefault: that.defaultCommonMonth,
            searchClearable: false,
            popperAppendToBody: false,
            change(e) {
              if (e.value === 4) {
                that.customMonth = true
                const end = new Date()
                const start = new Date()
                start.setMonth(start.getMonth() - 1)
                that.selectMonth = [start, end]
              } else {
                that.customMonth = false
              }
            }
          },
          {
            label: '选择月份',
            prop: 'customMonth',
            search: that.customMonth,
            hide: true,
            searchslot: true
          },
          {
            label: '付款标识',
            prop: 'isVerification',
            hide: true,
            search: true,
            type: 'select',
            dicData: DICT.paymentStatus,
            searchDefault: that.isVerification,
            popperAppendToBody: false
          },
          {
            label: '账单日期',
            prop: 'billDate',
            renderHeader: that.renderHeader
          },
          {
            label: '账单月份',
            prop: 'billMonth',
            renderHeader: that.renderHeader
          },
          {
            label: '账单编号',
            prop: 'billNo',
            renderHeader: that.renderHeader,
            showTooltip: false,
            minWidth: 180
          },
          {
            label: '票数',
            prop: 'ticketNum',
            renderHeader: that.renderHeader,
            minWidth: 120
          },
          {
            label: '账单总额',
            prop: 'totalMoney',
            formatter: (row, value, label, column) => {
              return that.outputdollars(row.totalMoney)
            },
            renderHeader: that.renderHeader,
            minWidth: 120
          },
          {
            label: '应付金额',
            prop: 'requireMoney',
            formatter: (row, value, label, column) => {
              return that.outputdollars(row.requireMoney)
            },
            renderHeader: that.renderHeader,
            minWidth: 120
          },
          {
            label: '已付金额',
            prop: 'paidMoney',
            formatter: (row, value, label, column) => {
              return that.outputdollars(row.paidMoney)
            },
            renderHeader: that.renderHeader,
            minWidth: 120
          },
          {
            label: '未付金额',
            prop: 'unPaidMoney',
            formatter: (row, value, label, column) => {
              return that.outputdollars(row.unPaidMoney)
            },
            renderHeader: that.renderHeader,
            minWidth: 120
          },
          {
            label: '折额',
            prop: 'wreckMoney',
            formatter: (row, value, label, column) => {
              return that.outputdollars(row.wreckMoney)
            },
            renderHeader: that.renderHeader,
            minWidth: 120
          },
          {
            label: '核销',
            prop: 'isVerification',
            renderHeader: that.renderHeader
          },
          {
            label: '运单明细',
            prop: 'waybillDetails',
            slot: true,
            renderHeader: that.renderHeader
          }
        ]
      }
    },
    // 逗号分隔数值
    outputdollars() {
      return number => {
        if (number.length <= 3) return number === '' ? '0' : number
        else {
          const strNumBer = number.toString()
          var mod = strNumBer.length % 3
          var output = mod === 0 ? '' : strNumBer.substring(0, mod)
          for (var i = 0; i < Math.floor(strNumBer.length / 3); i++) {
            if (mod === 0 && i === 0) {
              output += strNumBer.substring(mod + 3 * i, mod + 3 * i + 3)
            } else {
              output += ',' + strNumBer.substring(mod + 3 * i, mod + 3 * i + 3)
            }
          }
          return output
        }
      }
    }
  },
  created() {
    const { commonMonth, selectMonth, isVerification } = this.$route.query
    if (commonMonth && selectMonth && isVerification) {
      console.log('??????????????????', this.$route.query.toString(), this.$route.query)
      this.customMonth = true
      this.selectMonth = selectMonth
      this.defaultCommonMonth = Number(commonMonth)
      this.isVerification = isVerification
      this.searchFun({ commonMonth: Number(commonMonth), isVerification })
    }
  },
  updated() {},
  methods: {
    // 监控自定义列
    getColumn(value) {
      this.columnList = value
    },
    // 清空
    resetList() {
      this.customMonth = false
    },
    // 合计
    summaryMethod(param) {
      const { columns, data } = param
      const sums = []
      const sumColumnList = this.statisticsMap
      if (columns.length > 0) {
        columns.forEach((column, index) => {
          const currItem = sumColumnList.find(
            item => item.name === column.property
          )
          if (index === 0) {
            sums[index] = this.$lang('统计')
          } else if (currItem) {
            switch (currItem.type) {
              case 'count':
                sums[index] = this.$lang('计数') + ':' + data.length
                break
              case 'avg':
                const avgValues = data.map(item =>
                  Number(item[column.property])
                )
                let nowindex = 1
                sums[index] = avgValues.reduce((perv, curr) => {
                  const value = Number(curr)
                  if (!isNaN(value)) {
                    return (perv + curr) / nowindex++
                  } else {
                    return perv
                  }
                }, 0)
                sums[index] = this.$lang('平均') + ':' + sums[index].toFixed(0)
                break
              case 'sum':
                const values = data.map(item => Number(item[column.property]))
                sums[index] = values.reduce((perv, curr) => {
                  const value = Number(curr)
                  if (!isNaN(value)) {
                    return perv + curr
                  } else {
                    return perv
                  }
                }, 0)
                sums[index] = this.outputdollars(sums[index].toFixed(0))
                break
            }
          } else {
            sums[index] = ''
          }
          // 改写统计的位置
          if (index > 0 && index < 4 && sums[index] === '') {
            sums[index - 1] = ''
            sums[index] = this.$lang('统计')
          }
        })
      }
      this.sumsList = sums
      return sums
    },
    async searchFun(params) {
      this.loading = true
      if (!params) {
        params = this.rangHandle(this.$refs.params.searchForm)
      }
      const param = this.searchFunParamsHandle(params)
      if (param === false) {
        this.loading = false
        return
      }
      console.log(params)
      try {
        const { data, code, msg } = await this.COM_HTTP.reqList(param)
        this.loading = false
        this.pageLoading = false
        if (code === RESPONSE_CODE.SUCCESS) {
          if (this.usePagination) {
            const { records, total, current } = data.monthlyBillVos
            this.tableList = records
              ? this.formatList
                ? this.formatList(data.monthlyBillVos)
                : records
              : []
            this.page.total = total || 0
            this.page.current = current || 1
          } else {
            this.tableList = this.formatList
              ? this.formatList(data.monthlyBillVos)
              : data.monthlyBillVos || []
          }
          this.searchAfterFun()
        } else {
          this.$message.error(msg)
        }
      } catch (error) {
        console.error('searchFun::error', error)
        this.loading = false
        this.pageLoading = false
      }
    },
    // 查看详情
    showDetail(val) {
      this.waybillDetailVisible = true
      this.monthlyBill = val.billNo
    },
    // 查询参数处理
    searchFunParamsHandle(params) {
      let dateArray = []
      switch (params.commonMonth) {
        case 1:
          dateArray = recentMonth(3)
          break
        case 2:
          dateArray = recentMonth(6)
          break
        case 3:
          dateArray = recentMonth('thisYear')
          break
        case 4:
          if (this.selectMonth.length !== 2) {
            this.$message.warning(this.$lang('请选择月份'))
            return false
          }
          dateArray = [
            formatDate(this.selectMonth[0], 'YYYY-MM'),
            formatDate(this.selectMonth[1], 'YYYY-MM')
          ]
          console.log(dateArray, this.selectMonth[0], this.selectMonth[1], formatDate(this.selectMonth[0], 'YYYY-MM'), formatDate(this.selectMonth[1], 'YYYY-MM'))
          break
        default:
          break
      }
      params.startTime = dateArray[0]
      params.endTime = dateArray[1]
      params.current = this.page.current
      params.size = this.page.size
      return params
    },
    // 导出参数设置
    getParamForOutExcel(param) {
      if (!param) {
        param = this.rangHandle(this.$refs.params.searchForm)
      }
      const params = this.searchFunParamsHandle(param)
      params.columnNames = [
        this.$lang('账单日期'),
        this.$lang('账单月份'),
        this.$lang('账单编号'),
        this.$lang('票数'),
        this.$lang('账单总额'),
        this.$lang('应付金额'),
        this.$lang('已付金额'),
        this.$lang('未付金额'),
        this.$lang('折额'),
        this.$lang('核销')
      ]
      params.sort = [
        'billDate',
        'billMonth',
        'billNo',
        'ticketNum',
        'totalMoney',
        'requireMoney',
        'paidMoney',
        'unPaidMoney',
        'wreckMoney',
        'isVerification'
      ]
      return params
    }
  }
}
</script>

<style lang="scss">
.monthrange{
  width: 228px !important;
  padding-right: 10px !important;
  .el-range__close-icon{
    width: 0;
  }
  .el-range-separator{
    line-height: 24px;
  }
  margin-top: 0;
}
.monthly-popper{
  margin-top: 4px !important;
}
</style>

<style lang="scss" scoped>
.monthly-statement{
  ::v-deep.el-popper{
    top: 36px !important;
    left: 0 !important;
    margin-top: 0 !important;
  }
}
</style>
