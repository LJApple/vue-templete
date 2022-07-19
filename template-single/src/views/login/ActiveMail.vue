<!--
 * @Description: 激活邮箱界面
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-18 18:26:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-13 12:01:42
-->
<template>
  <div class="active-mail">
    <el-header style="height: 48px">
      <div class="header-left">
        <div class="logo-img">
          <img src="@/assets/images/logo.png" alt="极兔" />
        </div>
      </div>
    </el-header>
    <div class="content" v-loading="loading">
      <div class="content__text">
        <i class="iconfont" :class="isActive ? 'icon-icon-chenggongtishi' : 'icon-icon-cuowutishi'"></i>
        <p>{{ msg }}</p>
        <div class="content__button" @click="goIndex">Back to Homepage</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getActiveMail } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
export default {
  name: 'ActiveMail',
  data() {
    return {
      isActive: true,
      loading: false,
      msg: '',
    }
  },
  mounted() {
    this.getActiveState()
  },
  methods: {
    goIndex() {
      this.$router.push({ path: '/index' })
    },
    async getActiveState() {
      this.loading = true
      try {
        const params = { checkCode: this.$route.query.checkCode }
        const { code, msg } = await getActiveMail(params)
        if (code === RESPONSE_CODE.SUCCESS) {
          this.isActive = true
          this.msg = 'Activation successful'
        } else {
          this.isActive = false
          this.msg = msg
        }
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.active-mail {
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
    background: #e60012;
    color: #ffffff;
    line-height: 48px;
    padding: 0 20px 0 12px;
  }
  .iconfont {
    font-size: 24px;
  }
  .icon-icon-cuowutishi {
    color: #ff4947;
    margin-top: 95px;
    display: inline-block;
  }
  .icon-icon-chenggongtishi {
    color: #67c23a;
    margin-top: 95px;
    display: inline-block;
  }
  .content {
    width: 100%;
    height: calc(100vh - 48px);
    background: #ebebeb;
    position: relative;
  }
  .content__text {
    width: 500px;
    height: 300px;
    // line-height: 300px;
    border-radius: 8px;
    text-align: center;
    background: #ffffff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    p {
      margin-top: 16px;
    }
    .content__button {
      width: 120px;
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      margin: 36px auto;
      text-align: center;
      color: #e60012;
      border: 1px solid #e60012;
      border-radius: 4px;
      cursor: pointer;
    }
  }
}
</style>
