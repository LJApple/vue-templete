<template>
  <div :class="b()">
    <!-- 头部组件 -->
    <!-- <header-title ref="headerTitle" id="jmsTitle" v-show="printKey && vaildData(tableOption.header,true)"></header-title> -->

    <!-- 顶部操作栏 -->
    <div :class="b('menu')" class="top-menu" id="jmsTopMenu">
      <!-- 顶部操作栏左  -->
      <!-- TODO permission鉴权要不要在组件里 因为这会触发一个bug 同一个路由多个crud实例 会导致权限篡乱 目前没有这样式情况 但是这不合理-->
      <div :class="b('left')">
        <slot name="menuLeftPre"></slot>
        <el-button type="info" @click="importExcel" :size="isMediumSize" v-if="vaildData(tableOption.importBtn, false)">{{ $lang("导入") }}</el-button>
        <el-button
          type="info"
          @click="rowAdd"
          :size="isMediumSize"
          :disabled="tableOption.addDisabled"
          class="btn-query"
          v-if="vaildData(tableOption.addBtn, false) && permission[$route.name + '_ADD' + vaildData(tableOption.perSuffix, '')]"
          >{{ $lang("新增") }}</el-button
        >
        <el-button
          type="info"
          @click="deleteRows"
          :size="isMediumSize"
          :loading="tableOption.deleteLoading"
          :disabled="vaildData(tableOption.deleteDisabled, !tableSelect.length)"
          v-if="vaildData(tableOption.deleteBtn, false) && permission[$route.name + '_DELETE' + vaildData(tableOption.perSuffix, '')]"
          >{{ $lang("删除") }}</el-button
        >
        <el-dropdown
          placement="bottom-start"
          class="output-style"
          trigger="click"
          v-if="vaildData(tableOption.exportBtn, false) && permission[$route.name + '_EXCEL' + vaildData(tableOption.perSuffix, '')]"
          @command="selectExport"
        >
          <el-button type="info" style="color: #e60012; border-color: #e60012" :size="isMediumSize" :loading="exportLoading"
            >{{ $lang("导出") }}
            <i class="el-icon-arrow-down el-icon--right" style="color: #e60012"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" class="output-more">
            <el-dropdown-item :command="$lang('此页导出')">{{ $lang("此页导出") }}</el-dropdown-item>
            <el-dropdown-item :command="$lang('全页导出')">{{ $lang("全页导出") }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="info" @click="exportExcelAll" :size="isMediumSize" :loading="exportLoading" v-if="vaildData(tableOption.exportAllBtn, false)">{{
          $lang("导出全部")
        }}</el-button>
        <el-button type="info" @click="chartModel" :size="isMediumSize" v-if="vaildData(tableOption.chartBtn, false)">{{ $lang("图表模式") }}</el-button>
        <slot name="menuLeft"></slot>
      </div>
    </div>

    <!-- 搜索组件 -->
    <header-search v-model="searchForm" id="jmsSearch" ref="headerSearch" v-show="printKey" v-if="vaildData(tableOption.search, true)">
      <template slot-scope="searchForm" slot="headerSearchSlot" v-if="tableOption.headerSearchslot">
        <slot name="headerSearch" :data="searchForm"></slot>
      </template>
      <template slot-scope="{ value, column, dic, size, label, disabled }" v-for="item in searchOption" :slot="item.prop + 'Search'">
        <slot
          :name="item.prop + 'Search'"
          v-if="item.searchslot"
          :value="value"
          :column="column"
          :dic="dic"
          :size="size"
          :label="label"
          :disabled="disabled"
          :form="searchForm"
        ></slot>
      </template>
      <template slot="search">
        <slot name="search"></slot>
      </template>
      <template slot="searchMenu">
        <slot name="searchMenu"></slot>
      </template>
      <template slot="menuRight" slot-scope="scope">
        <template v-if="vaildData(tableOption.searchExpand, true)"> </template>
        <div :class="{ 'query-box': vaildData(tableOption.search, true) }">
          <slot name="menuRight" v-bind="scope"></slot>
          <el-button @click="searchMoreToggle" type="text" class="toggle" v-if="vaildData(tableOption.searchMore, false)">
            <span>{{ $lang(searchShow ? "收起" : "展开") }}</span>
            <span class="el-icon-caret-bottom arrow" :class="{ expaned: searchShow, unexpaned: !searchShow }"></span>
          </el-button>
          <el-button type="primary" @click="searchChange" :size="isMediumSize" class="btn-query-right" v-if="vaildData(tableOption.search, true)">{{ $lang("查询") }}</el-button>
          <el-button type="info" @click="searchReset" :size="isMediumSize" class="btn-query-right" v-if="vaildData(tableOption.search, true)">{{ $lang("清空") }}</el-button>
        </div>
      </template>
    </header-search>

    <!-- 表格中间插槽 -->
    <div id="jmsMenu" class="jms-table-menu" v-if="tableOption.tableHeader">
      <slot name="tableHeader"></slot>
    </div>
    <!-- 头部选择项展示 -->
    <div class="avue-crud__tip" id="jmsTip" v-if="tableOption.tip && tableOption.selection">
      <span class="avue-crud__tip-name">
        {{ $lang("已选择") }}
        <span class="avue-crud__tip-count">{{ selectLen }}</span>
        {{ $lang("项") }}
      </span>
      <el-button type="text" size="small" @click="selectClear" v-if="tableOption.selectClearBtn && tableOption.selection">{{ $lang("清空") }} </el-button>
      <slot name="tip"></slot>
    </div>
    <div class="avue-crud__searchExtend avue-crud__searchMore" ref="searchMore" id="jmsSearchMore" v-if="vaildData(tableOption.searchMore, false) && tableOption.searchMore">
      <slot name="searchMore"></slot>
    </div>
    <div class="avue-crud__searchExtend" id="jmsSearchExtend" v-if="vaildData(tableOption.searchExtend, false)">
      <slot name="searchExtend"></slot>
    </div>
    <!--    表格自定义筛选-->
    <div class="avue-crud__searchExtend avue-crud__tableCustom" id="jmsTableCustom" v-if="vaildData(tableOption.tableCustom, false)">
      <custom-column ref="customColumn"></custom-column>
    </div>

    <!-- 表格主体 -->
    <el-table
      v-if="doLayout"
      v-show="!tableOption.tableHide"
      ref="table"
      highlight-current-row
      v-loading="tableLoading"
      :data="vaildData(tableOption.isFilterData, false) ? filterList : list"
      v-el-table-infinite-scroll="load"
      :select-on-indeterminate="false"
      :row-key="handleGetRowKeys"
      :size="controlSize"
      :border="vaildData(tableOption.border, config.border)"
      :expand-row-keys="tableOption.expandRowKeys"
      :default-expand-all="tableOption.defaultExpandAll"
      :show-summary="tableOption.showSummary"
      :summary-method="tableSummaryMethod"
      :span-method="tableSpanMethod"
      :stripe="tableOption.stripe"
      :selectable="tableOption.selectable"
      :show-header="tableOption.showHeader"
      :default-sort="tableOption.defaultSort"
      :row-class-name="rowClassName || rowDefaultClassName"
      :cell-class-name="cellClassName"
      :header-cell-class-name="headerCellClassName"
      :max-height="tableOption.maxHeight"
      :height="tableOption.tableHeight || tableHeight - (tableOption.fixHeight + 10 || 10)"
      :width="setPx(tableOption.width, config.width)"
      @current-change="currentRowChange"
      @expand-change="expandChange"
      @row-click="rowClick"
      @row-dblclick="rowDblclick"
      @cell-mouse-enter="cellMouseEnter"
      @cell-mouse-leave="cellMouseLeave"
      @cell-click="cellClick"
      @cell-dblclick="cellDblclick"
      @selection-change="selectionChange"
      @select="select"
      @select-all="selectAll"
      @sort-change="sortChange"
    >
      <!-- 暂无数据提醒 -->
      <template slot="empty">
        <div :class="b('empty')">
          <!-- 判断是否存在name=empty的插槽 -->
          <slot name="empty" v-if="$slots.empty"></slot>
          <!-- 不存在name=empty插槽 -->
          <template v-else>
            <!-- 区分loading状态以及异常状态 loading -->
            <avue-empty
              :loadingState="2"
              size="200"
              image="data:image/png;base64,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"
              :desc="tableOption.emptyText || $lang('暂无数据')"
            ></avue-empty>
          </template>
        </div>
      </template>

      <!-- 表格展开列  -->
      <el-table-column type="expand" width="60" align="center" fixed="left" v-if="tableOption.expand">
        <template slot-scope="props">
          <slot :row="props.row" name="expand"></slot>
        </template>
      </el-table-column>
      <!-- 选择框 -->
      <el-table-column
        v-if="tableOption.selection"
        type="selection"
        :width="tableOption.showSummary ? 70 : 50"
        fixed="left"
        align="center"
        :selectable="tableOption.selectable"
        :reserve-selection="vaildData(tableOption.reserveSelection, false)"
      >
      </el-table-column>

      <!-- 序号 -->
      <el-table-column
        v-if="this.vaildData(tableOption.index, true)"
        type="index"
        width="60"
        fixed="left"
        align="center"
        :label="$lang(tableOption.indexLabel || config.indexLabel)"
        :index="indexMethod"
      ></el-table-column>

      <!-- 占位符号解决ele问题 -->
      <!-- <el-table-column width="0px" v-show="false"></el-table-column> -->

      <!-- 占位列解决ele固定列导致的问题 -->
      <el-table-column width="1px" v-show="false" class-name="jms-hidden-column leave-alone"></el-table-column>

      <!-- 表格所有列 -->
      <template v-for="column in tableColumn">
        <column :column="column" :key="`${column.prop}`" v-if="!column.hide">
          <!-- 每列的自定义slot -->
          <template v-for="item in propOption" slot-scope="scope" :slot="item.prop">
            <slot :row="scope.row" :dic="scope.dic" :index="scope.index" :size="scope.size" :label="scope.label" :name="item.prop"></slot>
          </template>
        </column>
      </template>

      <!-- 操作列 -->
      <el-table-column
        fixed="right"
        :label="$lang(tableOption.rightTitle || '操作')"
        v-if="vaildData(tableOption.menu, config.menu) && isMenuShow"
        :header-align="tableOption.menuheaderAlign || config.menuheaderAlign"
        :width="isMobile ? tableOption.menuXsWidth || config.menuXsWidth : tableOption.menuWidth || config.menuWidth"
      >
        <template slot="header" v-if="vaildData(tableOption.menu, config.menu) && tableOption.dynamicOptions">
          <div class="operate-column">
            <span>{{ $lang("操作") }}</span>
            <el-button icon="iconfont iconshaixuan filter" type="text" @click="openDynamicDialog"></el-button>
          </div>
        </template>
        <template slot-scope="{ row, $index, dic, label }">
          <template v-if="['button', 'text', 'icon'].includes(menuType)">
            <!-- 行内编辑保存按钮 -->
            <el-button
              type="text"
              :size="isMediumSize"
              :disabled="btnDisabled"
              @click.stop="rowCell(row, $index)"
              :title="$lang('保存')"
              v-if="tableOption.cellBtn && permission[$route.name + '_EDIT' + vaildData(tableOption.perSuffix, '')]"
              >{{ $lang("保存") }}
            </el-button>
            <!-- 行内编辑取消按钮 -->
            <el-button
              type="text"
              :size="isMediumSize"
              :disabled="btnDisabled"
              @click.stop="rowCanel(row, $index)"
              :title="$lang('取消')"
              v-if="row.$cellEdit && tableOption.cancelBtn"
              >{{ $lang("取消") }}</el-button
            >

            <!-- 查看按钮 -->
            <el-button
              type="text"
              :size="isMediumSize"
              :disabled="tableOption.viewDisabled"
              icon="iconfont icon-icon_chakan"
              :class="{ 'icon-btn-disabled': tableOption.viewDisabled }"
              @click.stop="view(row, $index)"
              :title="$lang('查看')"
              v-if="tableOption.viewBtn !== false && permission[$route.name + '_DETAIL' + vaildData(tableOption.perSuffix, '')]"
            >
            </el-button>

            <!-- 编辑按钮 -->
            <el-button
              type="text"
              :size="isMediumSize"
              :disabled="tableOption.editDisabled"
              icon="iconfont icon-icon_bianji"
              :class="{ 'icon-btn-disabled': tableOption.editDisabled }"
              @click.stop="rowEdit(row, $index)"
              :title="$lang('编辑')"
              v-if="tableOption.editBtn !== false && permission[$route.name + '_EDIT' + vaildData(tableOption.perSuffix, '')]"
            >
            </el-button>

            <!-- 删除按钮 -->
            <el-button
              type="text"
              :size="isMediumSize"
              :disabled="tableOption.delDisabled"
              icon="iconfont icon-icon_shanchu"
              :class="{ 'icon-btn-disabled': tableOption.delDisabled }"
              @click.stop="rowDel(row, $index)"
              :title="$lang('删除')"
              v-if="tableOption.delBtn !== false && permission[$route.name + '_DELETE' + vaildData(tableOption.perSuffix, '')]"
            ></el-button>
          </template>

          <el-dropdown v-else-if="menuType === 'menu'" style="margin-right: 9px">
            <el-button type="primary" :size="isMediumSize">
              {{ $lang("更多") }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="tableOption.viewBtn !== false && permission[$route.name + '_DETAIL' + vaildData(tableOption.perSuffix, '')] && row.$view !== false"
                @click.native="rowView(row, $index)"
                >{{ $lang("查看") }}</el-dropdown-item
              >
              <el-dropdown-item
                divided
                v-if="tableOption.editBtn !== false && permission[$route.name + '_EDIT' + vaildData(tableOption.perSuffix, '')] && row.$edit !== false"
                @click.native="rowEdit(row, $index)"
              >
                {{ $lang("编辑") }}</el-dropdown-item
              >
              <el-dropdown-item
                divided
                v-if="tableOption.delBtn !== false && permission[$route.name + '_DELETE' + vaildData(tableOption.perSuffix, '')] && row.$delete !== false"
                @click.native="rowDel(row, $index)"
                >{{ $lang("删除") }}</el-dropdown-item
              >
              <slot name="menuBtn" :row="row" :dic="dic" :label="label" :index="$index"></slot>
            </el-dropdown-menu>
          </el-dropdown>
          <slot name="menu" :row="row" :disabled="btnDisabled" :size="isMediumSize" :index="$index"></slot>
        </template>
      </el-table-column>
      <el-table-column v-if="tableOption.dynamicOptions && !vaildData(tableOption.menu, config.menu)" align="center" width="30" fixed="right">
        <template slot="header">
          <el-button style="margin-left: -5px" icon="iconfont iconshaixuan filter" type="text" @click="openDynamicDialog"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <table-page ref="tablePage" id="jmsPagination" v-show="printKey && tableOption.pagination !== false"></table-page>

    <!-- 表单 -->
    <dialog-form ref="dialogForm" :class="dialogClass" :columnFormOption="columnFormOption" v-model="tableForm" v-if="(tableOption.customAdd || tableOption.customEdit) !== true">
      <template slot-scope="{ value, column, dic, size, label, disabled }" v-for="item in columnFormOption" :slot="item.prop">
        <slot
          :value="value"
          :column="column"
          :dic="dic"
          :size="size"
          :label="label"
          :disabled="disabled"
          :row="tableForm"
          :index="tableIndex"
          :name="item.prop + 'Form'"
          v-if="item.formslot"
        ></slot>
      </template>
      <template slot-scope="{ tableForm, boxType, size }" slot="menuForm">
        <slot name="menuForm" :size="size" :type="boxType"></slot>
      </template>
    </dialog-form>

    <!-- 查看弹窗 -->
    <el-dialog
      ref="dialogView"
      :open="viewOpen"
      lock-scroll
      v-if="tableOption.customView !== true"
      :custom-class="vaildData(tableOption.customClass, config.customClass)"
      :fullscreen="tableOption.dialogFullscreen"
      :modal-append-to-body="false"
      :append-to-body="true"
      :close-on-press-escape="tableOption.dialogEscape"
      :close-on-click-modal="false"
      :title="tableOption.viewTitle || functionName + $lang('详情')"
      :modal="tableOption.dialogModal"
      :show-close="tableOption.dialogCloseBtn"
      :visible.sync="viewVisible"
      :width="tableOption.dialogWidth || '712px'"
      @close="closeViewDialog"
    >
      <div :style="{ height: dialogHeight, overflow: 'unset' }" ref="content" v-loading="dialogLoading">
        <el-scrollbar style="height: 100%">
          <div :class="b('dialog', ['overflow'])">
            <avue-detail v-model="viewData" :option="this.tableOption" v-if="viewVisible" :styleType="'noBorder'">
              <!-- 渲染查看插槽 viewslot  -->
              <template v-for="item in columnOption">
                <template :slot="item.prop + 'View'" v-if="item.viewslot">
                  <slot :data="viewData[item.prop]" :row="viewData" :name="item.prop + 'View'"></slot>
                </template>
              </template>
            </avue-detail>
          </div>
        </el-scrollbar>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button :size="controlSize" @click="closeViewDialog">{{ $lang("关闭") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import create from "../../core/create";
import init from "../../core/crud/init.js";
import tablePage from "./table-page";
import headerSearch from "./header-search";
import column from "./column-new";

import dialogForm from "./dialog-form";
import config from "./config.js";
import treeToArray, { addAttrs } from "../../core/crud/eval";
import { calcCascader } from "../../core/common/dataformat";
import customColumn from "./custom-column";
// 导入
import elTableInfiniteScroll from "./table-infinite-scroll";
import server from "../../core/crud/pool.js";
import { RESPONSE_CODE } from "@public/http/config";
import fetch from "@public/http/request";
import remove from "lodash/remove";
import forEach from "lodash/forEach";
import qs from "qs";
import Sortable from "sortablejs";
export default create({
  name: "crud",
  mixins: [init("crud")],
  provide() {
    return {
      crud: this,
    };
  },
  directives: {
    "el-table-infinite-scroll": elTableInfiniteScroll,
  },
  components: {
    column,
    tablePage, // 分页
    headerSearch, // 搜索
    customColumn, // 显隐列
    // dragColumn,
    dialogForm, // 分页,
  },
  data() {
    return {
      config,
      functionName: "", // 当前模块的名字
      treeProp: "", // tree的字段
      boxType: "add", // 弹窗类型
      tableIndex: -1, // 当前处理行的索引
      doLayout: false, // 是否显示表格
      keyBtn: false, // 是否显示表格
      isChild: false, // 是否包含子集
      viewVisible: false, // 查看可见
      columnConfVisible: false, // 查看可见
      printKey: true,
      dialogLoading: false, // 弹窗loading
      list: [], // 表格展示的数据
      expandList: [], // 展开的列
      formIndexList: [],
      tableSelect: [], // 已选中的数据
      sumsList: [], // 求和项
      dynamicColumns: [], // 动态列配置项
      searchOption: [], // 搜索的配置
      tableColumn: [], // 表格列配置
      tableForm: {}, // 弹窗表单
      searchForm: {}, // 搜索表单
      formRules: {}, // 表单校验
      formCellRules: {}, // 行编辑校验规则
      permission: {}, // 当前模块权限信息
      cascaderDicList: {}, // 级联字典
      formCascaderList: {}, // 表单级联
      viewData: {}, // 查看数据
      oldFormData: {}, // 上一次的数据
      tempActionCol: ["DELETE", "EDIT", "DETAIL"], // 初始按钮
      actionCompare: 11,
      sortableInstance: null,
      hasAdvanced: false,
      isMenuShow: false, // 只有查询权限
      searchShow: true, // 是否显示展开-收起
      searchMoreHeight: 0, // 是否显示展开-收起的插槽默认高度
      isSelectAll: false, // 是否全选
      filterList: [], // 过滤后的数据源
      originArr: [], // 数据进行分组
      isSinleSelection: [], // 选中的数据缓存
      moreCurrent: 0, // 过滤的页码
      moreSize: 50, // 过滤的默认size
    };
  },
  created() {
    // 初始化权限信息
    this.permissionInit();
    // 初始化数据 包括初始化操作按钮的显示影藏
    this.dataInit();
    // TODO 应该只初始化搜索栏的字典
    this.handleLoadDic();
    // 初始标题信息 TODO 要在弹窗初始化时执行
    this.titleInit();
    // 动态列初始化
    this.initSearchOption();
    // 初始化列
    this.initTableColumn();
    // 初始操作列
    this.initActionColWidth();
  },
  mounted() {
    this.doLayout = false;
    this.$nextTick(() => {
      if (this.tableOption.dynamicOptions) {
        // 动态列初始化
        this.initDynamicColumn();
      } else {
        this.doLayout = true;
      }
      // 如果有搜索激活搜索
      // if (this.$refs.headerSearch) this.$refs.headerSearch.init();
      this.$nextTick(() => {
        // 是否开启表格拖拽排序
        if (this.tableOption.sortable) {
          setTimeout(this.setSort(), 0);
        }
      });
      if (this.tableOption.updateHeight) {
        setTimeout(() => {
          this.updateHeight();
        }, 300);
      }
    });
    // 延迟1s执行拖拽初始化，避免出现节点未初始化完成的异常
    // setTimeout(this.columnDrop, 1000)
    // 是否需要高级搜索按钮
    if (!this.$refs.headerSearch) {
      this.hasAdvanced = false;
    } else {
      const height = this.$refs.headerSearch.$el.offsetHeight;
      if (height > 75) {
        this.hasAdvanced = true;
      } else {
        this.hasAdvanced = false;
      }
    }
    this.searchMoreToggle();
  },
  computed: {
    // 弹窗高度
    dialogHeight() {
      return this.setPx(this.vaildData(this.tableOption.dialogHeight, config.dialogHeight));
    },
    // 全部配置项
    options() {
      return this.tableOption || {};
    },
    // 列的配置集合
    columnOption() {
      return this.tableOption.column || [];
    },
    // 返回所有的配置项  包括children里面的配置
    propOption() {
      let result = [];
      const ctx = this;
      // 递归查找所有的属性配置
      function findProp(list) {
        list.forEach((ele) => {
          if (ele.prop) {
            result.push(ele);
          }
          if (ele.children) {
            ctx.isChild = true;
            findProp(ele.children);
          }
        });
      }
      findProp(this.columnOption);
      // 处理联动字段
      if (this.isChild) {
        result = calcCascader(result);
      } else {
        result = calcCascader(this.columnOption);
      }

      if (this.isTree) this.treeProp = result[0].prop;
      return result;
    },
    // 表单的配置 TODO <动态列变化会影响到表单查看,要独立开来>
    columnFormOption() {
      if (this.isGroup) {
        const list = [];
        this.options.group.forEach((ele) => {
          if (!ele.column) return;
          ele.column.forEach((column) => {
            list.push(column);
          });
        });
        return list;
      } else {
        return this.propOption;
      }
    },
    // // 搜索栏的配置
    // columnSearchOption () {
    //   const option = this.deepClone(this.columnOption || []).filter((item) => item.search === true)
    //   return option;
    // },
    // 是否包含组
    isGroup() {
      return !this.validatenull(this.tableOption.group);
    },
    // 展开的级别
    expandLevel() {
      return this.options.expandLevel || 0;
    },
    // 是否展开全部
    expandAll() {
      return this.options.expandAll || false;
    },
    // 是否是树形表格
    isTree() {
      return this.vaildData(this.options.tree, false);
    },
    // 数据"id"的"key"
    idKey() {
      return this.tableOption.idKey || "id";
    },
    // 操作按钮不可用
    btnDisabled() {
      // return this.$refs.dialogForm.keyBtn && this.tableOption.cellBtn;
    },
    // 合计的配置集合
    sumColumnList() {
      return this.tableOption.sumColumnList || [];
    },
    // 已选中的长度
    selectLen() {
      return this.tableSelect ? this.tableSelect.length : 0;
    },
  },
  watch: {
    // 双向绑定弹窗表单的值
    tableForm: {
      handler() {
        this.$emit("input", this.tableForm);
      },
      deep: true,
    },
    // 传入弹窗表单表的值 @Object
    value: {
      handler() {
        this.formVal();
      },
      deep: true,
    },
    // 分页参数配置项
    page: {
      handler() {
        this.$refs.tablePage.pageInit();
      },
      deep: true,
    },
    // 监听组件配置是否变化，变化则刷新
    propOption() {
      this.refreshOptions();
    },
    // TODO 配置变化更新显示列
    // propOption () {
    //   // this.$refs.customColumn.columnInit();
    // },
    // 表格展示的数据
    data() {
      this.dataInit();
      if (this.tableOption.isFilterData) {
        this.pageChange(); // 过滤数据
      }
      // 初始化级联字典  TODO表格不需要初始化字典
      // this.handleLoadCascaderDic();
      this.$nextTick(() => {
        this.$refs.table && this.$refs.table.doLayout();
      });
    },
    // 路由切换重新计算布局
    $route(to, form) {
      this.$refs.table.doLayout();
    },
  },
  props: {
    dialogClass: {
      type: String,
    },
    // 弹窗表单传入的值
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
    spanMethod: Function, // 合并单元格的方法
    summaryMethod: Function, // 合计的方法
    beforeClose: Function, // 弹窗关闭之前
    beforeOpen: Function, // 弹窗开启之前
    rowClassName: Function, // 行类名
    cellClassName: Function, // 单元格类名
    headerCellClassName: Function, // 行类名
    uploadBefore: Function, // 开始上传之前
    uploadAfter: Function, // 上传后
    page: {
      type: Object,
      default() {
        return {};
      },
    },
    tableLoading: {
      type: Boolean,
      default: false,
    },
    exportLoading: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      required: true,
      default: () => {
        return [];
      },
    },
  },
  methods: {
    // 滚动至底部触发，用于绑定事件
    load() {
      if (this.tableOption.isFilterData) {
        if (this.moreCurrent >= this.originArr.length - 1 || this.filterList.length > 1000) return;
        this.moreCurrent++;
        const second = this.originArr[this.moreCurrent];
        this.filterList.push(...second);
        if (this.isSelectAll) {
          this.toggleSelection(second);
        }
      }
    },
    // 分割数据
    pageChange() {
      this.originArr = this.splitArray(this.list);
      this.filterList = this.originArr[0];
      this.moreCurrent = 0;
    },
    splitArray(arr) {
      const a_len = arr.length;
      const result = [];
      for (let i = 0; i < a_len; i += this.moreSize) {
        result.push(arr.slice(i, i + this.moreSize));
      }
      return result;
    },
    refreshOptions() {
      // 初始化权限信息
      this.permissionInit();
      // 初始化数据 包括初始化操作按钮的显示影藏
      this.dataInit();
      // TODO 应该只初始化搜索栏的字典
      this.handleLoadDic();
      // 初始标题信息 TODO 要在弹窗初始化时执行
      // this.titleInit()
      // 动态列初始化
      this.initSearchOption();
      // 初始化列
      this.initTableColumn();
      // 如果配置了动态列，需刷新动态列
      if (this.tableOption.dynamicOptions) {
        this.refreshDynamicColumn();
      }
    },
    chartModel() {
      this.$emit("custom-chart", {});
    },
    /** ********新增的方法start****************************************** */
    columnDrop() {
      // 获取表格配置中的复选框配置|索引列配置|展开列配置
      const { selection, index, expand, useDrag = true } = this.tableOption;
      // 是否使用拖拽
      if (!useDrag) return;
      // 获取当前实例对应的节点
      const pNode = this.$refs.table.$el;
      // 获取表格头部的节点
      const tr = pNode.querySelector(".has-gutter tr");
      // 挂载节点到拖拽初始化
      this.sortableInstance = Sortable.create(tr, {
        // 动画时间
        animation: 180,
        // 延迟时间
        delay: 0,
        // 拖拽结束的回调
        onEnd: (e) => {
          // 拖拽变动的列索引
          const { newIndex, oldIndex } = e;
          let prevLen = 0;
          // 存在复选框
          if (selection) prevLen++;
          // 存在索引列
          if (this.vaildData(index, true)) prevLen++;
          // 存在展开列
          if (expand) prevLen++;
          // 获取表头主体dom节点
          const header = pNode.querySelector(".el-table__header-wrapper");
          // 获取表头主体下的表头行
          const headerTr = [...header.querySelectorAll("tr")][0];
          // 拷贝表头主体下的表头行（用于后续表格列配置渲染后，处理表头恢复）
          const cloneThList = headerTr.cloneNode(true);
          // 回去拖拽的列
          const oldObj = this.tableColumn[oldIndex - prevLen];
          // 删除配置里面的拖拽列
          this.tableColumn.splice(oldIndex - prevLen, 1);
          // 把拖拽的列添加到目标位置
          this.tableColumn.splice(newIndex - prevLen, 0, oldObj);
          // 配置渲染完成后
          this.$nextTick(() => {
            // 获取表头主体下的表头单元格列表
            const tdList = [...headerTr.querySelectorAll("th")];
            // 获取上面备份的表头主体下的表头单元格列表
            const tdListOld = [...cloneThList.querySelectorAll("th")];
            // 遍历单元格列表
            tdList.forEach((item, index) => {
              const curNodeChild = item.children[0];
              const oldNodeChild = tdListOld[index].children[0];
              if (oldIndex > newIndex && index >= newIndex && index <= oldIndex) {
                // 从右往左拖拽
                // 替换新的节点为上一次拖拽后的节点
                // headerTr.replaceChild(tdListOld[index], item)
                if (curNodeChild) {
                  item.children[0].replaceChild(oldNodeChild.childNodes[0], curNodeChild.childNodes[0]);
                }
              } else if (oldIndex < newIndex && index <= newIndex && index >= oldIndex) {
                // 从左往右拖拽
                // 替换新的节点为上一次拖拽后的节点
                // headerTr.replaceChild(tdListOld[index], item)
                if (curNodeChild) {
                  item.children[0].replaceChild(oldNodeChild.childNodes[0], curNodeChild.childNodes[0]);
                }
              }
            });
          });
        },
      });
    },
    // 斑马纹
    rowDefaultClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 0) {
        return "";
      } else {
        return "row2n-class";
      }
    },
    // 初始化权限信息
    permissionInit() {
      const data = this.$store.state.base.btnList;
      const permission = {};
      data.map((item) => {
        permission[item] = true;
      });
      this.permission = this.upperJSONKey(permission) || {};
      this.isMenu();
    },
    upperJSONKey(json) {
      if (json instanceof Array) {
        for (const key in json) {
          this.upperJSONKey(json[key]);
        }
      } else if (json instanceof Object) {
        for (const key in json) {
          // var reg =/^[a-z0-9_]+$/;
          var reg = /[a-z]+$/;
          if (json[key] instanceof Object || json[key] instanceof Array) {
            this.upperJSONKey(json[key]);
          } else {
            if (reg.test(key)) {
              var lowerKey = key.toUpperCase();
              json[lowerKey] = json[key];
              delete json[key];
            }
          }
        }
      }
      return json;
    },
    // 根据返回按钮是否显示操作栏
    isMenu() {
      const menuList = Object.keys(this.permission);
      const btnList = ["EDIT", "DETAIL", "DELETE", "RELEASE", "STARTUSE", "STOPUSE", "CHECK", "AUTH", "DETAILCAREERS", "SEARCHDETAIL", "USERDETAIL"];
      btnList.forEach((item) => {
        if (menuList.includes(this.$route.name + "_" + item)) {
          this.isMenuShow = true;
        }
      });
    },
    initActionColWidth() {
      if (this.validatenull(this.permission)) {
        this.actionCompare = 0;
        return;
      }
      let actionCompare = this.actionCompare;
      if (this.tableOption.dynamicOptions) {
        // 动态列初始化
        actionCompare += 20;
      }
      // 设置操作列宽度
      this.tempActionCol.forEach((item) => {
        // viewBtn editBtn delBtn
        // const
        let optionBtnstr = "";
        if (item === "DELETE") {
          optionBtnstr = "delBtn";
        } else if (item === "DETAIL") {
          optionBtnstr = "viewBtn";
        } else if (item === "EDIT") {
          optionBtnstr = "editBtn";
        }
        const optionBtn = this.tableOption[optionBtnstr];
        if (this.permission[item] && optionBtn !== false) {
          actionCompare += 33;
        }
      });
      this.actionCompare = actionCompare === 11 ? 0 : actionCompare;
    },
    // 初始化标题
    titleInit(title = "") {
      this.functionName = this.$lang(title || this.$route.meta.title);
    },
    // 获取查看数据
    async getViewData(row) {
      this.viewOpen(this.viewData);
      if (this.tableOption.useRowView) {
        this.viewData = row;
        return;
      }
      if (this.tableOption.viewData) {
        this.viewData = this.tableOption.viewData;
      } else {
        this.dialogLoading = true;
        let reqUrl;
        if (!this.tableOption.formatViewReq) {
          reqUrl = `${this.tableOption.viewUrl}?${this.idKey}=${row[this.idKey]}`;
        } else {
          reqUrl = `${this.tableOption.viewUrl}${this.tableOption.formatViewReq(row)}`;
        }
        const resData = await fetch.get(reqUrl);
        this.dialogLoading = false;
        if (!resData || (!resData.code && resData.code !== 0)) {
          this.$message.error(resData.msg || this.$lang("请求异常，请联系客服"));
        } else {
          this.viewData = this.tableOption.formateViewData ? this.tableOption.formateViewData(resData.data) : resData.data;
        }
      }
      this.viewOpen(this.viewData);
      this.$emit("after-row-view", this.viewData);
    },
    // 删除表格中的某一项
    deleteItem(row) {
      this.$confirm(this.$lang("确认删除该条信息？"), this.$lang("温馨提示"), {
        confirmButtonText: this.$lang("确定"),
        cancelButtonText: this.$lang("取消"),
        closeOnClickModal: false,
        customClass: "common-confirm__topbar",
        confirmButtonClass: "comfirm-btn",
      }).then(() => {
        this.deleteReq(row);
      });
    },
    // 删除请求
    async deleteReq(row) {
      let data;
      if (!this.tableOption.formatDeleteReq) {
        data = { id: row[this.idKey] };
      } else {
        data = this.tableOption.formatDeleteReq(row);
      }
      const res = await server.reqDel(this.tableOption.deleteUrl, data);
      if (res.code === RESPONSE_CODE.SUCCESS) {
        this.$message.success(res.msg);
        this.$emit("delete-success");
      }
    },
    // 关闭查看弹窗
    closeViewDialog() {
      this.tableIndex = -1;
      this.tableForm = {};
      this.viewVisible = false;
      this.keyBtn = false;
      this.hide();
    },
    // 关闭查看回调
    hide() {
      const callack = () => {
        this.viewData = {};
      };
      if (typeof this.$parent.beforeClose === "function") {
        this.$parent.beforeClose(callack, this.boxType, this.viewData);
      } else {
        callack();
      }
    },
    // 获取编辑数据
    fetchFormData(row) {
      return new Promise((resolve, reject) => {
        let reqUrl;
        if (!this.tableOption.viewUrl) {
          resolve(row);
          return;
        }
        this.dialogLoading = true;
        if (!this.tableOption.formatViewReq) {
          reqUrl = `${this.tableOption.viewUrl}?${this.idKey}=${row[this.idKey]}`;
        } else {
          reqUrl = `${this.tableOption.viewUrl}${this.tableOption.formatViewReq(row)}`;
        }
        fetch.get(reqUrl).then((res) => {
          if (res.code === RESPONSE_CODE.SUCCESS) {
            // 判断配置是否有fetchDataCb参数且为函数，符合则执行
            typeof this.tableOption.fetchDataCb === "function" && this.tableOption.fetchDataCb(res.data);
            resolve(res.data);
          } else {
            reject(res);
            this.$message({ type: "error", message: res.msg });
          }
          this.dialogLoading = false;
        });
      });
    },
    // 更新权限信息
    refreshPower(data) {
      this.permission = data;
    },
    // 打开动态列弹窗
    openDynamicDialog() {
      //   this.$refs.dragColumn.openDialog();
    },
    // 远程配置和本地配置合并
    initDynamicColumn() {
      this.doLayout = false;
      const columnProps = {};
      const columns = [];
      this.columnOption.forEach((item, idx) => {
        columnProps[item.prop] = item;
      });
      this.fetchColumnData(this.tableOption)
        .then((customColumnDefs) => {
          this.dynamicColumns = customColumnDefs;
          const columnsShow = JSON.parse(JSON.stringify(this.dynamicColumns.filter((item) => item.show === true)));
          columnsShow.forEach((item) => {
            const col = columnProps[item.name];
            if (col) {
              if (col.hide !== undefined) {
                col.hide = false;
              }
              columns.push(Object.assign(item, col));
            } else {
              columns.push({
                label: item.column,
                prop: item.name,
                show: item.show,
              });
            }
          });
          this.tableColumn = columns;
          this.doLayout = true;
          setTimeout(() => {
            this.$refs.table && this.$refs.table.doLayout();
          }, 0);
        })
        .catch((res) => {
          this.doLayout = true;
        });
    },
    refreshDynamicColumn() {
      this.doLayout = false;
      const columnProps = {};
      const columns = [];
      this.columnOption.forEach((item, idx) => {
        columnProps[item.prop] = item;
      });
      const columnsShow = JSON.parse(JSON.stringify(this.dynamicColumns.filter((item) => item.show === true)));
      columnsShow.forEach((item) => {
        const col = columnProps[item.name];
        if (col) {
          if (col.hide !== undefined) {
            col.hide = false;
          }
          columns.push(Object.assign(item, col));
        } else {
          columns.push({
            label: item.column,
            prop: item.name,
            show: item.show,
          });
        }
      });
      this.tableColumn = columns;
      this.doLayout = true;
      setTimeout(() => {
        this.$refs.table && this.$refs.table.doLayout();
      }, 0);
    },
    /**
     * @Description: 用于刷新表格
     */
    tableRefresh() {
      this.tableColumn = this.deepClone(this.columnOption); // 深拷贝this.columnOption
      // 表格-if触发初始化事件
      this.doLayout = false;
      setTimeout(() => {
        this.$refs.table && this.$refs.table.doLayout();
      }, 0);
      this.$nextTick(() => {
        this.doLayout = true;
      });
    },
    // 获取动态列数据
    fetchColumnData(tableOption) {
      return new Promise((resolve, reject) => {
        const reqUrl = tableOption.dynamicOptions.getUrl;
        fetch
          .get(`${reqUrl}?` + qs.stringify(tableOption.dynamicOptions.params))
          .then((res) => {
            if (res.code === RESPONSE_CODE.SUCCESS) {
              resolve(res.data || []);
            } else {
              reject(res);
              this.$message({ type: "error", message: res.msg });
            }
          })
          .catch((res) => {
            // this.tableColumn = tableOption.column
            this.doLayout = true;
            setTimeout(() => {
              this.$refs.table && this.$refs.table.doLayout();
            }, 0);
          });
      });
    },
    // 设置动态列数据
    setCustomColumn(params) {
      return new Promise((resolve, reject) => {
        const reqUrl = this.tableOption.dynamicOptions.saveUrl;
        const baseobj = Object.assign({}, this.tableOption.dynamicOptions.params, params);
        fetch.post(`${reqUrl}`, baseobj).then((res) => {
          if (res.code === RESPONSE_CODE.SUCCESS) {
            this.$message.success(res.msg);
            this.initDynamicColumn();
            resolve(res);
          } else {
            this.$message({ type: "error", message: res.msg });
            resolve(res);
          }
        });
      });
    },
    // 初始化搜索配置
    initSearchOption() {
      const option = this.deepClone(this.propOption || []).filter((item) => item.search === true);
      const sortItems = remove(option, function (item) {
        return typeof item.sort === "number";
      });
      // this.searchOption = sortItems.sort((a, b) => { return a.sort - b.sort })
      forEach(sortItems, (item) => {
        option.splice(item.sort, 0, item);
      });
      this.searchOption = option;
    },
    // 初始化列配置
    initTableColumn() {
      console.log(1111111111, "111111111111");
      this.tableColumn = this.option.column.filter((o) => o.hide !== true);
    },
    /** ********新增的方法end****************************************** */
    // 开启排序
    setSort() {
      if (!window.Sortable) {
        console.error("please npm install Sortable -S");
        return;
      }
      const el = this.$refs.table.$el.querySelectorAll(".el-table__body-wrapper > table > tbody")[0];
      this.sortable = window.Sortable.create(el, {
        ghostClass: "avue-crud__sortable",
        onEnd: (evt) => {
          const oldindex = evt.oldIndex;
          const newindex = evt.newIndex;
          const targetRow = this.list.splice(oldindex, 1)[0];
          this.list.splice(newindex, 0, targetRow);
          this.$emit("sortable-change", oldindex, newindex, targetRow, this.list);
        },
      });
    },
    // 更新弹窗表单或者搜索栏的字典,用 refname 调用 dialogForm 或 headerSearch 实例的方法
    updateDic(prop, list, refname = "dialogForm", params) {
      this.$refs[refname] && this.$refs[refname].updateDic(prop, list, params);
    },
    showRow(row) {
      // const index = row.rowIndex;
      const show = row.row._parent ? row.row._parent._expand && row.row._parent._show : true;
      row.row._show = show;
      return show ? "animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;" : "display:none;";
    },
    // 对部分表单字段进行校验的方法
    validateField(val) {
      return this.$refs.dialogForm.$refs.tableForm.validateField(val);
    },
    handleGetRowKeys(row) {
      const rowKey = row[this.idKey];
      return rowKey;
    },
    // 初始化弹窗表单规则
    rulesInit() {
      this.formRules = {};
      this.propOption.forEach((ele) => {
        if (ele.rules) this.formRules[ele.prop] = ele.rules;
        if (ele.rules && ele.cell) this.formCellRules[ele.prop] = ele.rules;
      });
    },
    // 取消表格选择
    selectClear() {
      this.$refs.table.clearSelection();
      this.isSelectAll = false;
      this.isSinleSelection = []
    },
    // 选中/取消选中
    toggleRowSelection(row, selected) {
      this.$refs.table.toggleRowSelection(row, selected);
    },
    // 展开/取消展开
    toggleRowExpansion(row, expanded) {
      this.$refs.table.toggleRowExpansion(row, expanded);
    },
    // 高亮某一行
    setCurrentRow(row) {
      this.$refs.table.setCurrentRow(row);
    },
    // 返回序号
    indexMethod(index) {
      return index + 1 + ((this.$refs.tablePage.defaultPage.currentPage || 1) - 1) * (this.$refs.tablePage.defaultPage.pageSize || 10);
    },
    // 弹窗表单赋值
    formVal() {
      Object.keys(this.value).forEach((ele) => {
        this.$set(this.tableForm, ele, this.value[ele]);
      });
    },
    // 初始化数据
    dataInit() {
      if (this.isTree) {
        const data = this.data;
        if (data.length === 0) {
          this.list = [];
          return;
        }
        addAttrs(this, data, {
          expand: this.expandAll,
          expandLevel: this.expandLevel,
        });
        this.list = treeToArray(this, data);
      } else {
        this.list = this.data;
      }
      /*
       *存在操作按钮根据业务状态显示隐藏操作按钮 初始化显隐参数 避免在template中使用函数处理 以提高组件性能
       *@Description: tableOption.btnsVisible()
       *@param {ele} type Object
       *@return [type] Object 例如 { view: false, edit:false }
       *@Date: 2019-08-01 10:59:27
       */
      if (typeof this.tableOption.btnsVisible === "function") {
        this.list.forEach((ele, index) => {
          const btnVisible = this.tableOption.btnsVisible(ele) || {};
          ele.$view = btnVisible.view;
          ele.$edit = btnVisible.edit;
          ele.$delete = btnVisible.delete;
        });
      }
      // 格式化每列数据
      this.tableColumn.forEach((item) => {
        if (item.formatData && typeof item.formatData === "function") {
          this.list.forEach((itm) => {
            // 拷贝一份原始prop
            if (!itm[item.prop + "Origin"]) {
              itm[item.prop + "Origin"] = itm[item.prop];
            }
            itm[item.prop] = item.formatData(itm[item.prop]);
          });
        }
      });
    },
    // 展开或则关闭
    expandChange(row, expand) {
      this.expandList = [...expand];
      this.$emit("expand-change", row, expand);
    },
    // 设置单选
    currentRowChange(val) {
      this.$emit("current-row-change", val);
    },
    // 刷新事件
    refreshChange() {
      this.$emit("refresh-change", {
        page: this.defaultPage,
        searchForm: this.searchForm,
      });
    },
    // 选中行数据
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.table.toggleRowSelection(row);
        });
      } else {
        this.$refs.table.clearSelection();
      }
    },
    // 选择回调
    selectionChange(val) {
      this.tableSelect = val;
      this.$emit("selection-change", this.tableSelect);
    },
    // 单个选择回调
    select(val, currentRow) {
      if (this.tableOption.isFilterData) {
        // 检测当前行的选中状态
        const isChecked = val.some((item) => item.excelNum === currentRow.excelNum);
        if (this.isSelectAll) {
          if (!isChecked) {
            this.isSinleSelection = [...(this.isSinleSelection || []), currentRow.excelNum];
          } else {
            this.isSinleSelection = this.isSinleSelection.filter((item) => item !== currentRow.excelNum);
          }
          val = this.list.filter((item) => !this.isSinleSelection.includes(item.excelNum));
        }
      }
      this.$emit("select", val, currentRow);
    },
    // 点击勾选全选 Checkbox
    selectAll(val) {
      if (this.tableOption.isFilterData) {
        if (val.length > 0) {
          this.isSelectAll = true;
          val = this.list;
        } else {
          this.isSelectAll = false;
          val = [];
        }
      }
      this.isSinleSelection = [];
      this.$emit("select-all", val);
    },
    // 排序回调
    sortChange(val) {
      this.$emit("sort-change", val);
    },
    // 行双击
    rowDblclick(row, event) {
      this.$emit("row-dblclick", row, event);
    },
    // 行单机
    rowClick(row, event, column) {
      this.$emit("row-click", row, event, column);
    },
    // 当单元格 hover 进入时会触发该事件
    cellMouseEnter(row, column, cell, event) {
      this.$emit("cell-mouse-enter", row, column, cell, event);
    },
    // 当单元格 hover 退出时会触发该事件
    cellMouseLeave(row, column, cell, event) {
      this.$emit("cell-mouse-leave", row, column, cell, event);
    },
    // 当某个单元格被点击时会触发该事件
    cellClick(row, column, cell, event) {
      this.$emit("cell-click", row, column, cell, event);
    },
    // 当某个单元格被双击击时会触发该事件
    cellDblclick(row, column, cell, event) {
      this.$emit("cell-dblclick", row, column, cell, event);
    },
    // 行编辑点击
    rowCell(row, index) {
      if (row.$cellEdit) {
        this.rowCellUpdate(row, index);
      } else {
        this.rowCellEdit(row, index);
      }
    },
    // 单元格新增
    rowCellAdd(obj = {}) {
      const len = this.list.length;
      this.list.push(
        this.deepClone(
          Object.assign(
            this.tableForm,
            {
              $cellEdit: true,
              $index: len,
            },
            obj
          )
        )
      );
      this.formIndexList.push(len);
    },
    // 行取消
    rowCanel(row, index) {
      this.oldFormData = {};
      if (this.validatenull(row[this.idKey])) {
        this.list.splice(index, 1);
        return;
      }
      this.formCascaderList[index].$cellEdit = false;
      // 设置行数据
      this.$set(this.list, index, this.formCascaderList[index]);
      // 设置级联字典
      this.$set(this.cascaderDIC, index, this.cascaderDicList[index]);
      this.formIndexList.splice(this.formIndexList.indexOf(index), 1);
    },
    // 单元格编辑
    rowCellEdit(row, index) {
      row.$cellEdit = true;
      this.oldFormData = this.deepClone(row);
      this.tableForm = this.rowClone(row);
      this.$emit("input", this.tableForm);
      this.$set(this.list, index, row);
      // 缓冲行数据
      this.formCascaderList[index] = this.deepClone(row);
      // 缓冲级联字典
      this.cascaderDicList[index] = this.deepClone(this.cascaderDIC[index]);
      setTimeout(() => {
        this.formIndexList.push(index);
      }, 1000);
    },
    // 单元格更新
    rowCellUpdate(row, index) {
      this.asyncValidator(this.formCellRules, row)
        .then((res) => {
          this.$refs.dialogForm.keyBtn = true;
          this.$emit(
            "row-update",
            row,
            index,
            () => {
              row.$cellEdit = false;
              this.$set(this.list, index, row);
            },
            this.oldFormData,
            () => {
              this.$refs.dialogForm.keyBtn = false;
            }
          );
        })
        .catch((errors) => {
          this.$message.warning(errors[0].message || errors[0]);
        });
    },
    rowAdd() {
      this.boxType = "add";
      if (!this.tableOption.customAdd) {
        this.$refs.dialogForm.show("add");
      } else {
        this.$emit("custom-add");
      }
    },
    // 保存请求
    rowSave(isClose = true) {
      this.$refs.dialogForm.rowSave(isClose);
    },
    /**
     * @Description: 条件栏展开收缩
     * @return {Boolean} 当前状态值, true为展开状态
     */
    searchMoreToggle() {
      if (!this.tableOption.searchMore) {
        return;
      }
      if (!this.searchMoreHeight) {
        this.searchMoreHeight = this.$refs.searchMore.firstChild.offsetHeight + "px";
        this.$refs.searchMore.style.height = this.searchMoreHeight;
        console.log(1111, this.searchMoreHeight, this.$refs.searchMore.firstChild.firstChild);
      }

      setTimeout(() => {
        if (!this.searchShow) {
          this.$refs.searchMore.style.height = this.searchMoreHeight;
        } else {
          this.$refs.searchMore.style.height = 0;
          this.$refs.searchMore.style.overflow = "hidden";
        }
        this.searchShow = !this.searchShow;
      }, 0);
      this.$refs.headerSearch.calcHeight();
      this.$emit("search-more-toggle", this.searchShow);
    },
    // 更新视窗高度
    updateHeight() {
      this.$refs.headerSearch.calcHeight();
    },
    // 对象克隆
    rowClone(row) {
      const rowData = {};
      Object.keys(row).forEach((ele) => {
        if (!["_parent", "children"].includes(ele)) {
          rowData[ele] = row[ele];
        }
      });
      return rowData;
    },
    // 搜索
    searchChange() {
      this.$refs.headerSearch.searchChange();
    },
    // 清空
    searchReset() {
      this.$refs.headerSearch.searchReset();
    },
    // 导出excel
    exportExcel() {
      this.$emit("export-excel", this.selection);
    },
    // 导出excel
    exportExcelAll() {
      this.$emit("export-excel-all");
    },
    // 可选导出
    selectExport(command) {
      let excelType = 1;
      if (command === this.$lang("此页导出")) {
        excelType = 1;
      } else {
        excelType = 2;
      }
      this.$emit("export-excel", excelType);
    },
    // 打印
    importExcel() {
      this.$emit("import-excel");
    },
    deleteRows() {
      this.$emit("delete", this.tableSelect);
    },
    // 编辑
    rowEdit(row, index) {
      this.boxType = "edit";
      if (!this.tableOption.customEdit) {
        this.fetchFormData(row).then((res) => {
          this.oldFormData = this.tableOption.formateForm ? this.tableOption.formateForm(res) : res;
          this.tableForm = this.tableOption.formateForm ? this.tableOption.formateForm(res) : res;
          this.tableOption.fetchCallback && this.tableOption.fetchCallback();
        });
        this.$emit("input", this.tableForm);
        this.tableIndex = index;
        this.$refs.dialogForm.show("edit", index);
      } else {
        this.$emit("custom-edit", row, index);
      }
    },

    // 查看
    rowView(row, index) {
      this.boxType = "view";
      if (!this.tableOption.customView) {
        this.tableForm = this.rowClone(row);
        this.tableIndex = index;
        this.$refs.dialogForm.show("view");
        console.log("进来了吗查看");
      } else {
        this.$emit("custom-view", row, index);
      }
    },
    // 查看
    urlView(row, index) {
      this.boxType = "view";
      this.tableIndex = index;
      this.keyBtn = true;
      this.getViewData(row);
    },
    // 查看回调
    viewOpen(row) {
      const callack = () => {
        this.$nextTick(() => {
          this.viewVisible = true;
        });
      };
      if (typeof this.$parent.beforeOpen === "function") {
        this.$parent.beforeOpen(callack, this.boxType, row);
      } else {
        callack();
      }
    },
    // 查看
    view(row, idx) {
      if (!this.tableOption.customView) {
        this.urlView(row, idx);
      } else {
        this.$emit("custom-view", row, idx);
      }
    },
    // 删除
    rowDel(row, index) {
      if (this.tableOption.deleteUrl) {
        this.deleteItem(row);
      } else {
        this.$emit("row-del", row, index);
      }
    },
    // 清空表单
    resetForm() {
      this.$refs.dialogForm.resetForm();
      this.$emit("input", this.tableForm);
    },
    // 搜索指定的属性配置
    findColumnIndex(value) {
      return this.findArray(this.propOption, value, "prop");
    },
    // 合并行
    tableSpanMethod(param) {
      if (typeof this.spanMethod === "function") return this.spanMethod(param);
    },
    // 合集统计逻辑
    tableSummaryMethod(param) {
      // 如果自己写逻辑则调用summaryMethod方法
      if (typeof this.summaryMethod === "function") {
        return this.summaryMethod(param);
      }
      const { columns, data } = param;
      const sums = [];
      if (columns.length > 0) {
        columns.forEach((column, index) => {
          const currItem = this.sumColumnList.find((item) => item.name === column.property);
          if (index === 0) {
            sums[index] = this.tableOption.sumText || config.sumText;
          } else if (currItem) {
            switch (currItem.type) {
              case "count":
                sums[index] = this.$lang("计数") + ":" + data.length;
                break;
              case "avg":
                const avgValues = data.map((item) => Number(item[column.property]));
                let nowindex = 1;
                sums[index] = avgValues.reduce((perv, curr) => {
                  const value = Number(curr);
                  if (!isNaN(value)) {
                    return (perv + curr) / nowindex++;
                  } else {
                    return perv;
                  }
                }, 0);
                sums[index] = this.$lang("平均") + ":" + sums[index].toFixed(2);
                break;
              case "sum":
                const values = data.map((item) => Number(item[column.property]));
                sums[index] = values.reduce((perv, curr) => {
                  const value = Number(curr);
                  if (!isNaN(value)) {
                    return perv + curr;
                  } else {
                    return perv;
                  }
                }, 0);
                sums[index] = sums[index].toFixed(2);
                break;
            }
          } else {
            sums[index] = "-";
          }
        });
      }
      this.sumsList = sums;
      return sums;
    },
    // 清空某个表单元素
    clearFormItem(prop, refname = "dialogForm") {
      this.$refs[refname] && this.$refs[refname].clearFormItem(prop);
    },
  },
});
</script>
<style lang="scss">
.query-box {
  display: flex;
  justify-content: flex-end;
  min-width: 200px;
  .el-button.el-button--small {
    height: 32px;
    margin-left: 16px;
    border-radius: 4px;
  }
}
.el-table .cell {
  .iconfont {
    color: #e60012 !important;
  }
  .el-button + .el-button {
    margin-left: 0 !important;
  }
  .el-button {
    margin-right: 10px;
  }
  .el-button:last-child {
    margin-right: 0;
  }
}
.output-style {
  .el-button.el-button--small {
    padding: 7px 16px !important;
  }
}
.output-more {
  width: 216px;
  > li.el-dropdown-menu__item {
    height: 40px;
    font-size: 14px;
    line-height: 43px;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    padding: 0 18px;
    color: #61666d;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:last-of-type {
      border-bottom: none;
    }

    > i {
      margin-right: 0;
      width: 52px;
      display: inline-block;
      text-align: center;
    }

    &:focus,
    &:not(.is-disabled):hover {
      color: $-color-text-shalow-subtitle;
      background: $c-bg-2;
    }
  }
  .popper__arrow {
    display: none !important;
  }
}
.output-more.el-dropdown-menu {
  padding: 8px 0 !important;
}
.output-more.el-popper[x-placement^="bottom"] {
  margin-top: 5px;
}
.avue-crud__searchMore {
  transition: 0.3s;
}
.avue-crud__tableCustom {
  overflow: hidden;
}
</style>
