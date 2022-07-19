<!--
 * @Author: jinmiao
 * @Date: 2021-07-21 16:22:09
 * @Description: file content
 * @LastEditTime: 2021-10-28 15:47:36
-->
<template>
  <div class="dialogbox">
    <el-dialog :title="$lang('批量导入')" :visible.sync="addressShow" width="720px" @close="close">
      <div class="batchUploadcontent" v-loading="loading">
        <div class="title"><span>*</span>{{ $lang("上传文件") }}</div>
        <el-upload
          class="upload"
          ref="upload"
          :headers="header"
          drag
          :action="saveOrderflag ? actionURLTrue : actionURLFalse"
          accept=".xls,.xlsx"
          :auto-upload="false"
          :show-file-list="false"
          :file-list="fileList"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :on-error="handleError"
        >
          <el-button class="batchUpload_btn">{{ $lang("点击选择文件") }}</el-button>
          <div class="el-upload__tip">{{ uploadFile.name || $lang("或拖动文件到此处，可上传到文件格式为xlsx") }}</div>
        </el-upload>
        <div class="bathUploadMsg">
          <p>{{ $lang("说明") }}</p>
          <span>{{ $lang("1.导入正确格式规范录入必填栏位") }}</span>
          <span>{{ $lang("2.最多可以导入1000行数据") }}</span>
          <span>{{ $lang("3.导入寄件人模板：如果有委托人信息，则委托人标识必须填入1。如果没有委托人信息，必须填入0。") }}</span>
        </div>
        <div class="bathUploadSwitch">
          <el-switch v-model="saveOrderflag" active-color="#e60012" inactive-color="#9499A3"> </el-switch>
          <span class="dialogbox_txt">{{ $lang("电商订单重复判断") }}</span>
        </div>
      </div>
      <span slot="footer" class="bottom-wrap">
        <el-button type="primary dialogBtn" class="btn red" @click="immediateImport" :disabled="!uploadFile.name">{{ $lang("立即导入") }}</el-button>
      </span>
    </el-dialog>

    <div class="el-dialog__wrapper upload-dialog-wrap" v-show="innerVisible">
      <div class="el-dialog el-dialog__body">
        <p class="upload-dialog-wrap_p">{{ $lang("等待导入订单") }} {{ progress }}%</p>
        <span class="upload-dialog-wrap_span">{{ $lang("导入过程中请勿关闭当前页") }}</span>
        <el-progress
          :percentage="progress"
          :format="
            () => {
              return '';
            }
          "
          color="#E60012"
        ></el-progress>
      </div>
    </div>
  </div>
</template>

