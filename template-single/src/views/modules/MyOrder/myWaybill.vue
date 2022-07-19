/**
 * @Description: 页面名称
 * @author: name
 * @Date: 2020-07-07
*/
<template>
  <div class="main-css MyWaybill">
    <avue-crud ref="params" :data="tableList" :page="page" :option="listOpt" @search-more-toggle="searchMoreToggle" @search-change="searchChange" @row-click="rowClick" @selection-change="selectionChange" @export-excel="outExcel" @search-reset="resetList" :tableLoading="loading" @size-change="sizeChange" @current-change="currentChange" :summaryMethod="summaryMethod">
      <template slot="searchExtend">
        <div class="ibank-total-right">
          <template v-if="countList[0]">
            <div class="ibank-total-con" :class="{'ibank-total-conRight':activeTab === 0}" @click="changeactiveTab(0)">
              {{ $lang('全部订单') }}：<span :class="['ibank-total-num',{'ibank-total-num-ative':activeTab === 0}]">{{generatingThousandthPer(countList[0].num)}}</span>
            </div>
            <div class="ibank-total-con" :class="{'ibank-total-conRight': activeTab === 1}" @click="changeactiveTab(1)">
              {{ $lang('未签收') }}：<span :class="['ibank-total-num',{'ibank-total-num-ative':activeTab === 1}]">{{generatingThousandthPer(countList[1].num)}}</span>
            </div>
            <div class="ibank-total-con" :class="{'ibank-total-conRight': activeTab  === 2}" @click="changeactiveTab(2)">
              {{ $lang('已签收') }}：<span :class="['ibank-total-num',{'ibank-total-num-ative':activeTab === 2}]">{{generatingThousandthPer(countList[2].num)}}</span>
            </div>
            <div class="ibank-total-con" :class="{'ibank-total-conRight': activeTab === 3}" @click="changeactiveTab(3)">
              {{ $lang('已退件') }}：<span :class="['ibank-total-num',{'ibank-total-num-ative':activeTab === 3}]">{{generatingThousandthPer(countList[3].num)}}</span>
            </div>
            <div class="ibank-total-con" :class="{'ibank-total-conRight': activeTab === 4}" @click="changeactiveTab(4)">
              {{ $lang('已取消') }}：<span :class="['ibank-total-num',{'ibank-total-num-ative':activeTab === 4}]">{{generatingThousandthPer(countList[4].num)}}</span>
            </div>
          </template>
        </div>
      </template>
      <template slot="billCode" slot-scope="{row}">
        <div class="overtime_box" @click="goExpressTracking(row)"> {{ row.billCode}} </div>
      </template>
      <template slot="idListSearch">
        <base-input-tag :height="'28px'" @input="codingCodeChange" v-model="formData.codingCode" :addTagOnBlur="true" :clearBtnVisible="true" :limit="100" :placeholder="$lang('最多可查询100条，以逗号、空格或回车键隔开')" validate="codingCode" class="cms-input-tag">
        </base-input-tag>
      </template>
    </avue-crud>

  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import sheetNewMixin from '@/utils/sheetNewMixin'
