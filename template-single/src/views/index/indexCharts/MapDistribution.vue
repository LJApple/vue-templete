<!--
 * @Description: 运单量地图分布图
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-03 11:27:06
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-02-14 17:51:08
-->
<template>
  <div class="map-distribution index-tab">
    <div class="title">
      <div class="title_text">{{ $lang('运单量地图分布图') }}</div>
      <div style="width: 10px; height: 10px"></div>
      <div class="title_time">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
          <el-tab-pane label="1D" name="1D"></el-tab-pane>
          <el-tab-pane label="7D" name="7D"></el-tab-pane>
          <el-tab-pane label="1M" name="1M"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="map-distribution__canvas">
      <template v-if="!loading && !isEmpty">
        <v-chart :options="mapDistribution" :autoresize="true" class="map-distribution__chart" theme="maintheme"></v-chart>
        <div class="map-distribution__calibration">
          <p v-for="(item, index) in calibrations(total)" :key="index">
            {{ item }}
          </p>
        </div>
      </template>
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
import $echarts from 'echarts'
import cqmap from '../map/idnMap'
import 'echarts/lib/chart/map'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import { mapGetters } from 'vuex'
import mixin from './mixin'
export default {
  name: 'MapDistribution',
  components: {
    'v-chart': ECharts,
    BaseChartLoad,
  },
  mixins: [mixin],
  computed: {
    ...mapGetters(['user']),
    mapDistribution() {
      const that = this
      return {
        tooltip: {
          trigger: 'item',
          // formatter: '{b}<br /> {c}'
          formatter: params => {
            return `<span style="font-size:14px">${params.name}</span><br />${that.$lang('运单量')}: ${params.data ? that.generatingThousandthPers(params.data.value) : 0}`
          },
        },
        grid: {
          top: '100%',
        },
        visualMap: {
          min: 0,
          max: that.total,
          inRange: {
            color: ['#ACCEFF', '#3369F5'],
          },
          itemWidth: 12,
          itemHeight: 332,
          right: 0,
          top: 3,
          formatter: function (value) {
            return that.generatingThousandthPers(parseFloat(value).toFixed(2)) // 范围标签显示内容。
          },
        },
        series: [
          {
            type: 'map',
            mapType: 'Idn', // 自定义扩展图表类型
            data: that.mapData,
            // 自定义名称映射
            nameMap: {},
            zoom: 1.1,
            top: 15,
            bottom: 20,
            left: '7%',
            right: '7.5%',
          },
        ],
      }
    },
    // 平分刻度
    calibrations() {
      const that = this
      return total => {
        if (total < 4) {
          return Array.from({ length: total }, (x, i) => total - i)
        }
        const calibrationList = []
        const avg = Math.floor(total / 4)
        for (var i = 0; i < 5; i++) {
          const num = that.outputdollars(avg * i)
          calibrationList.unshift(num)
        }
        return calibrationList
      }
    },
    // 逗号分隔数值
    outputdollars() {
      return number => {
        if (number.length <= 3) return number === '' ? '0' : number
        else {
          const strNumBer = number.toString()
          var mod = strNumBer.length % 3
          var output = mod === 0 ? '' : strNumBer.substring(0, mod)
          for (var i = 0; i < Math.floor(strNumBer.length / 3); i++) {
            if (mod === 0 && i === 0) {
              output += strNumBer.substring(mod + 3 * i, mod + 3 * i + 3)
            } else {
              output += ',' + strNumBer.substring(mod + 3 * i, mod + 3 * i + 3)
            }
          }
          return output
        }
      }
    },
  },
  data() {
    return {
      activeName: '1D',
      total: 0,
      mapData: [],
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
  created() {
    $echarts.registerMap('Idn', cqmap)
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
        const { data, code, msg } = await IndexReport.getDistributionData(params)
        if (code === RESPONSE_CODE.SUCCESS) {
          this.mapData = data.map(item => {
            return { name: item.province, value: item.quantity }
          })
        } else {
          this.$message.error(msg)
        }
      } catch (error) {
        console.log(error)
      }
      if (this.mapData.length === 0) {
        this.isEmpty = true
      } else {
        this.isEmpty = false
        const sortData = this.mapData.sort((a, b) => {
          return b.value - a.value
        })
        this.total = sortData[0].value
      }
      this.loading = false
    },
  },
}
</script>

<style lang="scss" scoped>
.map-distribution {
  // width: 1113px;'
  width: 100%;
  height: 480px;
  background: #ffffff;
  border-radius: 12px;
  .map-distribution__canvas {
    width: 100%;
    height: 410px;
    position: relative;
    // margin-top: -20px;
    .echarts {
      width: 100%;
      height: 100%;
    }
    .map-distribution__chart,
    .map-distribution__calibration {
      float: left;
    }
    .map-distribution__chart {
      width: calc(100% - 100px);
    }
    .map-distribution__calibration {
      margin-left: 10px;
      width: 90px;
      height: 342px;
      // margin-top: 29px;
      color: #333;
      p {
        padding: 0;
        font-size: 14px;
        margin-bottom: 62px;
      }
      p:last-child {
        margin-bottom: 0;
      }
    }
  }
}
@media screen and (max-width: 1366px) {
  .map-distribution {
    height: 330px;
    .map-distribution__canvas {
      height: 254px;
      .map-distribution__calibration {
        height: 269px;
        p {
          font-size: 12px;
          margin-bottom: 45px;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.map-distribution {
  .emptyContent {
    margin-top: -28px;
  }
}
</style>
