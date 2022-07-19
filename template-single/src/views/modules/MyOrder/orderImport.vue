/** * @Description: 页面名称 * @author: jm * @Date: 2020-07-07 */
<template>
<div class="orderImport">
  <div class="main-css orderImport" v-show="!showEditPage">
    <avue-crud
      ref="params"
      :data="tableList"
      :page="page"
      :option="listOpt"
      @search-change="searchChange"
      @row-click="rowClick"
      @size-change="sizeChange"
      @current-change="currentChange"
      @export-excel="outExcel"
      @search-reset="resetList"
      :tableLoading="loading"
      @select-all="handleSelectAll"
      @select="handleSelectionChange"
      :cell-class-name="highLightError"
    >
      <template slot="menuLeftPre">
        <el-alert
          :title="
            $lang(
              '导入流程：导入成功-然后点击批量导入按钮-立即下单，成功后才能自动生成运单编号。'
            )
          "
          type="warning"
          class="orderImport_alert"
          @close="closeAlert"
        >
        </el-alert>
      </template>
      <template slot="searchExtend">
        <div class="ibank-total-right" v-if="importResult">
          <div
            class="ibank-total-con"
            :class="{ 'ibank-total-conRight': activeTab }"
            @click="changeactiveTab(true)"
          >
            {{ $lang('导入成功') }}：<span :class="['ibank-total-num',{'ibank-total-num-ative':activeTab}]">{{
              isOkList.length
            }}</span>
          </div>
          <div
            class="ibank-total-con"
            :class="{ 'ibank-total-conRight': !activeTab }"
            @click="changeactiveTab(false)"
          >
            {{ $lang('导入失败') }}：<span :class="['ibank-total-num',{'ibank-total-num-ative':!activeTab}]">{{
              isErrorList.length
            }}</span>
          </div>
        </div>
      </template>
      <template slot="menuLeft">
        <el-button @click="upload = true" class="btn"
          ><span>{{ $lang('批量导入') }}</span></el-button
        >
        <el-button @click="deleteRow" class="btn"
          ><span>{{ $lang('删除') }}</span></el-button
        >
        <el-button @click="downloadTemplate" class="btn"
          ><span>{{ $lang('下载模板') }}</span></el-button
        >
        <el-button @click="outExcel('download', $lang('地区信息'))" class="btn"
          ><span>{{ $lang('下载地区信息') }}</span></el-button
        >
        <el-button @click="saveOrderClick" class="btn" :loading="uploadOrderLoading"
          ><span>{{ $lang('立即下单') }}</span></el-button
        >
      </template>
    </avue-crud>

    <printeDialog ref="printeDialog"></printeDialog>
  </div>
  <div v-if="upload">
    <BatchUpload
      v-model="upload"
      ref="batchUpload"
      @success="uploadSuccess"
    ></BatchUpload>
  </div>

  <el-dialog
    :title="$lang('下载模板')"
    :visible="downloadShow"
    @close="closeTemplate"
    width="720px"
  >
    <div class="downloadTemplate" v-loading="downloadLoading">
      <p>{{ $lang('请选择下载模板') }}</p>
      <div
        class="downloadTemplate_iconbox"
        v-for="(item, index) in outExcelList"
        :key="index"
        :class="{ active: index === templateIndex }"
        @click="templateIndex = index"
      >
        <i class="iconfont icon-wendang downloadTemplate_icon"></i>
        <span>{{ item.name }}</span>
      </div>
      <div class="downloadTemplate_msg">
        <p>{{ $lang('说明') }}</p>
        <span class="downloadTemplate_msg_first">{{
          $lang('标题红色栏位为必填项，最多只能录入1000行数据；')
        }}</span>
        <span class="downloadTemplate_red">{{ $lang('注意：') + ' ' }}</span>
        <span class="downloadTemplate_red downloadTemplate_margin">{{
          $lang(
            '如果有委托人信息，则委托人标识必须填入1. 如果没有委托人信息，必须填入0'
          )
        }}</span>
        <span class="downloadTemplate_red downloadTemplate_margin">{{
          $lang(
            '如果需要保价，则保价费标识必须填入1. 如果没有保价，则保价费标识必须填入0'
          )
        }}</span>
      </div>
      <span slot="footer" class="bottom-wrap">
        <el-button type="primary" class="downBtn" @click="outExcelTemplate">{{
          $lang('下载模板')
        }}</el-button>
      </span>
    </div>
  </el-dialog>
  <editOrderImport
    ref="editOrderImport"
    :formData.sync="formData"
    @saveForm="saveForm"
  ></editOrderImport>

    <!-- 立即下单进度条 -->
    <div class="el-dialog__wrapper upload-dialog-wrap" v-show="uploadOrderLoading">
      <div class="el-dialog el-dialog__body">
        <p class="upload-dialog-wrap_p">{{$lang('等待上传订单')}}  {{progress}}%</p>
        <span class="upload-dialog-wrap_span">{{$lang('批量下单期间，请勿关闭页面')}}</span>
        <el-progress :percentage="progress" :format="()=> {return ''}" color='#E60012'></el-progress>
      </div>
    </div>
