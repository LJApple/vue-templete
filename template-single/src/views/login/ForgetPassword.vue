<!--
 * @Author: jinmiao
 * @Date: 2021-07-12 16:47:59
 * @Description: 忘记密码
 * @LastEditTime: 2022-04-24 14:36:54
-->
<template>
  <div class="login">
    <div class="login-main">
      <div class="login-title">
        <div class="logo" @click="gologo">
          <svg
            class="icon svg-icon"
            aria-hidden="true"
          >
            <use xlink:href="#icon-logo"></use>
          </svg>
        </div>
        <div class="changeLanguage">
          <QRDownload></QRDownload>
          <svg
            class="icon svg-icon"
            aria-hidden="true"
          >
            <use :xlink:href="icon_guoqi"></use>
          </svg>
          <el-dropdown  @command="handleCommand"  trigger="click" :hide-on-click="false" id="loginDropdown" @visible-change="visibleChange">
            <span class="el-dropdown-link">
              <template v-if="!languageChoose">
                {{language === 'CN' ? '简体中文' : language === 'EN' ? 'English' : 'Indonesia'}}<i class="iconfont icon-caidan_ico_xiala down"></i>
              </template>
              <span class="langHighLight" v-if="languageChoose">
                {{language === 'CN' ? '简体中文' : language === 'EN' ? 'English' : 'Indonesia'}}<i class="iconfont icon-caidan_ico_xiala down"></i>
              </span>
            </span>
            <el-dropdown-menu slot="dropdown" id="loginDropdownMenu" >
              <el-dropdown-item command="CN" class="login-drop-item" :class="{'langHighLight' : language === 'CN'}">简体中文</el-dropdown-item>
              <el-dropdown-item command="EN" class="login-drop-item" :class="{'langHighLight' : language === 'EN'}">English</el-dropdown-item>
              <el-dropdown-item command="YN" class="login-drop-item" :class="{'langHighLight' : language === 'YN'}">Indonesia</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div class="bg-img" :class="imgURL"></div>
      <div class="login-box">
        <div class="login-box_content">
          <div class="form" v-if="setNewPass !== 3">
            <h1>{{ $lang('忘记密码') }}</h1>
          </div>
          <el-form
              ref="loginForm"
              label-position="left"
              :model="loginForm"
              :rules="rules"
              autocomplete="off"
              class="login-form forget-form"
              v-if="setNewPass === 1"
          >
            <!-- 输入验证码 第二步 -->
            <div v-if="setaccount">
              <el-form-item prop="account" class="loginForm-input textword desc-message">
                <p>{{ $lang('验证码已发送至') + ' ' + mail }}</p>
                <p>{{ $lang('请在下方输入验证码') }}</p>
              </el-form-item>
              <el-form-item prop="" class="loginForm-input">
                <el-input
                    :placeholder="$lang('请输入邮箱验证码')"
                    maxlength="6"
                    v-model="loginForm.verificationCode"
                    autofocus="true"
                    @input="resetMsg"
                    @keyup.enter.native="nextstep(2)"
                >
                  <template slot="append">
                    <div
                        @click="getCode"
                        v-if="regetCodeStatus"
                        :class="['regain', { noregain: !timeStatus }]"
                    >
                      {{ $lang('重新获取') }}
                    </div>
                    <div v-else class="normal-text">
                      {{ countTime }}{{ $lang('s') }}
                    </div>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="account" class="loginForm-input">
                <div class="timeMsg" v-if="!timeMsg.includes($lang('获取次数过多'))">{{ $lang(timeMsg) }}</div>
              </el-form-item>
              <el-form-item prop="account" class="loginForm-input">
                <div class="timeMsg" v-if="!timeStatus">
                  {{ $lang('获取次数过多，请15分钟后重新获取') }}
                </div>
              </el-form-item>
              <div style="text-align: center" class="forgetbtn_box">
              <span class="forgetbtn_left" @click="backLogin">{{
                  $lang('返回登录')
                }}</span>
                <el-button
                    class="commonBtn forgetbtn"
                    @click.prevent="nextstep(2)"
                    :loading="loginLoading"
                >{{ $lang('下一步') }}</el-button
                >
              </div>
            </div>
            <!-- 输入账号 第一步 -->
            <div v-if="!setaccount">
              <el-form-item class="loginForm-input textword desc-message">{{$lang('您可以在此输入已注册成功的账号以便验证。若验证成功将可以立即透过注册好的邮箱收取您的验证码。')}}</el-form-item>
              <el-form-item prop="" class="loginForm-input input_withouticon">
                <el-input
                    :placeholder="$lang('请输入账号')"
                    maxlength="50"
                    v-model="loginForm.account"
                    autofocus="true"
                    @input="resetMsg"
                    @keyup.enter.native="changesetaccount"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="account" class="loginForm-input">
                <div class="timeMsg">{{ $lang(timeMsg) }}</div>
              </el-form-item>
              <div style="text-align: center" class="forgetbtn_box">
              <span class="forgetbtn_left" @click="backLogin">{{
                  $lang('返回登录')
                }}</span>
                <el-button
                    class="commonBtn forgetbtn"
                    @click.prevent="changesetaccount"
                    :loading="loginLoading"
                    @input="resetMsg"
                >{{ $lang('下一步') }}</el-button
                >
              </div>
            </div>
          </el-form>
          <!-- 验证码后下一步  第三步 -->
          <el-form
              ref="loginForm2"
              label-position="left"
              :model="loginForm2"
              :rules="rules2"
              autocomplete="off"
              class="login-form new-password_box forget-form"
              v-if="setNewPass === 2"
          >
              <el-form-item class="loginForm-input textword desc-message">
                <p v-html="$lang('为确保您的账户安全，请按照要求输入强度较高的密码').replace(this.$lang('您的账户安全'),`<span style='font-weight: bold;color: #000;padding: 0 5px;'>${this.$lang('您的账户安全')}</span>`)"></p>
              </el-form-item>
            <el-form-item :label="$lang('新密码')" prop="newPassword" class="loginForm-input textword input_withouticon">
              <el-input
                  :placeholder="$lang('请输入新密码')"
                  maxlength="20"
                  :type="loginForm2.show ? 'password' : 'text'"
                  v-model="loginForm2.newPassword"
              >
                <i
                    slot="suffix"
                    class="iconfont icon-zujian_ico_mingwen seeicon"
                    @click="loginForm2.show = true"
                    v-if="!loginForm2.show"
                ></i>
                <i
                    slot="suffix"
                    class="iconfont icon-zujian_ico_anwen seeicon"
                    @click="loginForm2.show = false"
                    v-if="loginForm2.show"
                ></i>
              </el-input>
            </el-form-item>
            <el-form-item :label="$lang('确认新密码')" prop="confirmPassword" class="loginForm-input input_withouticon">
              <el-input
                  :placeholder="$lang('请重复输入密码')"
                  maxlength="20"
                  :type="loginForm2.show2 ? 'password' : 'text'"
                  v-model="loginForm2.confirmPassword"
              >
                <i
                    slot="suffix"
                    class="iconfont icon-zujian_ico_mingwen seeicon"
                    @click="loginForm2.show2 = true"
                    v-if="!loginForm2.show2"
                ></i>
                <i
                    slot="suffix"
                    class="iconfont icon-zujian_ico_anwen seeicon"
                    @click="loginForm2.show2 = false"
                    v-if="loginForm2.show2"
                ></i>
              </el-input>
            </el-form-item>
            <el-form-item class="loginForm-input"> </el-form-item>
            <div style="text-align: center" class="forgetbtn_box">
            <span class="forgetbtn_left" @click="backLogin">{{
                $lang('返回登录')
              }}</span>
              <el-button
                  class="commonBtn forgetbtn"
                  @click.prevent="nextstep(3)"
                  :loading="loginLoading"
              >{{ $lang('确认重置') }}</el-button
              >
            </div>
          </el-form>
          <el-form v-if="setNewPass === 3">
            <el-form-item class="loginForm-input textword setscuessbox">
              <div class="setscuess">
                <svg
                  class="icon svg-icon"
                  aria-hidden="true"
                >
                  <use xlink:href="#icon-icon-chenggongtishi"></use>
                </svg>
                {{ $lang('重置成功') }}
              </div>
              <div class="setscuessback">
                {{ backTime }}{{'s ' + $lang('后即将返回') }}
                <span class="setscuessback_span" @click="backLogin">{{ $lang('登录') + ' ' }}</span
                >{{ $lang('页面') }}
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="login-footer">
        <div class="title">&#169; 2015-2021 PT. Global Jet Express All Rights Reserved</div>
