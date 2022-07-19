<!--
 * @Author: jinmiao
 * @Date: 2021-07-19 15:58:45
 * @Description: file content
 * @LastEditTime: 2022-03-11 11:53:48
-->
<template>
  <!-- senderInfo.vue -->
  <div class="sender-info-wrap">
    <div class="sender-info-top">
      <div class="sender-info-top-title">{{$lang('费用信息')}}</div><span class="sender-info-top-subtitle">{{$lang('标*为必填项')}}</span>
      <div class="save-address">
      <!-- <span @click="changeLock" :class="{'lockIcon':!locked}">
        <i class="iconfont icon-qita_ico_weisuo" v-if="!locked"></i>
        <i class="iconfont icon-qita_ico_suoding" v-if="locked"></i> {{locked? $lang('已锁定') : $lang('未锁定')}}</span> -->
      </div>
    </div>
    <div class="sender-info-center">
      <el-form :model="formData" :rules="rules" ref="formData">
      <el-row :gutter="16">
      <el-col :span="6">
       <el-form-item :label="$lang('代收货款') + '：'" prop="codFee">
              <el-input  size="medium"
                v-thousands.codFee="formData"
                v-model="formData.codFee"
                :placeholder="$lang('请输入')"
                maxlength="11"
                clearable></el-input>
                <!-- @input="formData.codFee=formData.codFee?formData.codFee.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'):''" -->
            </el-form-item>
      </el-col>
      <el-col :span="6">
       <el-form-item :label="$lang('应收运费') + '：'" prop="receivableFee">
              <el-input  size="medium"
                v-thousands.receivableFee="formData"
                v-model="formData.receivableFee"
                :placeholder="$lang('请输入')"
                maxlength="11"
                clearable></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item :label="$lang('保价费') + '：'">
              <el-input  size="medium"
                v-thousands.insuranceFee="formData"
                v-model="formData.insuranceFee"
                :placeholder="$lang('请输入')"
                :disabled="true"
                clearable></el-input>
            </el-form-item>
        </el-col>
         <el-col :span="6">
         <el-form-item :label="$lang('其他费用') + '：'" prop="otherFee" style="margin-bottom: 30px;">
              <el-input  size="medium"
                v-thousands.otherFee="formData"
                v-model="formData.otherFee"
                :placeholder="$lang('请输入')"
                maxlength="11"
                clearable></el-input>
                <!-- formData.otherFee && formData.otherFee instanceof String? formData.otherFee.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'):formData.otherFee -->
            </el-form-item>
        </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import { OrderController } from '@/api'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import { mapActions } from 'vuex'
