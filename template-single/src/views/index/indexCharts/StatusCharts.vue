<!--
 * @Description: 状态
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-02 18:13:02
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-02-11 18:26:49
-->
<template>
  <div class="status index-tab">
    <!-- 状态 -->
    <div class="title">
      <div class="title_text">{{ $lang('状态圆图表') }}</div>
      <!-- <div style="width:10px;height:10px"></div> -->
      <div class="title_time">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
          <el-tab-pane label="1D" name="1D"></el-tab-pane>
          <el-tab-pane label="7D" name="7D"></el-tab-pane>
          <el-tab-pane label="1M" name="1M"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="status-canvas">
      <BaseChartLoad :loading="loading" :empty="isEmpty" :emptyTitle="false" />
      <v-chart v-if="!loading && !isEmpty" :options="polar" :autoresize="true" theme="maintheme" @dblclick="goManagement"></v-chart>
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
import 'echarts/lib/component/title'
import { mapGetters } from 'vuex'
import { formatDate } from '@public/utils/common'
import dayjs from 'dayjs'
import mixin from './mixin'
export default {
  name: 'StatusCharts',
  mixins: [mixin],
  components: {
    'v-chart': ECharts,
    BaseChartLoad,
  },
  computed: {
    ...mapGetters(['user']),
    polar() {
      const that = this
      return {
        title: {
          zlevel: 0,
          text: that.totalNumber,
          subtext: that.$lang('总计'),
          top: '27%',
          left: '49%',
          textAlign: 'center',
          textStyle: {
            fontSize: 14,
            color: '#2B2D42',
            fontWeight: 700,
            marginTop: 0,
          },
          subtextStyle: {
            fontSize: 12,
            color: '#61666D',
          },
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{a} <br/>{b}: {c} ({d}%)',
          formatter: function (p) {
            return `${p.seriesName}<br/>${p.name}: ${that.generatingThousandthPers(p.value)} (${p.percent}%)`
          },
          confine: true,
        },
        legend: [
          {
            bottom: 0,
            orient: "vertical",
            data: [that.$lang('待取件'), that.$lang('寄件中'), that.$lang('已签收')],
            icon: 'circle',
            right: '51%',
            itemGap: 20,
            width: '40%',
            textStyle: {
              fontSize: 10,
              color: '#61666d',
            },
          },
          {
            bottom: 35,
            left: '50%',
            orient: "vertical",
            data: [that.$lang('已退件'), that.$lang('已作废')],
            icon: 'circle',
            itemGap: 20,
            width: '50%',
            textStyle: {
              fontSize: 10,
              color: '#61666d',
            },
          }
        ],
        // 拼接状态对应值
        formatter(name) {
          const than = that.polar.series[0].data // 获取series中的data
          let tarValue
          for (let i = 0; i < than.length; i++) {
            if (than[i].name === name) {
              tarValue = that.generatingThousandthPers(than[i].value)
              break
            }
          }
          const p = tarValue
          return name + ' ' + '  ' + p
        },
        series: [
          {
            name: that.$lang('状态圆图表'),
            type: 'pie',
            radius: [58, 80],
            // center: ['22%', '50%'],
            bottom: 100,
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '30',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: that.statusData,
            hoverOffset: 5,
          },
        ],
      }
    },
    turnThousand() {
      return value => {
        return (value / 1000).toFixed(2)
      }
    },
  },
  data() {
    return {
      activeName: '1D',
      totalNumber: 300,
      statusData: [],
      source: 'ALL',
      loading: false,
      isEmpty: false,
    }
  },
  watch: {
    '$parent.$props.activeName': {
      handler(nval, oval) {
        this.source = nval
        this.activeName = '1D'
        this.handleClick()
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    async handleClick() {
      this.loading = true
      const params = {
        cusCode: this.user.loginCode,
        days: this.activeName,
        source: this.source,
      }
      try {
        const { data, code, msg } = await IndexReport.getStatusData(params)
        if (code === RESPONSE_CODE.SUCCESS) {
          const objNum = Object.values(data).filter(value => {
            return typeof value === 'number'
          })
          const totalNumber = objNum.reduce((total, value) => {
            return total + value
          })
          this.totalNumber = this.generatingThousandthPers(totalNumber)
          this.statusData = [
            { value: data.pending, name: this.$lang('待取件') },
            { value: data.got, name: this.$lang('寄件中') },
            { value: data.signing, name: this.$lang('已签收') },
            { value: data.returned, name: this.$lang('已退件') },
            { value: data.invalid, name: this.$lang('已作废') },
          ]
        } else {
          this.$message.error(msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
      if (this.statusData.length === 0) {
        this.isEmpty = true
      } else {
        this.isEmpty = false
      }
    },
    goManagement(params) {
      let activeTab
      switch (params.name) {
        case this.$lang('待取件'):
          activeTab = 1
          break
        case this.$lang('寄件中'):
          activeTab = 2
          break
        case this.$lang('已签收'):
          activeTab = 3
          break
        case this.$lang('已退件'):
          activeTab = 4
          break
        case this.$lang('已作废'):
          activeTab = 5
          break
        default:
          break
      }
      let startTime
      const nowTime = new Date().getTime()
      if (this.activeName === '1D') {
        startTime = formatDate(new Date())
      } else if (this.activeName === '7D') {
        // 开始时间：当前时间-6天
        startTime = dayjs(nowTime - 3600 * 24 * 1000 * 6).format('YYYY-MM-DD')
      } else {
        // 开始时间：当前时间-29天
        startTime = dayjs(nowTime - 3600 * 24 * 1000 * 29).format('YYYY-MM-DD')
      }
      const query = {
        activeTab,
        orderSource: this.source === 'ALL' ? [1, 2] : this.source === 'VIP' ? [1] : [2], // 订单来源：1-VIP；2-电商
        startTime: startTime,
        endTime: formatDate(new Date()),
      }
      this.$router.push({ name: 'orderManagement', query: query })
    },
  },
}
</script>

<style lang="scss" scoped>
.status {
  // width: 546px;
  width: 100%;
  height: 340px;
  background: #fff;
  border-radius: 12px;
  .status-canvas {
    // width: 540px;
    height: calc(100% - 60px);
    position: relative;
    .echarts {
      width: 100%;
      height: 270px;
    }
  }
}
</style>

<style lang="scss">
.status {
  .emptyContent {
    margin-top: -28px;
  }
}
</style>
