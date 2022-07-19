<!--
 * @Author: jinmiao
 * @Date: 2021-07-12 16:47:59
 * @Description: 登录
 * @LastEditTime: 2022-02-25 13:47:01
-->
<template>
  <div class="login">
    <div class="login-main">
      <div class="login-title">
        <div class="logo" @click="gologo">
          <svg class="icon svg-icon" aria-hidden="true">
            <use xlink:href="#icon-logo"></use>
          </svg>
        </div>
        <div class="changeLanguage">
          <QRDownload></QRDownload>
          <svg class="icon svg-icon" aria-hidden="true">
            <use :xlink:href="icon_guoqi"></use>
          </svg>
          <el-dropdown @command="handleCommand" trigger="click" :hide-on-click="false" id="loginDropdown" @visible-change="visibleChange">
            <span class="el-dropdown-link">
              <template v-if="!languageChoose">
                {{ language === 'CN' ? '简体中文' : language === 'EN' ? 'English' : 'Indonesia' }}<i class="iconfont icon-caidan_ico_xiala down"></i>
              </template>
              <span class="langHighLight" v-if="languageChoose">
                {{ language === 'CN' ? '简体中文' : language === 'EN' ? 'English' : 'Indonesia' }}<i class="iconfont icon-caidan_ico_xiala down"></i>
              </span>
            </span>
            <el-dropdown-menu slot="dropdown" id="loginDropdownMenu">
              <el-dropdown-item command="YN" class="login-drop-item" :class="{ langHighLight: language === 'YN' }">Indonesia</el-dropdown-item>
              <el-dropdown-item command="EN" class="login-drop-item" :class="{ langHighLight: language === 'EN' }">English</el-dropdown-item>
              <el-dropdown-item command="CN" class="login-drop-item" :class="{ langHighLight: language === 'CN' }">简体中文</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div class="bg-img" :class="imgURL"></div>
      <div class="login-box">
        <div class="login-box_content">
          <!-- <div class="form">
            <h1>{{$lang('登录')}}</h1>
          </div> -->
          <div class="login-denglu">{{ $lang('登录') }}</div>
          <el-form ref="loginForm" class="login-form" label-position="left" autocomplete="off" :model="loginForm" :rules="rules">
            <el-form-item prop="loginCode" class="loginForm-input">
              <el-input :placeholder="$lang('请输入您的用户名')" maxlength="50" v-model.trim="loginForm.loginCode" @input="formChange" @keyup.enter.native="enterLogin">
                <i slot="prefix" class="iconfont icon-zujian_ico_yonghuming prefix-icon"></i>
              </el-input>
            </el-form-item>
            <el-form-item prop="loginPassword" class="loginForm-input">
              <el-input
                :placeholder="$lang('请输入您的密码')"
                :type="isShowPassword ? 'text' : 'password'"
                maxlength="20"
                v-model="loginForm.loginPassword"
                @input="formChange"
                @keyup.enter.native="enterLogin"
              >
                <i slot="prefix" class="iconfont icon-zujian_ico_mima prefix-icon"></i>
                <i slot="suffix" class="iconfont pointer" :class="[isShowPassword ? 'icon-zujian_ico_mingwen' : 'icon-zujian_ico_anwen']" @click="toggleIcon"></i>
              </el-input>
            </el-form-item>
            <el-form-item prop="verificationCode" class="loginForm-input verificationCode">
              <el-input
                :placeholder="$lang('请输入验证码')"
                maxlength="4"
                class="verificationCode_left"
                v-model="loginForm.captcha"
                @input="formChange"
                @keyup.enter.native="enterLogin"
              >
                <i slot="prefix" class="iconfont icon-zujian_ico_yanzhengma prefix-icon"></i>
                <i slot="suffix">
                  <img :src="verificationImg" alt="" @click="refreshCode" style="position: relative; bottom: 1px" />
                </i>
              </el-input>
              <i class="iconfont icon-icon_shuaxin" @click="refreshCode"></i>
            </el-form-item>
            <!-- <googleCaptch :sitekey="googleKey" ref="googleCaptch" @googleValidate="getGoogleCode"/> -->
            <div class="remember">
              <el-row>
                <el-col :span="12">
                  <el-checkbox v-model="remember" :label="$lang('记住用户名')" class="remember-account"></el-checkbox>
                </el-col>
                <el-col :span="12">
                  <div class="remember_right" @click="goForget">{{ $lang('忘记密码') + '？' }}</div>
                </el-col>
              </el-row>
            </div>
            <div class="switch" @click="goOld">{{ $lang('点击切换旧大客户') }}</div>
            <div style="text-align: center">
              <el-button
                class="commonBtn loginBtn jt-bounce-to-right"
                :disabled="!verifyState"
                :class="{ 'loginBtn-disabled': !verifyState }"
                @click.prevent="login"
                :loading="loginLoading"
                >{{ $lang('登录') }}</el-button
              >
            </div>
            <div class="register">
              <!-- <span class="red-span" @click="goOld">{{$lang('点击切换旧大客户')}}</span> -->
              <div>
                {{ $lang('还没有账号') + '？' }}<span class="red-span" @click="registerNew">{{ $lang('立即注册') }}</span>
              </div>
            </div>
          </el-form>
        </div>
      </div>
      <div class="login-footer">
        <div class="title">&#169; 2015-2021 PT. Global Jet Express All Rights Reserved</div>
