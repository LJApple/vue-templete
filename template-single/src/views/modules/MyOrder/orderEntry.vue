<!--
 * @Author: jinmiao
 * @Date: 2021-07-19 09:16:26
 * @Description: 订单录入
 * @LastEditTime: 2022-02-28 17:14:41
-->
<template>
  <div class="order-entry">
    <senderInfo ref="senderInfo"></senderInfo>
    <receiverInfo class="interval" ref="receiverInfo"></receiverInfo>
    <cargoInformation class="interval" ref="cargoInformation" :payType="payType" @goodsCost="goodsCost"  @disInsMark="disInsMark" @goodsinsurance="goodsinsurance" @selectexpressType="selectexpressType"></cargoInformation>
    <costInfo class="interval" ref="costInfo" :payType="payType" :goodsCosts="goodsCosts" :disInsMarks="disInsMarks" :goodsinsurances="goodsinsurances"></costInfo>
    <div class="bottom-wrap interval">
      <el-row>
        <el-button class="btn" @click="cleanAll">{{$lang('清除所有')}}</el-button>
        <el-button class="btn red" :disabled="disabled" @click="showSaveOrderflag">{{$lang('保存订单')}}</el-button>
      </el-row>
  </div>
  <div class="dialogbox">
        <el-dialog
          :title="$lang('是否保存订单？')"
          :visible.sync="dialogVisible"
          :close-on-click-modal='false'
          :close-on-press-escape='false'
          width="600px">
          <el-switch
            v-model="isFilterRepeat"
            active-color="#e60012"
            inactive-color="#9499A3">
          </el-switch>
          <span class="dialogbox_txt">{{$lang('过滤重复电商订单号')}}</span>
          <span slot="footer" class="dialog-footer flex flex_center">
            <el-button @click="dialogVisible = false">{{$lang('取消')}}</el-button>
            <el-button type="primary" class="dialogBtn" :loading="subLoading" @click="saveOrder">{{$lang('保存')}}</el-button>
          </span>
    </el-dialog>
  </div>
  <printeDialog ref="printeDialog"></printeDialog>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import senderInfo from './components/senderInfo'
