<!--
 * @Description: 账单管理
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-03 14:48:07
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-18 17:03:44
-->
<template>
  <div class="billing-management index-tab">
    <div class="title">
      <div class="title_other">{{ $lang("账单管理") }}</div>
      <div class="title__refresh" @click="refresh">
        <span class="iconfont icon-icon_shuaxin"></span>
      </div>
    </div>
    <div class="billing-management-canvas">
      <template v-show="!loading && !isEmpty">
        <v-chart
          v-show="firstMonthValues.length > 0"
          :options="billingManagement('firstMonth')"
          :autoresize="true"
          theme="maintheme"
          @dblclick="goToDetail"
          ref="firstMonthCanvas"
        ></v-chart>
        <v-chart
          v-show="secondMonthValues.length > 0"
          :options="billingManagement('secondMonth')"
          :autoresize="true"
          theme="maintheme"
          @dblclick="goToDetail"
          ref="secondMonthCanvas"
        ></v-chart>
        <v-chart
          v-show="thirdMonthValues.length > 0"
          :options="billingManagement('thirdMonth')"
          :autoresize="true"
          theme="maintheme"
          @dblclick="goToDetail"
          ref="thirdMonthCanvas"
        ></v-chart>
      </template>
      <BaseChartLoad :loading="loading" :empty="isEmpty" :emptyTitle="false" />
    </div>
  </div>
</template>

