<!--
 * @Author: jinmiao
 * @Date: 2021-07-19 15:40:54
 * @Description: file content
 * @LastEditTime: 2021-10-28 15:51:21
-->
<template>
  <!-- senderInfo.vue -->
  <div class="sender-info-wrap cargoInformation">
    <div class="sender-info-top">
      <div class="sender-info-top-title">{{$lang('货物信息')}}</div><span class="sender-info-top-subtitle">{{$lang('标*为必填项')}}</span>
      <div class="save-address">
      <span @click="changeLock" :class="{'lockIcon':!locked}" v-if="!showLock">
        <i class="iconfont icon-qita_ico_weisuo" v-if="!locked"></i>
        <i class="iconfont icon-qita_ico_suoding" v-if="locked"></i>{{locked? $lang('已锁定') : $lang('未锁定')}}</span>
      </div>
    </div>
    <div class="sender-info-center">
      <el-form :model="formData" :rules="rules" ref="formData">
      <el-row :gutter="16">
      <el-col :span="6">
       <el-form-item :label="$lang('货物重量') + '：'" prop="cargoWeight">
              <el-input  size="medium"
                v-thousands.cargoWeight="formData"
                v-model.trim="formData.cargoWeight"
                :placeholder="$lang('请输入')"
                class="cargoWeight"
                maxlength="6">
                <template slot="append">kg</template>
                </el-input>
                <!-- (formData.cargoWeight)formData.cargoWeight=formData.cargoWeight && formData.cargoWeight instanceof String?formData.cargoWeight.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'):formData.cargoWeight" -->
            </el-form-item>
      </el-col>
      <el-col :span="6">
       <el-form-item :label="$lang('件数') + '：'" prop="countNum">
              <el-input  size="medium"
                v-thousands.countNum="formData"
                v-model="formData.countNum"
                :placeholder="$lang('请输入')"
                maxlength="6"
                class="cargoWeight">
                <template slot="append">PCS</template>
                </el-input>
            </el-form-item>
        </el-col>
      <el-col :span="6">
        <el-form-item :label="$lang('物品类型') + '：'" prop="goodsType">
           <el-select  v-model="formData.goodsType" size="medium"  :placeholder="$lang('请选择')" class="cargo-information-select">
               <el-option
                    v-for="item in goodsTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
            </el-form-item>
        </el-col>
      <el-col :span="6">
         <el-form-item :label="$lang('快件类型') + '：'" prop="expressType" required style="margin-bottom: 30px;">
              <el-select  v-model="formData.expressType" size="medium" :placeholder="$lang(expressTypeMsg)" @focus='expressTypeFocus' class="cargo-information-select">
                  <el-option
                    v-for="item in expressTypeList"
                    :key="item.name"
                    :label="item.showName"
                    :value="item.name"
                     @click.native="selectChange(item)">
                  </el-option>
                </el-select>
            </el-form-item>
        </el-col>
         </el-row>
      <el-row :gutter="16">
             <el-col :span="24">
                <el-form-item :label="$lang('物品名称') + '：'" prop="goodsName" required style="margin-bottom: 30px;">
                    <el-input  size="medium"
                        v-model="formData.goodsName"
                        :placeholder="$lang('请输入')"
                        type="textarea"
                        resize="none"
                        :rows="2"
                        maxlength="255"
                        show-word-limit
                        clearable></el-input>
                </el-form-item>
             </el-col>
         </el-row>
      <el-row :gutter="16">
        <el-col :span="6">
        <el-form-item :label="$lang('物品价值') + '：'" prop="goodsCost">
            <el-input  size="medium"
                v-thousands.goodsCost="formData"
                v-model="formData.goodsCost"
                :placeholder="$lang('请输入')"
                maxlength="11"
                @input="changeGoodsCost"
                clearable></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item>
          <div class="goodsCostbox" v-if="!payType">
            <el-checkbox v-model="goodsinsurance" :disabled="disInsMark === '1'" @change="payTypeClick"  class="cargo-information-select">{{$lang('包裹保险')}}</el-checkbox>
          </div>
            </el-form-item>
        </el-col>
         <el-col :span="6">
        <el-form-item :label="$lang('电商单号') + '：'" prop="electricityNumber">
            <el-input  size="medium"
                v-model="formData.electricityNumber"
                :placeholder="$lang('请输入')"
                maxlength="30"
                clearable></el-input>
            </el-form-item>
        </el-col>
         <el-col :span="6">
        <el-form-item :label="$lang('备注') + '：'">
            <el-input  size="medium"
                v-model="formData.goodsRemark"
                :placeholder="$lang('请输入')"
                maxlength="255"
                clearable></el-input>
            </el-form-item>
        </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import { mapActions } from 'vuex'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import { OrderController } from '@/api'