<!--        <img src="~@/assets/images/login/GoogleButton.png" class="googleImg" @click="gogoogle" />-->
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapActions, mapGetters } from 'vuex'
import { RULES } from '@public/utils/rules'
import * as Api from '@/api'
import { CryptoUtil } from '@/utils/crypto'
import { RESPONSE_SUCCESS } from '@public/utils/const'
import QRDownload from '@/views/layout/components/QRDownload'
// import googleCaptch from './googleCaptch.vue'
const { VUE_APP_ENV } = process.env
export default {
  name: 'Login',
  props: {},
  components: { QRDownload },
  data() {
    return {
      COM_HTTP: Api,
      loginForm: {
        loginCode: '',
        loginPassword: '',
        captcha: '',
      },
      rules: {
        loginCode: [RULES.required],
        loginPassword: [RULES.required],
        captcha: [RULES.required],
      },
      activeName: 'account',
      remember: false,
      loginLoading: false,
      isShowPassword: false, // 不显示
      language: 'CN',
      routeAuthList: [],
      captcha: '',
      verifyState: false,
      languageChoose: false,
      verificationImg: '', // 验证码图片
      ctoken: '',
      googleKey: '6Ld7-UwgAAAAAAdVz6X8Cdllyq2ZOyLQfixkOpSE'
    }
  },
  computed: {
    ...mapGetters(['token', 'lang']),
    icon_guoqi() {
      const language = this.lang
      switch (language) {
        case 'CN':
          return '#icon-guoqi-zhongwen'
        case 'EN':
          return '#icon-guoqi-yingwen'
        case 'YN':
          return '#icon-guoqi-yinni'
        default:
          return '#icon-guoqi-yinni'
      }
    },
    imgURL() {
      const language = this.lang
      switch (language) {
        case 'CN':
          return 'bg-img-zh'
        case 'EN':
          return 'bg-img-en'
        case 'YN':
          return 'bg-img-ind'
        default:
          return 'bg-img-ind'
      }
    },
  },
  watch: {},
  created() {
    this.init()
    this.getCode()
  },
  mounted() {
    this.removeWatermark()
  },
  methods: {
    ...mapActions(['LOGIN_INIT', 'LOGIN_OUT', 'SET_BTNLIST', 'SET_PAGELIST', 'setLang']),
    init() {
      this.language = this.lang
      // 在页面加载时从cookie获取登录信息
      const loginCode = this.getCookie('loginCode')
      const loginPassword = this.getCookie('loginPassword')

      // 如果存在赋值给表单，并且将记住密码勾选
      if (loginCode) {
        this.loginForm.loginCode = CryptoUtil.aesDecrypt(loginCode)
        this.loginForm.loginPassword = CryptoUtil.aesDecrypt(loginPassword)
        this.remember = true
      }
    },
    getGoogleCode(val) {
      this.verifyState = val
    },
    /**
     * 获取验证码
     */
    async getCode() {
      await this.COM_HTTP.captcha().then(res => {
        this.verificationImg = res.data.img
        this.ctoken = res.data.ctoken
      })
    },
    formChange(valid) {
      this.$refs.loginForm.validate(async valid => {
        console.log(valid, 'validvalidvalid')
        this.verifyState = !!valid
      })
    },
    // 去除watermark（兼容处理）
    removeWatermark() {
      const w = document.getElementById('watermark')
      if (w) document.body.removeChild(w)
    },
    changeCaptcha(code) {
      this.captcha = code
    },
    refreshCode() {
      this.getCode()
    },
    toggleIcon() {
      this.isShowPassword = !this.isShowPassword
    },

    // 递归处理按钮权限
    getBtnAuth(item, name, arr = []) {
      item.forEach(item => {
        if (item.resource_type === 'BUTTON') {
          arr.push({ resource_code: item.resource_code, name })
        } else if (item.children) {
          return this.getBtnAuth(item.children, item.url, arr)
        }
      })
      return arr
    },

    // 递归处理按钮权限 -> 暂不使用
    getPageAuth(item, arr = []) {
      item.forEach(item => {
        if (item.url) {
          arr.push(item.url)
        }
        if (item.children) {
          return this.getPageAuth(item.children, arr)
        }
      })
      return arr
    },
    enterLogin() {
      if (this.verifyState) {
        this.login()
      }
    },
    // 登录
    async login() {
      const $this = this
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          const { loginCode, loginPassword, captcha } = this.loginForm
          $this.loginLoading = true
          const { data, code, msg } = await $this.COM_HTTP.login({ loginCode, loginPassword: CryptoUtil.rsaEncrypt(loginPassword), ctoken: this.ctoken, captcha })
          if (code === RESPONSE_SUCCESS) {
            const { token = '', newMenuId = '', userAdmin } = data
            $this.saveAccountCookie()
            $this.LOGIN_INIT({ user: data, token, menu: {}, routeAuthList: [] })
            let menu = await $this.getMenuList()
            let routeAuthList = []
            console.log(userAdmin, 'userAdmin')
            if (userAdmin === 1) {
              // 产品需求-管理员默认添加权限管理
              menu.push({
                id: 14,
                resourceCode: 'authorityManagement',
                resourceName: '权限管理',
                resourceHref: null,
                resourceInco: 'icon-caidan_ico_quanxianguanli',
                parentid: 0,
                resourceType: 1,
                sort: 4,
                childResources: [
                  {
                    id: 140,
                    resourceCode: 'authoritySetting',
                    resourceName: '权限管理设置',
                    resourceHref: 'authoritySetting',
                    resourceInco: null,
                    parentid: 14,
                    resourceType: 1,
                    sort: 1,
                    childResources: [
                      {
                        id: 1400,
                        resourceCode: 'authoritySetting_QUERY',
                        resourceName: '查询',
                        resourceHref: null,
                        resourceInco: null,
                        parentid: 140,
                        resourceType: 2,
                        sort: 1,
                        childResources: [],
                      },
                      {
                        id: 1401,
                        resourceCode: 'authoritySetting_ADD',
                        resourceName: '新增',
                        resourceHref: null,
                        resourceInco: null,
                        parentid: 140,
                        resourceType: 2,
                        sort: 1,
                        childResources: [],
                      },

                      {
                        id: 1402,
                        resourceCode: 'authoritySetting_EDIT',
                        resourceName: '修改',
                        resourceHref: null,
                        resourceInco: null,
                        parentid: 140,
                        resourceType: 2,
                        sort: 1,
                        childResources: [],
                      },
                    ],
                  },
                ],
              })
              routeAuthList = $this.filteNodeAdmin(menu).map(item => item.resourceCode)
              $this.routeAuthList = routeAuthList
            } else if (newMenuId && newMenuId.length) {
              routeAuthList = newMenuId.split(',')
              $this.routeAuthList = routeAuthList
              $this.filteNode(menu)
            } else {
              menu = []
            }
            // 产品需求-默认都有首页
            // menu.unshift({
            //   id: 99,
            //   resourceHref: 'index',
            //   resourceCode: 'index',
            //   resourceName: '首页',
            //   parentid: 0,
            //   resource_id: 0,
            //   resourceType: '1',
            //   resourceInco: 'icon-caidan_ico_shouye',
            // })
            if (!menu.length) {
              this.$message.error(this.$lang('此帐户未设置权限，请先设置权限'))
              $this.refreshCode()
              $this.loginLoading = false
              return
            }
            console.log(menu, 'menu')
            console.log(routeAuthList, 'routeAuthList')
            $this.LOGIN_INIT({ user: data, token, menu, routeAuthList })
            const btnList = $this.getButtonAuth(menu) // 递归处理数据
            $this.SET_BTNLIST(btnList) // 存储
            $this.loginLoading = false
            $this.$router.push({ name: 'index' })
          } else {
            $this.refreshCode()
            $this.loginLoading = false
            $this.$message.error(msg)
          }
        }
      })
    },
    filteNode(node, parent, index) {
      if (node instanceof Array) {
        for (let i = node.length - 1; i >= 0; i--) {
          this.filteNode(node[i], node, i)
        }
      } else {
        if (node.childResources) {
          for (let i = node.childResources.length - 1; i >= 0; i--) {
            this.filteNode(node.childResources[i], node.childResources, i)
          }
        }
        if ((!node.childResources || node.childResources.length === 0) && !this.hasId(this.routeAuthList, node)) {
          parent.splice(index, 1)
        }
      }
    },
    filteNodeAdmin(node) {
      let list = []
      if (node instanceof Array) {
        for (let i = node.length - 1; i >= 0; i--) {
          list = list.concat(this.filteNodeAdmin(node[i]))
        }
      } else {
        if (node.childResources) {
          list.push(node)
          for (let i = node.childResources.length - 1; i >= 0; i--) {
            list = list.concat(this.filteNodeAdmin(node.childResources[i]))
          }
        }
      }
      return list
    },
    hasId(list, node) {
      for (var i = 0, length = list.length; i < length; i++) {
        if (list[i] === node.resourceCode) return true
      }
      return false
    },
    getButtonAuth(list) {
      const btnList = []
      const rev = item => {
        for (let i = 0; i < item.length; i++) {
          if (item[i].resourceType === 2) {
            btnList.push(item[i].resourceCode)
          } else if (item[i].childResources && item[i].childResources.length) {
            rev(item[i].childResources)
          }
        }
      }
      rev(list)
      return btnList
    },
    recursionFun(list) {
      if (list === null) return
      const stack = [...list]
      const btnList = {}
      while (stack.length) {
        const first = stack.shift()
        const { buttons, routeName } = first
        // 按钮
        if (buttons && buttons.length) {
          btnList[routeName] = {}
          buttons.forEach(item => (btnList[routeName][item] = true))
        }
      }
      return { btnList }
    },
    // 保存用户名密码
    saveAccountCookie() {
      const { loginCode, loginPassword } = this.loginForm
      if (this.remember) {
        this.setCookie('loginCode', CryptoUtil.aesEncrypt(loginCode), 7 * 24 * 3600)
        this.setCookie('loginPassword', CryptoUtil.aesEncrypt(loginPassword), 7 * 24 * 3600)
      } else {
        this.setCookie('loginCode', '')
        this.setCookie('loginPassword', '')
      }
    },
    async getMenuList() {
      // 获取全部权限树
      const { data, code, msg } = await this.COM_HTTP.getMenuList()
      if (code === RESPONSE_SUCCESS) {
        return data.menuResourceVos || []
      } else {
        this.$message.error(msg)
        return []
      }
    },
    // 获取cookie
    getCookie(key) {
      const cookie = document.cookie
      const length = cookie.length
      if (length) {
        let start = cookie.indexOf(key + '=')
        if (start !== -1) {
          start = start + key.length + 1
          let end = cookie.indexOf(';', start)
          if (end === -1) end = length
          return unescape(cookie.substring(start, end))
        }
      }
      return ''
    },
    // 保存cookie
    setCookie(cName, value, expireseconds) {
      const exdate = new Date()
      exdate.setTime(exdate.getTime() + expireseconds * 1000)
      document.cookie = cName + '=' + escape(value) + (expireseconds == null ? '' : ';expires=' + exdate.toGMTString())
    },
    goForget() {
      this.$router.push({ path: '/forgetPassword' })
    },
    visibleChange(state) {
      this.languageChoose = state
    },
    handleCommand(command) {
      this.language = command
      this.setLang(command)
    },
    goOld() {
      // 点击切换旧大客户
      const _lang = this.lang === 'CN' ? 'zh' : this.lang === 'EN' ? 'en' : 'id'
      let oldVipUrl = `https://test-jk.jet.co.id/vip-customer-web/logout.do?lang=${_lang}`
      switch (VUE_APP_ENV) {
        case 'test':
          oldVipUrl = `https://test-jk.jet.co.id/vip-customer-web/logout.do?lang=${_lang}`
          break
        case 'uat':
          oldVipUrl = `https://uat-jk.jet.co.id/yinni-vip-new/logout.do?lang=${_lang}`
          break
        case 'prod':
          oldVipUrl = `https://login-vip.jet.co.id/?lang=${_lang}`
          break
      }
      window.open(oldVipUrl)
    },
    registerNew() {
      // 立即注册
      let registerUrl = 'https://vipcustomer.jet.co.id/register?lang=id'
      switch (this.language) {
        case 'CN':
          registerUrl = 'https://vipcustomer.jet.co.id/register?lang=zh'
          break
        case 'EN':
          registerUrl = 'https://vipcustomer.jet.co.id/register?lang=en'
          break
        case 'YN':
          registerUrl = 'https://vipcustomer.jet.co.id/register?lang=id'
          break
      }
      window.open(registerUrl)
    },
    gologo() {
      // logo click
      const _lang = this.lang === 'CN' ? 'zh' : this.lang === 'EN' ? 'en' : 'id'
      window.open(`https://vipcustomer.jet.co.id/?lang=${_lang}`)
    },
    // gogoogle() {
    //   window.open('https://play.google.com/store/apps/details?id=com.jnt.vipa')
    // },
  },
}
</script>

