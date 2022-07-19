<!--
 * @Description: 打开图片
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-19 16:19:57
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-18 10:04:01
-->
<template>
  <div v-if="pictureVisible">
    <el-dialog
      :visible="pictureVisible"
      @close="close"
      :title="$lang(pictureType)"
      class="picture-dialog"
    >
      <div class="picture-dialog__top">
        <img :src="imgUrl" />
      </div>
      <div id="watermarkPic"></div>
    </el-dialog>
  </div>
</template>

<script>
import { watermark } from '@/components/avuex/plugin/canvas/'
import mixin from '@/mixins/mixin'
import { formatDate } from '@public/utils/common'
export default {
  name: 'ExpressTrackingPic',
  mixins: [mixin],
  props: {
    pictureVisible: {
      type: Boolean,
      default: false
    },
    pictureType: {
      type: String,
      default: ''
    },
    imgUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShowFirst: false
    }
  },
  mounted() {},
  watch: {},
  methods: {
    drawWatermark() {
      watermark({ text: this.user.cusName + ' ' + formatDate(new Date()) })
    },
    // 关闭弹窗
    close() {
      this.$emit('update:pictureVisible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.picture-dialog__top {
  font-size: 14px;
  color: #a1a3a6;
  .operating-setting {
    margin-right: 23px;
    cursor: pointer;
  }
  img {
    width: 100%;
  }
}
#watermarkPic {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}
</style>
<style lang="scss">
.picture-dialog{
  .el-dialog__body{
    height: 60vh;
    overflow: scroll;
  }
}
</style>