import receiverInfo from './components/receiverInfo'
import cargoInformation from './components/cargoInformation'
import costInfo from './components/costInfo'
import printeDialog from './components/printeDialog'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import { OrderController, MyProfile } from '@/api'
import { mapActions } from 'vuex'
import { commonFun } from '@public/utils/common'
export default {
  name: 'OrderEntry',
  mixins: [mixin],
  components: {
    senderInfo,
    receiverInfo,
    cargoInformation,
    costInfo,
    printeDialog
  },
  data() {
    return {
      isShowFirst: false,
      COM_HTTP: OrderController,
      subLoading: false,
      disabled: false,
      dialogVisible: false,
      isFilterRepeat: true,
      payType: false,
      goodsCosts: '0',
      radio: 3,
      showDiscount: false,
      disInsMarks: '1',
      goodsinsurances: false,
      AllList: {},
      effective: {
        effectiveTime: ''
      }
    }
  },
  computed: {
    freightlist() {
      return this.$store.getters.freightlist
    }
  },
  watch: {
    freightlist: {
      immediate: true,
      handler: function (newval) {}
    }
  },
  created() {
    this.Freight_List({})
    // 取消根据客户信息进行隐藏 包裹保险 修改于 2021-12-02
    // this.customerInfo()
    this.getUserInfo()
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  methods: {
    ...mapActions(['Freight_List']),
    // async customerInfo() {
    //   const { code, data } = await this.COM_HTTP.customerInfo()
    //   if (code === RESPONSE_SUCCESS) {
    //     if (data && data.custype === 'CEK') {
    //       this.payType = true
    //     }
    //   }
    // },
    goodsCost(v) {
      this.goodsCosts = v.toString()
    },
    disInsMark(v) {
      this.disInsMarks = v.toString()
    },
    goodsinsurance(v) {
      this.goodsinsurances = v
    },
    selectexpressType(v) {
      this.effective = v
      console.log('dayjs时间', v)
      this.effective.effectiveTime = v.effectiveTime ? v.effectiveTime.trim().split(' ')[1] : '23:59:59'
    },
    async getUserInfo() {
      this.loading = true
      const params = { loginCode: this.user.loginCode }
      const { data, code } = await MyProfile.getUserInfo(params)
      if (code === RESPONSE_SUCCESS) {
        // 面单信息
        if (data.faceSheetFormat) {
          data.faceSheetFormat === '0' || data.faceSheetFormat === "3" ? this.$refs.printeDialog.radio = '2' : this.$refs.printeDialog.radio = data.faceSheetFormat
        }
        // 折扣信息
        if (data.discountInformation) {
          this.$refs.printeDialog.showDiscount = true || false
        }
      }
    },
    async showSaveOrderflag() {
      try {
        this.dialogVisible = false
        const sender = await this.$refs.senderInfo.checkformData()
        const receive = await this.$refs.receiverInfo.checkformData(sender)
        const cargoInformation = await this.$refs.cargoInformation.checkformData(receive)
        const costInfo = await this.$refs.costInfo.checkformData(cargoInformation)
        // console.log('sender', sender, receive, cargoInformation, costInfo)
        if (this.CompareDate(commonFun.getCurDate().hour, this.effective.effectiveTime)) {
          // this.$message.error(`${this.$lang('快件类型')}${this.effective.name}，${this.$lang('有效下单时间范围是')} ：00:00:00-${this.effective.effectiveTime}`)
          this.$alert(`<span style="color:#333333">${this.$lang('快件类型')}${this.effective.name}，${this.$lang('有效下单时间范围是')} ：00:00:00-${this.effective.effectiveTime}</span>`, '', {
            dangerouslyUseHTMLString: true,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false
          });
          return
        }
        if (sender && receive && cargoInformation && costInfo) {
          this.AllList = Object.assign(this.$refs.senderInfo.formData, this.$refs.receiverInfo.formData, this.$refs.cargoInformation.formData, this.$refs.costInfo.formData)
          this.AllList.isFilterRepeat = this.isFilterRepeat
          this.AllList.receiverArea = this.$store.getters.freightlist.receiverArea
          this.AllList.senderCity = this.$store.getters.freightlist.senderCity
          this.dialogVisible = !this.dialogVisible
        }
      } catch (err) {
        console.log(err)
      }
    },
    CompareDate(t1, t2) {
      const date = new Date();
      const a = t1.split(':');
      const b = t2.split(':');
      return date.setHours(a[0], a[1]) > date.setHours(b[0], b[1]);
    },
    saveOrder() {
      this.OrderController({...this.AllList, ...{ isFilterRepeat: this.isFilterRepeat }})
    },
    async OrderController(reqData) {
      this.subLoading = true
      const { code, msg, data } = await this.COM_HTTP.addOrder(reqData)
      if (code === RESPONSE_SUCCESS) {
        this.$message.success(this.$lang('下单成功！'))
        this.$refs.printeDialog.showDialog(data.billCode)
        this.cleanSome()
        this.dialogVisible = false
      } else {
        this.$message.warning(this.$lang(msg))
      }
      this.subLoading = false
    },
    cleanSome() {
      if (!this.$refs.senderInfo.locked) { this.$refs.senderInfo.resetData() }
      if (!this.$refs.receiverInfo.locked) { this.$refs.receiverInfo.resetData() }
      if (!this.$refs.cargoInformation.locked) { this.$refs.cargoInformation.resetData() }
      // this.$refs.costInfo.resetData()
    },
    cleanAll() {
      this.$refs.senderInfo.resetData()
      this.$refs.receiverInfo.resetData()
      this.$refs.cargoInformation.resetData()
      this.$refs.costInfo.resetData()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-entry{
  padding: 16px;
  background: #fff;
  border-radius: 0 4px 4px 4px;
  overflow-y: auto;
}
.interval{
  margin-top: 20px;
}
.bottom-wrap{
  border-radius: 12px;
   background-color: #ffffff;
   text-align: center;
   padding: 4px 0 8px;
  .btn{
    width: 120px;
    background: #ffffff;
    border: 1px solid $-color-brand;
    border-radius: 4px;
    font-size: 14px;
    color: $-color-brand;
    line-height: 24px;
  }
  .red{
    background: $-color-brand;
    color: #ffffff;
    margin-left: 16px;
  }
}
.dialogbox{
  .el-button{
    border-radius: 8px;
  }
  .dialogBtn{
    background: $-color-brand;
    color: #ffffff;
    margin-left: 20px;
  }
  .dialogbox_txt{
    margin-left: 10px;
    color: #61666d;
  }
}
.flex{
  display: flex;
  &_center{
    justify-content: center;
    align-items: center;
  }
}
</style>
