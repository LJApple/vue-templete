<!--
 * @Author: jinmiao
 * @Date: 2021-07-14 15:22:33
 * @Description: file content
 * @LastEditTime: 2022-02-28 17:13:45
-->
<template>
  <div class="main-wrap">
    <el-dialog
      lock-scroll
      :modal-append-to-body="false"
      append-to-body
      destroy-on-close
      :title="title"
      :width="'835px'"
      custom-class="myprofile-dialog"
      :visible.sync="myprofileVisible"
      :styleType="'noBorder'"
      :close-on-click-modal="false"
      :before-close="closemyprofileDialog"
    >
      <div class="content_box" :class="{'ortherLang': lang !== 'CN'}" v-loading="loading">
        <div>
          <div class="topbox myprofilebg">
            <div class="topbox_cus">
              <span class="topbox_label">{{ $lang('客户名称') + ':' }}</span>
              <span class="topbox_title_name" :title="userInfo.userAdmin === 1 ? userInfo.cusName: userInfo.name">{{ userInfo.userAdmin === 1 ? userInfo.cusName: userInfo.name }}</span>
            </div>
            <div>
              <span class="topbox_label">{{ $lang('客户编码') + ':' }}</span>
              <span class="topbox_title">{{ userInfo.cusCode }}</span>
            </div>
            <div>
              <span class="topbox_label">{{ $lang('账户类型') + ':' }}</span>
              <span class="topbox_title">{{
                $lang(userInfo.userAdmin === 1 ? '主账户' : '子账户')
              }}</span>
            </div>
            <div>
              <span class="topbox_label">{{ $lang('账户状态') + ':' }}</span>
              <span class="topbox_title">{{
                $lang(userInfo.state === 1 ? '启用' : '禁用')
              }}</span>
            </div>
            <div>
              <span class="topbox_label">{{ $lang('签约网点') + ':' }}</span>
              <span class="topbox_title">{{ userInfo.siteCode }}</span>
            </div>
          </div>
          <!-- 邮箱 -->
          <div class="myprofilebg">
            <div class="centerbox">
              <div class="centerbox_left">
                <div>
                  <span class="topbox_label">{{ $lang('绑定邮箱') + ':' }}</span>
                  <span class="centerbox_title">{{
                    userInfo.mail ? userInfo.mail : ' - - '
                  }}</span>
                  <span
                    class=" activate toactivate"
                    v-if="userInfo.mail && userInfo.mailState === 0"
                    >{{ $lang('待激活') }}</span
                  >
                  <span
                    class=" activate activated"
                    v-if="userInfo.mail && userInfo.mailState === 1"
                    >{{ $lang('已激活') }}</span
                  >
                </div>
              </div>
              <div
                class="centerbox_right"
                @click="showlist.mailboxShow = !showlist.mailboxShow"
                v-if="userInfo.mailState !== 1"
              >
                {{ $lang(userInfo.mail ? '重新绑定' : '启用绑定') }}
              </div>
            </div>
            <!-- 邮箱提示发送成功 -->
            <div class="centerbox_center" v-if="closeEmailtip">
              <div>
                {{
                  $lang('绑定邮箱验证码已发送到') +
                    userInfo.mail +
                    $lang('邮箱') +
                    '，' +
                    $lang('请前往该邮箱激活绑定')
                }}
              </div>
              <i
                class="iconfont icon-zujian_ico_tishiguanbi"
                @click.stop="closeEmailtip = false"
              ></i>
            </div>
            <div class="bottombox" v-if="showlist.mailboxShow">
              <el-row type="flex" justify="space-between"
                ><el-col :span="8">
                  <el-form ref="myForm" :model="ruleForm" :rules="rules">
                    <el-form-item :label="$lang('邮箱') + ':'" prop="mailbox">
                      <el-input
                        v-model="ruleForm.mailbox"
                        :placeholder="$lang('请输入')"
                        size="medium"
                        @input="resetMsg"
                      >
                      </el-input>
                    </el-form-item> </el-form
                ></el-col>
                <el-col :span="10" class="bottomBtn_box">
                  <el-button
                    class="commonBtn bottomBtn_box_red bottomBtn_box_red_one"
                    @click.prevent="bindEmail"
                    :loading="loginLoading"
                    v-if="regetCodeStatus"
                    :disabled="mailDisabled"
                    >{{ $lang('发送验证码') }}</el-button
                  >
                  <el-button
                    class="commonBtn bottomBtn_box_gray"
                    v-else
                    >{{ countTime }}{{ $lang('s') }}</el-button
                  >
                  <el-button
                    class="commonBtn bottomBtn_box_gray"
                    @click.prevent="showlist.mailboxShow = false"
                    :loading="loginLoading"
                    >{{ $lang('取消') }}</el-button
                  >
                </el-col>
              </el-row>
              <div class="timeMsg">{{ $lang(timeMsg) }}</div>
            </div>
          </div>
          <!-- 账号 -->
          <div class="myprofilebg">
            <div class="centerbox">
              <div class="centerbox_left">
                <div>
                  <span class="topbox_label">{{ $lang('登录账号') + ':' }}</span>
                  <span class="centerbox_title">
                    {{ userInfo.loginCode }}
                  </span>
                </div>
              </div>
              <div
                class="centerbox_right"
                @click="showlist.passwordShow = !showlist.passwordShow"
              >
                {{ $lang('重设密码') }}
              </div>
            </div>
            <div class="bottombox" v-if="showlist.passwordShow">
              <el-row :gutter="20">
                <el-form
                  :model="ruleFormPass"
                  ref="ruleFormPass"
                  :rules="rules2"
                  autocomplete="off"
                >
                  <el-col :span="8">
                    <el-form-item
                      :label="$lang('旧密码') + ':'"
                      prop="oldPassword"
                    >
                      <el-input
                        type="password"
                        v-model="ruleFormPass.oldPassword"
                        :placeholder="$lang('请输入')"
                        size="medium"
                      >
                      </el-input> </el-form-item
                  ></el-col>
                  <el-col :span="8"
                    ><el-form-item
                      :label="$lang('新密码') + ':'"
                      prop="newPassword"
                    >
                      <el-input
                        type="password"
                        v-model="ruleFormPass.newPassword"
                        :placeholder="$lang('请输入')"
                        size="medium"
                      >
                      </el-input> </el-form-item
                  ></el-col>
                  <el-col :span="8"
                    ><el-form-item
                      :label="$lang('确认新密码') + ':'"
                      prop="confirmPassword"
                    >
                      <el-input
                        type="password"
                        v-model="ruleFormPass.confirmPassword"
                        :placeholder="$lang('请输入')"
                        size="medium"
                      >
                      </el-input> </el-form-item
                  ></el-col>
                </el-form>
              </el-row>
              <div v-if="errMsg">{{errMsg}}</div>
              <div class="bottomBtn_box">
                <el-button
                  class="commonBtn bottomBtn_box_red"
                  @click.prevent="changePassword"
                  :loading="loginLoading"
                  >{{ $lang('修改') }}</el-button
                >
                <el-button
                  class="commonBtn bottomBtn_box_gray"
                  @click.prevent="showlist.passwordShow = false"
                  :loading="loginLoading"
                  >{{ $lang('取消') }}</el-button
                >
              </div>
            </div>
          </div>
          <!-- 默认面单格式 -->
          <div class="myprofilebg">
            <div class="centerbox">
              <div class="centerbox_left">
                <div>
                  <span class="topbox_label">{{ $lang('面单格式') + ':' }}</span>
                  <span class="centerbox_title">
                    {{
                      $lang(userInfo.faceSheetFormatName
                        ? userInfo.faceSheetFormatName
                        : '不默认面单格式')
                    }}
                  </span>
                </div>
              </div>
              <div
                class="centerbox_right"
                @click="showlist.expressSheetShow = !showlist.expressSheetShow"
              >
                {{ $lang('修改') }}
              </div>
            </div>
            <div class="bottombox" v-if="showlist.expressSheetShow">
              <el-row type="flex"
                ><el-col :span="8">
                  <el-form :model="ruleForm" status-icon :rules="rules">
                    <el-form-item :label="$lang('面单格式') + ':'">
                      <el-select
                        v-model="ruleForm.faceSheetFormat"
                        :placeholder="$lang('请选择')"
                      >
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item> </el-form
                ></el-col>
                <el-col :span="6" class="bottomBtn_box">
                  <el-button
                    class="commonBtn bottomBtn_box_red"
                    @click.prevent="
                      modifyInformation(
                        'faceSheetFormat',
                        ruleForm.faceSheetFormat
                      )
                    "
                    :loading="loginLoading"
                    >{{ $lang('修改') }}</el-button
                  >
                  <el-button
                    class="commonBtn bottomBtn_box_gray"
                    @click="showlist.expressSheetShow = false"
                    :loading="loginLoading"
                    >{{ $lang('取消') }}</el-button
                  >
                </el-col>
              </el-row>
            </div>
          </div>
          <!-- 默认打印机 -->
          <div class="myprofilebg">
            <div class="centerbox">
              <div class="centerbox_left">
                <div>
                  <span class="topbox_label">{{ $lang('默认打印机') + ':' }}</span>
                  <span class="centerbox_title">
                    {{
                      $lang(userInfo.printerName
                        ? userInfo.printerName
                        : '不默认打印机')
                    }}</span
                  >
                </div>
              </div>
              <div
                class="centerbox_right"
                @click="showlist.printerShow = !showlist.printerShow"
              >
                {{ $lang('修改') }}
              </div>
            </div>
            <div class="bottombox" v-if="showlist.printerShow">
              <el-row type="flex"
                ><el-col :span="8">
                  <el-form :model="ruleForm" status-icon :rules="rules">
                    <el-form-item :label="$lang('默认打印机')">
                      <el-select
                        v-model="ruleForm.printer"
                        :placeholder="$lang('请选择')"
                      >
                        <el-option
                          v-for="(item, index) in optionsTwo"
                          :key="index"
                          :label="item"
                          :value="item"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item> </el-form
                ></el-col>
                <el-col :span="6" class="bottomBtn_box">
                  <el-button
                    class="commonBtn bottomBtn_box_red"
                    @click.prevent="
                      modifyInformation('printer', ruleForm.printer)
                    "
                    :loading="loginLoading"
                    >{{ $lang('修改') }}</el-button
                  >
                  <el-button
                    class="commonBtn bottomBtn_box_gray"
                    @click.prevent="showlist.printerShow = false"
                    :loading="loginLoading"
                    >{{ $lang('取消') }}</el-button
                  >
                </el-col>
              </el-row>
            </div>
          </div>
          <!-- 默认折扣信息 -->
          <div class="myprofilebg">
            <div class="centerbox">
              <div class="centerbox_left">
                <div>
                  <span class="topbox_label">{{ $lang('显示折扣信息') + ':' }}</span>
                  <span class="centerbox_title">
                    {{
                      $lang(userInfo.discountInformationName
                        ? userInfo.discountInformationName
                        : '不默认折扣信息')
                    }}
                  </span>
                </div>
              </div>
              <div
                class="centerbox_right"
                @click="showlist.discountShow = !showlist.discountShow"
              >
                {{ $lang('修改') }}
              </div>
            </div>
            <div class="bottombox" v-if="showlist.discountShow">
              <el-row type="flex"
                ><el-col :span="8">
                  <el-form :model="ruleForm" status-icon :rules="rules">
                    <el-form-item :label="$lang('显示折扣信息')">
                      <el-select
                        v-model="ruleForm.discountInformation"
                        :placeholder="$lang('请选择')"
                      >
                        <el-option
                          v-for="item in optionsThree"
                          :key="item.value"
                          :label="$lang(item.label)"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item> </el-form
                ></el-col>
                <el-col :span="6" class="bottomBtn_box">
                  <el-button
                    class="commonBtn bottomBtn_box_red"
                    :loading="loginLoading"
                    @click.prevent="
                      modifyInformation(
                        'discountInformation',
                        ruleForm.discountInformation
                      )
                    "
                    >{{ $lang('修改') }}</el-button
                  >
                  <el-button
                    class="commonBtn bottomBtn_box_gray"
                    @click.prevent="showlist.discountShow = false"
                    :loading="loginLoading"
                    >{{ $lang('取消') }}</el-button
                  >
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
import { RULES } from '@public/utils/rules'
import { DICT } from '@public/utils/dict'
import { MyProfile } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
import store from '@/store'
import { CryptoUtil } from '@/utils/crypto'
import { mapGetters } from 'vuex'
// import { log } from 'util';
export default {
  name: 'Myprofile',
  mixins: [mixin],
  components: {},
  props: {
    myprofileVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const equalPass = (rule, value, callback) => {
      if (value !== this.ruleFormPass.newPassword) {
        callback(new Error(this.$lang('两次密码输入不一致!')))
      } else {
        callback()
      }
    }
    const that = this
    return {
      // myprofileVisible: false,
      loading: false,
      isShowFirst: false,
      title: that.$lang('我的资料'),
      userInfo: {},
      ruleForm: {
        mailbox: '', // 邮箱
        faceSheetFormat: '', // 面单
        printer: '', // 打印机
        discountInformation: '' // 折扣信息
      },
      ruleFormPass: {
        oldPassword: '', // 旧密码
        newPassword: '', // 新密码
        confirmPassword: '' // 再次确认新密码
      },
      errMsg: '', // 校验错误信息
      rules: {
        mailbox: [RULES.required, RULES.email]
        // newPassword: [RULES.required, RULES.checkPassword4]
      },
      rules2: {
        oldPassword: [RULES.required],
        newPassword: [RULES.required, RULES.noBlankSpace, RULES.lengthEightToEighteen, RULES.letternew, RULES.Specialcharacters, RULES.noBlankSpace],
        confirmPassword: [RULES.required, RULES.noBlankSpace, { required: true, validator: equalPass, trigger: 'blur' }]
      },
      options: DICT.profileFaceFormatOptions,
      optionsTwo: [],
      optionsThree: DICT.profileDiscountInformationOptions,
      showlist: {
        mailboxShow: false,
        passwordShow: false,
        expressSheetShow: false, // 面单
        printerShow: false, // 打印机
        discountShow: false // 折扣信息
      },
      loginLoading: false,
      closeEmailtip: false, // 邮箱提示
      countTime: 90,
      regetCodeStatus: true, // 重新获取验证码
      timeMsg: '',
      resetTime: 900
    }
  },
  computed: {
    ...mapGetters(['lang']),
    mailDisabled() {
      return !this.regetCodeStatus
    }
  },
  created() {},
  mounted() {
    this.userInfo = this.user
    this.getUserInfo()
  },
  methods: {
    resetMsg() {
      this.timeMsg = ''
    },
    // 查询用户信息
    async getUserInfo() {
      this.loading = true
      const params = { loginCode: this.user.loginCode }
      const { data, code, msg } = await MyProfile.getUserInfo(params)
      if (code === RESPONSE_CODE.SUCCESS) {
        this.userInfo = this.deepClone(data)
        this.ruleForm = this.deepClone(data)
        // 面单为空设置不默认
        if (!this.ruleForm.faceSheetFormat) {
          this.ruleForm.faceSheetFormat = '0'
        }
        if (this.ruleForm.faceSheetFormat == '3') {
          this.ruleForm.faceSheetFormat = '2'
          this.userInfo.faceSheetFormatName = '二联面单'
        }
        try {
          this.optionsTwo = []
          this.LODOP = this.$getLodop()
          this.hasLodop = !!this.LODOP.VERSION
          const printCount = this.LODOP.GET_PRINTER_COUNT()
          // 获取所有打印机的名称
          for (let i = 0; i < printCount; i++) {
            this.optionsTwo.push(this.LODOP.GET_PRINTER_NAME(i))
          }
        } catch (error) {
          console.log('printer::error::' + error)
        }
        this.optionsTwo.unshift(this.$lang('不默认打印机'))
        // 打印为空设置不默认
        if (!this.ruleForm.printer) {
          this.ruleForm.printer = this.optionsTwo[0]
        }
        // 折扣为空设置不显示
        if (!this.ruleForm.discountInformation) {
          this.ruleForm.discountInformation = '0'
        }
      } else {
        this.$message.error(msg)
      }
      this.loading = false
    },
    closemyprofileDialog() {
      // this.myprofileVisible = false
      this.$emit('update:myprofileVisible', false)
    },
    // 修改密码
    async changePassword() {
      this.$refs.ruleFormPass.validate(async valid => {
        if (valid) {
          if (
            this.ruleFormPass.newPassword ===
            this.ruleFormPass.confirmPassword
          ) {
            // 借口校验旧密码是否通过
            const { newPassword, confirmPassword, oldPassword } = this.ruleFormPass
            const params = {}
            params.newPassword = CryptoUtil.rsaEncrypt(newPassword)
            params.confirmPassword = CryptoUtil.rsaEncrypt(confirmPassword)
            params.oldPassword = CryptoUtil.rsaEncrypt(oldPassword)
            const { code, data, msg } = await MyProfile.changePassword(params)
            if (code === RESPONSE_CODE.SUCCESS) {
              console.log(data)
              store.dispatch('LOGIN_OUT').then(() => {
                this.$message.success(`${this.$lang('修改成功')},1s ${this.$lang('后跳转到到登录页面')}`)
                setTimeout(() => {
                  // 退出
                  localStorage.removeItem('account')
                  this.$router.push({ path: '/login' })
                  // window.location.href = window.location.origin + '/login'
                }, 1000)
              })
            } else {
              this.$message.error(msg)
            }
          } else {
            this.errMsg = this.$lang('输入密码不一致')
          }
        }
      })
    },
    // 绑定邮箱
    async bindEmail() {
      this.$refs.myForm.validate(async valid => {
        if (valid) {
          const { mailbox } = this.ruleForm
          const params = { mail: mailbox }
          const { code, msg } = await MyProfile.bindEmail(params)
          if (code === RESPONSE_CODE.SUCCESS) {
            clearInterval(this.codeTimer)
            this.codeTimer = setInterval(() => {
              --this.countTime
              if (this.countTime === 0) {
                this.countTime = 90
                this.regetCodeStatus = true
                clearInterval(this.codeTimer)
              }
            }, 1000)

            this.regetCodeStatus = false
            // 取消发送邮箱之后刷新数据的操作，显示提示邮箱发送成功
            this.userInfo.mail = mailbox
            this.closeEmailtip = true
          } else {
            this.$message.error(msg)
            this.timeMsg = msg
          }
        } else {
          this.$message.warning(this.$lang('未通过校验'))
        }
      })
    },
    // 修改面单等
    async modifyInformation(name, value) {
      const params = {}
      params[name] = value
      const { code, msg } = await MyProfile.modifyInformation(params)
      if (code === RESPONSE_CODE.SUCCESS) {
        this.getUserInfo()
        // 收起面单
        this.showlist.expressSheetShow = false
        // 收起打印机
        this.showlist.printerShow = false
        // 收起折扣
        this.showlist.discountShow = false
      } else {
        this.$message.error(msg)
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.codeTimer)
  }
}
</script>

<style lang="scss" scoped>
.myprofile-dialog {
  .myprofilebg {
    background-color: #f5f6f7;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
  }
  .content_box {
    height: 548px;
    overflow-y: auto;
    .topbox {
      color: #9499a3;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      div {
        width: 355px;
        font-size: 14px;
        font-weight: 500;
        height: 30px;
        line-height: 30px;
        .topbox_title {
          color: #4c4d57;
        }
        .topbox_title_name {
          display: inline-block;
          width: 340px;
          overflow:hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #4c4d57;
        }
      }
      .topbox_cus{
        display: flex;
        width: 100%;
      }
    }
    .topbox_label{
      width: 98px;
      display: inline-block;
      margin-right: 10px;
    }
    .el-row--flex{
      justify-content: space-between;
    }
  }
  // 其他语言优化
  .content_box.ortherLang{
    .topbox_label{
      width: 152px;
    }
  }
  .centerbox {
    display: flex;
    justify-content: space-between;
    .centerbox_left {
      div {
        font-size: 14px;
        font-weight: 400;
        color: #9499a3;
        line-height: 18px;
        .centerbox_title {
          // margin-left: 60px;
          color: #4c4d57;
        }
        .activate {
          height: 20px;
          border-radius: 10px;
          line-height: 20px;
          font-size: 12px;
          padding: 0 10px;
          margin-left: 22px;
        }
        .toactivate {
          color: #FAA111;
          background: rgba(250,161,17,0.2);
        }
        .activated {
          color: #22CE88;
          background: rgba(34,206,136,0.2);
        }
      }
    }
    .centerbox_right {
      color: #e60012;
      cursor: pointer;
    }
  }
  .bottombox {
    position: relative;
    overflow: hidden;
    margin-top: 20px;
    ::v-deep.el-form-item__label {
      font-size: 14px;
      color: #61666d;
      line-height: 16px;
      font-weight: 400;
      margin-bottom: 6px;
    }
    .timeMsg {
      width: 320px;
      font-size: 16px;
      color: #e60012;
      line-height: 22px;
      // margin-top: -20px;
    }
  }

  .bottomBtn_box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .commonBtn {
      background: #ffffff;
      border-radius: 8px;
    }
    .bottomBtn_box_red {
      border: 1px solid #e60012;
      color: #e60012;
    }
    .bottomBtn_box_red_one {
      // width: 120px;
    }
    .bottomBtn_box_gray {
      border: 1px solid #b0b3b6;
      color: #b0b3b6;
    }
  }
  .centerbox_center {
    display: flex;
    justify-content: space-between;
    line-height: 36px;
    background: #fefbf5;
    border: 1px solid #fadd9e;
    border-radius: 8px;
    padding: 0 15px;
    margin-top: 15px;
    div {
      font-size: 12px;
      color: #61666d;
    }
  }
}
@media (max-width: 1366px) {
  .myprofile-dialog .centerbox .centerbox_left div, .myprofile-dialog .content_box .topbox div{
    font-size: 12px;
  }
  .myprofile-dialog .bottombox {
    ::v-deep.el-form-item__label {
      font-size: 12px;
    }
  }
}
</style>