<style lang="scss">
@import '@/assets/style/login.scss';
.verificationCode_left {
  .el-input-group__append,
  .el-input-group__prepend {
    padding: 0 6px !important;
  }
}
.verificationCode {
  .el-input-group:hover .el-input-group__append {
    border-color: #e8e8e8 !important;
  }
}
.login-drop-menu {
  color: #61666d !important;
}
#dropdown-menu {
  .el-dropdown-menu__item {
    color: #61666d;
  }
  .el-dropdown-menu__item:focus,
  .el-dropdown-menu__item:hover {
    background-color: #ebebeb !important;
    color: #61666d;
  }
}
</style>

<style lang="scss" scoped>
@media only screen and (min-width: 1920px) {
  .login .login-main {
    .bg-img {
      margin-left: 13%;
    }
    .login-box {
      right: 6.7%;
      width: 512px;
      height: 562px;
    }
  }
}
#loginDropdownMenu {
  .el-dropdown-menu__item:focus,
  .el-dropdown-menu__item:hover {
    background-color: #000 !important;
  }
}
.login-drop-item {
  color: #61666d;
}
.el-dropdown-menu__item:focus,
.el-dropdown-menu__item:hover {
  background-color: #ebebeb !important;
  color: #61666d;
}
.langHighLight {
  color: #e60012;
}
.login {
  height: 100%;
  width: 100%;
  min-width: 1280px;
  background-color: #ffffff;
  .login-title {
    width: 100%;
    height: 56px;
    z-index: 9999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .changeLanguage {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 80px;
      .el-dropdown {
        cursor: pointer;
      }
      .el-dropdown-link {
        font-size: 14px;
        color: #61666d;
        line-height: 18px;
        .down {
          color: #9499a3;
          margin: 0 5px;
        }
        .langHighLight .down {
          color: #e60012;
        }
      }
      .svg-icon {
        width: 32px;
        height: 24px;
        margin-right: 4px;
      }
    }
  }
  .login-main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .bg-img {
    max-width: 1430px;
    min-width: 920px;
    width: 70%;
    height: calc(100% - 56px - 72px);
    margin-left: 6%;
    background: url('~@/assets/images/login/login.jpg') 10% center no-repeat;
    background-size: 100% !important;
  }
  // .bg-img-zh {
  //   background: url("~@/assets/images/login/login_zh.jpg") 10% center no-repeat;
  // }
  // .bg-img-en {
  //   background: url("~@/assets/images/login/login_en.jpg") 10% center no-repeat;
  // }
  // .bg-img-ind {
  //   background: url("~@/assets/images/login/login_ind.jpg") 10% center no-repeat;
  // }
  .login-box {
    width: 416px;
    height: 482px;
    position: fixed;
    right: 6%;
    top: 50%;
    transform: translateY(-50%);
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    .form {
      width: 420px;
    }
    .el-form {
      margin-top: 24px;
    }
    .verificationCode {
      .icon-icon_shuaxin {
        font-size: 16px;
        padding-left: 4px;
        cursor: pointer;
        color: #999999;
      }
    }
  }
  .logo {
    padding-left: 80px;
    color: #e60012;
    .svg-icon {
      width: 114px;
      height: 24px;
      fill: currentColor;
    }
  }
  .loginBtn {
    color: #fff !important;
    border-color: #e60012 !important;
    background: #e60012 !important;
    font-size: 18px;
  }
  .loginBtn-disabled {
    border-color: #e8e8e8 !important;
    background: #f4f4f4 !important;
    color: #bebebe !important;
  }
  .verificationCode {
    ::v-deep.el-form-item__content {
      display: flex;
    }
  }
  .remember {
    margin-top: 20px;
    .remember-account {
      ::v-deep.el-checkbox__label {
        font-size: 14px;
      }
    }
    .remember_right {
      text-align: right;
      font-size: 14px;
      cursor: pointer;
      text-decoration: underline;
      color: #e60012;
    }
  }
  .switch {
    font-size: 14px;
    color: #e60012;
    cursor: pointer;
    text-decoration: underline;
    text-align: center;
    margin-bottom: 20px;
  }
  .register {
    width: 320px;
    font-size: 14px;
    color: #a1a3a6;
    line-height: 25px;
    margin-top: 12px;
    display: flex;
    justify-content: center;
    .red-span {
      color: #e60012;
      cursor: pointer;
      text-decoration: underline;
    }
  }
  .login-footer {
    width: 100%;
    height: 72px;
    background: #f4f4f4;
    display: flex;
    z-index: 10;
    align-items: center;
    justify-content: space-between;
    .title {
      width: 370px;
      height: 18px;
      padding-left: 80px;
      font-size: 14px;
      font-weight: 400;
      color: #2b2d42;
      line-height: 18px;
    }
    .googleImg {
      width: 135px;
      height: 40px;
      padding-right: 80px;
      cursor: pointer;
    }
  }
  .login-denglu {
    height: 40px;
    font-size: 32px;
    font-weight: 600;
    color: #2b2d42;
    line-height: 40px;
  }
}
</style>
