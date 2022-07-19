<template>
  <!-- senderInfo.vue -->
  <div class="sender-info-wrap">
    <div class="sender-info-top">
      <div class="sender-info-top-title">{{$lang('寄件人信息')}}</div><span class="sender-info-top-subtitle">{{$lang('标*为必填项')}}</span>
      <div class="save-address">
      <el-checkbox v-model="entrust">{{$lang('委托')}}</el-checkbox>
      <span @click="$refs.adressList.dialogShow()"><i class="iconfont icon-qita_ico_dizhibao"></i>{{$lang('寄件人地址薄')}}</span>
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
          <el-form-item :label="$lang('姓名') + '：'" prop="senderName">
                  <el-input  size="medium"
                    v-model="formData.senderName"
                    :placeholder="$lang('请输入')"
                    clearable></el-input>
                </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="$lang('联系电话') + '：'" prop="senderPhone">
              <el-input  size="medium"
                v-model="formData.senderPhone"
                :placeholder="$lang('请输入')"
                maxlength="17"
                :onkeyup="formData.senderPhone = formData.senderPhone.replace(/[^\d+]/g, '')"
                clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$lang('始发地') + '：'" prop="senderCity">
              <BaseAddress
              :provCityArea.sync="formData.senderCity"
              :addressType='1'
              ref="BaseAddress"
              :rowData="rowData"
              @provCityAreaList="provCityAreaList"></BaseAddress>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$lang('详细地址') + '：'" prop="senderAddr" style="margin-bottom: 30px;">
          <el-input  size="medium"
            v-model="formData.senderAddr"
            :placeholder="$lang('请输入')"
            clearable
            type="textarea"
            resize="none"
            :rows="2"
            maxlength="250"
            show-word-limit></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="sender-info-bottom" v-show="entrust">
      <div class="sender-info-top-title sender-info-bottom_title">
         {{$lang('委托信息')}}
          <span class="sender-info-top-subtitle">{{$lang('标*为必填项')}}</span>
        <span @click="$refs.entrustAddressList.dialogShow()" class="wtsave-address"><i class="iconfont icon-qita_ico_dizhibao"></i>{{$lang('委托人地址薄')}}</span>
      </div>
        <el-form :model="entrustformData" :rules="entrustrules" ref="entrustformData">
          <el-row :gutter="16">
          <el-col :span="6">
          <el-form-item :label="$lang('姓名') + '：'" prop="entrustName">
                  <el-input  size="medium"
                    v-model="entrustformData.entrustName"
                    :placeholder="$lang('请输入')"
                    clearable></el-input>
                </el-form-item>
          </el-col>
          <el-col :span="6">
          <el-form-item :label="$lang('联系电话') + '：'" prop="entrustPhone">
                  <el-input  size="medium"
                    v-model="entrustformData.entrustPhone"
                    :placeholder="$lang('请输入')"
                    :onkeyup="entrustformData.entrustPhone = entrustformData.entrustPhone.replace(/[^\d+]/g, '')"
                    maxlength="17"
                    clearable></el-input>
          </el-form-item>
        </el-col>
       </el-row>
      </el-form>
    </div>

    <addressList ref="adressList" :titleMsg="'sender'" @chooseList="chooseList"></addressList>
    <entrustAddressList  ref="entrustAddressList"  @choosEntrustList="choosEntrustList"></entrustAddressList>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import addressList from './addressList'
