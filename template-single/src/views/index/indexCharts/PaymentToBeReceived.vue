<!--
 * @Description: 统计代收货款
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-03 10:24:30
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-27 16:54:42
-->
<template>
  <div class="payment-to-be-received index-tab">
    <div class="title">
      <div class="title_text">{{ $lang('统计代收货款') }}</div>
      <div style="width:10px;height:10px"></div>
      <div class="title_time">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
          <el-tab-pane label="1D" name="1D"></el-tab-pane>
          <el-tab-pane label="7D" name="7D"></el-tab-pane>
          <el-tab-pane label="1M" name="1M"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="payment-to-be-received-canvas">
      <v-chart
        v-if="!loading && !isEmpty"
        :options="paymentToBeReceived"
        :autoresize="true"
        theme="maintheme"
        @dblclick="pieClick"
      ></v-chart>
      <BaseChartLoad :loading="loading" :empty="isEmpty" :emptyTitle="false" />
    </div>
  </div>
</template>

<script>
import { formatDate } from '@public/utils/common'
import dayjs from 'dayjs'
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
import mixin from './mixin'
export default {
  name: 'PaymentToBeReceived',
  mixins: [mixin],
  components: {
    'v-chart': ECharts,
    BaseChartLoad
  },
  computed: {
    ...mapGetters(['user']),
    paymentToBeReceived() {
      const that = this
      return {
        title: {
          zlevel: 0,
          text: that.totalPrice,
          subtext: that.$lang('总计'),
          top: '27%',
          left: '49%',
          textAlign: 'center',
          textStyle: {
            fontSize: 14,
            color: '#2B2D42',
            fontWeight: 700,
            marginTop: 0
          },
          subtextStyle: {
            fontSize: 12,
            color: '#61666D'
          }
        },
        tooltip: {
          trigger: 'item',
          // formatter: '{a} <br/>{b}: {c} ({d}%)',
          formatter: function (p) {
            return `${p.seriesName} <br/> ${p.name}: ${that.generatingThousandthPers(p.value)} (${p.percent}%)`
          },
          confine: true
        },
        legend: {
          show: true,
          orient: 'horizontal',
          bottom: 30,
          left: 'center',
          data: [that.$lang('未付'), that.$lang('已付')],
          icon: 'circle',
          itemGap: 20,
          textStyle: {
            fontSize: 10,
            color: '#61666d'
          }
        },
        // 拼接已付金额
        formatter(name) {
          const than = that.paymentToBeReceived.series[0].data // 获取series中的data
          let tarValue
          for (let i = 0; i < than.length; i++) {
            if (than[i].name === name) {
              tarValue = that.generatingThousandthPers(than[i].value)
              break
            }
          }
          const p = tarValue
          return name + ' ' + ' ' + 'RP ' + p
        },
        series: [
          {
            name: that.$lang('统计代收货款'),
            type: 'pie',
            radius: [58, 80],
            // center: ['22%', '50%'],
            bottom: 80,
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: that.pieData,
            hoverOffset: 5
          }
        ]
      }
    }
  },
  data() {
    return {
      activeName: '1D',
      totalPrice: 0,
      pieData: [],
      source: 'ALL',
      loading: false,
      isEmpty: false
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
      deep: true
    }
  },
  methods: {
    // 点击饼图
    pieClick(params) {
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
      let activeTab = 0;
      switch (params.name) {
        case this.$lang("已付"):
          activeTab = 3;
          break;
        default:
          break;
      }
      const query = {
        havCod: 1, // 代收货款：1-已付；2-未付
        activeTab,
        orderSource:
          this.source === 'ALL' ? [1, 2] : this.source === 'VIP' ? [1] : [2], // 订单来源：1-VIP；2-电商
        startTime: startTime,
        endTime: formatDate(new Date())
      }
      // if (params.name === this.$lang('未付')) {
      //   // 如果点击的未付
      //   query.havCod = [1]
      // } else {
      //   query.havCod = [2]
      // }
      this.$router.push({ name: 'orderManagement', query: query })
    },
    async handleClick() {
      this.loading = true
      const params = {
        cusCode: this.user.loginCode,
        days: this.activeName,
        source: this.source
      }
      try {
        const { data, code, msg } = await IndexReport.getCodData(params)
        if (code === RESPONSE_CODE.SUCCESS) {
          this.pieData = [
            {
              value: data.unpaid,
              name: this.$lang('未付')
            },
            { value: data.paid, name: this.$lang('已付') }
          ]
          const totalPrice = data.unpaid + data.paid
          this.totalPrice = this.generatingThousandthPers(totalPrice)
        } else {
          this.$message.error(msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
      if (this.pieData.length === 0) {
        this.isEmpty = true
      } else {
        this.isEmpty = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-to-be-received {
  // width: 546px;
  width: 100%;
  height: 340px;
  // margin-left: 21px;
  background: #fff;
  border-radius: 12px;
  .payment-to-be-received-canvas {
    position: relative;
    // width: 540px;
    height: calc(100% - 60px);
    // margin-top: -45px;
    .echarts {
      width: 100%;
      height: 250px;
    }
  }
}
</style>

<style lang="scss">
.payment-to-be-received {
  .emptyContent {
    margin-top: -28px;
  }
}
</style>
