/**
  * 自定义筛选
  * @Description: 通过改变option的hide属性达到对应的效果
  * @author: zhc
  * @Date: 2020-07-11
*/
<template>
  <div class="table-custom">
    <el-dropdown trigger="click">
      <span class="el-dropdown-link">
         <i class="iconfont icon-qita_ico_shaixuan icon-style"></i>
        {{ $lang('自定义列') }}</span>
      <el-dropdown-menu slot="dropdown" class="table-custom-drop">
        <el-checkbox class="check-all" :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">{{ $lang('全选') }}</el-checkbox>
        <el-checkbox-group v-model="checkedList" @change="checkedListChange">
          <el-checkbox v-for="(item, index) in list" :label="item.label" :key="index" :disabled="index === 0 || index === 1">{{$lang(item.label)}}</el-checkbox>
        </el-checkbox-group>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import create from '../../core/create';
export default create({
  name: 'crud',
  inject: ['crud'],
  data () {
    return {
      checkAll: true, // v-model是否全选
      checkedList: [], // 选中的数据
      allList: [], // 列表的数据
      allListFirst: '', // 列表的第一条数据
      isIndeterminate: false // indeterminate属性用以表示 checkbox的不确定状态
    };
  },
  computed: {
    list () {
      // this.crud.propOption参数对应column的参数
      let list = [];
      for (var o in this.crud.propOption) {
        const ele = this.crud.propOption[o]
        if (ele.hide !== true) {
          list.push(Object.assign(ele, { 'id': o }))
        }
      }
      list = list.filter(item => !this.validatenull(item.order)).sort((a, b) => (a.order || 0) - (b.order || 0)).concat(list.filter(item => this.validatenull(item.order)))
      list.unshift({ label: this.$lang('序号') })
      return list;
    }
  },
  mounted() {
    this.checkedList = this.list.map(item => item.label); // 默认全选数据
    this.allList = this.list.map(item => item.label); // 默认缓存全部的列表
    this.allListFirst = this.allList[1]; // 默认缓存列表的第一条数据
  },
  methods: {
    /**
     * @Description: 全选change触发方法
     * @param {Boolean} [val] - 是否为全选状态
     */
    checkAllChange(val) {
      this.checkedList = val ? this.list.map(item => item.label) : ['序号', this.allListFirst]; // 根据是否全选状态返回对应的值
      this.checkedListChange(val ? this.allList : ['序号', this.allListFirst]) // 根据是否全选状态触发列表显隐
      this.isIndeterminate = false; // indeterminate属性用以表示 checkbox的不确定状态
    },
    /**
     * @Description: 当选中的数据发生改变触发
     * @param {Array} [value] - 当前选中的值
     */
    checkedListChange(value) {
      console.log(value, 'value')
      this.crud.columnFormOption.map((item, index) => {
        if (this.allList.includes(item.label) && (item.label !== this.allListFirst) || index !== '序号') {
          item.hide = !value.includes(item.label)
        }
      })
      this.crud.tableRefresh() // 用于刷新表格
      const checkedCount = value.length; // 当前选中的列表长度
      this.checkAll = checkedCount === this.list.length; // 判断是否全选状态
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.list.length; // 判断是否全选状态
    }
  }
});
</script>
<style lang="scss">
.el-table__empty-block {
  width: 100% !important;
}
.table-custom {
  margin: 0 0 16px;
  display: flex;
  justify-content: flex-end;
  .el-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    &:hover {
      color: $-color-brand;
    }
    .icon-style {
      margin-right: 8px;
    }
    .el-dropdown-link {
      font-size: 12px;
    }
  }
}
.table-custom-drop {
  width: 418px;
  padding: 9px 16px !important;
  left: calc(100% - 476px) !important;
  margin-top: 4px !important;
  .el-checkbox-group {
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: 5px;
    .el-checkbox {
      width: 204px;
      height: 26px;
      line-height: 26px;
      font-size: 12px;
      margin-right: 0;
      .el-checkbox__input {
        vertical-align: sub;
        // margin-left: 16px;
      }
      .el-checkbox__label {
        padding-left: 8px;
        font-size: 12px;
      }
      &:focus, &:not(.is-disabled):hover {
        color: $-color-text-shalow-subtitle;
        background: $c-bg-2;
      }
    }
    .el-checkbox:nth-child(odd){
      margin-left: 0;
    }
    .el-checkbox:nth-child(even){
      margin-left: 10px;
    }
    &::-webkit-scrollbar {
      width: 4px;
      /*height: 4px;*/
    }
  }
  .el-radio__input.is-disabled .el-radio__inner {
    border-color: #f4f4f4 !important;
  }
  .el-checkbox__input.is-checked + .el-checkbox__label {
    font-weight: 400;
    color: #4c4d57 !important;
  }
  .el-checkbox__input.is-disabled .el-checkbox__inner {
    border-color: #f4f4f4 !important;
  }
  .el-checkbox__inner{
    width: 16px;
    height: 16px;
  }
  .el-checkbox__inner::after{
    top: 2px;
    left: 5px;
  }
  //.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  //  border-color: #ffffff;
  //}
  .check-all{
    width: 100%;
    line-height: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e8e8e8;
    .el-checkbox__label{
      font-size: 12px;
    }
    .el-checkbox__input {
      vertical-align: sub;
    }
  }
}
</style>

