<!--
 * @Description: tab内部
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-02 17:46:25
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-15 17:06:36
-->
<template>
  <div id="indexContent">
    <div class="top">
      <div class="index-content__child">
        <StatusCharts />
      </div>
      <div class="index-content__child">
        <PaymentToBeReceived />
      </div>
      <div class="index-content__child">
        <WaybillGrowth />
      </div>
    </div>
    <div class="middle">
      <div class="index-content__child">
        <MapDistribution />
      </div>
      <div class="index-content__child">
        <TOP5destination />
      </div>
    </div>
    <div class="bottom">
      <div class="index-content__child">
        <CostAnalysis />
      </div>
      <div class="index-content__child">
        <BillingManagement />
      </div>
    </div>
  </div>
</template>

<script>
import StatusCharts from '@/views/index/indexCharts/StatusCharts.vue'
import WaybillGrowth from '@/views/index/indexCharts/WaybillGrowth.vue'
import PaymentToBeReceived from '@/views/index/indexCharts/PaymentToBeReceived.vue'
import MapDistribution from '@/views/index/indexCharts/MapDistribution.vue'
import TOP5destination from '@/views/index/indexCharts/TOP5destination.vue'
import CostAnalysis from '@/views/index/indexCharts/CostAnalysis.vue'
import BillingManagement from '@/views/index/indexCharts/BillingManagement.vue'
export default {
  name: 'IndexContent',
  components: {
    StatusCharts,
    WaybillGrowth,
    PaymentToBeReceived,
    MapDistribution,
    TOP5destination,
    CostAnalysis,
    BillingManagement
  },
  props: {
    activeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.index-content__child{
  border: 1px solid #E8E8E8;
  border-radius: 4px;
    box-sizing: border-box;
}
.top {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  .index-content__child {
    width: calc((100% - 30px) / 3);
  }
}
.middle {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 20px;
  .index-content__child:first-child {
    flex: 1;
  }
  .index-content__child:last-child {
    width: calc((100% - 30px) / 3);
    margin-left: 15px;
  }
}
.bottom {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .index-content__child {
    width: calc(50% - 8px);
  }
}

</style>

<style lang="scss">
@import "./style/indexCommonStyle.scss";
#indexContent{
  .index-content__child{
    .el-tabs.el-tabs--card
      .el-tabs__header
      .el-tabs__nav-wrap
      .el-tabs__nav-scroll
      .el-tabs__nav
      .el-tabs__item.is-active {
      background: #e60012;
      color: $-color-white;
    }
    .el-tabs.el-tabs--card
      .el-tabs__header
      .el-tabs__nav-wrap
      .el-tabs__nav-scroll
      .el-tabs__nav
      .el-tabs__item:first-child.is-active{
        margin-left: -1px;
      }
    .el-tabs.el-tabs--card
      .el-tabs__header
      .el-tabs__nav-wrap
      .el-tabs__nav-scroll
      .el-tabs__nav
      .el-tabs__item:last-child.is-active{
        margin-right: -1px;
      }
    .el-tabs__item{
      font-size: 14px;
    }
  }
}
</style>
