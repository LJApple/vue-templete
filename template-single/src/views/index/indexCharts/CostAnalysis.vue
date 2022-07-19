<!--
 * @Description: 费用分析
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-03 14:26:52
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-18 17:00:46
-->

<template>
  <div class="cost-analysis index-tab">
    <div class="title">
      <div class="title_text">{{ $lang('费用分析') }}</div>
      <div class="empty" style="width:10px;height:10px"> </div>
      <div class="title_time">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
          <el-tab-pane label="7D" name="7D"></el-tab-pane>
          <el-tab-pane label="1M" name="1M"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="cost-analysis-canvas">
      <v-chart
        ref="CostAnalysis"
        :options="costAnalysis"
        style="width:100%;height:280px"
        theme="maintheme"
      ></v-chart>
      <BaseChartLoad :loading="loading" :empty="isEmpty" />
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
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
export default {
  name: 'CostAnalysis',
  components: {
    'v-chart': ECharts,
    BaseChartLoad
  },
  computed: {
    ...mapGetters(['user']),
    costAnalysis() {
      const that = this
      return {
        // 提示
        tooltip: {
          trigger: 'axis'
        },
        // 图例
        legend: {
          data: [
            { name: that.$lang('总运费') },
            { name: that.$lang('应收运费') },
            { name: that.$lang('COD') }
          ],
          textStyle: {
            color: '#61666d',
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: that.xAxisData,
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
            textStyle: {
              fontSize: 10
            }
          }
        },
        series: [
          {
            name: that.$lang('总运费'),
            type: 'line',
            data: that.totalFreight,
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
            smooth: true
          },
          {
            name: that.$lang('应收运费'),
            type: 'line',
            data: that.receivableFreight,
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
            smooth: true
          },
          {
            name: that.$lang('COD'),
            type: 'line',
            data: that.cod,
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
                    color: '#00C4B388' // 0% 处的颜色
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
            smooth: true
          }
        ]
      }
    }
  },
  data() {
    return {
      activeName: '7D',
      xAxisData: [],
      totalFreight: [],
      receivableFreight: [],
      cod: [],
      source: 'ALL',
      loading: false,
      isEmpty: false
    }
  },
  watch: {
    '$parent.$props.activeName': {
      handler(nval, oval) {
        this.source = nval
        this.activeName = '7D'
        this.handleClick()
      },
      // immediate: true,
      deep: true
    }
  },
  created() {
    this.handleClick()
  },
  mounted() {
    // 监听视窗改变及销毁
    this.$nextTick(() => {
      // 监听视窗改变及销毁
      this.weightFlowResize = debounce(this.$refs.CostAnalysis.resize, 400)
      window.addEventListener('resize', this.weightFlowResize, false)
      this.$on('hook:activated', () => {
        window.addEventListener('resize', this.weightFlowResize, false)
      })
      this.$on('hook:deactivated', () => {
        window.removeEventListener('resize', this.weightFlowResize, false)
      })
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('resize', this.weightFlowResize, false)
      })
    })
  },
  methods: {
    // 图表重绘
    chartResize(val) {
      this.$nextTick(() => {
        window.addEventListener('resize', this.weightFlowResize, false)
        this.$refs.CostAnalysis.resize()
      })
    },
    // 获取列表接口
    async handleClick() {
      this.loading = true
      const params = {
        cusCode: this.user.loginCode,
        days: this.activeName,
        source: this.source
      }
      try {
        const { data, code, msg } = await IndexReport.getCostData(params)
        if (code === RESPONSE_CODE.SUCCESS) {
          this.totalFreight = data.map(item => item.totalFreight)
          this.receivableFreight = data.map(item => item.receivableFreight)
          this.cod = data.map(item => item.cod)
          this.xAxisData = data.map(item => item.dayId)
        } else {
          this.$message.error(msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
      // 判断是否为空数据
      if (
        this.totalFreight.length === 0 &&
        this.receivableFreight.length === 0 &&
        this.cod.length === 0
      ) {
        this.isEmpty = true
      } else {
        this.isEmpty = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cost-analysis {
  // width: 830px;
  width: 100%;
  height: calc(100% - 60px);
  background: #ffffff;
  border-radius: 12px;
  .cost-analysis-canvas {
    position: relative;
    height: 360px;
    width: 100%;
    // margin-top: 28px;
  }
}
</style>

<style lang="scss">
.cost-analysis {
  .emptyContent {
    margin-top: -28px;
  }
}
</style>
