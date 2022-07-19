/** * @Description: 页面名称 * @author: jm * @Date: 2020-07-07 */
<template>
  <div class="main-css orderManagement">
    <avue-crud
      ref="params"
      :data="tableList"
      :page="page"
      :option="listOpt"
      @search-more-toggle="searchMoreToggle"
      @search-change="searchChange"
      @row-click="rowClick"
      @selection-change="selectionChange"
      @export-excel="outExcel"
      @search-reset="resetList"
      :tableLoading="loading"
      @size-change="sizeChange"
      @current-change="currentChange"
      :summaryMethod="summaryMethod"
    >
      <template slot="menuLeft">
        <el-button class="btn" @click="printrOrder" v-if="hasPower('PRINT')"
          ><span>{{ $lang('面单打印') }}</span></el-button
        >
        <el-button class="btn" @click="cancelOrder" v-if="hasPower('CANCEL')"
          ><span>{{ $lang('作废') }}</span></el-button
        >
        <el-button class="btn" @click="followOrder"
          ><span>{{ $lang('快件跟踪') }}</span></el-button
        >
        <el-button class="btn" @click="fastOrderOutExcel" v-if="hasPower('TRACKING_EXCEL')"
          ><span>{{ $lang('导出快件跟踪地址') }}</span></el-button
        >
        <!-- <el-button  class="btn"><span>{{$lang('导出')}}</span></el-button> -->
      </template>
      <template slot="menuRight">
        <div class="search-more-button" @click="searchMore">{{ $lang('高级搜索') }}</div>
      </template>
      <template slot="searchExtend">
        <div class="ibank-total-right">
          <template v-if="countList[0]">
            <div class="ibank-total-con" :class="{ 'ibank-total-conRight': activeTab === 0 }" @click="changeactiveTab(0)">
              {{ $lang('全部订单') }}：<span :class="['ibank-total-num', { 'ibank-total-num-ative': activeTab === 0 }]">{{ generatingThousandthPer(countList[0].num) }}</span>
            </div>
            <div class="ibank-total-con" :class="{ 'ibank-total-conRight': activeTab === 1 }" @click="changeactiveTab(1)">
              {{ $lang('未寄件') }}：<span :class="['ibank-total-num', { 'ibank-total-num-ative': activeTab === 1 }]">{{ generatingThousandthPer(countList[1].num) }}</span>
            </div>
            <div class="ibank-total-con" :class="{ 'ibank-total-conRight': activeTab === 2 }" @click="changeactiveTab(2)">
              {{ $lang('寄件中') }}：<span :class="['ibank-total-num', { 'ibank-total-num-ative': activeTab === 2 }]">{{ generatingThousandthPer(countList[2].num) }}</span>
            </div>
            <div class="ibank-total-con" :class="{ 'ibank-total-conRight': activeTab === 3 }" @click="changeactiveTab(3)">
              {{ $lang('已签收') }}：<span :class="['ibank-total-num', { 'ibank-total-num-ative': activeTab === 3 }]">{{ generatingThousandthPer(countList[3].num) }}</span>
            </div>
            <div class="ibank-total-con" :class="{ 'ibank-total-conRight': activeTab === 4 }" @click="changeactiveTab(4)">
              {{ $lang('已退件') }}：<span :class="['ibank-total-num', { 'ibank-total-num-ative': activeTab === 4 }]">{{ generatingThousandthPer(countList[4].num) }}</span>
            </div>
            <div class="ibank-total-con" :class="{ 'ibank-total-conRight': activeTab === 5 }" @click="changeactiveTab(5)">
              {{ $lang('已取消') }}：<span :class="['ibank-total-num', { 'ibank-total-num-ative': activeTab === 5 }]">{{ generatingThousandthPer(countList[5].num) }}</span>
            </div>
          </template>
        </div>
      </template>
      <template slot="idListSearch">
        <base-input-tag
          :height="'28px'"
          @input="codingCodeChange"
          v-model="formData.codes"
          :addTagOnBlur="true"
          :clearBtnVisible="true"
          :limit="500"
          :placeholder="$lang('最多可查询500条，以逗号、空格或回车键隔开')"
          validate="codingCode"
          class="cms-input-tag"
        >
        </base-input-tag>
      </template>
      <template slot="billCode" slot-scope="{ row }">
        <div class="overtime_box" @click="goExpressTracking(row)">{{ row.billCode }}</div>
      </template>
    </avue-crud>

    <el-drawer :title="$lang('高级搜索')" :visible.sync="searchMoreVisible" direction="rtl" :modal="false" :wrapperClosable="false" :destroy-on-close="true" size="326px">
      <div class="order_checkoutBox_outbox">
        <div class="order_checkoutBox">
          <span class="order_checkoutBox_title">{{ $lang('订单来源：') }}</span>
          <div class="checkbox_ds">
            <!-- <el-checkbox :indeterminate="formData.orderSourcecheck" v-model="formData.orderSourcecheck" @change="handleCheckAllChange(formData.orderSourcecheck,'orderSource')" class="order_checkoutBox_all">{{$lang('全选')}}</el-checkbox> -->
            <el-checkbox-group v-model="formData.orderSource">
              <el-checkbox :label="1" :name="$lang('VIP订单')" class="order_checkoutBox_all">{{ $lang('VIP订单') }}</el-checkbox>
              <el-checkbox :label="2" :name="$lang('电商订单')" class="order_checkoutBox_all">{{ $lang('电商订单') }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="order_checkoutBox" v-if="printLogo && printLogo.length !== 0">
          <span class="order_checkoutBox_title">{{ $lang('打印状态：') }}</span>
          <div class="checkbox_ds">
            <el-checkbox-group v-model="formData.printMark">
              <el-checkbox v-for="(item, index) in printLogo" :label="item.value" :key="index" class="order_checkoutBox_all">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="order_checkoutBox" v-if="ecSourceList && ecSourceList.length !== 0">
          <span class="order_checkoutBox_title">{{ $lang('电商来源：') }}</span>
          <div class="checkbox_ds">
            <el-select v-model="formData.ecSourceList">
              <el-option v-for="item in ecSourceList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>
        </div>
        <div class="order_checkoutBox">
          <span class="order_checkoutBox_title">{{ $lang('折扣标识：') }}</span>
          <div class="checkbox_ds">
            <!-- <el-checkbox :indeterminate="formData.printMarkscheck" v-model="formData.printMarkscheck" @change="handleCheckAllChange(formData.printMarkscheck,'printMarks')" class="order_checkoutBox_all">{{$lang('全选')}}</el-checkbox> -->
            <el-checkbox-group v-model="formData.printMarks">
              <el-checkbox :label="1" class="order_checkoutBox_all">{{ $lang('有折扣') }}</el-checkbox>
              <el-checkbox :label="2" class="order_checkoutBox_all">{{ $lang('没有折扣') }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="order_checkoutBox">
          <span class="order_checkoutBox_title">{{ $lang('代收货款：') }}</span>
          <div class="checkbox_ds">
            <!-- <el-checkbox :indeterminate="formData.havCodcheck" v-model="formData.havCodcheck" @change="handleCheckAllChange(formData.havCodcheck,'havCod')" class="order_checkoutBox_all">{{$lang('全选')}}</el-checkbox> -->
            <el-checkbox-group v-model="formData.havCod">
              <el-checkbox :label="1" class="order_checkoutBox_all">{{ $lang('有代收货款') }}</el-checkbox>
              <el-checkbox :label="2" class="order_checkoutBox_all">{{ $lang('无代收货款') }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
      <div class="drawer-buttons">
        <el-button type="primary" @click="searchChange($refs.params.searchForm)">{{ $lang('查询') }}</el-button>
        <el-button type="info" @click="resetList">{{ $lang('清空') }}</el-button>
      </div>
    </el-drawer>

    <el-dialog :title="$lang('打印面单')" :visible="printingShow" @close="printingShow = false" width="580px">
      <div class="printingTemplate">
        <div class="printingTemplate_top">
          <div class="printingTemplate_item">
            <img src="~@/assets/images/template_one.jpg" alt="" />
            <el-radio v-model="radio" :label="'1'">{{ $lang('一联电子面单') }}</el-radio>
            <span>10cm*10cm</span>
          </div>
          <div class="printingTemplate_item">
            <img src="~@/assets/images/template_three.jpg" alt="" />
            <el-radio v-model="radio" :label="'2'">{{ $lang('二联电子面单') }}</el-radio>
            <span>10cm*15cm</span>
          </div>
          <!-- <div class="printingTemplate_item">
            <img src="~@/assets/images/template_two.jpg" alt="" />
            <el-radio v-model="radio" :label="'3'">{{ $lang('三联电子面单') }}</el-radio>
            <span>10cm*18cm</span>
          </div> -->
        </div>
        <div class="printingTemplate_center">
          <el-switch v-model="showDiscount" active-color="#e60012" inactive-color="#9499A3"> </el-switch>
          <span class="dialogbox_txt">{{ $lang('显示折扣金额') }}</span>
        </div>
        <span slot="footer" class="bottom-wrap centerBottom">
          <el-button type="primary" class="btn" :loading="printLoading" @click="OrderPrinte">{{ $lang('面单打印') }}</el-button>
        </span>
      </div>
    </el-dialog>

    <div class="invalidData">
      <el-dialog :title="$lang('温馨提示')" :visible.sync="invalidDataVisible" width="600px">
        <span class="dialogbox_txt">{{ $lang('您确定要取消此订单？') }}</span>
        <span slot="footer" class="bottom-wrap">
          <el-button @click="invalidDataVisible = false">{{ $lang('取消') }}</el-button>
          <el-button type="primary btn" @click="clickcancelOrder">{{ $lang('确定') }}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import sheetNewMixin from '@/utils/sheetNewMixin'
import { LabelController, OrderManageController, MyProfile, fastPrinte } from '@/api'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import BaseInputTag from '@/components/base/BaseInputTagNew.vue'
import { commonFun } from '@public/utils/common'
import { DICT } from '@public/utils/dict.js'
import { Util } from '@/utils/utils.js'
// import dayjs from 'dayjs'
export default {
  name: 'OrderManagement',
  mixins: [mixin, sheetNewMixin],
  components: { BaseInputTag },
  data() {
    const that = this
    return {
      imageUrl: '',
      COM_HTTP: OrderManageController,
      searchMoreVisible: false,
      tableList: [{ a: '1' }],
      checkList: ['电商订单'],
      checkListAll: [],
      isIndeterminate: true,
      activeTab: 0,
      printingShow: false,
      showDiscount: false,
      invalidDataVisible: false,
      radio: '2',
      checkAll: '',
      url: '',
      pageUrl: '',
      choiceDate: '', // 时间选择30天，
      formData: {
        orderSourcecheck: false,
        ecSourceListcheck: false,
        printMarkscheck: false,
        havCodcheck: false,
        orderSource: [], // 订单来源
        ecSourceList: that.$lang('全部'), // 电商来源
        printMarks: [], // 折扣标识
        printMark: [], // 打印标识
        havCod: [],
        codes: [],
      },
      printLogo: DICT.printLogo,
      useFilterEmptyParam: true,
      ecSourceList: [],
      searchShow: false,
      countList: [],
      cancelOrderList: [],
      columnList: [],
      page: {
        size: 50, // 每页显示多少条
        sizes: [50, 100, 200],
      },
      printLoading: false, // 面单打印中
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
        search: true,
        exportBtn: this.hasPower('EXCEL'),
        resetBtn: true,
        // importBtn: true,
        menu: false,
        index: false, // 隐藏序号
        menuWidth: 100, // 操作宽度
        updateHeight: true,
        searchExtend: true,
        fixHeight: 24,
        selection: true,
        showSummary: true, // 展示合计
        column: [
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
            },
          },
          // {
          //   label: '收货时间',
          //   prop: 'searchTime',
          //   search: true,
          //   type: 'datetimerange',
          //   searchslot: true,
          //   hide: true
          // },
          {
            label: that.$lang('订单编号'),
            prop: 'codeType',
            hide: true,
            search: true,
            searchDefault: 2,
            type: 'select',
            hasAll: false,
            searchClearable: false,
            dicData: DICT.orderList,
          },
          {
            label: that.$lang('请输入'),
            prop: 'idList',
            hide: true,
            search: true,
            searchslot: true,
          },
          // {
          //   label: that.$lang('请选择打印标识'),
          //   prop: 'printMark',
          //   hide: true,
          //   search: true,
          //   type: 'select',
          //   dicData: DICT.printLogo,
          //   searchslot: true
          // },
          {
            label: that.$lang('运单编号'),
            prop: 'billCode',
            fixed: true,
            slot: true,
            renderHeader: that.renderHeader,
            minWidth: 150,
          },
          {
            label: that.$lang('订单编号'),
            prop: 'id',
            renderHeader: that.renderHeader,
            minWidth: 150,
          },
          {
            label: that.$lang('订单来源'),
            prop: 'orderSource',
            renderHeader: that.renderHeader,
            minWidth: 140,
          },
          {
            label: that.$lang('下单日期'),
            prop: 'sendDate',
            renderHeader: that.renderHeader,
            minWidth: 100,
          },
          {
            label: that.$lang('状态'),
            prop: 'showStatus',
            renderHeader: that.renderHeader,
            minWidth: 200,
          },
          {
            label: that.$lang('寄件客户'),
            prop: 'sendCus',
            renderHeader: that.renderHeader,
            minWidth: 185,
          },
          // {
          //   label: that.$lang('下单账号名称'),
          //   prop: 'orderAccName',
          //   renderHeader: that.renderHeader,
          //   minWidth: 90
          // },
          {
            label: that.$lang('寄件人'),
            prop: 'senderName',
            renderHeader: that.renderHeader,
            minWidth: 270,
          },
          {
            label: that.$lang('寄件人电话'),
            prop: 'senderPhone',
            renderHeader: that.renderHeader,
            minWidth: 150,
          },
          {
            label: that.$lang('寄件省份'),
            prop: 'senderProv',
            renderHeader: that.renderHeader,
            minWidth: 170,
          },
          {
            label: that.$lang('寄件城市'),
            prop: 'senderCity',
            renderHeader: that.renderHeader,
            minWidth: 170,
          },
          {
            label: that.$lang('寄件地址'),
            prop: 'senderAddress',
            renderHeader: that.renderHeader,
            minWidth: 400,
          },
          {
            label: that.$lang('收件人'),
            prop: 'receiverName',
            renderHeader: that.renderHeader,
            minWidth: 270,
          },
          {
            label: that.$lang('收件人电话'),
            prop: 'receiverPhone',
            renderHeader: that.renderHeader,
            minWidth: 150,
          },
          {
            label: that.$lang('收件省份'),
            prop: 'receiverProv',
            renderHeader: that.renderHeader,
            minWidth: 170,
          },
          {
            label: that.$lang('收件城市'),
            prop: 'receiverCity',
            renderHeader: that.renderHeader,
            minWidth: 170,
          },
          {
            label: that.$lang('收件地区'),
            prop: 'receiverArea',
            renderHeader: that.renderHeader,
            minWidth: 170,
          },
          {
            label: that.$lang('收件地址'),
            prop: 'receiverAddress',
            renderHeader: that.renderHeader,
            minWidth: 400,
          },
          {
            label: that.$lang('直运商标识'),
            prop: 'dcMark',
            formatter: row => {
              const map = {
                1: that.$lang('有委托人'),
                0: that.$lang('没有委托人'),
              }
              return map[row.dcMark]
            },
            renderHeader: that.renderHeader,
            minWidth: 180,
          },
          {
            label: that.$lang('直运商名称'),
            prop: 'dcName',
            renderHeader: that.renderHeader,
            minWidth: 180,
          },
          {
            label: that.$lang('直运商电话'),
            prop: 'dcMobile',
            renderHeader: that.renderHeader,
            minWidth: 150,
          },
          {
            label: that.$lang('电商订单号'),
            prop: 'ecOrderNo',
            renderHeader: that.renderHeader,
            minWidth: 150,
          },
          {
            label: that.$lang('件数'),
            prop: 'pcs',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.pcs)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('物品类型'),
            prop: 'goodsTypeCode',
            formatter: row => {
              const map = {
                BARANG: that.$lang('物品'),
                DOKUMEN: that.$lang('文件'),
              }
              return map[row.goodsTypeCode]
            },
            renderHeader: that.renderHeader,
            minWidth: 140,
          },
          {
            label: that.$lang('实际重量'),
            prop: 'realWeight',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.realWeight)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('订单重量'),
            prop: 'orderWeight',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.orderWeight)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('快件类型'),
            prop: 'expressType',
            renderHeader: that.renderHeader,
            minWidth: 140,
          },
          {
            label: that.$lang('支付方式'),
            prop: 'payType',
            formatter: row => {
              const map = {
                PP_PM: this.$lang('月结'),
                PP_CASH: this.$lang('现金'),
                CC_CASH: this.$lang('到付'),
              }
              return map[row.payType]
            },
            renderHeader: that.renderHeader,
            minWidth: 140,
          },
          {
            label: that.$lang('物品名称'),
            prop: 'goodsName',
            renderHeader: that.renderHeader,
            minWidth: 400,
          },
          {
            label: that.$lang('物品价值'),
            prop: 'goodsValue',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.goodsValue)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('实际运费'),
            prop: 'realFreight',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.realFreight)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('订单运费'),
            prop: 'orderFreight',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.orderFreight)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('保价费'),
            prop: 'insFee',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.insFee)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('其他费'),
            prop: 'otherFee',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.otherFee)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('总运费'),
            prop: 'realTotalFreight',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.realTotalFreight)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('折扣金额'),
            prop: 'disPrice',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.disPrice)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('折扣后总运费'),
            prop: 'disAfterTotalFreight',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.disAfterTotalFreight)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('折扣标识'),
            prop: 'disMark',
            formatter: row => {
              const map = {
                1: that.$lang('有折扣'),
                0: that.$lang('没有折扣'),
              }
              return map[row.disMark]
            },
            renderHeader: that.renderHeader,
            minWidth: 140,
          },
          {
            label: that.$lang('代收货款'),
            prop: 'codFee',
            renderHeader: that.renderHeader,
            formatter: row => {
              return this.generatingThousandthPer(row.codFee)
            },
            minWidth: 150,
          },
          {
            label: that.$lang('签收人'),
            prop: 'signer',
            renderHeader: that.renderHeader,
            minWidth: 160,
          },
          {
            label: that.$lang('与签收人关系'),
            prop: 'relationWithSigner',
            renderHeader: that.renderHeader,
            minWidth: 110,
          },
          {
            label: that.$lang('签收时间'),
            prop: 'signTime',
            renderHeader: that.renderHeader,
            minWidth: 110,
          },
          {
            label: that.$lang('打印次数'),
            prop: 'printNum',
            renderHeader: that.renderHeader,
          },
          {
            label: that.$lang('下单账号编号'),
            prop: 'orderAccCode',
            renderHeader: that.renderHeader,
            minWidth: 110,
          },
          {
            label: that.$lang('备注'),
            prop: 'remark',
            renderHeader: that.renderHeader,
            minWidth: 400,
          },
        ],
      }
    },
    timerange() {
      let timerange = []
      if (this.formData.endTime && this.formData.startTime) {
        timerange.push(this.formData.startTime, this.formData.endTime)
      } else {
        const time2 = commonFun.getBeforeDate(0) + ' 00:00:00'
        const time1 = commonFun.GetTodayDate()
        // const time1 = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
        timerange = []
        timerange.push(time2, time1[1])
      }
      return timerange
    },
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
  created() {
    // 获取电商来源
    this.sellerType()
    // 获取用户信息
    this.getUserInfo()
    const query = this.$route.query
    const { startTime = '', endTime = '', activeTab = '', havCod = '' } = query
    if (startTime && endTime) {
      if (activeTab) {
        this.activeTab = +activeTab
      } else {
        this.activeTab = 0
      }
      const havCodList = havCod ? [Number(havCod)] : []
      Object.assign(this.formData, { ...query, ...{ havCod: havCodList, startTime: `${startTime} 00:00:00`, endTime: `${endTime} 23:59:59` } })
    }
  },
  methods: {
    // 千分位处理
    generatingThousandthPer(num) {
      num += ''
      const num1 = num.split('.')[0]
      const num2 = num.split('.')[1]
      const c = num1.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
      return num.toString().indexOf('.') !== -1 ? c + '.' + num2 : c
    },
    // 单页统计数据
    summaryMethod(param) {
      const { columns, data } = param
      const columnTypeList = [
        'realTotalFreight',
        'otherFee',
        'goodsValue',
        'realFreight',
        'orderFreight',
        'insFee',
        'disPrice',
        'disAfterTotalFreight',
        'codFee',
        'pcs',
        'realWeight',
        'orderWeight',
      ]
      const sums = []
      if (columns.length > 0) {
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = this.$lang('总计')
          } else if (columnTypeList.includes(column.property)) {
            const values = data.map(item => Number(item[column.property]))
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr)
                if (!isNaN(value)) {
                  return Math.floor(parseFloat(prev) * 100 + parseFloat(curr) * 100) / 100
                } else {
                  return prev
                }
              }, 0)
              if (sums[index]) {
                sums[index] = this.generatingThousandthPer(sums[index])
              } else {
                sums[index] = '--'
              }
            } else {
              sums[index] = '--'
            }
          } else {
            sums[index] = '--'
          }
        })
      }
      return sums
    },
    // 高级搜索
    searchMore() {
      this.searchMoreVisible = true
    },
    resetList() {
      this.formData = {
        orderSourcecheck: false,
        ecSourceListcheck: false,
        printMarkscheck: false,
        havCodcheck: false,
        orderSource: [], // 订单来源
        ecSourceList: this.$lang('全部'), // 电商来源
        printMarks: [], // 打印标识
        havCod: [],
        codes: [],
        printMark: [],
      }
    },
    printrOrder() {
      if (this.cancelOrderList.length === 0) {
        this.$message.error(this.$lang('请选中一行再进行操作'))
        return
      }
      if (this.cancelOrderList.length > 200) {
        this.$message.error(this.$lang('最多只能打印200个票数'))
        return
      }
      for (let i = 0; i < this.cancelOrderList.length; i++) {
        const index = this.cancelOrderList[i]
        const list = ['PENDING', 'PUSAT_DISPATCH', 'DISPATCH']
        if (list.indexOf(index.orderStatus) === -1) {
          this.$message.error(this.$lang('状态不等于未寄件，不可打印'))
          return
        }
      }
      this.printingShow = true
    },
    // 作废
    cancelOrder() {
      if (this.cancelOrderList.length === 0) {
        this.$message.error(this.$lang('请选中一行再进行操作'))
        return
      }
      if (this.activeTab === 5) {
        this.$message.error(this.$lang('已是取消状态，不能再取消'))
        return
      }
      if (this.cancelOrderList.some(v => v.orderSource !== 'VIP')) {
        this.$message.error(this.$lang('只有VIP订单才能取消'))
        return
      }
      if (this.cancelOrderList.some(v => v.orderStatus !== 'PENDING')) {
        this.$message.error(this.$lang('PENDING状态才能取消'))
        return
      }
      // this.invalidDataVisible = true
      this.$confirm(this.$lang('您确定要取消此订单？'), this.$lang('温馨提示'), {
        confirmButtonText: this.$lang('确定'),
        cancelButtonText: this.$lang('取消'),
        closeOnClickModal: false,
        customClass: 'common-confirm__topbar',
        confirmButtonClass: 'comfirm-btn',
      }).then(async () => {
        this.clickcancelOrder()
      })
    },
    followOrder() {
      if (this.cancelOrderList.length === 0) {
        this.$message.error(this.$lang('请选中一行再进行操作'))
        return
      }
      if (this.cancelOrderList.length > 10) {
        this.$message.error(this.$lang('只能选10个单号'))
        return
      }
      const query = { wayBillNo: this.cancelOrderList }
      this.$router.push({ name: 'expressTracking', query: query })
    },
    // 多选
    selectionChange(list) {
      this.cancelOrderList = list
    },
    async clickcancelOrder(param) {
      const list = []
      this.cancelOrderList.forEach((item, index) => {
        list.push(item.id)
      })
      this.loading = true
      const { code, msg } = await this.COM_HTTP.cancelOrder({ ids: list })
      if (code === RESPONSE_SUCCESS) {
        this.invalidDataVisible = false
        // 接口返回等待5s  防止后端数据未更新
        await new Promise(resolve => {
          console.log('等待5s')
          setTimeout(() => resolve('等待5s'), 5000)
        }).then(msg => {
          console.log(msg)
        })
        this.$message.success(this.$lang(msg))
        this.searchFun()
      } else {
        this.loading = false
        this.$message.error(this.$lang(msg))
      }
    },
    searchMoreToggle() {},
    rowClick(list) {
      // 点击单行触发toggleSelection方法，toggleSelection接收数组为参数
      this.$refs.params.toggleSelection([list])
    },
    changeactiveTab(state) {
      this.activeTab = state
      this.page.current = 1
      this.searchFun()
    },
    handleCheckAllChange(val, name) {
      for (const i in this.formData) {
        if (i.indexOf(name) >= 0) {
          this.formData[name + 'check'] = val
          val ? (this.formData[name] = [1, 2]) : (this.formData[name] = [])
        }
      }
    },
    // 面单打印
    async OrderPrinte() {
      const id = this.cancelOrderList.map((item, index) => item.billCode)
      this.printLoading = true
      await this.updateNum(id)
      let res = ''
      if (id.length > 1) {
        res = await Util.showPDFList({
          style: this.radio,
          ids: id.toString(),
          type: 'pdf',
          discountPrint: this.showDiscount === true ? 1 : 0,
        })
      } else {
        const param = {
          style: this.radio,
          id: id,
          type: 'pdf',
        }
        const discountPrint = this.showDiscount === true ? 1 : 0
        res = await Util.showPDF(param, discountPrint)
      }
      this.$nextTick(() => {
        this.printLoading = false
      })
      if (res.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        window.open(url)
      }
    },
    async updateNum(id) {
      const { code, data } = await fastPrinte.update({ codes: id })
      if (code === RESPONSE_SUCCESS) {
        console.log('更新num', data)
      }
    },
    async printeExpressList() {
      // ids.join(',')
      const param = {
        style: this.radio,
        ids: '1027611586',
        discountPrint: this.showDiscount === true ? 1 : 0,
      }
      const { code, msg, data } = await LabelController.printeExpressList(param)
      if (code === RESPONSE_SUCCESS) {
        console.log('批量打印msg', data, msg)
      }
    },
    // 混入自定义查询参数
    searchFunParamsHandle_after(params) {
      let time = []
      if (this.formData.endTime && this.formData.startTime) {
        time.push(this.formData.startTime, this.formData.endTime)
      } else {
        time = this.$refs.params.searchForm['|range']
      }
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
      const { orderSource, ecSourceList, printMarks, havCod, codes, printMark } = this.formData
      if (printMark.length === 1) {
        params.printMark = Number(printMark.toString())
      }
      const printMarknew = printMarks.length === 1 ? printMarks.toString() : ''
      const havCodnew = havCod.length === 1 ? havCod.toString() : ''
      const orderSourcenew = orderSource.length === 1 ? orderSource.toString() : ''
      let num = ''
      // 列表总数total
      if (this.countList.length > 0) {
        num = this.countList[this.activeTab].num
      }
      let newecSourceList = ecSourceList.split(',')
      newecSourceList = newecSourceList.indexOf(this.$lang('全部')) > -1 ? [] : newecSourceList
      params = Object.assign({ orderSource: orderSourcenew, ecSourceList: newecSourceList, disMark: printMarknew, havCod: havCodnew, num: num, codes: codes }, params)
      // 后端要求如果选择全选不传参数这里出以下判断是否全选然后删除全选的参数
      const list = [1, 2]
      for (const key in params) {
        if (JSON.stringify(params[key]) === '[]') {
          delete params[key]
        }
        if (params[key] === '1,2') {
          delete params[key]
        }
        if (Util.ArrayIsEqual(params[key], list) === true) {
          delete params[key]
        }
      }
      this.countOrder(params)
      return params
    },
    codingCodeChange() {},
    async sellerType(param) {
      const { code, msg, data } = await this.COM_HTTP.sellerType(param)
      if (code === RESPONSE_SUCCESS) {
        data.unshift(this.$lang('全部'))
        this.ecSourceList = data
      } else {
        this.$message.error(this.$lang(msg))
      }
    },
    ecSourceListcheckAll(val) {
      this.formData.ecSourceListcheck = val
      if (val) {
        this.ecSourceList.forEach(item => {
          this.formData.ecSourceList.push(item)
        })
      } else {
        this.formData.ecSourceList = []
      }
    },
    // 列表数量
    async countOrder(param) {
      if (this.activeTab) {
        param.statusCode = this.activeTab
      }
      const { code, msg, data } = await this.COM_HTTP.countOrder(param)
      if (code === RESPONSE_SUCCESS) {
        this.countList = data
      } else {
        this.$message.error(this.$lang(msg))
      }
    },
    // 导出前置函数
    getParamForOutExcel() {
      let params = null
      if (this.$refs.params) {
        params = this.rangHandle(this.$refs.params.searchForm)
      }
      const param = this.searchFunParamsHandle(params)
      const sort = []
      const columnNames = []
      this.listOpt.column.forEach(item => {
        if (!item.hide) {
          sort.push(item.prop)
          columnNames.push(item.label)
        }
      })
      param.columnNames = columnNames
      param.sort = sort
      return param
    },
    // 快件跟踪地址导出
    async exportOrder(param) {
      const { code, msg } = await this.COM_HTTP.exportOrder(param)
      if (code === RESPONSE_SUCCESS) {
        // 成功
      } else {
        this.$message.error(this.$lang(msg))
      }
    },
    // 导出快件跟踪地址
    async fastOrderOutExcel() {
      if (this.cancelOrderList.length === 0) {
        this.$message.error(this.$lang('请选中一行再进行操作'))
        return
      }
      const sort = ['billCode', 'id', 'senderName', 'receiverName', 'receiverArea', 'expressType', 'goodsName', 'etAddrUrl']
      const columnNames = [
        this.$lang('运单编号'),
        this.$lang('订单编号'),
        this.$lang('寄件人'),
        this.$lang('收件人'),
        this.$lang('收件地区'),
        this.$lang('快件类型'),
        this.$lang('物品名称'),
        this.$lang('快件跟踪地址'),
      ]
      const list = []
      // 启用加载中状态
      this.loading = true
      this.cancelOrderList.forEach((item, index) => {
        list.push(item.id)
      })
      const params = {
        ids: list,
        sort,
        columnNames,
      }
      const res = await this.COM_HTTP.exportOrder(params)
      this.loading = false
      // 如果有返回体
      if (res) {
        if (res.fail) {
          this.$message.error(res.msg)
        } else {
          this.outExcelList(res)
        }
      }
    },
    goExpressTracking(row) {
      const list = []
      list.push(row)
      const query = { wayBillNo: list }
      this.$router.push({ name: 'expressTracking', query: query })
    },
    async getUserInfo() {
      const params = { loginCode: this.user.loginCode }
      const { data, code } = await MyProfile.getUserInfo(params)
      if (code === RESPONSE_SUCCESS) {
        // 面单信息
        if (data.faceSheetFormat) {
          data.faceSheetFormat === '0' || data.faceSheetFormat === "3" ? (this.radio = '2') : (this.radio = data.faceSheetFormat)
        }
        // 折扣信息
        if (data.discountInformation) {
          this.showDiscount = true || false
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.orderManagement {
  .btn {
    background: #ffffff;
    border: 1px solid #e60012;
    border-radius: 4px;
    color: #e60012;
    margin-right: 16px;
    min-width: 80px;
  }
  .search-more-button {
    color: #e60012;
    cursor: pointer;
    font-size: 14px;
    line-height: 32px;
  }
  ::v-deep.el-drawer {
    pointer-events: all;
    box-shadow: 0px 4px 20px 0px rgba(62, 63, 65, 0.18);
  }
  .el-drawer__wrapper {
    top: 58px;
    bottom: 10px;
    right: 10px;
    border-radius: 0 4px 4px 0;
    pointer-events: none;
  }
  .drawer-buttons {
    margin: 8px 24px;
    .el-button {
      min-width: 80px;
    }
    .el-button + .el-button {
      margin-left: 16px;
    }
  }
  .order_checkoutBox_outbox {
    border-radius: 8px;
    padding: 16px 24px;
  }
  .order_checkoutBox {
    // display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 24px;
    .order_checkoutBox_all {
      margin-right: 0px;
      margin-top: 3px;
      width: 50%;
      font-weight: 400;
      // margin-left: 20px;
      .el-checkbox__label {
        font-size: 12px;
      }
    }
    .order_checkoutBox_title {
      display: block;
      font-size: 12px;
      color: #61666d;
      line-height: 16px;
      background: #fff;
      display: block;
      width: 100px;
      height: 100%;
      font-weight: 600;
    }
  }
  .ibank-total-right {
    height: 40px;
    margin-top: 0px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
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
  .printingTemplate {
    padding: 20px;
  }
  .printingTemplate_top {
    display: flex;
    justify-content: space-between;
    .printingTemplate_item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-right: 30px;
      img {
        width: 230px;
        height: 340px;
        margin-bottom: 10px;
      }
      ::v-deep.el-radio {
        text-align: center;
      }
    }
    span {
      font-size: 14px;
      color: #61666d;
      line-height: 20px;
      text-align: center;
    }
  }
  .printingTemplate_center {
    margin: 40px 0 30px;
    text-align: center;
    .dialogbox_txt {
      margin-left: 12px;
      color: #4c4d57;
      line-height: 16px;
    }
  }
  .centerBottom {
    display: flex;
    justify-content: center;
  }
  .bottom-wrap {
    .downBtn {
      display: flex;
      justify-content: center;
    }
    .btn {
      background: #e60012;
      border-radius: 8px;
      color: #fff;
    }
  }
  .ibank-total-num {
    padding: 0 5px;
    color: #61666d;
    background: #ebebeb;
    border-radius: 4px;
  }
  .ibank-total-num-ative {
    border-radius: 4px;
    padding: 0 5px;
    color: #ffffff;
    background: #e60012;
    font-size: 12px;
  }
  .checkbox_ds {
    // background: #f7f7f7;
    // display: flex;
    justify-content: flex-start;
    // padding: 10px 20px;
    flex: 1;
  }
  .overtime_box {
    color: #e60012;
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.orderManagement {
  .avue-crud__search {
    margin: 0 -8px !important;
    .avue-date .el-date-editor {
      width: 360px !important;
    }
  }
  .el-select,
  .input-tag-container {
    width: 140px;
  }
  .el-form-item {
    min-width: 140px;
  }
  .el-drawer__wrapper {
    .el-drawer__header {
      height: 48px;
      margin-bottom: 0;
      border-bottom: 1px solid #e8e8e8;
      padding: 0 24px;
      color: #2b2d42;
      font-size: 20px;
      font-weight: 500;
      .el-drawer__close-btn {
        padding-right: 0;
      }
    }
    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
    .el-select {
      margin-top: 8px;
    }
  }
  .order_checkoutBox_all {
    .el-checkbox__label {
      font-size: 12px;
      line-height: 16px;
      .el-checkbox__inner {
        width: 15px;
        height: 15px;
      }
    }
  }
}
</style>