<!--        <img src="~@/assets/images/login/GoogleButton.png" class="googleImg" @click="gogoogle"/>-->
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapGetters, mapActions } from 'vuex'
import { RULES } from '@public/utils/rules'
import { ForgotPassWord } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
import { CryptoUtil } from '@/utils/crypto'
import QRDownload from '@/views/layout/components/QRDownload'
export default {
  name: 'ForgetPassword',
  props: {},
  components: { QRDownload },
  data() {
    const equalPass = (rule, value, callback) => {
      if (value !== this.loginForm2.newPassword) {
        callback(new Error(this.$lang('两次密码输入不一致!')))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        account: '',
        verificationCode: '',
        newPassword: ''
      },
      loginForm2: {
        newPassword: '',
        confirmPassword: '',
        show: true,
        show2: true
      },
      rules: {
        account: [RULES.required, RULES.lengthFifty],
        newPassword: [RULES.required, RULES.checkPassword3]
      },
      rules2: {
        newPassword: [RULES.required, RULES.noBlankSpace, RULES.lengthEightToEighteen, RULES.letternew, RULES.Specialcharacters, RULES.noBlankSpace],
        confirmPassword: [RULES.required, RULES.noBlankSpace, { required: true, validator: equalPass, trigger: 'blur' }]
      },
      loginLoading: false,
      countTime: 90,
      regetCodeStatus: true, // 重新获取验证码
      setNewPass: 1,
      backTime: 5,
      language: 'CN',
      setaccount: false,
      timeStatus: true,
      timeMsg: '',
      getTimecount: 0,
      resetTime: 900,
      mail: '', // 账号绑定的邮箱
      languageChoose: false
    }
  },
  computed: {
    ...mapGetters(['token', 'lang']),
    icon_guoqi() {
      const language = this.lang
      switch (language) {
        case 'CN' :
          return '#icon-guoqi-zhongwen'
        case 'EN' :
          return '#icon-guoqi-yingwen'
        case 'YN' :
          return '#icon-guoqi-yinni'
        default:
          return '#icon-guoqi-yinni'
      }
    },
    imgURL() {
      const language = this.lang
      switch (language) {
        case 'CN' :
          return 'bg-img-zh'
        case 'EN' :
          return 'bg-img-en'
        case 'YN' :
          return 'bg-img-ind'
        default:
          return 'bg-img-ind'
      }
    }
  },
  watch: {},
  created() {
    this.language = this.lang
    // this.init()
  },
  mounted() {},
  methods: {
    ...mapActions(['setLang']),
    resetMsg() {
      this.timeMsg = ''
    },
    backLogin() {
      this.$router.push({ name: 'Login' })
    },
    // 重新获取验证码按钮
    async getCode(step) {
      try {
        if (step !== 'next') {
          await this.checkAccountAndSendCode()
          if (this.timeMsg.includes('获取次数过多')) {
            this.getTimecount = 4
            this.timeStatus = false
            clearInterval(this.resetTimer)
            return
          }
        }
      } catch (error) {
        console.log('getCodeError::' + error)
      }
      this.getTimecount++
      if (this.getTimecount > 3) {
        this.timeStatus = false
        clearInterval(this.resetTimer)
        this.resetTimer = setInterval(() => {
          --this.resetTime
          if (this.resetTime === 0) {
            this.resetTime = 900
            this.regetCodeStatus = true
            this.timeStatus = true
            clearInterval(this.resetTimer)
          }
        }, 1000)
        return
      } else {
        this.timeStatus = true
      }
      this.regetCodeStatus = false
      clearInterval(this.codeTimer)
      this.codeTimer = setInterval(() => {
        --this.countTime
        if (this.countTime === 0) {
          this.countTime = 90
          this.regetCodeStatus = true
          clearInterval(this.codeTimer)
        }
      }, 1000)
    },
    // 下一步按钮---2：验证码点击下一步；
    async nextstep(value) {
      if (value === 3) {
        // 1. 先校验两次密码是否一致，是： 重置密码成功，继续逻辑。否：提示错误
        this.$refs.loginForm2.validate(async valid => {
          if (valid) {
            if (
              this.loginForm2.newPassword === this.loginForm2.confirmPassword
            ) {
              const { newPassword, confirmPassword } = this.loginForm2
              console.log(newPassword, confirmPassword)
              const params = {
                code: this.loginForm.verificationCode,
                confirmPassword: CryptoUtil.rsaEncrypt(confirmPassword),
                loginCode: this.loginForm.account,
                newPassword: CryptoUtil.rsaEncrypt(newPassword)
              }
              const { data, code, msg } = await ForgotPassWord.resetPassword(params)
              if (code === RESPONSE_CODE.SUCCESS) {
                console.log(data)
                this.$message.success(this.$lang('重置密码成功'))
                this.setNewPass = value
              } else {
                console.log(msg)
                return
              }
              clearInterval(this.backTimer)
              this.backTimer = setInterval(() => {
                --this.backTime
                if (this.backTime === 0) {
                  this.backTime = 5
                  clearInterval(this.backTimer)
                  this.backLogin()
                }
              }, 1000)
            } else {
              this.$message.warning(this.$lang('两次密码输入不一致'))
            }
          } else {
            this.$message.warning(this.$lang('未通过校验'))
          }
        })
      } else {
        if (value === 2) {
          // 验证码后的下一步
          const params = { loginCode: this.loginForm.account, code: this.loginForm.verificationCode }
          const { code, msg } = await ForgotPassWord.checkCode(params)
          if (code !== RESPONSE_CODE.SUCCESS) {
            console.log(msg)
            this.timeMsg = msg
            return
          }
        }
        this.setNewPass = value
      }
    },
    // 输入账号后的下一步按钮，点击验证账号
    async changesetaccount() {
      // 接口校验账号后
      // 校验验证码是否正确
      // 验证码正确，跳转到密码重置页面，此时需要将验证码设置为失效
      // 验证码失效，提示“验证码已失效，请重新获取”
      // 验证码错误，则在栏位下方提示，“验证码错误”
      // const params = { loginCode: this.loginForm.account }
      // const { data, code, msg } = await ForgotPassWord.forgetPassword(params)
      // if (code === RESPONSE_CODE.SUCCESS) {
      //   this.mail = data.mail
      //   this.setaccount = true
      //   this.getCode()
      // } else {
      //   this.timeMsg = msg
      // }
      if (this.loginForm.account) {
        this.checkAccountAndSendCode()
      } else {
        this.timeMsg = this.$lang('账号栏位不能为空')
      }
    },
    async checkAccountAndSendCode() {
      const params = { loginCode: this.loginForm.account }
      const { data, code, msg } = await ForgotPassWord.forgetPassword(params)
      if (code === RESPONSE_CODE.SUCCESS) {
        this.mail = data.mail
        this.setaccount = true
        this.getCode('next')
      } else {
        this.timeMsg = !this.setaccount ? msg : this.timeMsg
        return
      }
    },
    visibleChange(state) {
      this.languageChoose = state
    },
    handleCommand(command) {
      this.language = command
      this.setLang(command)
    },
    gologo() {
      // logo click
      const _lang = this.lang === 'CN' ? 'zh' : this.lang === 'EN' ? 'en' : 'id'
      window.open(`https://vipcustomer.jet.co.id/?lang=${_lang}`)
    },
    // gogoogle() {
    //   window.open('https://play.google.com/store/apps/details?id=com.jnt.vipa')
    // }
  },
  beforeDestroy() {
    clearInterval(this.codeTimer)
    clearInterval(this.backTimer)
    clearInterval(this.resetTimer)
  }
}
</script>

