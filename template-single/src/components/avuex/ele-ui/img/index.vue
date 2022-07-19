<template>
  <div :class="[b(),'avue-img--'+align]" class="my-img-text">
    <img v-if="status" :src="text" :width="setPx(imgWidth,'100%')" :height="setPx(imgHeight)" alt>
    <el-button v-else :size="size" :type="type" @click="handleViews">{{$lang(label)}}</el-button>
    <el-dialog
      :visible.sync="box"
      width="60%"
      class="my-img-dialog"
      :class="{'avue-img--fullscreen':fullscreen}"
      :fullscreen="fullscreen"
      modal-append-to-body
      append-to-body
    >
      <avue-carousel :option="option"></avue-carousel>
    </el-dialog>
  </div>
</template>

<script>
import create from '../../core/create';
import props from '../../core/common/props.js';
import event from '../../core/common/event.js';
import { setPx } from '../../utils/util';
export default create({
  name: 'img',
  mixins: [props(), event()],
  data() {
    return {
      box: false
    };
  },
  props: {
    align: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: '查看'
    },
    imgType: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    dataType: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'small'
    },
    listType: {
      type: String,
      default: ''
    },
    value: {},
    imgWidth: {},
    imgHeight: {}
  },
  computed: {
    option() {
      if (this.status || !this.text) return {};
      const list = [];
      this.text.forEach(ele => {
        if (this.isArray) {
          list.push({
            src: ele
          });
        } else {
          list.push({
            title: ele[this.labelKey],
            src: ele[this.valueKey]
          });
        }
      });
      return {
        autoplay: false,
        type: this.imgType,
        fullscreen: this.fullscreen,
        interval: 0,
        data: list
      };
    },
    isArray() {
      return this.dataType === 'array';
    },
    status() {
      return this.listType === 'picture-img';
    }
  },
  watch: {},
  created() {
    this.setPx = setPx;
  },
  mounted() {},
  methods: {
    handleViews() {
      this.box = true;
    }
  }
});
</script>

<style  lang="scss">
  .my-img-text{
    .el-button--text{
      @include base-color('clr');
      &::after{
        content:"";
        display:block;
        margin-top: 2px;
        width: 100%;
        height:1px;
        @include base-color('bg');
        transform:scaleY(1);
        float:left;
      }
    }
  }
  .my-img-dialog{
    .el-dialog{
        background-color: transparent!important;
        box-shadow: 0 0 0 rgba(0, 0, 0, 0);
        .el-dialog__header {
              border-bottom: 0px;
        }
        .el-carousel__container{
          height: 55vh;
        }
        .el-dialog__headerbtn{
              top: 0px;
          .el-dialog__close{
            color: #ffffff;
            font-size: 26px;
          }
        }
        .el-carousel__button{
          width: 10px;
          height: 10px;
          border-radius: 5px;
        }
        .avue-carousel__img{
          background-repeat:no-repeat;
          background-size:contain;
        }
        .el-dialog__headerbtn{
          // right: 15%;
        }
    }
    .el-pager {
        li {
          background-color: transparent!important;
        }
      }
  }
</style>