</div>
</template>

<script>
import mixin from '@/mixins/mixin'
import BatchUpload from './components/BatchUpload'
import editOrderImport from './components/editOrderImport'
import { mapGetters } from 'vuex'
import { OrderImport, MyProfile } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
import printeDialog from './components/printeDialog'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' // 是否开发环境
const baseURL = IS_DEVELOPMENT ? '/proxyUrl' : process.env.VUE_APP_API_URL
let timer1 = null
export default {
  name: 'OrderImport',
  mixins: [mixin],
  components: { BatchUpload, editOrderImport, printeDialog },
  data() {
    return {
      isShowFirst: false,
      COM_HTTP: OrderImport,
      importResult: null,
      tableList: [],
      uploadOrderLoading: false, // 批量下单Loading
      activeTab: true,
      downloadShow: false,
      fixedHeight: 70,
      showEditPage: false,
      outExcelList: [
        {
          name: this.$lang('下载模板')
        }
      ],
      downloadLoading: false, // 下载模板loading
      upload: false,
      templateIndex: 0,
      hasErrorMsg: false, // 有错误信息
      formData: {},
      isOkList: [], // 成功列表
      isErrorList: [], // 失败列表
      errorMsgMap: {}, // 失败原因
      rowList: [], // 选中的列表

      progress: 0, // 下单进度
      uploadUrl: `${baseURL}/jts-idn-basics-api/api/basics/uploadFile`,
      page: {
        size: 500,
        current: 1,
        total: 0,
        sizes: [100, 200, 500]
      }
    }
  },
  computed: {
    ...mapGetters(['lang']),
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
        search: false,
        searchExtend: true,
        resetBtn: true,
        menu: false,
        valueFlag: false,
        menuWidth: 100, // 操作宽度
        editBtn: this.hasPower('EDIT'), // 编辑按钮
        searchMore: false,
        tableCustom: true,
        index: false,
        selection: true,
        fixHeight: that.fixedHeight,
        pagination: true,
        isFilterData: true,
        column: [
          {
            label: that.$lang('Excel序号'),
            prop: 'excelNum'
          },
          {
            label: that.$lang('错误信息'),
            prop: 'errorMsg',
            hide: !that.hasErrorMsg || !that.activeTab,
            renderHeader: that.renderHeader,
            minWidth: 110
          },
          {
            label: that.$lang('重量'),
            prop: 'goodsWeight',
            renderHeader: that.renderHeader,
            minWidth: 80,
            formatter: (row) => {
              return this.generatingThousandthPer(row.goodsWeight);
            }
          },
          {
            label: that.$lang('寄件人'),
            prop: 'senderName',
            renderHeader: that.renderHeader,
            minWidth: 130
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
            label: that.$lang('委托人标识'),
            prop: 'isEntrust',
            renderHeader: that.renderHeader,
            minWidth: 80
          },
          {
            label: that.$lang('委托人姓名'),
            prop: 'entrustName',
            renderHeader: that.renderHeader,
            minWidth: 130
          },
          {
            label: that.$lang('委托人电话'),
            prop: 'entrustPhone',
            renderHeader: that.renderHeader,
            minWidth: 150
          },
          {
            label: that.$lang('收件人'),
            prop: 'receiverName',
            renderHeader: that.renderHeader,
            minWidth: 130
          },
          {
            label: that.$lang('收件人电话'),
            prop: 'receiverPhone',
            renderHeader: that.renderHeader,
            minWidth: 150
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
            label: that.$lang('物品名称'),
            prop: 'goodsName',
            renderHeader: that.renderHeader,
            minWidth: 400
          },
          {
            label: that.$lang('物品价值'),
            prop: 'goodsPrice',
            renderHeader: that.renderHeader,
            minWidth: 80,
            formatter: (row) => {
              return this.generatingThousandthPer(row.goodsPrice);
            }
          },
          {
            label: that.$lang('保价费标识'),
            prop: 'insuranceFlag',
            renderHeader: that.renderHeader,
            minWidth: 80
          },
          {
            label: that.$lang('件数'),
            prop: 'goodsNum',
            renderHeader: that.renderHeader,
            minWidth: 80,
            formatter: (row) => {
              return this.generatingThousandthPer(row.goodsNum);
            }
          },
          {
            label: that.$lang('物品类型'),
            prop: 'goodsType',
            renderHeader: that.renderHeader
          },
          {
            label: that.$lang('备注'),
            prop: 'goodsRemark',
            renderHeader: that.renderHeader,
            minWidth: 400
          },
          {
            label: that.$lang('电商订单号'),
            prop: 'ecOrderNo',
            renderHeader: that.renderHeader,
            minWidth: 110
          },
          {
            label: that.$lang('代收货款'),
            prop: 'codFee',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.codFee);
            }
          },
          {
            label: that.$lang('快件类型'),
            prop: 'expressType',
            renderHeader: that.renderHeader,
            minWidth: 110
          },
          {
            label: that.$lang('应收运费'),
            prop: 'receivableFee',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.receivableFee);
            }
          },
          {
            label: that.$lang('其它费'),
            prop: 'otherFee',
            renderHeader: that.renderHeader,
            formatter: (row) => {
              return this.generatingThousandthPer(row.otherFee);
            }
          }
        ]
      }
    }
  },
  watch: {},
  created() {},
  methods: {
    sizeChange(size) {
      this.page.size = size
      if (this.activeTab) {
        this.tableList = this.isOkList.slice((this.page.current - 1) * size, size * this.page.current)
      } else {
        this.tableList = this.isErrorList.slice((this.page.current - 1) * size, size * this.page.current)
      }
    },
    currentChange(current) {
      this.page.current = current
      if (this.activeTab) {
        this.tableList = this.isOkList.slice((current - 1) * this.page.size, this.page.size * current)
      } else {
        this.tableList = this.isErrorList.slice((current - 1) * this.page.size, this.page.size * current)
      }
    },
    highLightError({ row, column }) {
      if (!this.activeTab) {
        const excelNums = Object.keys(this.errorMsgMap)
        if (excelNums.includes(row.excelNum)) {
          // console.log(row, column)
          for (const key in this.errorMsgMap[row.excelNum]) {
            if (key === column.property) {
              return 'highlight-error'
            }
          }
        }
      }
      return
    },
    // 下载模板
    outExcelTemplate() {
      this.downloadLoading = true
      let url = ''
      switch (this.lang) {
        case 'CN':
          url = 'https://app-photo.jet.co.id/vip/exptemplete-Chinese.xls'
          break
        case 'EN':
          url = 'https://app-photo.jet.co.id/vip/exptemplete-English.xls'
          break
        default:
          url = 'https://app-photo.jet.co.id/vip/exptemplete-Indonesia.xls'
          break
      }
      // 创建a标签
      const elink = document.createElement('a')
      // 设置a标签隐藏
      elink.style.display = 'none'
      // 设置a标签的链接属性为url
      elink.href = url
      // 添加a标签到文档节点
      document.body.appendChild(elink)
      // 触发a标签点击
      elink.click()
      // 释放URL对象
      URL.revokeObjectURL(elink.href)
      // 移除刚穿件的a标签
      document.body.removeChild(elink)
      this.downloadLoading = false
      this.downloadShow = false
    },
    // 导入成功
    async uploadSuccess(data, file, valueFlag) {
      console.log('进来了吗')
      if (!data) return;
      console.log(data, file, '导入成功')
      this.valueFlag = valueFlag
      this.importResult = data
      this.isOkList = this.deepClone(data.isOkList || [])
      this.isErrorList = this.deepClone(data.isErrorList || [])
      this.errorMsgMap = data.errorMsgMap || []
      this.changeactiveTab(this.activeTab)
      if (document.createEvent) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("resize", true, true);
        window.dispatchEvent(event);
      } else if (document.createEventObject) {
        window.fireEvent("onresize");
      }
      console.log(this.uploadUrl)
      const fileUrl = await this.exportExcelNew(this.uploadUrl, {file: file.raw, data_digest: 'eQcRUPM0qg5esyazkp9WLIU8qSr0h5YMXzMvviSypYJeq3JwyE2JyKx7dplM3L2GUqfafz6lx2wbSSkX1avguG9PklDOUcn1RzCYXxEh3SA0MZo8ImSxP1t9IXM+O0APRyGE/9P8zTIbetLrX1JAOU/DeT6xGvbgl93mNam7WCnEetOuKoNHhign0a/UgA/Rdcb8YACQqRcU86rM8lUUX3prxVL2YPpvewSSTLkvxyEB4VzW3ksT0p1SLMDnM06Wvyvl7+y9ir9p6OEspoUzE8f0x1d3loFNohl3F0D5PKY6YYygKR862H1+WydE9Z77QqOVpn0wwr0dKFkeDGeN/g=='})
      // 上传文件下载地址
      await this.COM_HTTP.fileLog({fileUrl})
    },
    // 切换tab
    changeactiveTab(state) {
      this.activeTab = state
      this.$refs.params.selectClear()
      this.rowList = []
      if (state) {
        this.page.total = this.isOkList.length
        this.page.current = 1
        this.tableList = this.isOkList.slice(0, this.page.size)
        // 存在errorMsg且不等于--则显示错误信息
        this.hasErrorMsg =
          this.tableList.filter(item => item.errorMsg && item.errorMsg !== '--')
            .length > 0
      } else {
        this.page.total = this.isErrorList.length
        this.page.current = 1
        // this.tableList = this.deepClone(this.isErrorList)
        this.tableList = this.isErrorList.slice(0, this.page.size)
        for (const ele in this.errorMsgMap) {
          // ele 为错误行 处理错误显示
          for (let i = 0; i < this.tableList.length; i++) {
            if (ele === this.tableList[i].excelNum) {
              for (const item in this.errorMsgMap[ele]) {
                // item为错误的字段名
                this.tableList[i][item] = this.errorMsgMap[ele][item]
              }
              break
            }
          }
        }
      }
    },
    // 关闭下载模板弹框
    closeTemplate() {
      this.downloadShow = false
    },
    // 行单击
    rowClick(row, currentColumn) {
      // 点击选择框不做任何操作
      if (currentColumn.type && currentColumn.type === 'selection') return ;
      // 正确列表不允许编辑
      if (this.activeTab) return
      if (!this.activeTab) {
        // 如果是错误的列表
        const formData = this.isErrorList.filter(
          item => item.excelNum === row.excelNum
        )[0]
        const { errorMsgMap } = this;
        if (errorMsgMap[formData.excelNum]) {
          const emptyKey = ['senderCity', 'receiverArea', 'goodsPrice', 'goodsWeight', 'goodsNum', 'codFee', 'receivableFee', 'otherFee']
          Object.keys(errorMsgMap[formData.excelNum]).forEach(v => {
            if (emptyKey.includes(v)) formData[v] = ''
          })
        }
        this.formData = formData;
      }
      //  else {
      //   this.formData = row
      // }
      this.$refs.editOrderImport.showEdit()
      this.showEditPage = true
    },
    closeAlert() {
      this.fixedHeight = 20
      if (document.createEvent) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("resize", true, true);
        window.dispatchEvent(event);
      } else if (document.createEventObject) {
        window.fireEvent("onresize");
      }
    },
    // 下载模板弹窗
    downloadTemplate() {
      this.downloadShow = true
    },
    // 删除
    deleteRow(row, type) {
      if (this.rowList.length === 0) {
        this.$message.warning(this.$lang('至少选中一行数据'))
        return
      }
      this.$confirm(
        this.$lang('确认删除该条信息？'),
        this.$lang('温馨提示'),
        {
          confirmButtonText: this.$lang('确定'),
          cancelButtonText: this.$lang('取消'),
          closeOnClickModal: false,
          customClass: 'common-confirm__topbar',
          confirmButtonClass: 'comfirm-btn'
        }
      )
        .then(() => {
          const list = this.deepClone(this.rowList)
          let tableList = this.deepClone(this.tableList)
          tableList = tableList.filter(item => {
            const arrlist = list.map(v => v.excelNum)
            return !arrlist.includes(item.excelNum)
          })
          if (this.activeTab) {
            this.isOkList = tableList
            this.tableList = this.isOkList
          } else {
            this.isErrorList = tableList
            this.tableList = this.isErrorList
          }
          this.$message.success(this.$lang('删除成功'))
        })
        .catch(err => console.log(err))
    },
    // 全选
    handleSelectAll(rows) {
      this.rowList = rows
    },
    // 选中
    handleSelectionChange(rows) {
      this.rowList = rows
    },
    // 保存
    saveForm(formData) {
      formData.isEntrust = formData.isEntrust === true ? 1 : 0
      this.isErrorList = this.isErrorList.filter(item => {
        if (item.excelNum && formData.excelNum) {
          return Number(item.excelNum) !== Number(formData.excelNum)
        } else {
          return item
        }
      })
      formData.errorMsg = '--'
      let flag = true
      for (let i = 0; i < this.isOkList.length; i++) {
        // 成功数据修改保存
        if (formData.excelNum === this.isOkList[i].excelNum) {
          this.isOkList.splice(i, 1, formData)
          flag = false
          break
        }
      }
      if (flag) {
        // 失败数据修改保存
        this.isOkList.push(formData)
        this.isOkList.sort((a, b) => a.excelNum - b.excelNum)
      }
      if (this.rowList.length > 0) {
        // 被多选的选择后也高亮
        for (let i = 0; i < this.rowList.length; i++) {
          if (this.rowList[i].excelNum === formData.excelNum) {
            this.$refs.params.toggleRowSelection(this.rowList[i], false)
            this.$refs.params.toggleRowSelection(formData, true)
            break
          }
        }
      }
      // 更新到列表
      if (this.activeTab) {
        this.tableList = this.isOkList
        // 判断是否还有错误信息
        this.hasErrorMsg =
          this.tableList.filter(item => item.errorMsg && item.errorMsg !== '--')
            .length > 0
      } else {
        this.changeactiveTab(false)
      }
    },
    // 立即下单
    saveOrderClick() {
      if (this.rowList.length === 0) {
        this.$message.warning(this.$lang('至少选中一行数据'))
        return
      }
      if (!this.activeTab) {
        this.$message.warning(this.$lang('请选择导入成功数据进行上传'))
        return
      }
      this.$confirm(`${this.$lang('您确定要上传选中行数据吗？')}`, this.$lang('温馨提示'), {
        closeOnClickModal: false,
        customClass: 'common-confirm__topbar',
        confirmButtonClass: 'comfirm-btn'
      }).then(async() => {
        this.uploadOrderList()
      })
    },
    async uploadOrderList() {
      const params = {
        lang: this.lang === 'ZN' ? 'zn' : this.lang === 'EN' ? 'en' : 'in',
        filterRepeat: this.valueFlag,
        parameter: this.rowList,
      }
      this.uploadOrderLoading = true
      this.progress = 0
      // 倒计时时长  选择数据越多 时间越长
      let countTimeNumber = 20
      if (this.rowList.length > 10 <= 100) countTimeNumber = 100
      if (this.rowList.length > 100 <= 500) countTimeNumber = 300
      if (this.rowList.length > 500 <= 8000) countTimeNumber = 500
      if (this.rowList.length > 800) countTimeNumber = 700
      // 倒计时开始
      timer1 = setInterval(() => {
        this.progress++
        if (this.progress >= 98) {
          timer1 && clearInterval(timer1)
        }
      }, countTimeNumber)
      let successList = []
      const { data, msg, code } = await this.COM_HTTP.insertOrder(params)
      // 已经完成  清除时间戳
      this.progress = 100
      timer1 && clearInterval(timer1)
      // 等待500ms  待进度条动画完成
      await new Promise(resolve => {
        setTimeout(() => resolve("hello word"), 500);
      });
      if (code === RESPONSE_CODE.SUCCESS) {
        const { billCodes, errors, isErrorList, failCount, successCount } = data
        if (billCodes && billCodes.length > 0) {
          // 有成功的数据 需要在列表中删除
          // 在成功的数据中删除掉成功数据
          // 1.复制选中的数据
          const selectList = this.deepClone(this.rowList)
          // 取出错误的数据excelNum
          const errorExcelNum = isErrorList.map(item => item.excelNum)
          // 取成功的数据
          successList = selectList
            .filter(item => !errorExcelNum.includes(item.excelNum))
            .map(item => item.excelNum)
          this.isOkList = this.isOkList.filter(
            item => !successList.includes(item.excelNum)
          )
          this.page.total = this.isOkList.length
          this.tableList = this.isOkList.slice(0, this.page.size)
          // 调用打印面单
          this.getUserInfo(billCodes)
        }
        if (isErrorList.length > 0) {
          // 如果有上传失败的数据
          this.hasErrorMsg = true
          for (const num in errors) {
            for (let i = 0; i < this.isOkList.length; i++) {
              if (num === this.isOkList[i].excelNum) {
                this.isOkList[i].errorMsg = `${Object.keys(errors[num])[0]}：${
                  Object.values(errors[num])[0]
                }`
                break
              }
            }
          }
        } else {
          this.hasErrorMsg = false
        }
        this.$refs.params.selectClear()
        this.rowList = []
        this.$message.success(
          this.$lang('本次上传') + (failCount + successCount) + this.$lang('条数据，下单成功') + successCount + this.$lang('条，下单失败') + failCount + this.$lang('条')
        )
      } else {
        this.$message.warning(msg)
      }
      this.uploadOrderLoading = false
      this.progress = 0
    },
    // 打印面单
    async getUserInfo(billCodes) {
      this.loading = true
      const params = { loginCode: this.user.loginCode }
      const { data, code } = await MyProfile.getUserInfo(params)
      if (code === RESPONSE_CODE.SUCCESS) {
        // 面单信息
        if (data.faceSheetFormat) {
          data.faceSheetFormat === '0' ? this.$refs.printeDialog.radio = '3' : this.$refs.printeDialog.radio = data.faceSheetFormat
        }
        // 折扣信息
        if (data.discountInformation) {
          this.$refs.printeDialog.showDiscount = data.discountInformation === '1' || data.discountInformation === '0'
        }
        this.$refs.printeDialog.showDialog(billCodes.toString())
      }
      this.loading = false
    },
    // 千分位处理
    generatingThousandthPer(num) {
      num += '';
      const num1 = num.split('.')[0];
      const num2 = num.split('.')[1];
      const c = num1.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
      return num.toString().indexOf('.') !== -1 ? c + ('.') + num2 : c;
    }
  }
}
</script>

