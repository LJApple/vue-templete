<!--
 * @Description: echarts加载组件
 * @Version: 1.0
 * @Autor: zhaoyy
 * @Date: 2021-08-05 10:26:03
 * @LastEditors: zhaoyy
 * @LastEditTime: 2021-10-18 17:54:54
-->
<template>
  <div class="loadComponent">
    <div v-show="loading" class="loading">
      <img src="@/assets/images/loading.gif" :alt="$lang('加载中')" class="rankLoading" />
    </div>
    <div v-show="empty" class="empty">
      <div v-if="emptyTitle" class="emptyTitle"></div>
      <div class="emptyContent" :style="`top: ${emptyTitle ? '49px' : '0'};height: ${emptyTitle ? 'calc(100% - 49px)' : '100%'};`">
        <img src="@/assets/images/empty.png" :alt="$lang('暂无数据')" />
        <div v-if="hasText">{{ $lang('暂无数据') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    empty: {
      type: Boolean,
      default: false
    },
    emptyTitle: {
      type: Boolean,
      default: true
    },
    hasText: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.loadComponent {
  display: contents;
  .empty {
    display: contents;
    .emptyTitle {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 49px;
    }
    .emptyContent {
      position: absolute;
      top: 49px;
      left: 0;
      width: 100%;
      height: calc(100% - 49px);
      border-radius: 12px;
      @include bg-color('main');
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      > img {
        height: 260px;
      }
      > div {
        @include text-color('secondary');
        margin-top: 180px;
        position: absolute;
      }
    }
  }
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    @include bg-color('main');
    opacity: 0.85;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    > img {
      height: 200px;
    }
    > div {
      position: absolute;
      @include text-color('secondary');
      left: 50%;
      top: 50%;
      transform: translate(-50%, 300%);
    }
  }
}
</style>
