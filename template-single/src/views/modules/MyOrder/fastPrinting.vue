/** * @Description: 页面名称 * @author: name * @Date: 2020-07-07 */
<template>
  <div class="main-css FastPrinting">
    <avue-crud ref="params" :data="tableList" :page="page" :option="listOpt" @row-click="rowClick" @selection-change="selectionChange">
      <template slot="menuLeftPre">
        <div class="top_box orderImport_alert" v-if="showContent">
          <div>
            {{ $lang("Web打印服务未安装启动，点击这里") }}<span class="top_box_span" @click="dowmloadZip">{{ $lang("下载执行安装") }}</span>
          </div>
          <div>
            {{ $lang("（若此前已安装过，可") }}<span class="top_box_span" @click="checkIsInstallcheck">{{ $lang("点这里直接再次启动") }}</span
            >{{ $lang("）成功后请刷新本页面") }}
          </div>
          <div>{{ $lang("点击查看安装打印插件的操作方式") }}</div>
        </div>
      </template>
      <template slot="menuLeft">
        <el-button class="btn" @click="fastShow = true"
          ><span>{{ $lang("操作程序") }}</span></el-button
        >
        <el-button class="btn" @click="resetList"
          ><span>{{ $lang("清空所有") }}</span></el-button
        >
      </template>
      <template slot="showDiscountSearch">
        <el-checkbox @change="idListfocus" v-model="showDiscount" true-label="1" false-label="2" class="showDiscount">{{ $lang("显示折扣金额") }}</el-checkbox>
      </template>
      <template slot="idListSearch">
        <!-- <div tabindex="0"  class="inputfocus"> -->
        <div @click="idListfocus" tabindex="0" class="inputfocus">
          <input class="el-input__inner" :placeholder="$lang('请输入订单/运单号')" :autofocus="autofocus" @keydown="keydownHandle" @input="changeHandle" ref="idListInput" />
          <el-input class="idListSearch_input" :placeholder="$lang('请输入订单/运单号')" v-model="formData.idList" :disabled="true"> </el-input>
        </div>
      </template>
      <template slot="printSearch">
        <el-select v-model="printer" :placeholder="$lang('请选择打印机')" @change="idListfocus">
          <el-option v-for="(item, index) in options" :key="index" :label="item" :value="item"> </el-option>
        </el-select>
      </template>
    </avue-crud>

    <el-dialog :title="$lang('如何使用此快速打印界面')" :visible="fastShow" @close="closeTemplate" width="720px">
      <div class="fast_video">
        <iframe width="560" height="324" :src="videoUrl" title="video player" frameborder="0" allowfullscreen></iframe>
      </div>
    </el-dialog>
    <div></div>
  </div>
</template>

<script>
import mixin from "@/mixins/mixin";
import { fastPrinte, MyProfile } from "@/api";
import { RESPONSE_SUCCESS } from "@public/utils/const";
import { commonFun } from "@public/utils/common";
import { Util } from "@/utils/utils.js";
import debounce from "lodash/debounce";
const codImage = require('@/assets/images/cod.png')
let inputEvent = {
  firstTime: "",
  nextTime: "",
  lastTime: "",
  value: "",
};

