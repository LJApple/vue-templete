<template>
  <div ref="tableSearch" class="table-search">
    <el-form :class="b('search')"
            :model="searchForm"
            :inline="true"
            :label-position="config.labelPosition"
            ref="searchForm"
            @keyup.enter.native="searchChange"
            v-if="searchFlag">
      <!-- 循环列搜索框 -->
      <template v-if="$parent.tableOption.headerSearchslot">
        <slot :searchForm="searchForm" name="headerSearchSlot"></slot>
      </template>
      <template v-else v-for="(column,index) in $parent.searchOption">
        <template v-if="column.searchHide !== true">
          <template v-if="column.searchslot">
            <el-form-item :prop="column.prop"
                    :label="column.label && isShowLabel ? $lang(column.labelAlias || column.label) + ' :' : ''"
                    :key="index">
                <slot :name="column.prop + 'Search'" :data="column" :form="searchForm"></slot>
            </el-form-item>
          </template>
          <el-form-item v-else
                        :key="index"
                        :prop="column.prop"
                        :label="column.label && isShowLabel ? $lang(column.labelAlias || column.label) + ' :' : ''"
                        :class="{'no-label': !column.label}">
          <!-- <el-tooltip :disabled="!column.searchTip"
                      :content="vaildData(column.searchTip,getPlaceholder(column,'search'))"
                      :placement="column.searchTipPlacement"> -->
            <component v-model="searchForm[column.prop]"
                      :ref="column.prop"
                      :is="getSearchType(column.type)"
                      :clearable="column.searchClearable"
                      :defaultTime="column.searchDefaultTime || (column.more ? ['00:00:00', '23:59:59'] : '')"
                      :disabled="column.searchDisabled"
                      :defaultExpandAll="column.defaultExpandAll"
                      :dic="$parent.DIC[column.prop]"
                      :filterable="column.searchFilterable"
                      :selectDic="column.selectDic"
                      :groupChildren="column.groupChildren"
                      :filter-method="column.searchFilterMethod"
                      :editable="column.editable"
                      :format="column.format"
                      :checkStrictly="column.searchCheckStrictly || column.checkStrictly"
                      :change="column.change"
                      :separator="column.separator"
                      :showAllLevels="column.showAllLevels"
                      :multiple="config.searchMultiple.includes(column.type) && vaildData(column.searchMmultiple,false)"
                      :parent="column.parent"
                      :placeholder="$lang(column.searchPlaceholder || '请输入'+column.label)"
                      :props="column.props || $parent.tableOption.props"
                      :size="$parent.isMediumSize"
                      :type="getType(column)"
                      :tags="column.searchTags"
                      :value-format="column.valueFormat"
                      :tpyeformat="column.tpyeformat"
                      :remote="column.remote"
                      :dicUrl="column.dicUrl"
                      :dicData="column.dicData"
                      :dicQuery="column.dicQuery"
                      :pickerOptions="column.pickerOptions"
                      :isSearch="true"
                      :hasAll="column.hasAll === false ? false : true"
                      :useCurNetworkInfo="column.useCurNetworkInfo"
                      :isAll="column.isAll"
                      :treeQuery="column.treeQuery"
                      :remoteQuery="column.remoteQuery"
                      :treeUrl="column.treeUrl"
                      :remoteUrl="column.remoteUrl"
                      :maxlength="column.maxlength"
                      :useClearMessage="column.useClearMessage"
                      :clearMessageInfo="column.clearMessageInfo"
                      :beforeSelect="column.beforeSelect"
                      :afterSelect="column.afterSelect"
                      :valueDefaultYl="column.valueDefaultYl"
                      :clear="column.clear"
                      :input="column.input"
                      :popperAppendToBody="column.popperAppendToBody"
                      ></component>
            <!-- </el-tooltip> -->
          </el-form-item>
        </template>
      </template>
      <slot name="search"></slot>
      <!-- <el-form-item :class="{ [b('searchMenu')]: true }" id="searchMenuBtns">
        <el-button type="primary"
                  @click="searchChange"
                  :icon="config.searchBtnIcon"
                  :loading="$parent.tableLoading"
                  v-if="vaildData($parent.tableOption.searchSubBtn,config.searchSubBtn)"
                  :size="$parent.isMediumSize">{{$lang('查 询')}}</el-button>
        <el-button @click="searchReset"
                  :icon="config.emptyBtnIcon"
                  v-if="vaildData($parent.tableOption.searchResetBtn,config.searchResetBtn)"
                  :size="$parent.isMediumSize">{{$lang('清 空')}}</el-button>
        <slot name="searchMenu"></slot>
      </el-form-item> -->
    </el-form>
    <div>
      <slot name="menuRight"></slot>
    </div>
  </div>
