<template>
  <div class="main">
    <topBar></topBar>
    <div class="alert_error" id="jmsAlertError" v-if="alertErrorShow">
      <i class="iconfont icon-qita_ico_tongzhi"></i>
      <vueMarquee>{{ alertData.advertInfo }}</vueMarquee>
      <i class="el-icon-close pointer" @click.stop="closeAlert"></i>
    </div>
    <div class="content">
      <keep-alive>
        <router-view />
      </keep-alive>
    </div>

    <div class="advert-box" v-show="AdvertShow">
      <div class="advert-wrap">
        <span class="advert-content">
          <a class="advert-link" v-if="AdvertData.advertUrl" :href="AdvertData.advertUrl" target="_blank"></a>
          <el-image style="width: 480px; height: 480px" :src="AdvertData.advertImg" fit="contain"></el-image>
        </span>
        <p></p>
        <el-button class="advert-footer" type="primary" @click="AdvertClose">{{ $lang('确定') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import topBar from './TopBar'
import { commonWarning, commonNoticeRead, commonAdvert } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
import { mapState, mapMutations } from 'vuex'
let onlinetime = null
import vueMarquee from './components/vueMarquee.vue'
export default {
  name: 'Main',
  props: {},
  components: { topBar, vueMarquee },
  data() {
    return {
      // 走马灯提醒
      alertErrorShow: false,
      alertData: {
        serialNo: '',
        advertInfo: '',
        advertType: '',
        advertImg: '',
        advertUrl: '',
      },
      // 广告弹出层
      AdvertShow: false,
      AdvertData: {
        serialNo: '',
        advertInfo: '',
        advertType: '',
        advertImg: '',
        advertUrl: '',
      },
    }
  },
  computed: {
    ...mapState({
      indexBoxAlert: state => state.base.indexBoxAlert,
    }),
  },
  created() {
    this.getCommonWarning()
    onlinetime = setInterval(() => {
      this.getCommonWarning()
    }, 1000 * 60)
    if (this.indexBoxAlert) {
      this.getcommonAdvert()
    }
  },
  beforeDestroy() {
    if (onlinetime) clearInterval(onlinetime)
  },
  methods: {
    ...mapMutations({
      SET_BOX_ALERT: 'SET_BOX_ALERT',
    }),
    /**
     * @description: 获取广告弹窗
     */
    async getcommonAdvert() {
      const { code, data } = await commonAdvert()
      this.SET_BOX_ALERT(false)
      if (code === RESPONSE_CODE.SUCCESS && data) {
        this.AdvertShow = true
        this.AdvertData = data
      }
    },
    /**
     * @description: 获取紧急提醒
     */
    async getCommonWarning() {
      if (this.alertErrorShow) return
      const { code, data } = await commonWarning()
      if (code === RESPONSE_CODE.SUCCESS && data) {
        this.alertErrorShow = true
        this.alertData = data
        this.$bus.$emit('doLayout')
      }
    },
    /**
     * @description: 紧急提醒已读
     */
    closeAlert() {
      this.alertErrorShow = false
      this.$bus.$emit('doLayout')
      const { serialNo, advertType } = this.alertData
      // 已读
      commonNoticeRead({ serialNo, advertType })
    },
    /**
     * @description: 广告已读
     */
    AdvertClose() {
      this.AdvertShow = false
      const { serialNo, advertType } = this.AdvertData
      // 已读
      commonNoticeRead({ serialNo, advertType })
    },
  },
}
</script>

<style lang="scss" scoped>
.main {
  margin-left: 200px;
  height: calc(100%);
  box-sizing: border-box;
  background: #ebebeb;
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
  .advert-box {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 5555;
    .advert-wrap {
      width: 720px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);
      padding: 16px;
      margin: 15vh auto 50px;
      box-sizing: border-box;
      text-align: center;
      .advert-content {
        position: relative;
        box-sizing: border-box;
        display: inline-block;
        .advert-link {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 555;
        }
      }
      .advert-footer {
        width: 120px;
        margin-top: 24px;
      }
    }
  }
  .alert_error {
    height: 40px;
    background: #fef2f3;
    border: 1px solid rgba(230, 0, 18, 0.5);
    padding: 0 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    margin: 0 10px 10px;
    color: #61666d;
    i {
      font-size: 16px;
    }
  }
}
</style>
