<!--
 * @Author: jinmiao
 * @Date: 2021-07-19 15:11:31
 * @Description: file content
 * @LastEditTime: 2021-10-22 15:57:04
-->
<template>
  <!-- senderInfo.vue -->
  <div class="sender-info-wrap">
    <div class="sender-info-top">
      <div class="sender-info-top-title">{{$lang('收件人信息')}}</div><span class="sender-info-top-subtitle">{{$lang('标*为必填项')}}</span>
      <div class="save-address">
      <span @click="$refs.adressList.dialogShow()"><i class="iconfont icon-qita_ico_dizhibao"></i>{{$lang('收件人地址薄')}}</span>
      <span @click="resetData"><i class="iconfont icon-qita_ico_qingchu"></i>{{$lang('清空已填写信息')}}</span>
      <span @click="changeLock" :class="{'lockIcon':!locked}" v-if="!showLock">
        <i class="iconfont icon-qita_ico_weisuo" v-if="!locked"></i>
        <i class="iconfont icon-qita_ico_suoding" v-if="locked"></i>
        {{locked? $lang('已锁定') : $lang('未锁定')}}
      </span>
      </div>
    </div>
    <div class="sender-info-center">
      <el-form :model="formData" :rules="rules" ref="formData">
      <el-row :gutter="16">
      <el-col :span="6">
       <el-form-item :label="$lang('姓名') + '：'" prop="receiverName">
              <el-input  size="medium"
                v-model="formData.receiverName"
                :placeholder="$lang('请输入')"
                clearable></el-input>
            </el-form-item>
      </el-col>
      <el-col :span="6">
       <el-form-item :label="$lang('联系电话') + '：'" prop="receiverPhone">
              <el-input  size="medium"
                v-model="formData.receiverPhone"
                :placeholder="$lang('请输入')"
                :onkeyup="formData.receiverPhone = formData.receiverPhone.replace(/[^\d+]/g, '')"
                maxlength="17"
                clearable></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="12">
        <el-form-item :label="$lang('目的地') + '：'" prop="receiverArea">
            <BaseAddress :provCityArea.sync="formData.receiverArea" :addressType='2' ref="BaseAddress" :rowData="rowData"  @provCityAreaList="provCityAreaList"></BaseAddress>
        </el-form-item>
        </el-col>
        </el-row>
         <el-form-item :label="$lang('详细地址') + '：'" prop="receiverAddr" style="margin-bottom: 30px;">
              <el-input  size="medium"
                v-model="formData.receiverAddr"
                :placeholder="$lang('请输入')"
                type="textarea"
                resize="none"
                :rows="2"
                maxlength="250"
                show-word-limit
                clearable></el-input>
            </el-form-item>
      </el-form>
    </div>
    <addressList ref="adressList" :titleMsg="'reciver'"  @chooseList="chooseList"></addressList>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import addressList from './addressList'
import { mapActions } from 'vuex'
import BaseAddress from '@/components/base/BaseAddress'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import { ReceiveAddressController } from '@/api'
import { RULES } from '@public/utils/rules'
export default {
  name: 'ReceiverInfo',
  mixins: [mixin],
  props: {
    useDefaultAddress: {
      type: Boolean,
      default: true
    },
    showLock: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowFirst: false,
      saveSenderAddress: false,
      formData: {
        receiverName: '', // 姓名
        receiverPhone: '', // 联系电话
        provenance: '', // 始发地
        receiverAddr: '', // 详细地址Go
        receiverArea: '', //	string收件区
        receiverProv: '', //	string收件省,
        receiverCity: '' //	string收件市
      },
      rules: {
        receiverPhone: [RULES.required, RULES.idnPhone, RULES.idnOnlyNumber],
        receiverName: [RULES.required, RULES.lengthFifty],
        receiverArea: [RULES.required],
        receiverAddr: [RULES.required]
      },
      locked: true, //  锁定
      rowData: {
        prov: '',
        city: '',
        area: ''
      }
    }
  },
  components: {
    addressList,
    BaseAddress
  },
  watch: {
    receiverArea(newValue, oldValue) {
      console.log('receiverArea', newValue)
      this.Freight_List({ receiverArea: newValue })
    }
  },
  computed: {
    receiverArea() {
      return this.rowData.area
    }
  },
  created() {

  },
  mounted() {
    if (this.useDefaultAddress) {
      this.getList()
    }
  },
  methods: {
    ...mapActions(['Freight_List', 'Receive_List']),
    changeLock() {
      this.locked = !this.locked
      this.locked ? this.Receive_List(this.formData) : this.Receive_List({})
    },
    haveLock() {
      if (this.$store.state.base.receiveList) {
        Object.assign(this.formData, this.$store.state.base.receiveList)
      }
    },
    provCityAreaList(item) {
      const { area, city, prov } = item
      this.formData.receiverCity = city
      this.formData.receiverProv = prov
      this.formData.receiverArea = area
      this.rowData = {
        prov: prov,
        city: city,
        area: area
      }
    },
    // 清空已填写信息
    resetData() {
      this.formData = { receiverName: '', receiverPhone: '', provenance: '', receiverAddr: '', receiverArea: '', receiverProv: '', receiverCity: '' }
      this.rowData = { prov: '', city: '', area: '' }
      if (this.$refs['formData'] !== undefined) { this.$refs.formData.resetFields(); }
    },
    // 寄件人地址薄
    changeSenderType() {},
    checkformData(flag) {
      return new Promise((resolve, reject) => {
        if (!flag) {
          this.$message.warning(this.$lang('请填写完整寄件人信息'))
          return
        }
        this.$refs['formData'].validate(valid => {
          if (valid) {
            this.formData.receiverName = this.formData.receiverName.trim()
            resolve(true)
          // 校验通过
          // const list = {
          //   receiverArea: 'q',	// string寄件区
          //   receiverCity: 'q',	// string寄件市
          //   receiverProv: 'a'	// string寄件省
          // }
          // Object.assign(this.formData, list)
          } else {
            // this.$message.warning(this.$lang('请填写完整收件人信息'))
            reject(false)
          }
        })
      })
    },
    selectChange(value) {},
    chooseList(item) {
      const {
        name, // 姓名
        contacts, // 联系电话
        provenance, // 始发地
        address, // 详细地址
        prov, // 始发地省
        city,
        area
        // defaultaddress, // 是否默认
      } = item
      this.formData = {
        receiverName: name, // 姓名
        receiverPhone: contacts, // 联系电话
        provenance: provenance, // 始发地
        receiverAddr: address, // 详细地址
        receiverArea: area,	// string寄件区
        receiverCity: city,	// string寄件市
        receiverProv: prov	// string寄件省
      }
      this.$nextTick(function () {
        this.rowData = {
          prov: prov,
          city: city,
          area: area
        }
      })
    },
    async getList() {
      const param = {
        size: this.size,
        current: this.current
      }
      const { code, data } = await ReceiveAddressController.reqList(param)
      if (code === RESPONSE_SUCCESS) {
        if (data.records[0] && data.records[0].defaultaddress === '1') {
          this.chooseList(data.records[0])
        }
        this.haveLock()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./scss/senderInfo.scss";
</style>
