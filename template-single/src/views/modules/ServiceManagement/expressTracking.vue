<!--
 * @Description: 快件跟踪
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-12 10:36:00
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-27 10:56:48
-->
<template>
  <div class="tk_body_wrap" id="express-tracking">
    <div class="tk_body">
      <div class="tk_top">
        <!-- <div class="tk_left"> -->
        <div class="tk_search">
          <base-input-tag
            ref="inputTag"
            v-model="searchKey"
            :validate="inputTagValid"
            :placeholder="$lang('请输入运单号,多单号用英文逗号或enter(回车)隔开,单次最多输入十个单号')"
            :addTagOnBlur="true"
            maxHeight="100%"
            class="cms-input-tag"
            :clearBtnVisible="false"
          >
            <template slot="inputButton">
              <div class="input-tag-buttons">
                <el-button type="primary" plain @click="searchFun">{{ $lang("查询") }}</el-button>
                <el-button @click="resetSearch">{{ $lang("清空") }}</el-button>
              </div>
            </template>
          </base-input-tag>
        </div>
      </div>
      <div class="tk_bottom" v-if="!isEmpty && traceList && traceList.length">
        <el-form class="el-form-detail" ref="sizeForm" :inline="true" label-position="left" label-suffix=" :">
          <el-collapse v-model="activeName">
            <template v-for="(tag, $index) in traceList">
              <el-collapse-item v-if="tag" :key="$index" :name="$index" class="el-collapse-item1">
                <span class="collapse-title" slot="title"
                  >{{ $lang("运单编号") + " " + tag.billCode }}
                  <!-- 通过acitveName，判断折叠板是否展开，有的话采用激活的icon -->
                  <svg class="icon svg-icon" aria-hidden="true" v-if="!activeName.includes($index)">
                    <use xlink:href="#icon-qita_ico_zhankai"></use>
                  </svg>
                  <svg class="icon svg-icon" aria-hidden="true" v-else>
                    <use xlink:href="#icon-qita_ico_shouqi"></use>
                  </svg>
                  <span class="total-time" v-if="tag && tag.traceItems">{{ `${$lang("共计用时")}:${tag.traceItems ? totalTime(tag.traceItems) : ""}` }}</span>
                  <div class="title-buttons" v-if="tag && tag.wayBillImgs">
                    <span v-for="(item, index) in tag.wayBillImgs" :key="index" @click.stop="openPicture(item)">
                      <i class="iconfont icon-qita_ico_shoujiantupian" v-if="item.fileType === 'QSTP' || item.fileType === 'QMTP' || item.fileType === 'SJTP'"></i
                      >{{ " " + $lang(item.fileType === "QSTP" ? "签收图片" : item.fileType === "QMTP" ? "签名图片" : item.fileType === "SJTP" ? "收件图片" : "") }}
                    </span>
                  </div>
                </span>
                <div v-if="tag && tag.traceItems && tag.traceItems.length">
                  <div class="c_timeline">
                    <div
                      class="c_timeline_item"
                      v-for="(item, index) in tag.traceItems"
                      :key="index"
                      :class="(index === 0 && item.scanStatus === 9) || item.scanStatus === 10 ? 'SIGNED' : index === 0 ? 'WARNING' : ''"
                    >
                      <span class="item_nr_span" :class="index === 0 ? 'first' : ''">{{ item.time }} </span>
                      <div class="c_timeline_item_nr">
                        <div class="c_timeline_item_time">
                          {{
                            $lang(
                              item.scanType === "收件"
                                ? "已揽收"
                                : item.scanType === "发件"
                                ? "运送中"
                                : item.scanType === "到件"
                                ? "已到达"
                                : item.scanType === "派件"
                                ? "派件中"
                                : item.scanType === "签收"
                                ? "已签收"
                                : item.scanType === "退件登记"
                                ? "退件中"
                                : item.scanType === "退件签收"
                                ? "已退件"
                                : item.scanType === "疑难件"
                                ? "停留中"
                                : ""
                            )
                          }}
                        </div>
                        <div class="c_timeline_item_dec">
                          {{
                            `${item.netWorkType} , ${item.scanCity} ${$lang(
                              '城市'
                            )} , ` +
                              (item.scanType === '收件'
                                ? `${$lang('揽收人员')} : [${item.dispatcher}]`
                                : item.scanType === '发件'
                                ? `${$lang('已发往')} [${item.lastNext}]`
                                : item.scanType === '到件'
                                ? $lang('已到达')
                                : item.scanType === '派件'
                                ? `${$lang('派送人员')} : [${item.dispatcher}]`
                                : item.scanType === '签收'
                                ? `${$lang('签收人')} : [${item.signer}]`
                                : item.scanType === '退件登记'
                                ? `${$lang('退件中')} , ${$lang('原因')}[${
                                    item.backReason
                                  }]`
                                : item.scanType === '退件签收'
                                ? `${$lang('退件签收人')} : [${item.signer}]`
                                : item.scanType === '疑难件'
                                ? `${$lang('停留中')} , ${$lang('原因')}[${
                                    item.remark
                                  }]`
                                : '')
                          }}
                        </div>
                        <p v-if="index != tag.traceItems.length - 1"></p>
                        <svg v-if="index === 0" class="icon svg-icon" aria-hidden="true">
                          <use xlink:href="#icon-qita_ico_zuixinjilu"></use>
                        </svg>
                        <i v-else class="yuan-icon iconfont iconyuan"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-data_item list-empty">
                  <BaseChartLoad :empty="true" :emptyTitle="false" />
                </div>
              </el-collapse-item>
            </template>
          </el-collapse>
        </el-form>
      </div>
      <div class="tk_bottom" :class="{ 'list-empty': isEmpty, 'list-loading': loading }" v-if="isEmpty || loading">
        <div class="list-empty_content">
          <BaseChartLoad :loading="loading" :empty="isEmpty" :emptyTitle="false" :hasText="false" />
        </div>
      </div>
    </div>
    <div v-if="pictureVisible">
      <expressTrackingPic ref="trackingPicture" :pictureVisible.sync="pictureVisible" :pictureType="pictureType" :imgUrl="imgUrl" />
    </div>
  </div>
