<!--
 * @Description: TOP5目的地
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-03 11:34:13
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-18 15:25:33
-->
<template>
  <div class="TOP5destination index-tab">
    <div class="title">
      <div class="title_text">TOP5 {{ $lang('目的地') }}</div>
      <div style="width:10px;height:10px"></div>
      <div class="title_time">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="card">
          <el-tab-pane label="7D" name="7D"></el-tab-pane>
          <el-tab-pane label="1M" name="1M"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="TOP5destination-content">
      <el-table :data="tableList">
        <template slot="empty">
          <BaseChartLoad
            :loading="loading"
            :empty="isEmpty"
            :emptyTitle="false"
          />
        </template>
        <el-table-column :label="$lang('排名')" type="index" width="45"></el-table-column>
        <el-table-column
          :label="$lang('目的地')"
          prop="destination"
          width="98"
        >
          <template slot-scope="scope">
            <el-tooltip
              placement="top"
              v-model="scope.row.showTooltip"
              :open-delay="500"
              effect="dark"
              :disabled="!scope.row.showTooltip"
            >
              <div slot="content">{{ scope.row.destination }}</div>
              <div @mouseenter="showTips($event, scope.row)" class="myNote" v-html="newStr(scope.row.destination)">
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          :label="$lang('运单量')"
          prop="quantity"
          min-width="121"
        >
          <template slot-scope="{ row }">
            <!-- 大于三位数显示K -->
            <div class="row-border">
              <div
                class="row-center"
                :style="
                  row.quantity
                    ? 'width:' + (row.quantity / totalNum) * 100 + '%'
                    : ''
                "
              ></div>
            </div>
            <span class="row-number">{{row.quantity && row.quantity.toString().length > 3 ? (row.quantity / 1000).toFixed(2) + 'K' : row.quantity}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column>
          <template slot-scope="{ row }">
          </template>
        </el-table-column> -->
      </el-table>
      <BaseChartLoad :loading="loading" :emptyTitle="false" />
    </div>
  </div>
</template>

<script>
import BaseChartLoad from '@/components/base/BaseChartLoad.vue'
import { IndexReport } from '@/api'
import { RESPONSE_CODE } from '@public/http/config'
import { mapGetters } from 'vuex'
export default {
  name: 'TOP5destination',
  components: {
    BaseChartLoad
  },
  computed: {
    ...mapGetters(['user'])
  },
  data() {
    return {
      activeName: '7D',
      tableList: [],
      totalNum: 0,
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
      immediate: true,
      deep: true
    }
  },
  methods: {
    newStr(val) {
      const str = val.replace(/\s+/g, '<br/>')
      return `<span>${str}</span>`
    },
    async handleClick() {
      this.loading = true
      const params = {
        cusCode: this.user.loginCode,
        days: this.activeName,
        source: this.source
      }
      try {
        const { data, code, msg } = await IndexReport.getRankingData(params)
        if (code === RESPONSE_CODE.SUCCESS) {
          this.tableList = data
        } else {
          this.$message.error(msg)
        }
      } catch (error) {
        console.log(error)
      }
      if (this.tableList.length > 0) {
        this.totalNum = this.tableList[0].quantity
        this.isEmpty = false
      } else {
        this.isEmpty = true
      }
      this.loading = false
    },
    // 划过事件
    showTips(obj, row) {
      // obj为鼠标移入时的事件对象
      // currentWidth 为文本在页面中所占的宽度，创建标签，加入到页面，获取currentWidth ,最后在移除
      // const TemporaryTag = document.createElement('span')
      // // 用处理后的文字填充
      // TemporaryTag.innerText = this.newStr(row.destination)
      // TemporaryTag.className = 'getTextWidth'
      // document.querySelector('body').appendChild(TemporaryTag)
      // const currentWidth = document.querySelector('.getTextWidth').offsetWidth
      // document.querySelector('.getTextWidth').remove()
      // // cellWidth为表格容器的宽度
      // const cellWidth = obj.target.offsetWidth
      // // 当文本宽度小于||等于容器宽度两倍时，代表文本显示未超过两行
      // currentWidth <= 2 * cellWidth
      //   ? (row.showTooltip = false)
      //   : (row.showTooltip = true)
      const str = this.newStr(row.destination)
      // 如果没有<br/>，长度是1，超过包含两个，长度等于或大于3
      if (str && str.split('<br/>').length >= 3) {
        row.showTooltip = true
      } else {
        row.showTooltip = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.TOP5destination {
  // width: 546px;
  width: 100%;
  height: 480px;
  // margin-left: 20px;
  background: #fff;
  border-radius: 12px;
  .TOP5destination-content {
    position: relative;
    margin: -10px 16px 16px;
  }
  .row-number{
    width: 60px;
    padding-left: 10px;
    display: inline-block;
  }
  .row-border {
    display: inline-block;
    width: calc(100% - 70px);
    .row-center {
      background: linear-gradient(270deg, #fa4a64, #f32434);
      // width: 20%;
      height: 6px;
      border-radius: 3px;
    }
  }
}
@media screen and (max-width: 1366px) {
  .TOP5destination{
    height: 330px;
  }
}
</style>

<style lang="scss">
.TOP5destination {
  .el-table .el-table__header tr,
  .el-table .el-table__header td,
  .el-table .el-table__header th {
    background: #fff !important;
    font-size: 12px;
    .cell{
      color: #9499A3;
    }
  }
  .el-table .el-table__header th{
    padding: 10px 0;
  }
  .el-table__empty-block{
    height: 360px !important;
  }
  .el-table .cell, .el-table--border td:first-child .cell, .el-table--border th:first-child .cell{
    padding-left: 0;
  }
  .el-table td, .el-table th{
    padding: 2px 0;
  }
  .el-table .cell {
    line-height: 1 !important;
  }
  tbody {
    overflow: hidden;
    tr {
      height: 63px;
    }
  }
  .emptyContent {
    margin-top: -28px;
  }
  .el-table__empty-block {
    width: 100%;
    min-height: 20px;
  }
  .myNote {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    padding: 2px;
  }
}
@media screen and (max-width: 1366px) {
  .TOP5destination{
    tbody{
      tr {
        height: 46px;
      }
    }
    .el-table__empty-block{
      height: 230px !important;
    }
  }
}
</style>