import BaseInputTag from '@/components/base/BaseInputTagNew.vue'
import { MyOrder } from '@/api'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import { commonFun } from '@public/utils/common'
import { DICT } from '@public/utils/dict.js'
// import dayjs from 'dayjs'
export default {
  name: 'MyWaybill',
  mixins: [mixin, sheetNewMixin],
  components: { BaseInputTag },
  data() {
    return {
      COM_HTTP: MyOrder,
      tableList: [{ a: '1' }],
      activeTab: 0,
      formData: {
        codingCode: []
      },
      countList: [],
      page: {
        size: 50, // 每页显示多少条
        sizes: [50, 100, 200]
      },
      fixedHeight: 16
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
        return h('div', { class: 'table-head', style: { width: '100%' } }, [column.label])
      }
    },
    listOpt() {
      const that = this
      return {
        index: false, // 隐藏序号
        search: true,
        exportBtn: this.hasPower('EXCEL'),
        resetBtn: true,
        // importBtn: true,
        menu: false,
        menuWidth: 100, // 操作宽度
        // searchMore: true,
        searchExtend: true,
        fixHeight: that.fixedHeight,
        showSummary: true, // 展示合计
        column: [
          // {
          //   label: '订单编号',
          //   prop: 'commonMonth',
          //   hide: true,
          //   search: true,
          //   type: 'select',
          //   hasAll: false,
          //   searchClearable: false
          // },
          {
            label: that.$lang('收货时间'),
            prop: '|range',
            type: 'datetimerange',
            search: true,
            hide: true,
            viewDisplay: false,
            addDisplay: false,
            editDisplay: false,
            format: 'yyyy-MM-dd HH:mm:ss',
            searchDefault: that.timerange,
            searchClearable: false,
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            change({ value }) {
              if (value) {
                that.formData.startTime = value[0]
                that.formData.endTime = value[1]
              } else {
                that.$nextTick(_ => {
                  that.$refs.params.searchForm['|range'] = that.timerange
                  that.formData.startTime = that.timerange[0]
                  that.formData.endTime = that.timerange[1]
                })
              }
            }
          },
          {
            label: that.$lang('请选择代折扣标识'),
            prop: 'disSign',
            hide: true,
            search: true,
            type: 'select',
            dicData: DICT.countFlag
          },
          {
            label: that.$lang('请输入'),
            prop: 'idList',
            hide: true,
            search: true,
            searchslot: true
          },
          {
            label: that.$lang('运单编号'),
            prop: 'billCode',
            fixed: true,
            slot: true,
            renderHeader: that.renderHeader,
            minWidth: 110
          },
          {
            label: that.$lang('签收标识'),
            prop: 'billStatus',
            formatter: row => {
              const map = {
                '1': that.$lang('未签收'),
                '2': that.$lang('已签收'),
                '3': that.$lang('已退件'),
                '4': that.$lang('已作废')
              }
              return map[row.billStatus]
            },
            renderHeader: that.renderHeader,
            minWidth: 140
          },
          {
            label: that.$lang('作废原因'),
            prop: 'cancelReason',
            renderHeader: that.renderHeader,
            minWidth: 400
          },
          {
            label: that.$lang('寄件日期'),
            prop: 'sendDate',
            renderHeader: that.renderHeader,
            minWidth: 100
          },
          {
            label: that.$lang('寄件客户'),
            prop: 'sendCus',
            renderHeader: that.renderHeader,
            minWidth: 185
          },
          {
            label: that.$lang('寄件人'),
            prop: 'sender',
            renderHeader: that.renderHeader,
            minWidth: 270
          },
          {
            label: that.$lang('寄件人电话'),
            prop: 'senderPhone',
            renderHeader: that.renderHeader,
            minWidth: 150
          },
          {
            label: that.$lang('寄件城市'),
            prop: 'senderCity',
            renderHeader: that.renderHeader,
            minWidth: 170
          },
          {
            label: that.$lang('寄件地址'),
            prop: 'senderAddr',
            renderHeader: that.renderHeader,
            minWidth: 400
          },
          {
            label: that.$lang('收件人'),
            prop: 'receiver',
            renderHeader: that.renderHeader,
            minWidth: 270
          },
          {
            label: that.$lang('收件人电话'),
            prop: 'receiverPhone',
            renderHeader: that.renderHeader,
            minWidth: 130
          },
          {
            label: that.$lang('收件省份'),
            prop: 'receiverProv',
            renderHeader: that.renderHeader,
            minWidth: 170
          },
          {
            label: that.$lang('收件城市'),
            prop: 'receiverCity',
            renderHeader: that.renderHeader,
            minWidth: 170
          },
          {
            label: that.$lang('收件地区'),
            prop: 'receiverArea',
            renderHeader: that.renderHeader,
            minWidth: 170
          },
          {
            label: that.$lang('收件地址'),
            prop: 'receiverAddr',
            renderHeader: that.renderHeader,
            minWidth: 400
          },
          {
            label: that.$lang('件数'),
            prop: 'goodsNum',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.goodsNum);
            },
            minWidth: 150
          },
          {
            label: that.$lang('物品类型'),
            prop: 'goodsType',
            formatter: row => {
              const map = {
                'BARANG': that.$lang('物品'),
                'DOKUMEN': that.$lang('文件')
              }
              return map[row.goodsType]
            },
            renderHeader: that.renderHeader,
            minWidth: 140
          },
          {
            label: that.$lang('货物重量'),
            prop: 'goodsWeight',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.goodsWeight);
            },
            minWidth: 150
          },
          {
            label: that.$lang('物品价值'),
            prop: 'goodsPrice',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.goodsPrice);
            },
            minWidth: 150
          },
          {
            label: that.$lang('快件类型'),
            prop: 'expressTypeName',
            renderHeader: that.renderHeader,
            minWidth: 140
          },
          {
            label: that.$lang('支付方式'),
            prop: 'payType',
            formatter: row => {
              const map = {
                'PP_PM': this.$lang('月结'),
                'PP_CASH': this.$lang('现金'),
                'CC_CASH': this.$lang('到付')
              }
              return map[row.payType]
            },
            renderHeader: that.renderHeader,
            minWidth: 140
          },
          {
            label: that.$lang('物品名称'),
            prop: 'goodsName',
            renderHeader: that.renderHeader,
            minWidth: 310
          },
          {
            label: that.$lang('运费'),
            prop: 'freight',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.freight);
            },
            minWidth: 150
          },
          {
            label: that.$lang('保价费'),
            prop: 'insFee',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.insFee);
            },
            minWidth: 150
          },
          {
            label: that.$lang('其他费'),
            prop: 'otherFee',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.otherFee);
            },
            minWidth: 150
          },
          {
            label: that.$lang('总运费'),
            prop: 'totalFreight',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.totalFreight);
            },
            minWidth: 150
          },
          {
            label: that.$lang('折扣标识'),
            prop: 'disMark',
            formatter: row => {
              const map = {
                '1': that.$lang('有折扣'),
                '0': that.$lang('没有折扣')
              }
              return map[row.disMark]
            },
            renderHeader: that.renderHeader,
            minWidth: 140
          },
          {
            label: that.$lang('折扣金额'),
            prop: 'disPrice',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.disPrice);
            },
            minWidth: 150
          },
          {
            label: that.$lang('折扣后总运费'),
            prop: 'disAfterTotalFreight',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.disAfterTotalFreight);
            },
            minWidth: 150
          },
          {
            label: that.$lang('代收货款'),
            prop: 'codPrice',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.codPrice);
            },
            minWidth: 150
          },
          {
            label: that.$lang('签收人'),
            prop: 'signer',
            renderHeader: that.renderHeader,
            minWidth: 130
          },
          {
            label: that.$lang('与签收人关系'),
            prop: 'relationWithSigner',
            renderHeader: that.renderHeader,
            minWidth: 140
          },
          {
            label: that.$lang('签收时间'),
            prop: 'signTime',
            renderHeader: that.renderHeader,
            minWidth: 150
          },
          {
            label: that.$lang('备注'),
            prop: 'remark',
            renderHeader: that.renderHeader,
            minWidth: 400
          }
        ]
      };
    },
    timerange() {
      const time2 = commonFun.getBeforeDate(0) + ' 00:00:00'
      // const time1 = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
      const time1 = commonFun.GetTodayDate()
      const timerange = []
      timerange.push(time2, time1[1])
      return timerange
    }
  },
  watch: {},
  activated() {
    if (!this.isShowFirst) {
      this.$nextTick().then(res => {
        this.searchFun()
      })
    }
    this.isShowFirst = false
  },
  methods: {
    // 千分位处理
    generatingThousandthPer(num) {
      num += '';
      const num1 = num.split('.')[0];
      const num2 = num.split('.')[1];
      const c = num1.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
      return num.toString().indexOf('.') !== -1 ? c + ('.') + num2 : c;
    },
    // 单页统计数据
    summaryMethod(param) {
      const { columns, data } = param;
      const columnTypeList = ['goodsNum', 'goodsWeight', 'goodsPrice', 'freight', 'insFee', 'otherFee', 'totalFreight', 'disPrice', 'disAfterTotalFreight', 'codPrice']
      const sums = []
      if (columns.length > 0) {
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = this.$lang('总计')
          } else if (columnTypeList.includes(column.property)) {
            const values = data.map(item => Number(item[column.property]));
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return Math.floor(parseFloat(prev) * 100 + parseFloat(curr) * 100) / 100;
                } else {
                  return prev;
                }
              }, 0);
              if (sums[index]) {
                sums[index] = this.generatingThousandthPer(sums[index])
              } else {
                sums[index] = '--';
              }
            } else {
              sums[index] = '--';
            }
          } else {
            sums[index] = '--';
          }
        })
      }
      return sums;
    },
    searchMoreToggle() { },
    selectionChange() { },
    rowClick() { },
    resetList() {
      this.formData.codingCode = ''
    },
    changeactiveTab(state) {
      this.activeTab = state
      this.page.current = 1
      this.searchFun()
    },
    searchFunParamsHandle_after(params) {
      const time = this.$refs.params.searchForm['|range']
      const { codingCode } = this.formData
      if (time) {
        const startTimes = new Date(time[0]).getTime()
        const endTimes = new Date(time[1]).getTime()
        const space = 30 * 24 * 3600 * 1000
        if (endTimes - startTimes > space) {
          this.$message.error(this.$lang('开始时间与结束时间之差不能大于30天'))
          return false
        }
        params.startTime = time[0]
        params.endTime = time[1]
      }
      let num = ''
      // 列表总数total
      if (this.countList.length > 0) {
        num = this.countList[this.activeTab].num
      }
      if (codingCode && codingCode.length) {
        params = {
          ...params,
          billCodes: codingCode
        }
      }
      params = Object.assign({ num: num }, params)
      this.countOrder(params)
      return params
    },
    async countOrder(param) {
      if (this.activeTab) { param.statusCode = this.activeTab }
      const { code, msg, data } = await this.COM_HTTP.countOrder(param)
      if (code === RESPONSE_SUCCESS) {
        this.countList = data
      } else {
        this.$message.error(this.$lang(msg))
      }
    },
    // 加入导出参数
    getParamForOutExcel() {
      let params = null
      if (this.$refs.params) {
        params = this.rangHandle(this.$refs.params.searchForm)
      }
      const param = this.searchFunParamsHandle(params)
      const sort = []
      const columnNames = []
      this.listOpt.column.forEach((item) => {
        if (!item.hide) {
          sort.push(item.prop)
          columnNames.push(item.label)
        }
      })
      param.columnNames = columnNames
      param.sort = sort
      return param
    },
    codingCodeChange() { },
    // 运单查询
    goExpressTracking(row) {
      const list = []
      list.push(row)
      const query = { wayBillNo: list }
      this.$router.push({ name: 'expressTracking', query: query })
    },
  }
}
</script>

