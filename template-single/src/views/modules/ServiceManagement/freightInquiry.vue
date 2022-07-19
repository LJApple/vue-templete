<!--
 * @Description: 运费查询
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-12 10:36:00
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-25 16:46:51
-->
<template>
  <div class="freight-inquiry">
    <div class="freight-inquiry__top">
      <!-- 查询 -->
      <div class="search">
        <el-form :model="searchForm" size="small">
          <div class="search-form__col search-receiverArea">
            <el-form-item :label="$lang('目的地') + '：'" required>
              <el-select
                v-model="searchForm.receiverArea"
                remote
                filterable
                :remote-method="searchDestination"
                @change="rulesCheck(searchForm.receiverArea)"
                @focus="rulesCheck(searchForm.receiverArea)"
                class="receiverArea-input"
                :loading="loading"
                :loading-text="$lang('加载中')"
                :no-data-text="$lang('无数据')"
              >
                <template slot="prefix">
                  <i class="iconfont icon-zujian_ico_chaxun"></i>
                </template>
                <el-option
                  v-for="(item, index) in locationOptions"
                  :key="index"
                  :label="`${item.prov}${item.city ? '/' + item.city : ''}${item.area ? '/' + item.area : ''}`"
                  :value="`${item.prov}${item.city ? '/' + item.city : ''}${item.area ? '/' + item.area : ''}`">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="search-form__col search-weight">
            <el-form-item :label="$lang('货物重量') + '：'" required>
              <el-input
                v-model="searchForm.weight"
                class="weight-input"
                @input="rulesCheck2(searchForm.weight)"
                @focus="rulesCheck2(searchForm.weight)"
              >
                <template slot="append">kg</template>
              </el-input>
            </el-form-item>
          </div>
          <el-button
            type="primary"
            @click="searchChange"
            class="search-form__col"
            >{{$lang('查询')}}</el-button
          >
        </el-form>
      </div>
      <div class="input-error-message" v-if="showErrorMessage">
        <div class="address-msg" v-if="showErrorMessage2">{{ inputErrorMessage }}</div>
        <div class="weight-msg" v-if="showErrorMessage3" :class="!showErrorMessage2 && 'one-msg'">{{ inputErrorMessage2 }}</div>
        <!-- <span
          class="close-error-message iconfont icon-zujian_ico_tishiguanbi"
          @click="closeErrorMessage"
        ></span> -->
      </div>
      <!-- 查询结果 -->
      <div class="search-result" v-if="goodsInfo.receiverArea">
        <div class="float-left search-result__location">
          <p class="search-result__title">{{$lang('始发地')}}</p>
          <div class="search-result__content">
            {{ goodsInfo.location }}
          </div>
        </div>
        <div class="float-left search-result__middle">
          <p class="search-result__title">{{$lang('货物重量')}}</p>
          <div class="search-result__content">
            <svg class="icon svg-icon__weight" aria-hidden="true">
              <use xlink:href="#icon-qita_ico_songda1"></use>
            </svg>
            {{ goodsInfo.goodsWeight ? goodsInfo.goodsWeight : '0.00' }}KG
          </div>
        </div>
        <div class="float-left search-result__location">
          <p class="search-result__title">{{$lang('目的地')}}</p>
          <div class="search-result__content">{{ goodsInfo.receiverArea }}</div>
        </div>
      </div>
    </div>
    <div class="freight_bottom" :class="{'list-empty__error': showErrorMessage, 'list-empty__result': goodsInfo.receiverArea}">
      <div class="guid" v-if="tableList && tableList.length > 0">
        <!-- 列表 -->
        <div class="table-content">
          <div class="div-scroll" ref="scrollTest">
            <div
              v-for="(item, index) in tableList"
              :key="index"
              class="type-list"
              :style="`background: url(${item.src}) #f4f4f4 no-repeat;background-size: contain;`"
            >
              <!-- <img class="background-image__content" :src="item.src" /> -->
              <div class="type-list__info">
                <div class="type-list__maintitle">
                  <img class="logo-image" :src="item.logosrc" alt />
                  <span>{{ item.name }}</span>
                </div>
                <div>
                  <div class="type-list__title">{{
                    $lang('下单时间') + '：'
                  }}</div>
                  <span class="type-list__content">{{ '00:00:00 -' + (item.effectiveTime?item.effectiveTime.substring(10):'23:59:59')}}</span>
                </div>
                <div>
                  <div class="type-list__title">{{ $lang('下单重量') + '：' }}</div>
                  <span class="type-list__content">{{
                    `${item.goodsWeight && item.goodsWeight >= item.minWeight && item.goodsWeight <= item.maxWeight  ? item.goodsWeight : item.minWeight + ' - ' + item.maxWeight}` + 'kg'
                  }}</span>
                </div>
                <div>
                  <div class="type-list__title">{{ $lang('应收运费') + '：' }}</div>
                  <span class="type-list__content">{{
                    (item.goodsFee || (item.minFee !== null && item.maxFee !== null) ? 'Rp ' : '') + (item.goodsFee && item.goodsFee !== 0 ? item.goodsFee : item.minFee !== null && item.maxFee !== null  ? item.minFee + ' - ' + item.maxFee : $lang('暂无报价'))
                  }}</span>
                </div>
                <div class="choice-button" @click="goOrderEntry">
                  {{ $lang('马上下单') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="list-empty" v-if="isEmpty || keyBtn" :class="{'list-empty__error': showErrorMessage}">
        <BaseChartLoad
          :loading="keyBtn"
          :empty="isEmpty"
          :emptyTitle="false"
          :hasText="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import BaseChartLoad from '@/components/base/BaseChartLoad.vue'
import { FreightInquiry } from '@/api/index.js'
import { RESPONSE_CODE } from '@public/http/config'
export default {
  name: 'FreightInquiry',
  mixins: [mixin],
  components: {
    BaseChartLoad
  },
  data() {
    return {
      COM_HTTP: FreightInquiry,
      isShowFirst: false,
      // tableList: [],
      locationOptions: [], // 地址列表
      isEmpty: true, // 是否为空
      keyBtn: false, // 查询控制
      loading: false,
      offsetWidth: '',
      searchForm: {
        receiverArea: '',
        weight: ''
      },
      networkInfo: {}, // 网点信息
      // 查询结果-货物信息
      goodsInfo: {},
      listIndex: 0, // 第一个显示的listIndex
      viewCount: 5, // 浏览器可以装下的数量
      leftDisabled: true, // 左侧不可点击
      rightDisabled: false, // 右侧不可点击
      // isInputError: false, // 规则验证
      // showErrorMessage: false, // 显示验证错误弹框
      showErrorMessage2: false, // 显示地址验证错误弹框
      showErrorMessage3: false, // 显示重量验证弹框
      inputErrorMessage: '', // 地址规则验证提示
      inputErrorMessage2: '' // 重量规则校验提示
    }
  },
  mounted() {
    this.getNetworkInfo()
  },
  computed: {
    showErrorMessage: {
      // 只要有一个为true，显示验证错误弹框
      get() {
        if (this.showErrorMessage2 || this.showErrorMessage3) {
          return true
        } else {
          return false
        }
      },
      set(newValue) {
        return newValue
      }
    },
    isInputError: {
      // 只要有一个为true
      get() {
        if (this.showErrorMessage2 || this.showErrorMessage3) {
          return true
        } else {
          return false
        }
      },
      set(newValue) {
        return newValue
      }
    }
  },
  methods: {
    async getNetworkInfo() {
      const { data, code, msg } = await this.COM_HTTP.getNetworkInfo()
      if (code === RESPONSE_CODE.SUCCESS) {
        this.networkInfo = data
      } else {
        this.$message.error(msg)
      }
    },
    // 规则验证
    rulesCheck(val) {
      const { receiverArea } = this.searchForm
      if (receiverArea === '') {
        this.showErrorMessage2 = true
        this.inputErrorMessage = this.$lang('请输入目的地')
      } else {
        this.showErrorMessage2 = false
      }
    },
    // 规则验证-重量
    rulesCheck2(val) {
      const { weight } = this.searchForm
      const weightNumber = Number(weight)
      // 小数点位数
      const decimalLength = weight.indexOf('.') === -1 ? 0 : weight.length - weight.indexOf('.') - 1
      if (
        (weight !== '' &&
          (isNaN(weightNumber) ||
            weightNumber > 100 ||
            weightNumber <= 0 ||
            decimalLength > 2)) || weight === ''
      ) {
        this.showErrorMessage3 = true
        if (weight === '') {
          this.inputErrorMessage2 = this.$lang('请输入重量')
        } else {
          this.inputErrorMessage2 = this.$lang(
            '只能输入0.01-100KG'
          )
        }
      } else {
        this.showErrorMessage3 = false
      }
    },
    // 查询地址
    async searchDestination(val) {
      this.loading = true
      const res = await this.COM_HTTP.getLocationOptions({ searchKey: val })
      const { code, data, msg } = res
      if (code === RESPONSE_CODE.SUCCESS) {
        this.locationOptions = data
      } else {
        this.$message.warning(msg)
      }
      this.loading = false
    },
    // 关闭验证提示
    closeErrorMessage() {
      this.showErrorMessage = false
    },
    searchFunParamsHandle(params) {
      const { receiverArea, weight } = this.searchForm
      if (receiverArea === '') {
        this.rulesCheck()
        return false
      }
      if (weight === '') {
        this.rulesCheck2()
        return false
      }
      if (this.isInputError === true) {
        // this.showErrorMessage = true
        return false
      }
      params.area = receiverArea
      const areaList = receiverArea.split('/')
      params.receiverArea = areaList[areaList.length - 1]
      params.weight = Number(weight)
      if (this.searchForm.receiverArea && !this.isInputError) {
        return params
      }
    },
    async searchChange() {
      this.keyBtn = true
      const params = this.rangHandle(this.searchForm)
      const param = this.searchFunParamsHandle(params)
      console.log(param)
      if (param === false) {
        this.keyBtn = false
        // console.log(this.isInputError, 'this.inputErrorMessage', this.inputErrorMessage, this.inputErrorMessage2 )
        // if (this.isInputError && this.inputErrorMessage) {
        //   this.$message.warning(this.inputErrorMessage)
        //   return
        // }
        // if (this.isInputError && this.inputErrorMessage2) {
        //   this.$message.warning(this.inputErrorMessage2)
        //   return
        // }
        return
      }
      const { data, code, msg } = await this.COM_HTTP.reqList(param)
      if (code === RESPONSE_CODE.SUCCESS) {
        const { weight } = this.searchForm
        const Data = [...data]
        const newData = Data.filter((item, index, arr) => {
          return (item.maxWeight >= weight) && (item.goodsFee)
        })
        this.tableList = newData
        console.log('newData', newData)
      } else {
        this.$message.error(msg)
      }
      this.goodsInfo.receiverArea = param.area
      this.goodsInfo.goodsWeight = params.weight
      this.goodsInfo.location = `${this.networkInfo.prov ? this.networkInfo.prov : ''}${this.networkInfo.city ? '/' + this.networkInfo.city : ''}`
      this.searchAfterFun()
      this.keyBtn = false
    },
    searchAfterFun() {
      if (this.tableList.length === 0) {
        this.isEmpty = true
      } else {
        this.isEmpty = false
      }
      this.tableList.map(item => {
        // 设定图片
        try {
          return Object.assign(item, {
            src: require(`@/assets/images/freightInquiry/${item.name}.png`),
            logosrc: require(`@/assets/images/freightInquiry/LOGO_${item.name}.png`)
          })
        } catch (error) {
          return Object.assign(item, {
            src: require(`@/assets/images/freightInquiry/Public.png`),
            logosrc: item.name === 'JND' ? require(`@/assets/images/freightInquiry/LOGO_JEMARI.png`) : item.name === 'PREMIUM' ? require(`@/assets/images/freightInquiry/LOGO_PT.png`) : require(`@/assets/images/freightInquiry/LOGO_Public.png`)
          })
        }
      })
    },
    // 马上下单
    goOrderEntry() {
      this.$router.push({ name: 'orderEntry' })
    }
  }
}
</script>

<style lang="scss" scoped>
.freight-inquiry {
  min-width: 880px;
  padding: 16px;
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  background: #fff;
  border-radius: 0 4px 4px 4px;
}
.freight-inquiry__top {
  width: 100%;
  // height: 196px;
  background: #fff;
  padding-bottom: 16px;
  border-bottom: 1px solid #E8E8E8;
  .search {
    width: 780px;
    height: 58px;
    margin-right: 20px;
    // float: left;
    .search-form__col {
      position: relative;
      float: left;
      margin-right: 16px;
      min-width: 80px;
    }
    .search-receiverArea {
      width: 480px;
      .el-input__prefix{
        left: 8px;
      }
    }
    .search-weight {
      width: 150px;
      margin-right: 24px;
    }
    .el-form {
      float: left;
      .el-button {
        margin-top: 26px;
        margin-right: 0;
        height: 32px;
      }
    }
    .search-button {
      width: 120px;
      height: 100px;
      margin-top: 41px;
      background: #e60012;
      border-radius: 0 12px 12px 0;
      float: right;
      color: #fff;
      font-size: 20px;
      text-align: center;
      line-height: 100px;
      cursor: pointer;
    }
  }
  .input-error-message {
    display: flex;
    width: 100%;
    height: 32px;
    line-height: 32px;
    margin: 8px 0 0;
    font-size: 12px;
    // background: #FEF2F3;
    // border: 1px solid rgba(230, 0, 18, 0.5);
    // border-radius: 8px;
    color: #E60012;
    .close-error-message {
      float: right;
      cursor: pointer;
    }
    .address-msg {
      width: 480px;
      padding: 0 15px;
      background: #FEF2F3;
      border: 1px solid rgba(230, 0, 18, 0.5);
      border-radius: 8px;
      margin-right: 16px;
      box-sizing: border-box;
    }
    .weight-msg {
      width: 150px;
      padding: 0 15px;
      background: #FEF2F3;
      border: 1px solid rgba(230, 0, 18, 0.5);
      border-radius: 8px;
      box-sizing: border-box;
      &.one-msg {
        margin-left: 496px;
      }
    }
  }
  .search-result {
    width: 720px;
    height: 58px;
    margin: 16px 20px 0 0;
    padding: 10px 15px;
    background: #f7f7f7;
    border-radius: 8px;
    font-size: 12px;
    border: 1px solid #E8E8E8;
    .float-left {
      float: left;
    }
    .search-result__location {
      width: 280px;
    }
    .search-result__middle {
      width: 150px;
      position: relative;
      .search-result__content {
        line-height: 32px;
      }
      .svg-icon__weight {
        width: 88px;
        height: 6px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 32px;
      }
    }
    .search-result__title {
      padding: 0;
      color: #a1a3a6;
      text-align: center;
      height: 16px;
      line-height: 16px;
    }
    .search-result__content {
      text-align: center;
      font-weight: 500;
      height: 32px;
      line-height: 16px;
      margin-top: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #4C4D57;
    }
    .icon-qita_ico_songda {
      position: absolute;
      width: 72px;
    }
    .font-bold {
      font-size: 14px;
      color: #4c4d57;
      font-weight: 900;
    }
    .font-regular {
      font-size: 14px;
      font-weight: 500;
      color: #61666d;
    }
  }
}
.guid {
  display: flex;
  height: calc(100% - 16px);
  overflow-y: auto;
  .fluid {
    width: 50px;
    height: 400px;
    line-height: 400px;
    text-align: right;
    button {
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.25);
      color: #fff;
      .iconfont {
        font-size: 11px;
      }
    }
    button:disabled {
      background: rgba(0, 0, 0, 0.05);
      color: #bbb;
    }
    .fluid-button__left {
      margin-right: 14px;
    }
    .fluid-button__right {
      margin-left: 14px;
    }
  }
  .fluid.right {
    text-align: left;
  }
}
.table-content {
  flex: 1;
  margin-left: -16px;
  .div-scroll {
    .type-list {
      position: relative;
      margin-left: 16px;
      width: 240px;
      height: 336px;
      border-radius: 4px;
      float: left;
      margin-top: 20px;
      .background-image__content {
        width: 100%;
      }
      .logo-image {
        width: 80px;
      }
      h3 {
        text-align: center;
        font-size: 24px;
        color: #2b2d42;
        margin-top: 9px;
      }
      .type-list__info {
        width: 192px;
        padding: 0 16px 16px;
        background: #fff;
        margin: 72px auto;
        border-radius: 4px;
        .type-list__maintitle{
          text-align: left;
          height: 48px;
          line-height: 48px;
          img{
            width: 48px;
            margin-right: 16px;
          }
          span{
            vertical-align: top;
          }
        }
      }
      .type-list__title {
        color: #A1A3A6;
        font-size: 12px;
        height: 16px;
        line-height: 16px;
        margin-top: 10px;
      }
      .type-list__content {
        text-align: left;
        color: #61666D;
        font-size: 14px;
        height: 18px;
        line-height: 18px;
        margin-top: 2px;
        display: block;
      }
      .choice-button {
        width: 140px;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        background: #e60012;
        color: #ffffff;
        border-radius: 4px;
        cursor: pointer;
        text-align: center;
        margin: 24px auto 0;
      }
    }
  }
}
.table-content::-webkit-scrollbar {
  display: none;
}
.freight_bottom{
  position: relative;
  height: calc(100% - 60px);
}
.freight_bottom.list-empty__error {
  height: calc(100% - 101px);
}
.freight_bottom.list-empty__result{
  height: calc(100% - 155px);
}
.list-empty {
  width: 100%;
  height: 100%;
  text-align: center;
  border-radius: 12px;
  position: absolute;
  top: 0;
  pointer-events: none;
  .image {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    p {
      position: absolute;
      top: 245px;
      left: 50%;
      transform: translateX(-50%);
      color: #bebebe;
    }
  }
}
</style>

<style lang="scss">
.search {
  .search-form__col {
    // width: 315px;
    // margin-top: 15px;
    .el-form-item__label {
      line-height: 26px;
    }
  }
  .weight-input.el-input-group .el-input-group__append {
    // .el-input-group__append, .el-input-group__prepend {
    border-color: #e8e8e8;
    padding: 0;
    width: 50px;
    text-align: center;
    background: #f2f2f2;
    // }
  }
  .weight-input.el-input-group:hover .el-input-group__append {
    border-color: #e8e8e8 !important;
  }
  .weight-input .el-input__inner{
    padding: 0 8px;
  }
  .receiverArea-input {
    width: 100%;
    .el-input__inner {
      border-radius: 8px;
      border-color: #e8e8e8;
    }
  }
  .el-input {
    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
    .el-input__prefix{
      left: 8px;
    }
  }

  .search-weight {
    width: 100px;
    .el-form-item__error {
      width: 740px;
      height: 36px;
      line-height: 36px;
      left: -420px;
    }
  }
  .el-form-item--mini.el-form-item,
  .el-form-item--small.el-form-item {
    margin-bottom: 10px;
  }
}
</style>