</template>

<script>
import mixin from "@/mixins/mixin";
import BaseInputTag from "./expressTrackingInputTag";
import BaseChartLoad from "@/components/base/BaseChartLoad.vue";
import expressTrackingPic from "@/views/modules/ServiceManagement/expressTrackingPic.vue";
import { ExpressTracking } from "@/api/index.js";
import { RESPONSE_CODE } from "@public/http/config";
import { commonFun } from "@public/utils/common.js";
// import { RESPONSE_SUCCESS } from '@public/utils/const'
export default {
  name: "ExpressTracking",
  mixins: [mixin],
  components: {
    BaseInputTag,
    expressTrackingPic,
    BaseChartLoad,
  },
  data() {
    return {
      COM_HTTP: ExpressTracking,
      isShowFirst: false,
      searchKey: [],
      searchKeyOld: [],
      traceList: [], // 物流跟踪list
      inputTagValid: "orderName",
      orderIds: "",
      preViewVisible: false,
      keyBtn: false,
      activeName: [0],
      pictureVisible: false,
      pictureType: "",
      imgUrl: "",
      loading: false,
      isEmpty: true, // 显示空数据
    };
  },
  computed: {
    // 计算花费总时间
    totalTime() {
      const that = this;
      return (items) => {
        // 过滤掉没有时间的数据
        const timeItems = items.filter((item) => item.time);
        let timeDiff = [];
        if (items.length < 2 || timeItems < 2) {
          // 只有一个时间
          return ` 0 ${that.$lang("天")} 0 ${that.$lang("小时")}`;
        } else if (!items[items.length - 1].time || !items[0].time) {
          // 没有开始/结束时间， 取过滤的数据开始结束时间并计算
          timeDiff = commonFun.getTimeDiff(timeItems[0].time, timeItems[timeItems.length - 1].time);
          return ` ${timeDiff[0]} ${that.$lang("天")} ${timeDiff[1]} ${that.$lang("小时")}`;
        } else {
          // 正常情况直接计算差值
          timeDiff = commonFun.getTimeDiff(items[items.length - 1].time, items[0].time);
          return ` ${timeDiff[0]} ${that.$lang("天")} ${timeDiff[1]} ${that.$lang("小时")}`;
        }
      };
    },
  },
  watch: {},
  created() {},
  activated() {
    if (this.$route.query) {
      const { wayBillNo } = this.$route.query;
      if (wayBillNo && wayBillNo.length > 0) {
        this.searchKey = wayBillNo.filter((item) => item.billCode).map((item) => item.billCode);
        this.searchFun();
      }
    }
  },
  methods: {
    // 搜索
    searchFun() {
      const reqList = [];
      if (!this.searchKey || this.searchKey.length === 0) {
        return this.$message.warning(this.$lang("请输入单号"));
      }
      if (this.searchKey.length > 10) {
        return this.$message.warning(this.$lang("您查询的单号已超出10条"));
      }
      const newArr = this.searchKey.filter((item) => !this.searchKeyOld.some((ele) => ele === item)); // 单次只能查询10条数据
      if (newArr.length > 10) {
        return this.$message.warning(this.$lang("单次只能查询10条数据"));
      }
      this.searchKeyOld = this.searchKey.slice(0);
      this.searchKey.forEach((item) => reqList.push(item));
      this.getOrderList(reqList);
      // this.afterSearchFun()
    },
    // 查询单号
    async getOrderList(reqList) {
      this.loading = true;
      const params = reqList;
      this.keyBtn = true;
      const { code, msg, data } = await this.COM_HTTP.reqList(params);
      this.keyBtn = false;
      if (code === RESPONSE_CODE.SUCCESS) {
        this.traceList = data;
        // this.isEmpty = data.every(item => !item.traceItems)
        this.isEmpty = data.length === 0;
      } else {
        this.$message.warning(msg);
      }
      this.loading = false;
    },
    afterSearchFun() {
      // if (this.traceList.every(item => !item.traceItems)) {
      if (this.traceList.length === 0) {
        this.isEmpty = true;
      } else {
        this.isEmpty = false;
      }
    },
    resetSearch() {
      this.searchKey = [];
    },
    /**
     * @description 打开图片
     * @param tag 当前行数据
     * @param type receive：收件图片；signature：签名图片；signFor：签收图片
     */
    openPicture(item) {
      this.pictureVisible = true;
      this.$nextTick(() => {
        this.$refs.trackingPicture.drawWatermark();
      });
      switch (item.fileType) {
        case "SJTP":
          this.pictureType = this.$lang("收件图片");
          break;
        case "QSTP":
          this.pictureType = this.$lang("签收图片");
          break;
        case "QMTP":
          this.pictureType = this.$lang("签名图片");
          break;
        default:
          break;
      }
      this.imgUrl = item.imgUrl;
    },
  },
};
</script>

