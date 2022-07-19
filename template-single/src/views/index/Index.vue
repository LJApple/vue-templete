<!--
 * @Description: 首页
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-07-12 10:36:00
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-15 16:51:42
-->
<template>
  <div id="Home">
    <div class="tabs">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane :label="$lang('全部')" name="ALL"></el-tab-pane>
        <el-tab-pane label="VIP" name="VIP"></el-tab-pane>
        <el-tab-pane :label="$lang('电商')" name="ECOMM"></el-tab-pane>
        <IndexContent :activeName="activeName" />
      </el-tabs>
    </div>
  </div>
</template>

<script type="text/javascript">
import IndexContent from './IndexContent'
export default {
  name: 'App',
  components: {
    IndexContent
  },
  data() {
    return {
      isShowFirst: false,
      activeName: 'ALL'
    }
  },
  watch: {},
  created() {
    const titleTexts = document.querySelectorAll('.title')
    titleTexts.forEach(titleText => {
      const letters = titleText.textContent.split('')
      titleText.textContent = ''
      letters.forEach((letter, i) => {
        const span = document.createElement('span')
        span.textContent = letter
        span.style.animationDelay = `${i * 0.05}s`
        titleText.append(span)
      })
    })
  },
  methods: {
    handleClick() {}
  }
}
</script>

<style lang="scss">
#Home {
  background: #fff;
  padding: 4px 6px 16px 16px;
  // margin-right: -10px;
  border-radius: 0px 4px 4px 4px;
  height: calc(100% - 20px);
  overflow-y: auto;
  .tabs{
    // margin-bottom: 10px;
  }
  .el-tabs__nav-scroll{
    display: flex;
    justify-content: center;
  }
  .el-tabs__nav-wrap::after{
    height: 0;
  }
  .el-tabs.el-tabs--card
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav-scroll
    .el-tabs__nav
    .el-tabs__item.is-active {
    color: #e60012;
    font-weight: 500;
    border-color: #e60012;
    border-radius: 15px !important;
    // color: $-color-white;
    margin-top: -1px;
  }
  .el-tabs.el-tabs--card
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav-scroll
    .el-tabs__nav
    .el-tabs__item {
    padding: 0 24px;
    color: #a1a3a6;
    border: none;
    border-radius: 0 !important;
    text-align: center;
    box-sizing: border-box;
    margin-top: -1px;
  }
  .el-tabs.el-tabs--card
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav-scroll
    .el-tabs__nav
    .el-tabs__item:not(.is-active){
      background: rgba(255,255,255,0)
    }
  .el-tabs__item{
    font-size: 16px;
  }
  .el-tabs--card > .el-tabs__header {
    border: none;
    .el-tabs__nav {
      background: #fff;
      border-radius: 8px;
      border: 1px solid #c4c8cc;
      height: 30px;
      box-sizing: border-box;
    }
  }
}
</style>