<style lang="scss">
@import '@/assets/style/login.scss';
.desc-message{
  margin: 40px 48px 16px !important;
  height: auto !important;
  .el-form-item__content{
    font-size: 14px;
    line-height: 22px;
  }
}
.input_withouticon{
  .el-input__inner{
    text-indent: 0 !important;
  }
}
</style>

<style lang="scss" scoped>
  .login .forget-form{
    ::v-deep {
      .el-input__inner{
        text-indent: 0;
      }
    }
  }
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
  #loginDropdownMenu{
    .el-dropdown-menu__item:focus, .el-dropdown-menu__item:hover{
      background-color: #000 !important;
    }
  }
  .login-drop-item{
    color: #61666D ;
  }
  .el-dropdown-menu__item:focus, .el-dropdown-menu__item:hover{
    background-color: #EBEBEB !important;
    color: #61666D;
  }
  .langHighLight{
    color: #E60012;
  }
.el-input-group:hover .el-input-group__append {
  border-color: #e8e8e8 !important;
}
.login {
  height: 100%;
  width: 100%;
  min-width: 1280px;
  background: #ffffff;
  .login-title{
    width: 100%;
    height: 56px;
    z-index: 9999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .changeLanguage{
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 80px;
      .el-dropdown{
        cursor: pointer;
      }
      .el-dropdown-link{
        font-size: 14px;
        color: #61666d;
        line-height: 18px;
        .down{
          color: #9499A3;
          margin: 0 5px;
        }
        .langHighLight .down{
          color: #E60012;
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
    background: url("~@/assets/images/login/login.jpg") 10% center no-repeat;
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
    background: #FFF;
    border-radius: 8px;
    box-shadow: 0px 0px 16px 0px rgba(0,0,0,0.2);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    .login-box-title{
      display: flex;
      width: 320px;
      height: 100px;
      margin: 0 auto;
      justify-content: space-between;
      align-items: center;
    }
    .form {
      width: 320px;
      margin: 0 auto;
      h1{
        margin: 0;
      }
    }
    .changeLanguage {
      display: flex;
      //justify-content: flex-end;
      .el-dropdown-link {
        font-size: 20px;
        color: #61666d;
        line-height: 16px;
        .down {
          color: #e60012;
          margin: 0 5px;
        }
      }
    }
    .login-message{
      width: 320px;
      margin: 0 auto;
    }
    .new-password_box{
      // margin-top: 122px;
      .loginForm-input{
        height: auto;
        margin-bottom: 20px;
      }
    }
  }
  .logo {
    padding-left: 80px;
    color: #e60012;
    .svg-icon{
      width: 114px;
      height: 24px;
      fill: currentColor;
    }
  }
  .forgetbtn_box {
    width: 320px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    .forgetbtn_left {
      font-size: 14px;
      color: #e60012;
      line-height: 56px;
      cursor: pointer;
    }
    .forgetbtn {
      color: #fff !important;
      border-color: #e60012 !important;
      background: #e60012 !important;
      width: 184px;
      height: 48px;
      font-size: 18px;
    }
  }
  .textword {
    p {
      font-size: 16px;
      color: #61666d;
      line-height: 20px;
      line-height: 26px;
    }
  }
  .loginForm-input {
    .el-input {
      ::v-deep.el-input-group__append {
        border-color: #e8e8e8 !important;
      }
    }
    .regain {
      color: #e60012;
      cursor: pointer;
    }
    .noregain {
      color: #e8e8e8;
      cursor: not-allowed;
      pointer-events: none;
    }
    .seeicon {
      font-size: 20px;
      margin-right: 10px;
    }
  }
  .timeMsg {
    width: 320px;
    font-size: 16px;
    color: #e60012;
    line-height: 22px;
    margin-top: -20px;
  }
  .setscuessbox {
    text-align: center;
    // margin-top: 330px;
    .setscuess {
      font-size: 16px;
      font-weight: 500;
      color: #4c4d57;
      line-height: 18px;
      height: 18px;
      svg{
        width: 24px;
        height: 24px;
        color: #22CE88;
        vertical-align: middle
      }
      .svg-icon{
        fill: currentColor;
      }
    }
    .setscuessback {
      margin-top: 28px;
      font-size: 14px;
      font-weight: 500;
      color: #61666d;
      line-height: 18px;
      .setscuessback_span {
        color: #e60012;
        cursor: pointer;
      }
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
      width:370px;
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
}
</style>