<style lang="scss" scoped>
.orderImport {
  ::v-deep.avue-crud__searchMore {
    margin-bottom: -30px;
  }
  .upload-dialog-wrap{
    z-index: 6666;
    background: rgba($color: #000000, $alpha: 0.5);
    .el-dialog.el-dialog__body {
      width: 480px;
      padding: 50px 30px;
      text-align: center;
     }
    .upload-dialog-wrap_p{
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        color: #2b2d42;
        line-height: 2.0;
    }
    .upload-dialog-wrap_span{
      font-size: 12px;
      line-height: 3.0;
    }
  }
  .ibank-total-right {
    display: flex;
    justify-content: flex-start;
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
      background: #FEF2F3;
    }
  }
  .ibank-total-num{
    padding: 0 5px;
    color: #61666D;
    background: #ebebeb;
    border-radius: 4px;
    font-size: 12px;
  }
  .ibank-total-num-ative{
    border-radius: 4px;
    padding: 0 5px;
    color: #FFFFFF;
    background: #E60012;
  }
  .btn {
    background: #ffffff;
    border: 1px solid #e60012;
    border-radius: 4px;
    color: #e60012;
    margin-right: 16px;
  }
  ::v-deep.avue-crud__left {
    width: 100%;
  }
  .orderImport_alert {
    width: 100%;
    margin: 0 0 16px 0;
    background: rgba(246, 188, 62, 0.05);
    border: 1px solid rgba(246, 188, 62, 0.5);
    border-radius: 8px;
    color: #61666d;
  }
  .downloadTemplate {
    margin: 0;
    p {
      font-size: 16px;
      font-weight: 600;
      color: #2B2D42;
      line-height: 18px;
      margin: 14px 0 10px;
    }
    .downloadTemplate_iconbox {
      width: 172px;
      height: 154px;
      border: 2px solid #c4c8cc;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 0;
      .downloadTemplate_icon {
        font-size: 48px;
        color: #e60012;
      }
      span {
        color: #61666d;
        line-height: 16px;
        font-size: 12px;
        margin-top: 10px;
      }
    }
    .downloadTemplate_iconbox.active {
      border-color: #e60012;
    }
    .downloadTemplate_msg {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      .downloadTemplate_red {
        color: #e60012;
        font-size: 12px;
        line-height: 16px;
        margin-top: 16px;
        margin-bottom: 6px;
      }
      .downloadTemplate_margin {
        margin: 0 0 6px;
      }
      .downloadTemplate_msg_first {
        font-size: 12px;
        line-height: 16px;
        color: #61666D;
      }
    }
    .bottom-wrap {
      margin-top: 40px;
      display: flex;
      justify-content: center;
      .downBtn {
        background: #e60012;
        border-radius: 4px;
        height: 32px;
        color: #fff;
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>

<style lang="scss">
.orderImport {
  .highlight-error {
    border: 1px solid #E60012 !important;
    .cell{
      color: #E60012 !important;
    }
  }
  // .highlight-error+.highlight-error{
  //   border-left-color: #00000000 !important;
  // }
  .el-alert{
    padding: 10px 16px;
    .el-alert__title{
      font-size: 12px;
    }
    .el-alert__content{
      padding: 0;
      height: 18px;
      line-height: 18px;
    }
    .el-alert__closebtn{
      top: 13px;
    }
  }
}
</style>