<style lang="scss" scope>
.no-data_item {
  // margin: 0 0  0 -14px;
  margin-left: -14px;
  height: 300px;
  pointer-events: none;
  .loadComponent .empty .emptyContent {
    background-color: #00000000 !important;
  }
}
.content .main-wrap {
  margin: 8px;
}
.tk_body_wrap {
  height: 100%;
  padding: 0 !important;
  box-sizing: border-box;
  border-radius: 0 5px 5px 5px;
  background: #fff;
  overflow-y: auto;
  .tr_nr .main-wrap {
    margin: 10px;
  }
  .tk_body {
    display: flex;
    // justify-content: space-between;
    padding: 16px;
    height: calc(100% - 32px);
    position: relative;
    .tk_top {
      width: 200px;
      height: 100%;
      border-right: 1px solid #e8e8e8;
      padding-right: 16px;
      .tk_search {
        border: 1px solid #e8e8e8;
        max-height: 100%;
        border-radius: 4px;
      }
      .input-tag-container {
        // float: left;
        width: 100%;
        height: 100%;
        border-radius: 0;
        .vue-input-tag-wrapper {
          height: 100% !important;
          box-sizing: border-box;
          border: none;
          .input-tag {
            position: relative;
            background: #e8e8e8;
            border-color: #e8e8e8 !important;
            border-radius: 4px;
            color: #646668;
            font-weight: 400;
            font-size: 14px;
            height: 24px;
            line-height: 1;
            a {
              cursor: pointer;
              position: absolute;
              top: 6px;
              font-size: 12px;
            }
            .edit-tag {
              font-size: 14px;
              color: #646668;
              // top: 3px;
              width: 132px;
            }
          }
          .input-tag:hover {
            border-color: #e8e8e8 !important;
          }
          .input-tag.input-tag-active {
            background: #fff;
            border-color: #e8e8e8 !important;
            color: #61666d !important;
          }
          // .del-btn{
          //   background: #fff;
          // }
        }
      }
    }
    .tk_left {
      justify-content: space-between;
      width: 440px;
      height: calc(100vh - 99px);
      padding: 24px;
      overflow: hidden;
      background: #ffffff;
      min-width: 365px;
      border-radius: 8px;
      box-sizing: border-box;
      .tk_search {
        width: 100%;
        height: auto;
        overflow: hidden;
        .el-select {
          float: left;
          width: 178px;
          height: 32px;
          margin-right: 16px;
          margin-bottom: 10px;
          .el-input__inner {
            height: 32px;
            line-height: 32px;
          }
        }
        // button {
        //   float: left;
        //   margin-bottom: 10px;
        //   width: 80px;
        //   font-size: 14px;
        //   font-weight: 400;
        //   border-radius: 8px;
        // }
        .cms-input-tag {
          .vue-input-tag-wrapper {
            padding: 12px;
          }
        }

        .input-tag-container {
          float: left;
          width: 100% !important;
          height: 100%;
          .vue-input-tag-wrapper {
            height: 170px !important;
            box-sizing: border-box;
            .input-tag {
              position: relative;
              background: #ebebeb;
              border-radius: 8px;
              color: #646668;
              font-weight: 400;
              font-size: 14px;
              height: 32px;
              line-height: 1.6;
              a {
                position: absolute;
                top: 6px;
                font-size: 12px;
              }
              .edit-tag {
                font-size: 12px;
                color: #646668;
                // top: 3px;
                width: 132px;
              }
            }
            // .del-btn{
            //   background: #fff;
            // }
          }
        }
      }
      .tk_search-btn {
        float: right;
        padding-top: 24px;
      }
      .tk_list {
        width: 100%;
        height: calc(100% - 178px);
        overflow: hidden;
        .tk_list_count {
          width: 100%;
          height: 28px;
          line-height: 28px;
          font-size: 16px;
          color: #333333;
          margin-top: 8px;
          text-indent: 10px;
          label {
            font-size: 12px;
            padding-left: 6px;
          }
        }
        .tk_list_title {
          display: flex;
          height: 42px;
          line-height: 42px;
          background: #ececec;
          border: #d8d8d8 solid 1px;
          div {
            flex: 1;
            box-sizing: border-box;
            font-size: 14px;
            color: #666666;
            text-align: center;
            border-left: #d8d8d8 solid 1px;
          }
          .d_1 {
            border-left: none;
          }
        }
        .tk_list_body {
          border: #d8d8d8 solid 1px;
          border-top: none;
          height: calc(100% - 84px);
          overflow-y: auto;
        }
        .tk_list_item {
          display: flex;
          width: 100%;
          height: 40px;
          line-height: 40px;
          overflow: hidden;
          cursor: pointer;
          div {
            flex: 1;
            padding: 0 5px;
            font-size: 12px;
            color: #666666;
            text-overflow: ellipsis;
            white-space: nowrap;
            border-bottom: #dedede solid 1px;
            overflow: hidden;
            i {
              font-style: normal;
              color: #999999;
            }
            .i_0 {
              color: #ff4b4b;
            }
            .i_100 {
              color: #00da00;
            }
          }
          .tk_list_statu {
            text-align: center;
          }
          .bd-left {
            border-left: #d8d8d8 solid 1px;
          }
          .d_1 {
            border-left: none;
          }
        }
      }
    }
    .tk_bottom {
      @include scrollBarStyle();
      flex: 1;
      height: 100%;
      overflow: auto;
      padding-left: 16px;
      background: #fff;
      // margin: 0 12px 0;
      // margin-top: 10px;
      border-radius: 8px;
      box-sizing: border-box;
      .el-form.el-form-edit > .el-collapse .el-collapse-item > div:nth-of-type(1) .el-collapse-item__header:before,
      .el-form.el-form-detail > .el-collapse .el-collapse-item > div:nth-of-type(1) .el-collapse-item__header:before {
        content: "";
        width: 0;
      }
      .el-form {
        .el-collapse {
          border-top-color: transparent !important;
          border-bottom-color: transparent !important;
          .el-collapse-item {
            margin-bottom: 12px;
            border: 1px solid #d4d6d8;
            border-radius: 8px;
            overflow: hidden;
            .is-active {
              .svg-icon {
                transform: rotate(-360deg);
              }
            }
            .collapse-title {
              font-size: 16px;
              color: #242628;
              font-weight: 600;
              padding-left: 24px;
              .svg-icon {
                margin-left: 8px;
                font-size: 16px;
                width: 16px;
                height: 16px;
                transition: transform 0.3s;
                vertical-align: -2px;
              }
              .total-time {
                font-size: 14px;
                color: #9499a3;
                font-weight: normal;
                margin-left: 16px;
              }
              .title-buttons {
                position: absolute;
                top: -3px;
                right: 20px;
                font-size: 12px;
                font-weight: normal;
                color: #4c4d57;
                i {
                  margin-left: 16px;
                  vertical-align: bottom;
                }
              }
            }
            .el-collapse-item__header {
              border: 0;
              padding: 0;
              height: 40px;
            }
            .el-collapse-item__content {
              padding: 0 0 25px 14px;
            }
            .el-collapse-item__arrow {
              display: none;
            }
          }
          .el-collapse-item:last-child {
            margin-bottom: 0;
          }
          .el-collapse-item1 {
            background: #f4f4f4;
            .el-collapse-item__wrap {
              background: #f4f4f4;
            }
            .el-collapse-item__header {
              background: #f4f4f4;
            }
          }
        }
      }
      .active {
        background-color: #e0bd7b;
        color: #ffffff !important;
      }
      .c_table {
        margin: 10px;
      }
      .no-data {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .c_timeline {
        // margin-top: 16px;
        transition: all 0.3s linear;

        .c_timeline_item {
          display: flex;
          margin-right: 40px;
          .first {
            font-weight: 600 !important;
          }
          .item_nr_span {
            width: 150px;
            margin-right: 12px;
            font-size: 14px;
            font-weight: 400;
            margin-right: 24px;
            color: #9499a3;
            text-align: right;
          }
          .avue-img--track {
            display: inline-block;
            .el-button--text {
              padding: 0;
            }
          }
          .c_timeline_item_nr {
            position: relative;
            padding-top: 2px;
            line-height: 20px;
            flex: 1;
            font-size: 12px;
            margin-left: 10px;
            padding-bottom: 20px;
            padding-left: 12px;
            .c_timeline_item_time {
              line-height: 20px;
              font-size: 14px;
              width: 140px;
              // margin: 0 5px;
              font-weight: 400;
              color: #9499a3;
            }
            .c_timeline_item_dec {
              color: #9499a3;
              font-weight: 400;
              margin-top: 3px;
            }
            p {
              position: absolute;
              width: 2px;
              height: 66%;
              border-left: #d8d8d8 solid 1px;
              left: -12px;
              top: 28%;
            }
            .yuan-icon {
              font-size: 8px;
              margin-left: 2px;
              width: 6px;
              height: 6px;
              opacity: 1;
              background: #d4d6d8;
              border-radius: 50%;
              position: absolute;
              top: 9px;
              left: -16px;
            }
            .svg-icon {
              position: absolute;
              top: 5px;
              left: -17px;
              box-sizing: border-box;
              width: 12px;
              height: 12px;
            }
          }
          .c_timeline_item_nr p:last-child() {
            display: none;
          }
        }
      }
      .c_timeline .c_timeline_item:first-child {
        .item_nr_span,
        .c_timeline_item_time,
        .c_timeline_item_dec {
          font-weight: 700;
          color: #4c4d57;
        }
        .item_nr_span {
          font-weight: 500;
        }
      }
    }
    .list-empty,
    .list-loading {
      position: relative;
      text-align: center;
      // margin-top: 10px;
      .list-empty_content {
        position: relative;
        height: 100%;
        pointer-events: none;
      }
      .image {
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        p {
          position: absolute;
          top: 245px;
          left: 50%;
          transform: translateX(-50%);
          color: #bebebe;
        }
      }
    }
    .list-loading {
      position: absolute;
      width: calc(100% - 233px);
      bottom: 0;
      margin: 0;
      right: 0;
    }
  }
}
</style>

<style lang="scss">
#express-tracking {
  .el-button--primary.is-plain {
    border-color: #e60012;
    background: #fff;
  }
  .el-button--primary:focus,
  .el-button--primary:hover,
  .el-button.comfirm-btn:focus,
  .el-button.comfirm-btn:hover,
  .el-button.comfirm-btn:active {
    background: #e60012 !important;
  }
  .input-tag-buttons {
    text-align: right;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
  }
  .loadComponent .loading {
    z-index: 9999;
  }
}
</style>
