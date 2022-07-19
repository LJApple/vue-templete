<!--
 * @Description: 运单增长量
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-03 08:54:00
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-14 15:13:22
-->
<template>
  <div class="waybill-growth index-tab">
    <div class="title">
      <div class="title_text">{{$lang('运单增长量')}}</div>
      <div class="title_time">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
          <el-tab-pane label="7D" name="7D"></el-tab-pane>
          <el-tab-pane label="1M" name="1M"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="waybill-growth__growth-rate">
      <span>{{ activeName === '7D' ? $lang('周') : $lang('月') }}</span>
      <span> {{ number }} </span>
      <span
        class="iconfont"
        :class="
          number.indexOf('-') === -1
            ? 'icon-qita_ico_shangzhang'
            : 'icon-qita_ico_xiajiang'
        "
      ></span>
    </div>
    <div class="waybill-growth-canvas">
      <template v-if="!loading && !isEmpty">
        <v-chart
          :options="waybillGrowth"
          :autoresize="true"
          theme="maintheme"
        ></v-chart>
        <!-- <div class="waybill-growth__growth-rate">
          <span>{{ activeName === '7D' ? $lang('周') : $lang('月') }}</span>
          <span> {{ number }} </span>
          <span
            class="iconfont"
            :class="
              number.indexOf('-') === -1
                ? 'icon-qita_ico_shangzhang'
                : 'icon-qita_ico_xiajiang'
            "
          ></span>
        </div> -->
      </template>
      <BaseChartLoad :loading="loading" :empty="isEmpty" :emptyTitle="false" />
    </div>
  </div>
</template>

<script>
import BaseChartLoad from '@/components/base/BaseChartLoad.vue'
import { IndexReport } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
import ECharts from 'vue-echarts'
import indexTheme from '@/assets/theme/indexTheme.json'
ECharts.registerTheme('maintheme', indexTheme)
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import { mapGetters } from 'vuex'
import mixin from "./mixin";
export default {
  name: 'WaybillGrowth',
  mixins: [mixin],
  components: {
    'v-chart': ECharts,
    BaseChartLoad
  },
  computed: {
    ...mapGetters(['user']),
    waybillGrowth() {
      const that = this
      return {
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter(params) {
            return `${that.$lang('运单量')}：${
              that.generatingThousandthPers(params.data.value)
            }<br />${that.$lang('运单增长率')}：${params.data.growth}`
          }
        },
        legend: {
          data: [
            that.$lang('全部'),
            that.$lang('有折扣'),
            that.$lang('无折扣')
          ],
          left: 20,
          itemGap: 20,
          textStyle: {
            color: '#61666d'
          }
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: that.dayId,
          axisLine: {
            lineStyle: {
              color: '#DCDEE1'
            }
          },
          axisTick: {
            lineStyle: {
              color: '#DCDEE1'
            }
          },
          axisLabel: {
            textStyle: {
              fontSize: 10,
              color: '#61666D'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#DCDEE1'
            }
          },
          axisLabel: {
            fontSize: 10
          }
        },
        series: [
          {
            name: that.$lang('全部'),
            type: 'line',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#F3243488' // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#FFFFFF00' // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              }
            },
            smooth: true,
            data: that.total,
            lineStyle: {
              width: 1.5
            }
          },
          {
            name: that.$lang('有折扣'),
            type: 'line',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#2259E788' // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#FFFFFF00' // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              }
            },
            smooth: true,
            data: that.discount,
            lineStyle: {
              width: 1.5
            }
          },
          {
            name: that.$lang('无折扣'),
            type: 'line',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#00C4B388'
                    // color: '#F3BA0B88' // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#FFFFFF00' // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              }
            },
            // lineStyle: {
            //   color: '#F3BA0B'
            // },
            // itemStyle: {
            //   color: '#F3BA0B'
            // },
            smooth: true,
            data: that.noDiscount
          }
        ]
      }
    }
  },
  data() {
    return {
      activeName: '7D', // tab状态
      number: '-80%', // 占比
      dayId: [], // 横坐标字段
      total: [], // 全部
      discount: [], // 有折扣
      noDiscount: [], // 没有折扣
      source: 'ALL',
      loading: false, // 加载
      isEmpty: false // 空
    }
  },
  watch: {
    '$parent.$props.activeName': {
      handler(nval, oval) {
        this.source = nval
        this.activeName = '7D'
        this.handleClick()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async handleClick() {
      this.loading = true
      const params = {
        cusCode: this.user.loginCode,
        days: this.activeName,
        source: this.source
      }
      try {
        const { data, code, msg } = await IndexReport.getWayBillData(params)
        if (code === RESPONSE_CODE.SUCCESS) {
          if (data.detail) {
            this.discount = data.detail.map(item => {
              return { value: item.discount, growth: item.discountGrowthRate }
            }) // 有折扣
            this.noDiscount = data.detail.map(item => {
              return {
                value: item.noDiscount,
                growth: item.noDiscountGrowthRate
              }
            }) // 无折扣
            this.total = data.detail.map(item => {
              return { value: item.total, growth: item.totalGrowthRate }
            }) // 全部
            this.dayId = data.detail.map(item => item.dayId) // 日期
          }
          this.number = data.ratio
        } else {
          this.$message.error(msg)
        }
      } catch (error) {
        console.log(error)
      }
      if (
        this.dayId.length === 0 &&
        this.total.length === 0 &&
        this.discount.length === 0 &&
        this.noDiscount.length === 0
      ) {
        this.isEmpty = true
      } else {
        this.isEmpty = false
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.waybill-growth {
  // width: 546px;
  width: 100%;
  height: 340px;
  background: #fff;
  border-radius: 12px;
  .waybill-growth__growth-rate {
    padding-left: 20px;
    margin-bottom: 10px;
    color: #61666D;
    // position: absolute;
    // top: 0;
    // left: 30px;
    // font-size: 14px;
  }
  .waybill-growth-canvas {
    position: relative;
    height: 240px;
    .echarts {
      width: 100%;
      height: 235px;
    }
  }
  .icon-qita_ico_shangzhang {
    color: #00a75f;
  }
  .icon-qita_ico_xiajiang {
    color: #e60012;
  }
}
</style>

<style lang="scss">
.waybill-growth {
  .emptyContent {
    margin-top: -28px;
  }
}
</style>
