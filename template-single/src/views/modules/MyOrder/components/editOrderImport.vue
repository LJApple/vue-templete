<!--
 * @Author: jinmiao
 * @Date: 2021-07-26 14:51:10
 * @Description: file content
 * @LastEditTime: 2021-10-22 16:37:39
-->
<template>
  <div class="EditOrderImport" v-if="editShow">
    <!-- <div class="back-to-list">
      <span @click="closeEdit" class="back-to-list_click"><span class="iconfont icon-tongyong-fanhui"></span> {{$lang('返回上一页')}}</span>
    </div> -->
    <div class="EditOrderImport_content">
      <div class="editbox">
        <senderInfo ref="senderInfo" :useDefaultAddress="false"></senderInfo>
        <receiverInfo ref="receiverInfo" class="interval" :useDefaultAddress="false"></receiverInfo>
        <cargoInformation ref="cargoInformation" class="interval" @goodsCost="goodsCost" @disInsMark="disInsMark" @goodsinsurance="goodsinsurance"></cargoInformation>
        <costInfo ref="costInfo" class="interval" :goodsCosts="goodsCosts" :disInsMarks="disInsMarks" :goodsinsurances="goodsinsurances"></costInfo>
        <div class="bottom-wrap interval">
          <el-row>
            <el-button class="btn" @click="closeEdit">{{ $lang("取消") }}</el-button>
            <el-button class="btn red" :disabled="disabled" :loading="subLoading" @click="saveOrder">{{ $lang("确定") }}</el-button>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "@/mixins/mixin";
