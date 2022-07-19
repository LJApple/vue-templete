/**
* @Description: Demo页面
* @author: name
* @Date: 2020-07-07
*/
<template>
  <div class="main-css">
<!--    头部高度配合fixHeight 使用-->
    <div style="height: 70px;background: greenyellow;">头部插槽</div>
    <avue-crud
        ref="params"
        :data="tableList"
        :page="page"
        :option="listOpt"
        @search-more-toggle="ccc"
        @search-change="searchChange"
    >
      <!--      searchExtend 插槽配合 option的 searchExtend: true 使用, -->
      <template slot="searchExtend">
        <div class="ibank-total-right">
          <div class="ibank-total-con">
            {{ $lang('searchExtend插槽') }}：<span class="ibank-total-num"></span>
          </div>
        </div>
      </template>
<!--      展开 收起 ----  searchMore 插槽配合 option的 searchMore: true 使用, -->
      <template slot="searchMore">
        <div class="ibank-total-right">
          <div class="ibank-total-con">
            {{ $lang('searchMore插槽') }}：<span class="ibank-total-num"></span>
          </div>
        </div>
      </template>
    </avue-crud>
  </div>
</template>

<script>
import mixin from '@/mixins/mixin'
export default {
  name: 'OrderEntry',
  mixins: [mixin],
  components: {},
  data() {
    return {
      isShowFirst: false,
      tableList: [
        {
          wayBillCode: 60,
          wayBillCode4: 66838
        },
        {
          wayBillCode: 60,
          wayBillCode4: 66838
        },
        {
          wayBillCode: 60,
          wayBillCode4: 66838
        }
      ]
    }
  },
  computed: {
    listOpt() {
      return {
        exportBtn: true, // 默认有导出本页 和 导出全部选项
        resetBtn: true,
        importBtn: true,
        fixHeight: 70,
        menuWidth: 100, // 操作宽度
        search: true, // 查询、清空按钮，默认展示在右边
        searchExtend: true, // 搜索条件与表格间的插槽
        searchMore: true, // 是否需要展开收起
        tableCustom: true, // 是否需要自定义列
        column: [
          {
            label: '运单号',
            prop: 'wayBillCode',
            search: true, // 搜索
            sort: 0
          },
          {
            label: '运单号2',
            prop: 'wayBillCode2',
            search: true, // 搜索
            sort: 0
          },
          {
            label: '运单号3',
            prop: 'wayBillCode3',
            search: true, // 搜索
            sort: 0
          },
          {
            label: '运单号4',
            prop: 'wayBillCode4',
            search: true, // 搜索
            sort: 0
          },
          {
            label: '运单号5',
            prop: 'wayBillCode5',
            search: true, // 搜索
            sort: 0
          },
          {
            label: '运单号6',
            prop: 'wayBillCode6',
            search: true, // 搜索
            sort: 0
          },
          {
            label: '运单号7',
            prop: 'wayBillCode7',
            search: true, // 搜索
            sort: 0
          },
          {
            label: '入库结束时间',
            prop: 'entryScanTimeE',
            search: true,
            type: 'datetime',
            disabled: true,
            viewDisplay: false, // 查看不显示
            searchClearable: false,
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            hide: true,
            sort: 11
          },
          {
            label: '入库结束时间',
            prop: 'entryScanTimeE',
            search: true,
            type: 'datetime',
            disabled: true,
            viewDisplay: false, // 查看不显示
            searchClearable: false,
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            hide: true,
            sort: 11
          },
          {
            label: '入库结束时间',
            prop: 'entryScanTimeE',
            search: true,
            type: 'datetime',
            disabled: true,
            viewDisplay: false, // 查看不显示
            searchClearable: false,
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            hide: true,
            sort: 11
          },
          {
            label: '入库结束时间',
            prop: 'entryScanTimeE',
            search: true,
            type: 'datetime',
            disabled: true,
            viewDisplay: false, // 查看不显示
            searchClearable: false,
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            hide: true,
            sort: 11
          },
          {
            label: '入库结束时间',
            prop: 'entryScanTimeE',
            search: true,
            type: 'datetime',
            disabled: true,
            viewDisplay: false, // 查看不显示
            searchClearable: false,
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            hide: true,
            sort: 11
          }
        ]
      };
    }
  },
  watch: {},
  created() {
  },
  methods: {
    ccc(state) {
      console.log(state, 'state')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
