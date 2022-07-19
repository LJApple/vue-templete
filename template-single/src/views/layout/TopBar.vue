<template>
  <div class="topBar">
    <div class="navTab">
      <TagBar></TagBar>
    </div>
    <div class="header-right">
      <div class="header-action">
        <QRDownload></QRDownload>
        <el-dropdown trigger="click" @command="userOperation">
          <div class="personal">
            <img src="@/assets/images/head.png" alt="" />
            <span class="name">{{ user.userAdmin === 1 ? user.cusName : user.name }} </span>
            <i class="el-icon-caret-bottom el-icon--right"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="home-menu">
            <el-dropdown-item command="chooselang" class="switch-lang-item">
              <el-dropdown @command="switchLang" placement="right-start">
                <div class="switch-lang iconfont icon-qita_ico_yuyanqiehuan">
                  <span>{{ $lang('选择语言') }}</span>
                </div>
                <el-dropdown-menu slot="dropdown" class="home-menu home-menu_language">
                  <el-dropdown-item command="YN" :class="{ 'lang-active': lang === 'YN' }">Indonesia</el-dropdown-item>
                  <el-dropdown-item command="EN" :class="{ 'lang-active': lang === 'EN' }">English</el-dropdown-item>
                  <el-dropdown-item command="CN" :class="{ 'lang-active': lang === 'CN' }">简体中文</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-dropdown-item>
            <el-dropdown-item command="myInfo" icon="iconfont icon-qita_ico_wode">{{ $lang('我的资料') }}</el-dropdown-item>
            <el-dropdown-item v-show="commonHelpUrl" command="help" icon="iconfont icon-qita_ico_bangzhu">{{ $lang('帮助中心') }}</el-dropdown-item>
            <el-dropdown-item command="logOut" icon="iconfont icon-qita_ico_tuichu">{{ $lang('退出') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div v-if="myprofileVisible">
      <myProfile :myprofileVisible.sync="myprofileVisible"></myProfile>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapGetters, mapActions } from 'vuex'
import { RESPONSE_CODE } from '@public/http/config'
import myProfile from './MyProfile'
import * as Api from '@/api'
import TagBar from './TagBar'
import { watermark } from '@public/utils/watermark.js'
import { formatDate } from '@public/utils/common.js'
import QRDownload from '@/views/layout/components/QRDownload'

export default {
  name: 'TopBar',
  components: { myProfile, TagBar, QRDownload },
  data() {
    return {
      myprofileVisible: false,
      commonHelpUrl: '',
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'lang', 'langJsonAll']),
  },
  watch: {
    user: {
      deep: true,
      // 初始化的时候执行
      immediate: true,
      handler(nVal) {
        if (nVal) {
          let text = nVal.userAdmin === 1 ? nVal.cusName : nVal.name
          text += ` ${formatDate(new Date(), 'YYYY-MM-DD')}`
          watermark({ text })
        }
      },
    },
  },
  created() {
    this.getHelpUrl()
  },
  methods: {
    ...mapActions(['LOGIN_OUT', 'setLang']),
    /**
     * @Description:  获取帮助中心链接
     */
    async getHelpUrl() {
      const { code, data } = await Api.commonHelp()
      if (code === RESPONSE_CODE.SUCCESS && data) {
        switch (this.lang) {
          case 'CN':
            this.commonHelpUrl = data.url
            break
          case 'EN':
            this.commonHelpUrl = data.enUrl
            break
          case 'YN':
            this.commonHelpUrl = data.idnUrl
            break
        }
      }
    },
    goVipPage() {
      let langType = 'zh'
      switch (this.lang) {
        case 'CN':
          langType = 'zh'
          break
        case 'EN':
          langType = 'en'
          break
        case 'YN':
          langType = 'id'
          break
      }
      window.open(`https://vipcustomer.jet.co.id/?lang=${langType}`)
    },
    /**
     * @Description: 切换语言
     * @param {String} [command] - 语言类型
     */
    switchLang(command) {
      console.log('切换语言', command)
      this.setLang(command)
    },
    /**
     * @Description: 用户更多选项
     * @param {String} [command] - 类型
     */
    userOperation(command) {
      if (command === 'myInfo') {
        this.myprofileVisible = true
      } else if (command === 'logOut') {
        // 退出登录
        this.logOut()
      } else if (command === 'help') {
        // 帮助中心
        window.open(this.commonHelpUrl, '_blank')
      }
    },
    /**
     * @description 退出
     */
    logOut() {
      this.$confirm(this.$lang('是否确认退出登录？'), '', {
        confirmButtonText: this.$lang('确定'),
        cancelButtonText: this.$lang('取消'),
        closeOnClickModal: false,
        // type: 'warning',
        customClass: 'logout-confirm__topbar',
        confirmButtonClass: 'comfirm-btn',
        // iconClass: 'el-icon-warning-outline',
        center: true,
      }).then(async () => {
        const { code, msg } = await Api.logout()
        if (code === RESPONSE_CODE.SUCCESS) {
          this.LOGIN_OUT().then(() => {
            this.$router.push({ path: '/login' })
          })
        } else {
          this.$message.error(msg)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.topBar {
  background: #fff;
  // color: #ffffff;
  height: 48px;
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  .navTab {
    flex: 1;
    width: 300px;
  }
  .header-left {
    float: left;
    display: flex;
    height: 48px;
    align-items: center;
    align-content: center;
    cursor: pointer;
    .logo-img {
      width: 113px;
      height: 24px;
      line-height: 23px;
      margin-left: 8px;
      -moz-user-select: none; /*火狐*/
      -webkit-user-select: none; /*webkit浏览器*/
      -ms-user-select: none; /*IE10*/
      -khtml-user-select: none; /*早期浏览器*/
      user-select: none;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .el-header {
    padding: 0 20px 0 12px;
  }
  .iconfont {
    font-size: 30px;
  }
  .header-action {
    height: 48px;
    cursor: pointer;
    float: right;
    display: flex;
    align-items: center;
    .personal {
      display: flex;
      align-items: center;
      text-decoration: none;
      // color: white;
      margin-right: 5px;
    }
    .switch-lang {
      display: flex;
      align-items: center;
      margin-right: 36px;
      // color: $--color-white;
    }
    img {
      width: 28px;
      height: 28px;
    }
    .name {
      max-width: 200px;
      display: inline-block;
      margin: 0 2px 0 6px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .icontuichu {
      font-size: 14px;
      cursor: pointer;
    }
  }
}
.home-menu {
  top: 41px !important;
  padding: 8px 0;
  margin-top: 5px;
  .popper__arrow {
    display: none !important;
  }
  > li.el-dropdown-menu__item {
    height: 40px;
    font-size: 12px;
    line-height: 38px;
    // border-bottom-width: 1px;
    // border-bottom-style: solid;
    // color: rgba(51, 51, 51, 1);
    min-width: 124px;
    padding: 0 12px;
    &:last-of-type {
      box-shadow: none;
      border-bottom: none;
    }
    > i {
      margin-right: 0px;
      width: 52px;
      display: inline-block;
      text-align: center;
    }
    &:focus,
    &:not(.is-disabled):hover {
      color: $-color-text-shalow-subtitle;
      background: $c-bg-2;
    }
  }
}

.home-menu.home-menu_language {
  width: 108px;
  min-width: 108px;
  > li.el-dropdown-menu__item {
    height: 32px;
    line-height: 30px;
    width: 62px;
    min-width: 62px;
    padding: 0 23px;
  }
}

.lang-active {
  color: #e60012 !important;
}

.logout-confirm .el-message-box__message {
  padding-left: 0 !important;
}
</style>

<style lang="scss">
.switch-lang-item {
  .el-dropdown {
    width: 100%;
  }
  .switch-lang {
    span {
      font-size: 12px;
      margin-left: 5px;
    }
  }
}
.logout-confirm__topbar {
  .el-message-box__message {
    padding-left: 0 !important;
    height: 45px;
    p {
      margin: 0 auto;
      font-size: 18px;
      font-weight: 500;
      color: #2b2d42;
    }
  }
  .el-message-box__btns .el-button {
    width: 120px;
  }
}
.common-confirm__topbar {
  .el-message-box__close {
    display: inline-block !important;
  }
  .el-message-box__header {
    padding: 40px 0 0 40px !important;
    .el-message-box__title {
      color: #2b2d42;
      font-weight: 500;
      line-height: 24px;
    }
  }
  .el-message-box__content {
    padding: 0 !important;
    margin-top: 6px;
    font-size: 14px;
    color: #4c4d57;
    line-height: 20px;
  }
  .el-message-box__message {
    height: auto;
    padding-left: 40px;
  }
  .el-message-box__btns {
    margin-top: 48px;
    padding: 0;
    text-align: center;
    .el-button {
      width: 120px;
      height: 32px;
    }
    button:nth-child(2) {
      margin-left: 16px;
    }
  }
}
.jt_logo {
  color: #e60012;
  font-size: 24px !important;
}
.header-right {
  max-width: 300px;
  margin-left: 16px;
}
</style>