<script>
import BaseChartLoad from "@/components/base/BaseChartLoad.vue";
import { IndexReport } from "@/api";
import ECharts from "vue-echarts";
import indexTheme from "@/assets/theme/indexTheme.json";
ECharts.registerTheme("maintheme", indexTheme);
import "echarts/lib/chart/pie";
import "echarts/lib/component/legend";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import { RESPONSE_CODE } from "@public/http/config";
import { mapGetters } from "vuex";
// import debounce from "lodash/debounce";
import mixin from "./mixin";
export default {
  name: "BillingManagement",
  mixins: [mixin],
  components: {
    "v-chart": ECharts,
    BaseChartLoad,
  },
  computed: {
    ...mapGetters(["user"]),
    // 账单管理图表配置
    billingManagement() {
      const that = this;
      return (val) => {
        return {
          title: [
            // 图例下：应付日期
            {
              subtext: that[val + "Obj"].date && that[val + "Values"][0].value ? that.$lang("应付日期") : "",
              x: "center",
              bottom: "0",
              subtextStyle: {
                lineHeight: 40,
                fontSize: 10,
                color: that[val + "Obj"].date && that.countDelayDate(that[val + "Obj"].date) !== "" ? "#F32434" : "#61666D",
              },
            },
            {
              subtext: that[val + "Obj"].date && that[val + "Values"][0].value ? that[val + "Obj"].date + that.countDelayDate(that[val + "Obj"].date) : "",
              x: "center",
              bottom: -20,
              subtextStyle: {
                lineHeight: 40,
                fontSize: 10,
                color: that[val + "Obj"].date && that.countDelayDate(that[val + "Obj"].date) !== "" ? "#F32434" : "#61666D",
              },
            },
            // 图例上：价格
            {
              subtext: that.monthChange(that[val + "Obj"].name),
              x: "center",
              bottom: "100",
              subtextStyle: {
                fontSize: 14,
                fontWeigh: 500,
                lineHeight: 18,
                color: "#2b2d42",
              },
            },
            // 饼图中的数字
            {
              subtext: that[val + "Obj"].totalNumber,
              x: "center",
              bottom: "188",
              subtextStyle: {
                fontSize: 14,
                fontWeigh: 500,
                lineHeight: 18,
                color: "#2b2d42",
              },
            },
          ],
          // 提示文字
          tooltip: {
            trigger: "item",
            //   formatter: '{a} <br/>{b}: {c} ({d}%)'
            formatter: function (p) {
              return `${p.seriesName}<br/>${p.name}: ${that.generatingThousandthPers(p.value)} (${p.percent}%)`;
            },
          },
          // 图例
          legend: {
            show: true,
            orient: "vertical",
            bottom: 40,
            left: "center",
            data: [that.$lang("未付"), that.$lang("已付")],
            icon: "circle",
            padding: 8,
            itemGap: 16,
            textStyle: {
              fontSize: 10,
              color: "#61666d",
            },
          },
          // 拼接价格
          formatter(name) {
            const than = that.billingManagement(val).series[0].data; // 获取series中的data
            let tarValue;
            for (let i = 0; i < than.length; i++) {
              if (than[i].name === name) {
                tarValue = that.generatingThousandthPers(than[i].value);
                break;
              }
            }
            const p = tarValue;
            return name + " " + " " + "RP " + p;
          },
          series: [
            {
              name: that[val + "Obj"].name,
              type: "pie",
              radius: ["50%", "65%"],
              // center: ['50%', '25%'],
              bottom: 100,
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: false,
                  fontSize: "30",
                  fontWeight: "bold",
                },
              },
              labelLine: {
                show: false,
              },
              data: that[val + "Values"],
            },
          ],
        };
      };
    },
    // 计算延迟日期
    countDelayDate() {
      const that = this;
      return (date) => {
        let num = 0;
        const payDate = new Date(date).getTime();
        const nowDate = new Date().getTime();
        if (nowDate > payDate) {
          // 已经超期
          num = (nowDate - payDate) / 3600 / 24 / 1000;
          return `(${that.$lang("迟")}${num % 1 === 0 ? num : Math.floor(num) + 1}${that.$lang("日")})`;
        }
        return "";
      };
    },
  },
  data() {
    return {
      thirdMonthValues: [],
      thirdMonthObj: {},
      secondMonthValues: [],
      secondMonthObj: {},
      firstMonthValues: [],
      firstMonthObj: {},
      source: "ALL",
      loading: false,
      isEmpty: false,
      totalNumber1: 0,
      totalNumber2: 0,
      totalNumber3: 0,
    };
  },
  watch: {
    "$parent.$props.activeName": {
      handler(nval, oval) {
        this.source = nval;
        this.refresh();
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    // 监听视窗改变及销毁
    // this.$nextTick(() => {
    //   // 监听视窗改变及销毁
    //   this.weightFlowResize = debounce(this.$refs.firstMonthCanvas.resize, 400);
    //   this.weightFlowResize1 = debounce(this.$refs.secondMonthCanvas.resize, 400);
    //   this.weightFlowResize2 = debounce(this.$refs.thirdMonthCanvas.resize, 400);
    //   window.addEventListener("resize", this.weightFlowResize, false);
    //   window.addEventListener("resize", this.weightFlowResize1, false);
    //   window.addEventListener("resize", this.weightFlowResize2, false);
    //   this.$on("hook:activated", () => {
    //     window.addEventListener("resize", this.weightFlowResize, false);
    //     window.addEventListener("resize", this.weightFlowResize1, false);
    //     window.addEventListener("resize", this.weightFlowResize2, false);
    //   });
    //   this.$on("hook:deactivated", () => {
    //     window.removeEventListener("resize", this.weightFlowResize, false);
    //     window.removeEventListener("resize", this.weightFlowResize1, false);
    //     window.removeEventListener("resize", this.weightFlowResize2, false);
    //   });
    //   this.$once("hook:beforeDestroy", () => {
    //     window.removeEventListener("resize", this.weightFlowResize, false);
    //     window.removeEventListener("resize", this.weightFlowResize1, false);
    //     window.removeEventListener("resize", this.weightFlowResize2, false);
    //   });
    // });
  },
  methods: {
    // 刷新/获取数据接口
    async refresh() {
      this.loading = true;
      const params = {
        cusCode: this.user.loginCode,
        days: "3M",
        source: this.source,
      };
      try {
        const { data, code, msg } = await IndexReport.getBillData(params);
        if (code === RESPONSE_CODE.SUCCESS) {
          if (data.length > 0) {
            // 获取总数
            if (typeof data[0].unpaid === "number" && typeof data[0].paid === "number") {
              this.totalNumber1 = data[0].unpaid + data[0].paid;
            }
            this.firstMonthValues = [
              { value: data[0].unpaid, name: this.$lang("未付") },
              { value: data[0].paid, name: this.$lang("已付") },
            ];
            this.firstMonthObj = {
              name: data[0].monthId, // 月份
              date: data[0].dueDate, // 应付日期
              totalNumber: this.generatingThousandthPers(this.totalNumber1),
            };
          }
          if (data.length > 1) {
            // 获取总数
            if (typeof data[1].unpaid === "number" && typeof data[1].paid === "number") {
              this.totalNumber2 = data[1].unpaid + data[1].paid;
            }
            console.log(this.totalNumber2);
            this.secondMonthValues = [
              { value: data[1].unpaid, name: this.$lang("未付") },
              { value: data[1].paid, name: this.$lang("已付") },
            ];
            this.secondMonthObj = {
              name: data[1].monthId,
              date: data[1].dueDate,
              totalNumber: this.generatingThousandthPers(this.totalNumber2),
            };
          }
          if (data.length > 2) {
            // 获取总数
            if (typeof data[2].unpaid === "number" && typeof data[2].paid === "number") {
              this.totalNumber3 = data[2].unpaid + data[2].paid;
            }
            console.log(this.totalNumber3);
            this.thirdMonthValues = [
              { value: data[2].unpaid, name: this.$lang("未付") },
              { value: data[2].paid, name: this.$lang("已付") },
            ];
            this.thirdMonthObj = {
              name: data[2].monthId,
              date: data[2].dueDate,
              totalNumber: this.generatingThousandthPers(this.totalNumber3),
            };
          }
        } else {
          this.$message.error(msg);
        }
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
      // 结果为空则显示无数据
      if (this.thirdMonthValues.length === 0 && this.secondMonthValues.length === 0 && this.firstMonthValues.length === 0) {
        this.isEmpty = true;
      } else {
        this.isEmpty = false;
      }
    },
    goToDetail(params) {
      const startTime = params.seriesName;
      const endTime = params.seriesName;
      const query = {
        isVerification: "", // 代收货款：1-已付；2-未付
        selectMonth: [startTime, endTime],
        commonMonth: 4,
      };
      if (params.name === this.$lang("未付")) {
        // 如果点击的未付
        query.isVerification = "0";
      } else {
        query.isVerification = "1";
      }
      this.$router.push({ name: "monthlyStatement", query: query });
    },
  },
};
</script>

<style lang="scss" scoped>
.billing-management {
  // width: 830px;
  width: 100%;
  height: 360px;
  // margin-left: 20px;
  background: #ffffff;
  border-radius: 12px;
  .title {
    .title__refresh {
      cursor: pointer;
      color: #4c4d57;
      line-height: 30px;
    }
  }
  .billing-management-canvas {
    min-height: calc(100% - 60px);
    position: relative;
    display: flex;
    justify-content: space-between;
    .echarts {
      height: 305px;
      width: 33.33%;
    }
  }
}
</style>

<style lang="scss">
.billing-management {
  .emptyContent {
    margin-top: -28px;
  }
}
</style>