import {
  RULES,
  numTwoFloat,
  moreZeroFloat,
  moreZeroInteger,
  maxGoodsCost,
  codeStrike
} from '@public/utils/rules'
export default {
  name: 'CargoInformation',
  mixins: [mixin],
  props: {
    payType: {
      type: Boolean,
      default: false
    },
    showLock: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      COM_HTTP: OrderController,
      isShowFirst: false,
      formData: {
        cargoWeight: '', // 姓名
        countNum: '', // 件数
        goodsType: 'BARANG', // 物品类型
        expressType: '', // 快件类型
        goodsName: '', // 物品名称
        goodsCost: '', // 物品价值
        electricityNumber: '', // 电商单号
        goodsRemark: ''
      },
      locked: true, //  锁定
      goodsTypeList: [{
        value: 'BARANG',
        label: this.$lang('物品')
      }, {
        value: 'DOKUMEN',
        label: this.$lang('文件')
      }],
      expressTypeList: [],
      goodsinsurance: false, // 物品保险
      expressTypeMsg: '',
      disInsMark: '',
      selectexpressType: {}
    }
  },
  components: {
  },
  watch: {
    expressType(newValue, oldValue) {
      this.Freight_List({ expressType: newValue })
    },
    countNum(newValue, oldValue) {
      this.Freight_List({ numbers: Number(newValue) })
    },
    cargoWeight(newValue, oldValue) {
      this.Freight_List({ weight: Number(newValue) })
    },
    freightlist: {
      immediate: true,
      handler: function (newval) {
        this.getExpressType(this.freightlist)
      }
    }
  },
  computed: {
    expressType() {
      return this.formData.expressType
    },
    countNum() {
      return this.formData.countNum
    },
    cargoWeight() {
      return this.formData.cargoWeight
    },
    freightlist() {
      return this.$store.getters.freightlist
    },
    // 数据校验规则
    rules() {
      return {
        cargoWeight: [RULES.required, { validator: this.validatecCargoWeight }, { validator: moreZeroFloat }, { validator: numTwoFloat }],
        countNum: [RULES.required, { validator: moreZeroInteger }, RULES.countlengthSix],
        goodsType: [RULES.required],
        expressType: [RULES.required],
        goodsName: [RULES.required],
        goodsCost: [{ validator: maxGoodsCost }, { validator: numTwoFloat }, this.goodsinsurance && { required: true, message: this.$lang('请输入物品价值'), trigger: ['blur', 'change'] }],
        electricityNumber: [{ validator: codeStrike }, { validator: this.length_25 }]
      }
    }
  },
  created() {

  },
  mounted() {
    this.haveLock()
  },
  methods: {
    // 电商单号规则校验
    length_25(rule, value, callback) {
      if (value && value.length > 25) {
        callback(new Error(this.$lang("不能超过25字符")));
      } else {
        callback();
      }
    },
    validatecCargoWeight(rule, value, callback) {
      this.selectexpressType.minWeight = this.selectexpressType.minWeight || 0.01
      this.selectexpressType.maxWeight = this.selectexpressType.maxWeight || 100
      if (Number(value) && this.selectexpressType.minWeight > Number(value) || this.selectexpressType.maxWeight < Number(value)) {
        callback(new Error(`${this.$lang('只能录入')}${this.selectexpressType.minWeight} - ${this.selectexpressType.maxWeight} KG`));
      } else {
        callback()
      }
    },
    ...mapActions(['Freight_List', 'CargoIn_List']),
    changeGoodsCost() {
      this.$emit('goodsCost', this.formData.goodsCost)
    },
    selectChange(params) {
      // '选中的快递类型'
      this.selectexpressType = params
      this.formData.expressType = params.name
      this.disInsMark = params.disInsMark
      if (params.disInsMark === '1') {
        this.goodsinsurance = false;
      }
      this.$emit('disInsMark', params.disInsMark)
      this.$emit('selectexpressType', params)
    },
    payTypeClick() {
      if (this.disInsMark === '1') {
        this.$message.warning(this.$lang('该快件类型已包含保价费'))
        this.goodsinsurance = false
        return
      }
      this.$emit('disInsMark', this.disInsMark)
      this.$emit('goodsinsurance', this.goodsinsurance)
    },
    // 快件类型 onfocus
    expressTypeFocus() {
      try {
        if (this.expressTypeMsg !== this.$lang('请选择')) {
          this.$message.warning(this.expressTypeMsg)
        }
      } catch (err) {
        console.log(err);
      }
    },
    // 快件类型 获取
    async getExpressType(param) {
      if (!this.freightlist.senderCity || !this.freightlist.receiverArea) {
        var str0 = this.$lang('请录入')
        var str = !this.freightlist.senderCity ? this.$lang('始发地') : ''
        var str2 = !this.freightlist.receiverArea ? this.$lang('目的地') : ''
        this.expressTypeMsg = str0 + str + str2
        this.selectChange({
          name: '',
          disInsMark: ''
        })
        return
      }
      this.expressTypeMsg = this.$lang('请选择')
      try {
        const { code, data } = await this.COM_HTTP.expressType(param)
        if (code === RESPONSE_SUCCESS && data && data.length) {
          this.expressTypeList = data
          const oldSelectIsSave = data.some(v => this.selectexpressType.name && v.name && v.name === this.selectexpressType.name)
          if (!oldSelectIsSave) {
            // 不存在旧数据 刷新数据
            this.selectChange(data[0] || {})
          } else {
            // 存在历史数据 todo someing
          }
        } else {
          this.expressTypeList = []
          this.formData.expressType = ''
          this.disInsMark = ''
          this.expressTypeMsg = this.$lang('始发地和目的地没有维护快件类型')
        }
      } catch (error) {
        console.log(error);
      }
    },
    changeLock() {
      this.locked = !this.locked
      this.locked ? this.CargoIn_List(this.formData) : this.CargoIn_List({})
    },
    haveLock() {
      if (this.$store.state.base.cargoInList) {
        Object.assign(this.formData, this.$store.state.base.cargoInList)
      }
    },
    // 清空已填写信息
    resetData() {
      this.formData = {
        cargoWeight: '', // 姓名
        countNum: '', // 件数
        goodsType: '', // 物品类型
        expressType: '', // 快件类型
        goodsName: '', // 物品名称
        goodsCost: '', // 物品价值
        electricityNumber: '', // 电商单号
        goodsRemark: ''
      }
      if (this.$refs['formData'] !== undefined) { this.$refs.formData.resetFields(); }
    },
    // 寄件人地址薄
    changeSenderType() {},
    checkformData(flag) {
      return new Promise((resolve, reject) => {
        this.$refs['formData'].validate(valid => {
          if (valid) {
            // 校验通过
            const {
              cargoWeight, // 姓名
              countNum, // 件数
              goodsCost, // 物品价值
              electricityNumber // 电商单号
            } = this.formData
            const list = {
              ecOrderNo: electricityNumber,	// string电商单号
              goodsNum: countNum,	// number件数
              goodsPrice: goodsCost,	// number物品价值
              goodsWeight: cargoWeight	// number货物重量
            }
            Object.assign(this.formData, list)
            resolve(true)
          } else {
            // this.$message.warning(this.$lang('请填写完整货物信息'))
            reject(false)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./scss/senderInfo.scss";
.cargoWeight{
    ::v-deep .el-input__inner{
    border-radius: 4px 0 0 4px;
    border-color: #e8e8e8;
}
  ::v-deep .el-input__inner:hover{
    border-color: #e8e8e8 !important;
  }
   ::v-deep .el-input-group__append{
    background: #f2f2f2;
    border-color: #e8e8e8 !important;
    border-radius: 0 4px 4px 0;
    width: 25px;
    text-align: center;
  }
}
.el-select{
  width: 100%;
}
.goodsCostbox{
    margin-top: 17px;
}
.cargo-information-select{
  ::v-deep.el-checkbox__label{
    font-size: 12px;
  }
}
.el-select-dropdown__item{
  font-size: 12px;
}
</style>

<style lang="scss">
  // .el-input-group .el-input-group__append{
  //   background-color: #fff !important;
  //   border-color: #fff !important;
  //   padding: 0 10px;
  // }
  //  .el-input-group .el-input-group__append:hover{
  //   border-color: #fff !important;
  // }
</style>

