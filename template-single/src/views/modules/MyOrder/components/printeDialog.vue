<!--
 * @Author: jinmiao
 * @Date: 2021-08-25 21:17:22
 * @Description: file content
 * @LastEditTime: 2022-03-01 10:50:16
-->
<template>
 <el-dialog  :title="$lang('打印面单')"  :visible="printingShow" @close="printingShow = false"  width="580px">
      <div class="printingTemplate">
        <div class="printingTemplate_top">
          <div class="printingTemplate_item">
            <img src="~@/assets/images/template_one.jpg" alt="">
            <el-radio v-model="radio" :label='"1"'>{{$lang('一联电子面单')}}</el-radio>
            <span>10cm*10cm</span>
          </div>
           <div class="printingTemplate_item">
            <img src="~@/assets/images/template_three.jpg" alt="">
            <el-radio v-model="radio" :label='"2"'>{{$lang('二联电子面单')}}</el-radio>
             <span>10cm*15cm</span>
          </div>
           <!-- <div class="printingTemplate_item">
            <img src="~@/assets/images/template_two.jpg" alt="">
            <el-radio v-model="radio" :label='"3"'>{{$lang('三联电子面单')}}</el-radio>
             <span>10cm*18cm</span>
          </div> -->
        </div>
        <div class="printingTemplate_center">
           <el-switch
            v-model="showDiscount"
            active-color="#e60012"
            inactive-color="#9499A3">
          </el-switch>
          <span class="dialogbox_txt">{{$lang('显示折扣金额')}}</span>
        </div>
         <span slot="footer" class="bottom-wrap centerBottom">
            <el-button type="primary" class="btn" :loading='printLoading' @click="OrderPrinte">{{$lang('面单打印')}}</el-button>
          </span>
      </div>
    </el-dialog>
</template>

<script>
import { Util } from '@/utils/utils.js'
import { fastPrinte } from '@/api'
import { RESPONSE_SUCCESS } from '@public/utils/const'
export default {
  name: 'PrinteDialog',
  data() {
    return {
      printingShow: false,
      billCode: 0,
      radio: '2',
      showDiscount: false,
      printLoading: false
    }
  },
  components: {
  },
  computed: {},

  watch: {
  },
  created() {

  },
  mounted() {},
  methods: {
    showDialog(params) {
      this.printingShow = true
      this.billCode = params
    },
    async OrderPrinte() {
      this.printLoading = true;
      this.updateNum(this.billCode.split(','))
      const res = await Util.showPDFList({
        style: this.radio,
        ids: this.billCode.toString(),
        type: 'pdf',
        discountPrint: this.showDiscount === true ? 1 : 0
      })
      if (res.data) {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url)
      }
      this.$nextTick(() => {
        this.printLoading = false;
      })
    },
    async updateNum(id) {
      const { code, data } = await fastPrinte.update({ codes: id })
      if (code === RESPONSE_SUCCESS) {
        console.log('更新num', data)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
 .printingTemplate_center{
    margin: 40px 0 30px;
    text-align: center;
    .dialogbox_txt{
      margin-left: 12px;
      color: #4c4d57;
      line-height: 16px;
    }
  }
  .printingTemplate_top{
    display: flex;
    justify-content: space-between;
    .printingTemplate_item{
      display: flex;
      flex-direction: column;
      justify-content: center;
      img{
        width: 230px;
        height: 340px;
        margin-bottom: 10px;
        }
        ::v-deep.el-radio{
          text-align: center;
        }
    }
    span{
      font-size: 14px;
      color: #61666d;
      line-height: 20px;
      text-align: center;
    }
  }
  .printingTemplate_center{
    margin: 40px 0 30px;
    text-align: center;
    .dialogbox_txt{
      margin-left: 12px;
      color: #4c4d57;
      line-height: 16px;
    }
  }
   .centerBottom{
     display: flex;
      justify-content: center;
  }
   .bottom-wrap{
      .downBtn{
      display: flex;
      justify-content: center;
    }
    .btn{
       background: #e60012;
      border-radius: 8px;
      color: #fff;
    }
    }
</style>