<script>
const IS_DEVELOPMENT = process.env.NODE_ENV === "development"; // 是否开发环境
const baseURL = IS_DEVELOPMENT ? "/proxyUrl" : process.env.VUE_APP_API_URL;
import { OrderImport } from "@/api";
import { RESPONSE_CODE } from "@public/http/config";
const EXCEL_URL = baseURL + "/yl-indonesia-vip/vip" + "/import/order/validateOrder?isFilterRepeat=";
import { mapGetters } from "vuex";
let timer1 = null;
export default {
  name: "BatchUpload",
  components: {},
  data() {
    return {
      COM_HTTP: OrderImport,
      isShowFirst: false,
      addressShow: false,
      saveOrderflag: false,
      actionURLFalse: EXCEL_URL + false,
      actionURLTrue: EXCEL_URL + true,
      fileList: [],
      uploadFile: {},
      loading: false,
      progress: 0, // 进度条刻度
      innerVisible: false, // 进度条
    };
  },
  props: {
    value: {},
  },
  computed: {
    ...mapGetters(["lang"]),
    // 用户信息
    userInfo() {
      return this.$store.state.base.user || {};
    },
    header() {
      let language = "";
      switch (this.lang) {
        case "CN":
          language = "zh_CN";
          break;
        case "EN":
          language = "en_US";
          break;
        case "YN":
          language = "in_ID";
          break;
        default:
          break;
      }
      return {
        authToken: this.userInfo.token,
        language: language,
      };
    },
  },
  watch: {
    value: {
      handler(val) {
        this.addressShow = val;
      },
      immediate: true,
    },
  },
  created() {},
  methods: {
    handleError(err) {
      timer1 && clearInterval(timer1);
      const myError = err.toString().replace("Error: ", "");
      const res = JSON.parse(myError);
      const { msg, code } = res;
      this.$message.warning(msg);
      this.innerVisible = false;
      this.close();
      if (code === (401 | 403)) {
        // 重新登录
        this.$store.dispatch("LOGIN_OUT").then(() => {
          setTimeout(() => {
            // 退出
            localStorage.removeItem("account");
            this.$router.push({ name: "Login" });
          }, 1000);
        });
      }
      this.loading = false;
      this.$parent.loading = false;
    },
    show() {
      this.addressShow = true;
    },
    async immediateImport() {
      this.loading = true;
      this.$parent.loading = true;
      this.innerVisible = true;
      this.progress = 0;
      let countTimeNumber = 20;
      try {
        const { size = 20480 } = this.uploadFile;
        const sizeNumber = parseInt(size / 1024);
        if (sizeNumber > 30 <= 50) countTimeNumber = 100;
        if (sizeNumber > 50 <= 100) countTimeNumber = 200;
        if (sizeNumber > 100 <= 300) countTimeNumber = 300;
        if (sizeNumber > 300) countTimeNumber = 400;
      } catch (error) {
        console.log(error);
      }
      timer1 = setInterval(() => {
        this.progress++;
        if (this.progress >= 98) {
          timer1 && clearInterval(timer1);
        }
      }, countTimeNumber);
      await this.$refs.upload.submit();
    },
    // 文件改变
    handleChange(file, ffff) {
      console.log(file, ffff);
      if (this.fileList > 1) {
        this.fileList.splice(0, 1);
      }
      this.uploadFile = file;
    },
    // 删除文件
    handleRemove(file, fileList) {
      this.uploadFile = {};
    },
    // 成功
    handleSuccess(res, file) {
      timer1 && clearInterval(timer1);
      timer1 = setInterval(() => {
        this.progress += 5;
        if (this.progress >= 100) {
          timer1 && clearInterval(timer1);
          this.progress = 100;
          setTimeout(() => {
            // 等待500ms  等进度条完成
            this.successFn(res, file)
          }, 500)
        }
      }, 20);
    },
    successFn({code, data, msg}, file) {
      this.loading = false
      this.innerVisible = false
      this.close()
      this.$emit('success', data, file, this.saveOrderflag)
      if (code !== RESPONSE_CODE.SUCCESS) {
        this.$message.warning(msg)
      }
      this.$parent.loading = false;
    },
    close() {
      this.addressShow = false;
      this.innerVisible = false;
      this.progress = 0;
      this.$emit("input", this.addressShow);
      this.$emit("change", this.addressShow);
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-dialog-wrap {
  z-index: 6666;
  background: rgba($color: #000000, $alpha: 0.5);
  .el-dialog.el-dialog__body {
    width: 480px;
    padding: 50px 30px;
    text-align: center;
  }
  .upload-dialog-wrap_p {
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    color: #2b2d42;
    line-height: 2;
  }
  .upload-dialog-wrap_span {
    font-size: 12px;
    line-height: 3;
  }
}
.dialogbox {
  .bottom-wrap {
    border-radius: 12px;
    background-color: #ffffff;
    // padding: 20px;
    display: flex;
    justify-content: center;
    .btn {
      background: #ffffff;
      border: 1px solid #e60012;
      border-radius: 4px;
      font-size: 14px;
      color: #e60012;
      height: 32px;
      padding: 7px 16px;
    }
    .btn.is-disabled {
      @include border-color("base");
      // border-color: rgba(230,0,18,0.05);
    }
    .red {
      background: #e60012;
      color: #ffffff;
      margin-left: 20px;
    }
    .red.is-disabled {
      @include bg-color("input-disabled");
      color: $-color-text-shalow-routine !important;
    }
  }
  .batchUploadcontent {
    margin: 0;
    ::v-deep.el-upload-dragger {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 100%;
      height: 106px;
    }
    ::v-deep.upload {
      display: flex;
      justify-content: center;
      flex-direction: column;
    }
    .batchUpload_btn {
      background: #ffffff;
      border: 1px solid #e60012;
      border-radius: 8px;
      color: #e60012;
      line-height: 18px;
      height: 32px;
      padding: 7px 16px;
    }
    .el-upload__tip {
      color: #9499a3;
      margin-top: 10px;
    }
    .bathUploadMsg {
      display: flex;
      flex-direction: column;
      margin-top: 24px;
      span {
        color: #61666d;
        line-height: 16px;
        font-size: 12px;
        margin-bottom: 6px;
      }
      p {
        font-weight: 500;
        color: #4c4d57;
        line-height: 20px;
        font-size: 16px;
        margin-bottom: 10px;
      }
    }
    .title {
      height: 42px;
      span {
        font-size: 16px;
        font-weight: 500;
        color: #e60012;
        line-height: 42px;
        margin-right: 6px;
      }
      font-size: 16px;
      font-weight: 500;
      color: #4c4d57;
      line-height: 42px;
    }
  }
  .bathUploadSwitch {
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
    margin-top: 18px;
    line-height: 20px;
    span {
      margin-left: 10px;
    }
  }
}
</style>

<style lang="scss">
.dialogbox {
  .el-dialog__body {
    padding: 12px 32px;
  }
  .el-switch__core {
    width: 36px !important;
    height: 18px;
  }
  .el-switch__core:after {
    width: 14px;
    height: 14px;
  }
  .el-dialog__footer {
    padding: 12px 32px 24px;
  }
}
</style>
