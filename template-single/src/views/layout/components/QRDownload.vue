<!--
 * @Author: jinmiao
 * @Date: 2021-07-12 16:47:59
 * @Description: 登录
 * @LastEditTime: 2022-02-25 13:47:01
-->
<template>
  <div class="qr-download-box">
    <el-popover
        placement="top-start"
        trigger="hover"
       >
      <div class="flex-box">
        <div class="left">
          <img src="@/assets/images/vip_download.png" width="180" height="180" alt="downloadQR">
        </div>
        <div class="right">
          <p>{{ $lang('扫描二维码') }}</p>
          <p>{{ $lang('或从下方下载应用程序') }}</p>
          <img class="googleImg" src="~@/assets/images/login/GoogleButton.png" @click="gogoogle" alt="download"/>
        </div>
      </div>
      <div class="text" slot="reference">
        <i class="el-icon-download"></i><p>{{ $lang('下载VIP应用') }}</p>
      </div>
    </el-popover>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'QRDownload',
  props: {},
  // components: { googleCaptch },
  data() {
    return {
    }
  },
  computed: {
  },
  watch: {},
  mounted() {
  },
  methods: {
    gogoogle() {
      window.open('https://play.google.com/store/apps/details?id=com.jnt.vipa')
    }
  }
}
</script>
<style lang="scss" scoped>
.qr-download-box {
  cursor: pointer;
  .text {
    display: flex;
    color: #61666d;
    margin-right: 20px;
    font-size: 14px;
    line-height: 24px;
    &:hover {
      color: #E60012;
    }
    .el-icon-download {
      font-size: 24px;
    }
  }
}
.flex-box {
  display: flex;
  margin: 20px;
}
.left {
  border-radius: 10px;
  border: 1px solid #E60012;
  overflow: hidden;
}
.right {
  width: 180px;
  height: 180px;
  text-align: center;
  line-height: 30px;
  margin-left: 20px;
  .googleImg {
    width: 170px;
    height: 50px;
    margin-top: 26px;
    cursor: pointer;
  }
}
</style>