<style lang="scss" scoped>
.MyWaybill {
  .ibank-total-right {
    height: 40px;
    margin-top: 0;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 16px;
    .ibank-total-con {
      border-radius: 4px;
      font-weight: 500;
      line-height: 40px;
      padding: 0 16px;
      font-size: 14px;
      cursor: pointer;
      background: #fff;
      color: #a1a3a6;
    }
    .ibank-total-conRight {
      color: #e60012;
      background: #fef2f3;
    }
  }
  .ibank-total-num {
    padding: 0 5px;
    color: #61666d;
    background: #ebebeb;
    border-radius: 4px;
    font-size: 12px;
  }
  .ibank-total-num-ative {
    border-radius: 4px;
    padding: 0 5px;
    color: #ffffff;
    background: #e60012;
  }
}
</style>

<style lang="scss">
.MyWaybill {
  .avue-crud__search {
    margin: 0 -8px !important;
    .avue-date .el-date-editor {
      width: 360px !important;
      .el-range__close-icon {
        width: 0;
      }
    }
    .el-form-item {
      min-width: 140px;
    }
    .el-input__inner {
      padding-right: 0;
    }
  }
  .el-select {
    width: 140px;
  }
  .input-tag-container {
    width: 140px;
  }
  .overtime_box {
    color: #e60012;
    cursor: pointer;
  }
}
</style>