</template>

<script>
import cteate from '../../core/create';
import { vaildData, filterForm } from '../../utils/util';
import { validatenull } from '../../utils/validate';
import { formInitVal, getSearchType, getType } from '../../core/common/dataformat';
import { sendDic } from '../../core/common/dic';
import config from './config';
import dayjs from 'dayjs';

export default cteate({
  name: 'crud',
  mixins: [],
  data() {
    return {
      config: config,
      defaultForm: {
        searchForm: {}
      },
      searchForm: {},
      container: null,
      advancedShow: true,
      searchShow: true,
      ulheight: 0,
      firstTime: true
    };
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isShowLabel: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    searchForm: {
      handler(nVal, oVal) {
        this.$emit('input', nVal);
      },
      deep: true
    }
  },
  created() {
    this.init();
  },
  mounted() {
    this.$nextTick().then(res => {
      this.handleDateRelationOpt()
      // this.ulheight = this.$refs.tableSearch.offsetHeight + 'px';
      // this.$refs.tableSearch.style.height = this.ulheight;
    })
    this.container = document.querySelector('.home-container')
  },
  computed: {
    searchSlot() {
      return !validatenull(this.$slots.search);
    },
    searchFlag() {
      if (this.searchSlot) return true;
      else return !validatenull(this.searchForm);
    },
    // 默认时间控件配置
    pickerOptionsEnd() {
      return {
        disabledDate: (time) => {
          const selectTime = time.getTime()
          const valTime = this.startTime && new Date(this.startTime) || ''
          if (!valTime) return ''
          return selectTime < valTime
        }
      }
    },
    searchHeight() {
      if (typeof this.$parent.tableOption.searchRow === 'number') {
        return this.$parent.tableOption.searchRow * 50 + 18;
      } else {
        return 50 + 18;
      }
    }
  },
  methods: {
    // 初始化
    init() {
      this.getSearchType = getSearchType;
      this.getType = getType;
      this.vaildData = vaildData;
      this.dataformat();
    },
    // 搜索回调
    searchChange() {
      this.$parent.selectClear()
      this.$parent.$emit('search-change', filterForm(this.searchForm));
    },
    // 搜索清空
    searchReset() {
      const headerSearchslot = this.$parent.tableOption.headerSearchslot
      if (headerSearchslot) {
        for (const key in this.searchForm) {
          this.searchForm[key] = ''
        }
      }
      // 过滤yl-前缀自定义组件
      const ylArr = this.$parent.searchOption.filter(item => item.type && item.type.includes('yl-'))
      // ylArr存在则清空值
      if (ylArr.length) {
        ylArr.forEach(item => {
          this.$refs[item.prop][0].restForm()
        })
      }
      this.$refs['searchForm'].resetFields();
      // TODO 重新初始化字典
      this.$parent.handleLoadDic();
      this.$parent.selectClear()
      this.$parent.$emit('search-reset');
    },
    // 展开收缩
    toggle() {
      if (!this.ulheight) {
        this.ulheight = this.$refs.tableSearch.offsetHeight + 'px';
        this.$refs.tableSearch.style.height = this.ulheight;
      }
      setTimeout(() => {
        if (!this.searchShow) {
          this.$refs.tableSearch.style.height = this.ulheight;
        } else {
          this.$refs.tableSearch.style.height = 0;
          this.$refs.tableSearch.style.overflow = 'hidden';
        }
        this.searchShow = !this.searchShow;
      }, 0);
      this.calcHeight()
    },
    // 高级条件
    advancedToggle() {
      if (!this.ulheight) {
        this.ulheight = this.$refs.tableSearch.offsetHeight + 'px';
        this.$refs.tableSearch.style.height = this.ulheight;
      }
      setTimeout(() => {
        if (!this.advancedShow) {
          this.$refs.tableSearch.style.height = this.ulheight;
          this.$refs.tableSearch.style.overflow = 'initial';
        } else {
          this.$refs.tableSearch.style.height = '70px';
          this.$refs.tableSearch.style.overflow = 'hidden';
        }
        this.advancedShow = !this.advancedShow;
        this.searchShow = true
      }, 0);
      this.calcHeight()
    },
    // 重新计算高度
    calcHeight() {
      // 消除scroll引起的页面抖动
      if (this.container && this.container.firstChild) {
        this.container.firstChild.style.overflowY = 'hidden';
      }
      // 计算还原高度
      setTimeout(() => {
        this.$bus.$emit('doLayout')
        // 还原scroll-y样式
        if (this.container && this.container.firstChild) {
          this.container.firstChild.style.overflowY = 'auto';
        }
        if (this.$refs.tableSearch && this.searchShow) {
          this.$refs.tableSearch.style.overflow = 'initial';
        }
      }, 300)
    },
    dataformat() {
      this.defaultForm = formInitVal(this.$parent.searchOption);
      this.searchForm = this.deepClone(this.defaultForm.searchForm);
      this.searchShow = vaildData(this.$parent.tableOption.searchShow, this.$parent.config.searchShow);
    },
    // 更新字典 val-合并到query的参数
    updateDic(prop, list = [], val = {}) {
      return new Promise((resolve, reject) => {
        if (this.validatenull(list)) {
          const column = this.$parent.searchOption.find(item => item.prop === prop);
          if (!this.validatenull(column.dicUrl)) {
            const value = this.searchForm[prop] || ''
            sendDic({
              url: column.dicUrl.replace('{{key}}', value),
              query: Object.assign({}, column.dicQuery, val),
              resKey: (column.props || {}).res
            }).then(list => {
              this.$set(this.$parent.DIC, prop, list);
              resolve(list)
            });
          }
        } else {
          this.DIC = this.DIC || {}
          this.$set(this.DIC, prop, list);
          resolve(list)
        }
      })
    },
    // 清空某个表单元素
    clearFormItem(prop) {
      this.searchForm[prop] = ''
      this.$refs[prop] && this.$refs[prop][0].clearFormItem && this.$refs[prop][0].clearFormItem()
    },
    // 时间控件关联属性处理
    handleDateRelationOpt() {
      // 父级的搜索栏配置
      const columns = this.$parent.searchOption
      columns.forEach(item => {
        // 获取当前存在时间关联属性
        const { relationProps = [] } = item
        // 获取时间关联属性中的关联值
        const [relationKey] = relationProps
        // 存在关联关系
        if (relationKey) {
          // 获取当前唯一属性key
          const key = item.prop
          // 获取当前key的最新的值
          const endNode = this.$refs[relationKey][0].$children[0]
          this.$watch(`searchForm.${key}`, (val) => {
            const endTime = this.searchForm[relationKey]
            // 结束日期禁用配置
            const opt = {
              disabledDate: time => {
                const selectTime = time.getTime()
                // const valTime = new Date(val) || ''
                const valTime = new Date(this.searchForm[key])
                // console.log(111, time, valTime);
                if (!valTime) return ''
                return selectTime < valTime
              }
            }
            // 查找关联节点的配置
            const index = columns.findIndex(item => item.prop === relationKey)
            if (index > -1) {
              // 获取传入的结束时间禁用配置
              const pickerOptions = columns[index].pickerOptions
              // 更新关联节点的日期配置信息
              // this.$set(this.$parent.searchOption[index], 'pickerOptions', { ...(item.pickerOptions || {}), ...opt })
              this.$set(this.$parent.searchOption[index], 'pickerOptions', pickerOptions || opt)
              if (!val) return
              const vTime = new Date(val)
              if (!endTime || vTime > new Date(endTime)) {
                this.searchForm[relationKey] = dayjs(new Date(vTime)).format('YYYY-MM-DD') + ' 23:59:59'
                endNode.focus()
              }
            }
          })
        }
      })
    }
  }
});
</script>
<style lang="scss">
.table-search {
  // transition: 0.3s height ease-in-out;
  transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
  //padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  .btn-query-right {
    padding: 7px 16px;
    font-size: 14px;
    min-width: 80px;
  }
}
</style>