const today = commonFun.getCurDate();
export default {
  name: "FastPrinting",
  mixins: [mixin],
  components: {},
  data() {
    return {
      COM_HTTP: fastPrinte,
      isShowFirst: false, // 首次禁止请求数据
      tableList: [],
      showDiscount: false,
      fastShow: false,
      videoUrl: "https://www.youtube.com/embed/SDrGBikvjkk",
      hasLodop: false,
      showContent: true,
      formData: {
        idList: "",
      },
      autofocus: true,
      options: [],
      radio: "2",
      userInfo: {},
      printer: "", // 打印机
    };
  },
  computed: {
    listOpt() {
      const that = this;
      return {
        search: true,
        exportBtn: false,
        // resetBtn: true,
        // importBtn: true,
        menu: false,
        menuWidth: 100, // 操作宽度
        // searchMore: true,
        searchExtend: true,
        // tableCustom: true,
        fixHeight: that.showContent ? 98 : 0,
        selection: true,
        column: [
          {
            prop: "idList",
            hide: true,
            search: true,
            searchslot: true,
          },
          {
            label: that.$lang("请选择打印机"),
            prop: "print",
            hide: true,
            search: true,
            searchslot: true,
          },
          {
            label: that.$lang("请选择电子面单"),
            prop: "radio",
            hide: true,
            search: true,
            type: "select",
            hasAll: false,
            searchDefault: that.radio,
            searchClearable: false,
            dicData: [
              { value: "1", label: that.$lang("一联电子面单") },
              { value: "2", label: that.$lang("二联电子面单") },
              // { value: "3", label: that.$lang("三联电子面单") },
            ],
            change(e) {
              that.idListfocus();
              that.radio = e.value;
            },
          },
          {
            label: "",
            prop: "showDiscount",
            searchslot: true,
            search: true,
            hide: true,
          },
          {
            label: that.$lang("订单号/运单号"),
            prop: "billCode",
          },
          {
            label: that.$lang("打印状态"),
            prop: "orderStatus",
          },
          {
            label: that.$lang("打印次数"),
            prop: "printNum",
          },
          {
            label: that.$lang("打印时间"),
            prop: "printeTime",
          },
        ],
      };
    },
  },
  watch: {},
  created() {},
  mounted() {
    this.$refs.idListInput.focus();
    this.getUserInfo();
    setTimeout(() => {
      this.checkIsInstall();
    }, 200);
  },
  methods: {
    // 500ms未输入 清空输入
    changeHandle: debounce(async function (e) {
      console.log("500ms 未输入  清空输入框");
      e.target.value = "";
      this.clearInputEvent();
    }, 500),
    // 订单/运单号监听输入
    keydownHandle(e) {
      if (!inputEvent.firstTime) {
        inputEvent.firstTime = new Date().getTime();
      }
      inputEvent.nextTime = new Date().getTime();
      const keyCode = e.keyCode || e.which || e.charCode;
      // 按键0-9(code:48到57)、a-zA-Z(code:65到90)、回车（code13）
      if (!(keyCode >= 48 && keyCode <= 57) && !(keyCode >= 65 && keyCode <= 90) && keyCode != 13) {
        console.log("输入事件监听：" + e.target.value);
        e.target.value = "";
        e.preventDefault();
      }
      if (keyCode === 13) {
        if (inputEvent.lastTime && inputEvent.lastTime - inputEvent.nextTime < 30) {
          // 扫码枪
          console.log("扫描信息：" + e.target.value);
          this.setidList(e.target.value);
        } else {
          // 键盘事件
          this.clearInputEvent();
        }
        e.target.value = "";
        e.preventDefault();
      } else {
        inputEvent.lastTime = inputEvent.nextTime;
      }
    },
    // 扫描成功 触发打印
    setidList: debounce(async function (newval, old) {
      if (newval && new RegExp("^([0-9a-zA-Z\-]{10,})$").test(newval)) {
        this.formData.idList = newval;
        await this.checkQuery();
      } else {
        this.$message.error(this.$lang("订单号/运单号有误，请重新输入订单号/运单号"));
      }
      this.clearInputEvent();
    }, 200),
    // 初始化记录
    clearInputEvent() {
      inputEvent = {
        firstTime: "",
        nextTime: "",
        lastTime: "",
        value: "",
      };
    },
    async getUserInfo() {
      this.loading = true;
      const params = { loginCode: this.user.loginCode };
      const { data, code } = await MyProfile.getUserInfo(params);
      if (code === RESPONSE_SUCCESS) {
        // 默认打印机
        this.userInfo = data;
        if (data.printerName) {
          this.printer = data.printerName;
        }
        // 面单信息
        if (data.faceSheetFormat) {
          data.faceSheetFormat === "0" || data.faceSheetFormat === "3" ? (this.radio = "2") : (this.radio = data.faceSheetFormat);
          data.faceSheetFormat === "0" || data.faceSheetFormat === "3" ? (this.$refs.params.searchForm.radio = "2") : (this.$refs.params.searchForm.radio = data.faceSheetFormat);
        }
        // 折扣信息
        if (data.discountInformation) {
          this.showDiscount = true || false;
        }
      }
    },
    resetList() {
      this.radio = "2";
      this.printer = "";
      this.formData.idList = "";
    },
    idListfocus() {
      this.$nextTick(() => {
        this.$refs.idListInput.focus();
      });
    },
    changeInput(value) {
      this.checkQuery();
    },
    closeAlert() {
      this.fixedHeight = 0;
    },
    selectionChange() {},
    rowClick() {},
    closeTemplate() {
      this.fastShow = false;
    },
    checkIsInstall() {
      try {
        this.LODOP = this.$getLodop();
        console.log("this.LODOP", this.LODOP);
        this.hasLodop = !!this.LODOP.VERSION;
        this.showContent = false;
        console.log("================", this.showContent);
        const printCount = this.LODOP.GET_PRINTER_COUNT();
        // 获取所有打印机的名称
        for (let i = 0; i < printCount; i++) {
          this.options.push(this.LODOP.GET_PRINTER_NAME(i));
        }
      } catch (err) {
        console.log("print:" + err);
      }
    },
    // 下载插件
    dowmloadZip() {
      this.$confirm(this.$lang("请先下载并安装CLodop打印插件，才可进行打印，下载成功后请刷新本页面，并启动CLodop插件。"), this.$lang("温馨提示"), {
        confirmButtonText: this.$lang("下载"),
        cancelButtonText: this.$lang("取消"),
        closeOnClickModal: false,
        type: "warning",
      })
        .then(() => {
          const link = document.createElement("a");
          link.href = "./clodop/CLodop_Setup_for_Win64NT.exe";
          link.style.display = "none";
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
        })
        .catch((_) => {});
    },
    // 再次确认
    checkIsInstallcheck() {
      this.checkIsInstall();
      this.showContent = !this.hasLodop;
      console.log(this.showContent, "this.showContent==============", this.hasLodop);
    },
    async checkQuery(params) {
      try {
        const idList = [];
        idList.push(this.formData.idList);
        const { code, data } = await this.COM_HTTP.query({ codes: idList });
        if (code === RESPONSE_SUCCESS) {
          let orderStatus = "";
          if (!data[0].billCode) {
            orderStatus = this.$lang("运单号为空，不可打印");
          }
          if (data[0].showStatus !== "1") {
            orderStatus = this.$lang("状态不为未寄件，不可打印");
          }
          if (data[0].showStatus === "1") {
            orderStatus = this.$lang("打印成功");
          }
          // id--订单编号,billCode--运单编号
          this.tableList.push({
            billCode: this.formData.idList,
            orderStatus: orderStatus || this.$lang("打印成功"),
            printNum: data[0].billCode && data[0].showStatus === "1" ? data[0].printNum + 1 : "",
            printeTime: data[0].billCode && data[0].showStatus === "1" ? today.dayHour : "",
          });
          const param = {
            style: `${this.radio}1`,
            id: this.formData.idList,
            type: "stream",
          };
          const discountPrint = this.showDiscount === true ? 1 : 0;
          if (data[0].billCode && data[0].showStatus === "1") {
            // 打印
            const res = await Util.fastPrintPDF(param, discountPrint);
            if (res && res.data) {
              const {pdfFile, hasCod = false} = res.data
              this.LODOP.PRINT_INIT(this.$lang("PDF打印"));
              this.LODOP.SET_PRINTER_INDEXA(this.options.indexOf(this.printer));
              this.changeType(pdfFile, hasCod);
              this.updateNum();
            } else {
              this.$message.error(this.$lang(res.msg));
            }
          }
        } else {
          this.tableList.push({
            billCode: this.formData.idList,
            orderStatus: this.$lang("暂无数据"),
            printNum: "",
            printeTime: "",
          });
        }
        this.formData.idList = "";
      } catch (error) {
        this.tableList.push({
          billCode: this.formData.idList,
          orderStatus: this.$lang("暂无数据"),
          printNum: "",
          printeTime: "",
        });
        this.formData.idList = "";
      }
    },
    changeType(res, hasCod) {
      // cod 水印改为前端打印
      if (this.radio === "1") {
        this.LODOP.SET_PRINT_PAGESIZE(0, "100mm", "100mm", "");
        // this.LODOP.ADD_PRINT_IMAGE(0, 0, '100%', '100%', `<img width="100%" src=${res}>`);
        hasCod && this.LODOP.ADD_PRINT_IMAGE('42mm', '48mm', '36mm', '15mm', `<img width="100%" src=${codImage}>`)
      } else if (this.radio === "2") {
        this.LODOP.SET_PRINT_PAGESIZE(0, 1000, 1500, "");
        // this.LODOP.ADD_PRINT_IMAGE(0, 0, '100mm', '150mm', `<img width="100%" src=${res}>`);
        hasCod && this.LODOP.ADD_PRINT_IMAGE('84mm', '40mm', '45mm', '17mm', `<img width="100%" src=${codImage}>`)
      }
      // 三联隐藏
      // else if (this.radio === "3") {
      //   this.LODOP.SET_PRINT_PAGESIZE(0, 1000, 1800, "");
      //   // this.LODOP.ADD_PRINT_IMAGE(0, 0, '100mm', '180mm', `<img width="100%" src=${res}>`);
      // }
      const img = res.replace("data:application/octet-stream;base64,", "");
      this.LODOP.ADD_PRINT_PDF(0, 0, "100%", "100%", img);
      this.LODOP.PRINT();
      // process.env.NODE_ENV === 'development' ? this.LODOP.PREVIEW() : this.LODOP.PRINT()
    },
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        // readAsDataURL
        fileReader.readAsDataURL(blob);
        fileReader.onload = (e) => {
          resolve(e.target.result);
        };
        fileReader.onerror = () => {
          reject(new Error("blobToBase64 error"));
        };
      });
    },
    async updateNum() {
      const idList = [];
      idList.push(this.formData.idList);
      const { code, data } = await this.COM_HTTP.update({ codes: idList });
      if (code === RESPONSE_SUCCESS) {
        console.log("更新num", data);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.FastPrinting {
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
  .top_box {
    width: calc(100% - 34px);
    font-size: 12px;
    display: flex;
    flex-direction: column;
    padding: 10px 16px;
    color: #61666d;
    div {
      height: 16px;
      line-height: 16px;
      margin: 2px 0;
    }
    .top_box_span {
      color: #e60012;
      cursor: pointer;
      font-weight: 500;
    }
  }
  .fast_video {
    width: 560px;
    height: 324px;
    background: url("~@/assets/images/404.png") no-repeat center center;
    background-size: 214px;
    border: 1px solid #c4c8cc;
    border-radius: 8px;
    margin: 20px auto;
    position: relative;
  }
  .idListSearch_input {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
  }
  .inputfocus ::v-deep {
    input:focus {
      border-color: #66afe9;
      outline: 0;
      -webkit-box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%), 0 0 8px rgb(102 175 233 / 60%);
      box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%), 0 0 8px rgb(102 175 233 / 60%);
    }
  }
}
</style>

<style lang="scss">
.FastPrinting {
  #jmsSearch {
    .query-box {
      display: none !important;
    }
  }
  .showDiscount {
    margin-top: 6px;
  }
}
</style>