import debounce from 'lodash/debounce'
import {
  RULES
} from '@public/utils/rules'
export default {
  name: 'CostInfo',
  mixins: [mixin],
  props: {
    payType: {
      type: Boolean,
      default: false
    },
    goodsCosts: {
      type: String,
      default: '0'
    },
    disInsMarks: {
      type: String,
      default: '0'
    },
    goodsinsurances: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      COM_HTTP: OrderController,
      isShowFirst: false,
      formData: {
        codFee: '', // 代收货款
        receivableFee: '', // 应收运费
        insuranceFee: '', // 保价费
        otherFee: '' // 其他费
      },
      rules: {
        codFee: [RULES.collectingMoney, RULES.floatingNum],
        receivableFee: [RULES.required, RULES.collectingMoneyBig, RULES.floatingNum],
        otherFee: [RULES.collectingMoneyBig, RULES.floatingNum]
      },
      locked: true, //  锁定
      receivableFee: 0
    }
  },
  components: {
  },
  computed: {
    freightlist() {
      return this.$store.getters.freightlist
    },
    showMoney() {
      return s => {
        return `${s ? Number(s).toLocaleString() : ''}`;
      }
    }
  },
  watch: {
    freightlist: {
      immediate: true,
      handler: debounce(async function (newval, old) {
        await this.orderfreight(newval)
        this.$nextTick(() => {
          const { expressType, receiverArea, senderCity, weight, numbers } = newval
          if (expressType && receiverArea && senderCity && weight && !isNaN(weight) && numbers && !isNaN(numbers) && old) {
            // 判断是否已经结束，后修改
            if (this.receivableFee !== 0) {
              this.formData.receivableFee = this.receivableFee
              this.$nextTick(() => {
                this.receivableFee = 0
              })
            }
          }
        }, 300)
      })
    },
    goodsCosts: {
      immediate: true,
      handler(nval) {
        if (!this.payType) {
          this.set_insuranceFee(this.disInsMarks !== '1' && this.goodsinsurances ? this.goodsCosts : '')
          // this.formData.insuranceFee = (this.disInsMarks !== '1' && this.goodsinsurances) ? (nval.replace(/,/g,'') * 0.002).toFixed(2) : ''
        }
      }
    },
    disInsMarks: {
      immediate: true,
      handler(nval) {
        if (!this.payType) {
          this.set_insuranceFee(nval !== '1' && this.goodsinsurances ? this.goodsCosts : '')
          // this.formData.insuranceFee = (nval !== '1' && this.goodsinsurances) ? (this.goodsCosts.replace(/,/g,'') * 0.002).toFixed(2) : ''
        }
      }
    },
    goodsinsurances: {
      immediate: true,
      handler(nval) {
        if (!this.payType) {
          this.set_insuranceFee(nval && this.disInsMarks !== '1' ? this.goodsCosts : '')
          // this.formData.insuranceFee = (nval && this.disInsMarks !== '1') ? (this.goodsCosts.replace(/,/g,'') * 0.002).toFixed(2) : ''
        }
      }
    }
  },
  created() {

  },
  mounted() { this.haveLock() },
  methods: {
    ...mapActions(['Freight_List', 'CostInfo_List']),
    changeLock() {
      this.locked = !this.locked
      this.locked ? this.CostInfo_List(this.formData) : this.CostInfo_List({})
    },
    haveLock() {
      if (this.$store.state.base.costInfoList) {
        Object.assign(this.formData, this.$store.state.base.costInfoList)
      }
    },
    // 清空已填写信息
    resetData() {
      this.formData = {
        codFee: '', // 代收货款
        receivableFee: '', // 应收运费
        insuranceFee: '', // 保价费
        otherFee: '' // 其他费
      }
      if (this.$refs['formData'] !== undefined) { this.$refs.formData.resetFields(); }
    },
    // 寄件人地址薄
    changeSenderType() {},
    checkformData(flag) {
      return new Promise((resolve, reject) => {
        this.$refs['formData'].validate(valid => {
          console.log(flag, '费用', valid)
          if (valid) {
          // 校验通过
          // Object.assign(this.formData, list)
            resolve(true)
          } else {
            // this.$message.warning(this.$lang('请填写完整费用信息'))
            reject(false)
          }
        })
      })
    },
    async orderfreight(params) {
      console.log('params', params, this.receivableFee)
      if (!params.expressType || !params.receiverArea || !params.senderCity || !params.weight || !params.numbers) {
        this.formData.receivableFee = ''
        return
      }
      const { code, data } = await this.COM_HTTP.orderfreight(params)
      if (code === RESPONSE_SUCCESS) {
        if (data.fee && data.fee > 0) {
          this.formData.receivableFee = data.fee
        } else if (data.fee === 0) {
          this.formData.receivableFee = ''
          this.$message.warning(this.$lang('此地区域暂未开通，请联系客户或选择其他区域'))
        }
      }
    },
    set_insuranceFee(num) {
      num = (num.replace(/,/g, '') * 0.002).toFixed(2).toString();
      const num1 = num.split(".")[0]
      const num2 = parseInt(num.split(".")[1]);
      const c = num1.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1");
      this.formData.insuranceFee = num2 ? c + "." + num2 : c;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./scss/senderInfo.scss";
</style>