import entrustAddressList from './entrustAddressList'
import BaseAddress from '@/components/base/BaseAddress'
import { SenderAddressController } from '@/api'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import { mapActions } from 'vuex'
import { RULES } from '@public/utils/rules'
export default {
  name: 'SenderInfo',
  mixins: [mixin],
  components: { addressList, BaseAddress, entrustAddressList },
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
      entrust: false,
      saveSenderAddress: false,
      isShowFirst: false,
      formData: {
        senderName: '', // 姓名
        senderPhone: '', // 联系电话
        provenance: '', // 始发地
        senderAddr: '', // 详细地址
        senderCity: '',	// string寄件目的地,
        senderProv: '',
        senderArea: ''
      },
      entrustformData: {
        entrustName: '', // 姓名
        entrustPhone: '' // 联系电话
      },
      rules: {
        senderPhone: [RULES.required, RULES.idnPhone, RULES.idnOnlyNumber],
        senderName: [RULES.required, RULES.lengthFifty],
        senderCity: [RULES.required],
        senderAddr: [RULES.required]
      },
      entrustrules: {
        entrustPhone: [RULES.required, RULES.idnPhone, RULES.idnOnlyNumber],
        entrustName: [RULES.required, RULES.lengthFifty]
      },
      locked: true, //  锁定
      rowData: {
        prov: '',
        city: '',
        area: ''
      }
    }
  },
  watch: {
    senderCity(newValue, oldValue) {
      this.Freight_List({ senderCity: newValue })
    }
  },
  computed: {
    senderCity() {
      return this.rowData.city
    }
  },
  created() {
    if (this.useDefaultAddress) {
      this.getList()
    }
  },
  mounted() { },
  methods: {
    ...mapActions(['Sender_List', 'Freight_List']),
    changeLock() {
      this.locked = !this.locked
      this.locked ? this.Sender_List(this.formData) : this.Sender_List({})
    },
    haveLock() {
      if (this.$store.state.base.senderList) {
        Object.assign(this.formData, this.$store.state.base.senderList)
      }
    },
    provCityAreaList(item) {
      const { area, city, prov } = item
      this.formData.senderCity = city
      this.formData.senderProv = prov
      this.formData.senderArea = area
      this.rowData = {
        prov: prov,
        city: city,
        area: area
      }
    },
    // 清空已填写信息
    resetData() {
      this.formData = { senderName: '', senderPhone: '', provenance: '', senderAddr: '', senderCity: '', senderProv: '', senderArea: '' }
      this.rowData = { prov: '', city: '', area: '' }
      this.entrustformData = { entrustName: '', entrustPhone: '' }
      if (this.$refs['formData'] !== undefined) { this.$refs.formData.resetFields(); }
      if (this.$refs['entrustformData'] !== undefined) { this.$refs.entrustformData.resetFields(); }
    },
    checkformData(formName) {
      let flag = true
      this.$refs['formData'].validate(valid => {
        if (valid) {
          // 校验通过
          this.formData.isEntrust = this.entrust
          this.formData.senderName = this.formData.senderName.trim()
          if (this.entrust) {
            this.$refs['entrustformData'].validate(valid => {
              if (valid) {
                // 校验通过
                this.formData.isEntrust = this.entrust
                this.formData.entrustName = this.entrustformData.entrustName.trim()
                this.formData.entrustPhone = this.entrustformData.entrustPhone
                flag = true
              } else {
                // this.$message.warning(this.$lang('请填写完整寄件人信息'))
                flag = false
              }
            })
          } else {
            flag = true
          }
        } else {
          flag = false
        }
      })
      return flag
    },
    chooseList(item) {
      const {
        name, // 姓名
        contacts, // 联系电话
        prov, // 始发地省
        city,
        area,
        address, // 详细地址
        entrust, // 是否委托
        entrustPhone,
        entrustName
        // defaultaddress, // 是否默认
      } = item
      this.formData = {
        senderName: name, // 姓名
        senderPhone: contacts, // 联系电话
        senderProv: prov, // 始发地
        senderCity: city,
        senderArea: area,
        senderAddr: address // 详细地址
      }

      this.$nextTick(function () {
        this.rowData = {
          prov: prov,
          city: city,
          area: area
        }
      })
      this.entrust = entrust === '1'
      if (entrust === '1') {
        this.entrustformData = {
          entrustName: entrustName || '', // 姓名
          entrustPhone: entrustPhone || '' // 联系电话
        }
      }
    },
    choosEntrustList(item) {
      const { name, contacts } = item
      this.entrust = true
      this.entrustformData = {
        entrustName: name, // 姓名
        entrustPhone: contacts // 联系电话
      }
    },
    async getList() {
      const param = {
        size: this.size,
        current: this.current,
        entrust: 0
      }
      const { code, data } = await SenderAddressController.reqList(param)
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
.wtsave-address{
    color: #4C4D57;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    margin-left: 50px;
    cursor: pointer;
    .icon-qita_ico_dizhibao{
      margin-right: 6px;
      line-height: 16px;
      font-size: 12px;
    }
}
</style>