import senderInfo from "./senderInfo";
import receiverInfo from "./receiverInfo";
import cargoInformation from "./cargoInformation";
import costInfo from "./costInfo";
export default {
  name: "EditOrderImport",
  mixins: [mixin],
  components: {
    senderInfo,
    receiverInfo,
    cargoInformation,
    costInfo,
  },
  data() {
    return {
      isShowFirst: false,
      subLoading: false,
      disabled: false,
      saveOrderflag: true,
      editShow: false,
      excelNum: "",
      goodsCosts: "0", // 物品价值
      disInsMarks: "0",
      goodsinsurances: false,
    };
  },
  props: {
    formData: {},
  },
  computed: {},
  watch: {
    editShow: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            const {
              excelNum,
              senderName,
              senderPhone,
              senderAddr,
              senderProv,
              senderCity,
              senderArea,
              isEntrust,
              entrustName,
              entrustPhone,
              receiverName,
              receiverPhone,
              provenance,
              receiverArea,
              receiverCity,
              receiverProv,
              receiverAddr,
              goodsWeight,
              goodsNum,
              goodsType,
              expressType,
              goodsName,
              goodsPrice,
              ecOrderNo,
              goodsRemark,
              codFee,
              receivableFee,
              insuranceFee,
              otherFee,
              insuranceFlag,
            } = this.formData;
            this.excelNum = excelNum;
            this.$refs.senderInfo.formData = {
              isEntrust,
            };
            const senderInfoData = {
              name: senderName || "",
              contacts: senderPhone || "",
              prov: senderProv || "",
              city: senderCity || "",
              area: senderArea || "",
              address: senderAddr || "",
              entrust: isEntrust ? isEntrust.toString() : "0",
              entrustName,
              entrustPhone: entrustPhone || "",
            };
            this.$refs.senderInfo.chooseList(senderInfoData);
            this.$refs.receiverInfo.formData = {
              receiverName: receiverName || "",
              receiverPhone: receiverPhone || "",
              provenance: provenance || "",
              receiverArea: receiverArea || "",
              receiverCity: receiverCity || "",
              receiverProv: receiverProv || "",
              receiverAddr: receiverAddr || "",
            };

            this.$refs.cargoInformation.formData = {
              cargoWeight: goodsWeight || goodsWeight === 0 ? goodsWeight.toString() : "",
              countNum: goodsNum || goodsWeight === 0 ? goodsNum.toString() : "",
              goodsType,
              expressType,
              goodsName,
              goodsCost: goodsPrice || goodsPrice === 0 ? goodsPrice.toString() : "",
              electricityNumber: ecOrderNo,
              goodsRemark,
            };
            this.goodsCost(goodsPrice || goodsPrice === 0 ? goodsPrice.toString() : "");
            console.log(this.$refs.cargoInformation.formData.goodsCost);
            // 包裹保险是否选择
            const insuranceFlagBool = insuranceFlag === "1" || insuranceFlag === 1;
            this.goodsinsurance(insuranceFlagBool);
            this.$refs.cargoInformation.goodsinsurance = insuranceFlagBool;
            // insuranceFlag === '1' || insuranceFlag === 1 ? this.$refs.cargoInformation.goodsinsurance = true : this.$refs.cargoInformation.goodsinsurance = false
            // console.log('this.$refs.cargoInformation.goodsinsurance', this.$refs.cargoInformation.goodsinsurance, insuranceFlag)
            this.$refs.costInfo.formData = {
              codFee: codFee ? codFee.toString() : "",
              receivableFee: receivableFee ? receivableFee.toString() : "",
              insuranceFee: insuranceFee ? insuranceFee.toString() : "",
              otherFee: otherFee ? otherFee.toString() : "",
            };
            this.$refs.costInfo.receivableFee = receivableFee;
            this.$refs.senderInfo.rowData = {
              prov: senderProv,
              city: senderCity,
              area: senderArea,
            };
            this.$refs.receiverInfo.rowData = {
              prov: receiverProv,
              city: receiverCity,
              area: receiverArea,
            };
          });
        }
      },
      immediate: true,
    },
  },
  created() {},
  methods: {
    closeEdit() {
      this.editShow = !this.editShow;
      this.$parent.showEditPage = false;
    },
    // 获取物品价值
    goodsCost(v) {
      this.goodsCosts = v || v === 0 ? v.toString() : "";
    },
    disInsMark(v) {
      this.disInsMarks = v.toString();
    },
    goodsinsurance(v) {
      this.goodsinsurances = v;
    },
    // 点击保存
    async saveOrder() {
      try {
        const sender = await this.$refs.senderInfo.checkformData();
        const receive = await this.$refs.receiverInfo.checkformData(sender);
        const cargoInformation = await this.$refs.cargoInformation.checkformData(receive);
        const costInfo = await this.$refs.costInfo.checkformData(cargoInformation);
        if (sender && receive && cargoInformation && costInfo) {
          // this.$refs.senderInfo.provCityAreaList()
          const { isFilterRepeat } = this.formData;
          const formData = Object.assign(
            { isFilterRepeat },
            this.$refs.senderInfo.formData,
            this.$refs.receiverInfo.formData,
            this.$refs.cargoInformation.formData,
            this.$refs.costInfo.formData,
            { excelNum: this.excelNum }
          );
          formData.senderCity = this.$refs.senderInfo.senderCity;
          formData.receiverArea = this.$refs.receiverInfo.receiverArea;
          formData.insuranceFlag = this.goodsinsurances ? 1 : 0;
          console.log(formData, "formData");
          this.$emit("update:formData", formData);
          this.$emit("saveForm", formData);
          this.closeEdit();
        }
      } catch (error) {
        console.log(error);
      }
    },
    showEdit() {
      this.editShow = true;
      this.$nextTick(async () => {
        this.$refs.senderInfo.checkformData();
        this.$refs.receiverInfo.checkformData(true);
        this.$refs.cargoInformation.checkformData(true);
        this.$refs.costInfo.checkformData(true);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.EditOrderImport_content {
  height: calc(100vh - 100px);
  border-radius: 0 4px 4px 4px;
  padding: 16px;
  background: #fff;
  overflow-y: scroll;
}
.editbox {
  // height: 630px;
  // overflow-y: auto;
}
.back-to-list {
  height: 60px;
  line-height: 60px;
  padding: 0 20px 0;
  border-radius: 12px;
  background-color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
  color: #242628;
  .back-to-list_click {
    cursor: pointer;
  }
}
.bottom-wrap {
  display: flex;
  justify-content: center;
  border-radius: 12px;
  background-color: #ffffff;
  padding: 24px 0 8px;
  .btn {
    background: #ffffff;
    border: 1px solid #e60012;
    border-radius: 4px;
    font-size: 14px;
    color: #e60012;
    width: 160px;
    height: 40px;
  }
  .red {
    background: #e60012;
    color: #ffffff;
    margin-left: 16px;
  }
}
.dialogbox {
  .el-button {
    border-radius: 8px;
  }
  .dialogBtn {
    background: #e60012;
    color: #ffffff;
    margin-left: 20px;
  }
  .dialogbox_txt {
    margin-left: 10px;
    color: #61666d;
  }
}
</style>
