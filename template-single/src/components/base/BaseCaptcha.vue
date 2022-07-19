<!--
 * @Author: ZHC
 * @Date: 2021-08-19 09:47:59
 * @Description: 图形验证码
 * @LastEditTime: 2021-08-10 14:32:08
-->
<template>
    <canvas
        id="s-canvas" class="s-canvas"
        :class="customClass"
        :width="contentWidth"
        :height="contentHeight"
        :style="customStyle"
        v-if="visible"
        @click="refreshCode"
    />
</template>

<script type="text/javascript">
export default {
  name: 'BaseCaptcha',
  props: {
    // 是否展示验证码
    visible: {
      type: Boolean,
      default: true
    },
    // 是否验证大小写,若为false,全部输出小写
    isVerifyCase: {
      type: Boolean,
      default: false
    },
    // 验证码宽度
    contentWidth: {
      type: Number,
      default: 138
    },
    // 验证码高度
    contentHeight: {
      type: Number,
      default: 54
    },
    // 自定义class
    customClass: {
      type: String,
      default: ''
    },
    // 自定义style
    customStyle: {
      type: String,
      default: ''
    },
    // 根据实际需求可显示的随机字符
    identifyCodes: {
      type: Array,
      default: () => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    },
    // 是否显示干扰线
    isShowLine: {
      type: Boolean,
      default: true
    },
    // 是否显示干扰点
    isShowDot: {
      type: Boolean,
      default: true
    },
    // 最小文字size
    fontSizeMin: {
      type: Number,
      default: 28
    },
    // 最大文字size
    fontSizeMax: {
      type: Number,
      default: 46
    },
    // 背景颜色最小色值(RGB)
    backgroundColorMin: {
      type: Number,
      default: 180
    },
    // 背景颜色最大色值(RGB)
    backgroundColorMax: {
      type: Number,
      default: 240
    },
    // 字体最小色值(RGB)
    colorMin: {
      type: Number,
      default: 50
    },
    // 字体最大色值(RGB)
    colorMax: {
      type: Number,
      default: 160
    },
    // 干扰线最小色值(RGB)
    lineColorMin: {
      type: Number,
      default: 40
    },
    // 干扰线最大色值(RGB)
    lineColorMax: {
      type: Number,
      default: 180
    },
    // 干扰点最小色值(RGB)
    dotColorMin: {
      type: Number,
      default: 0
    },
    // 干扰点最大色值(RGB)
    dotColorMax: {
      type: Number,
      default: 255
    }
  },
  data() {
    return {
      identifyCode: ''
    }
  },
  methods: {
    // 更新验证码
    refreshCode() {
      this.identifyCode = '';
      this.makeCode(this.identifyCodes, 4);
      this.drawPic()
      if (!this.isVerifyCase) { this.identifyCode = this.identifyCode.toLowerCase() }
      this.$emit('change', this.identifyCode); // 更新验证码后回调
    },
    // 生成一个随机数
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min)
    },
    // 生成一个随机的颜色
    randomColor(min, max) {
      const r = this.randomNum(min, max)
      const g = this.randomNum(min, max)
      const b = this.randomNum(min, max)
      return `rgb(${r}, ${g}, ${b})`
    },
    drawPic() {
      const canvas = document.getElementById('s-canvas')
      const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'bottom'
      // 绘制背景
      ctx.fillStyle = this.randomColor(this.backgroundColorMin, this.backgroundColorMax)
      ctx.fillRect(0, 0, this.contentWidth, this.contentHeight)
      // 绘制文字
      for (let i = 0; i < this.identifyCode.length; i++) {
        this.drawText(ctx, this.identifyCode[i], i)
      }
      if (this.isShowLine) this.drawLine(ctx) // 绘制干扰线
      if (this.isShowDot) this.drawDot(ctx) // 绘制干扰点
    },
    // 随机生成验证码字符串
    makeCode(data, len) {
      for (let i = 0; i < len; i++) {
        this.identifyCode += this.identifyCodes[this.randomNum(0, this.identifyCodes.length - 1)]
      }
    },
    // 绘制文本
    drawText(ctx, txt, i) {
      ctx.fillStyle = this.randomColor(this.colorMin, this.colorMax)
      ctx.font = this.randomNum(this.fontSizeMin, this.fontSizeMax) + 'px SimHei'
      const x = (i + 1) * (this.contentWidth / (this.identifyCode.length + 1))
      const y = this.randomNum(this.fontSizeMax, this.contentHeight - 5)
      var deg = this.randomNum(-30, 30) // 字符旋转角度(不超过45度比较好)
      // 修改坐标原点和旋转角度
      ctx.translate(x, y)
      ctx.rotate(deg * Math.PI / 180)
      ctx.fillText(txt, 0, 0)
      // 恢复坐标原点和旋转角度
      ctx.rotate(-deg * Math.PI / 180)
      ctx.translate(-x, -y)
    },
    drawLine(ctx) {
      // 绘制干扰线
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = this.randomColor(this.lineColorMin, this.lineColorMax)
        ctx.beginPath()
        ctx.moveTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight))
        ctx.lineTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight))
        ctx.stroke()
      }
    },
    drawDot(ctx) {
      // 绘制干扰点
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = this.randomColor(0, 255)
        ctx.beginPath()
        ctx.arc(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight), 1, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  },
  mounted() {
    this.refreshCode()
  }
}
</script>
<style lang="scss" scoped>
 .s-canvas {
   cursor: pointer;
 }
</style>
