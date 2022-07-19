<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <Aside :isCollapse="isCollapse"></Aside>
    <div class="collapse" :class="isCollapse ? 'collapse-min' : ''" @click="handleCollapse">
      <i class="iconfont" :class="isCollapse ? 'icon-caidan_ico_shouqi' : 'icon-caidan_ico_zhankai'"></i>
    </div>
    <!-- main -->
    <Main class="homePages" :class="isCollapse ? 'homePages-mini' : ''"></Main>
  </div>
</template>

<script type="text/javascript">
import Aside from './Aside'
import Main from './Main'
import { mapGetters, mapActions } from 'vuex'
import debounce from 'lodash/debounce'

export default {
  name: 'Layout',
  props: {},
  components: { Aside, Main },
  data() {
    return {
      calcHeight: 122,
      restHeight: 0,
      clientHeight: 1080,
      isCollapse: false,
    }
  },
  computed: {
    ...mapGetters({
      tableHeight: 'tableHeight',
    }),
  },
  watch: {
    $route(to, from) {
      // 设置标题
      this.$nextTick(() => {
        this.calcTableHeight()
      })
    },
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.calcTableHeight()
      // 绑定窗口resize事件
      const fn = debounce(this.calcTableHeight, 200) // 表格高度计算防抖
      window.addEventListener('resize', fn, false)
      // 触发destroyed钩子，移除resize的监听事件
      this.$once('hook:destroyed', () => {
        window.removeEventListener('resize', debounce(this.calcTableHeight, 200), false)
      })
    })

    // 监听高度重算事件
    this.$bus.$on('doLayout', () => {
      this.$nextTick(() => this.calcTableHeight())
    })
  },
  methods: {
    ...mapActions({
      setTableHeight: 'setTableHeight',
    }),
    handleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 计算元素的高度用于表格自适应
    getRestHeight() {
      const arr = ['AlertError', 'Title', 'Search', 'Pagination', 'Menu', 'Tip', 'SearchExtend', 'SearchMore', 'TableCustom']
      let height = 0
      arr.forEach(function (id) {
        const els = document.querySelectorAll('#jms' + id)
        els.forEach(item => {
          if (item.offsetParent !== null) {
            height += item.clientHeight
            if (id === 'AlertError') {
              height += 12
              console.log('AlertError')
            }
          }
        })
      })
      return height
    },
    calcTableHeight() {
      this.clientHeight = document.documentElement.clientHeight
      this.restHeight = this.getRestHeight()
      const tableHeight = this.clientHeight - this.restHeight - this.calcHeight
      this.setTableHeight(tableHeight)
    },
  },
}
</script>

<style lang="scss" scoped>
.layout {
  width: 100%;
  min-width: 1280px;
  height: 100%;
  overflow: hidden;
  .homePages-mini {
    margin-left: 80px;
    transition: margin-left 0.1s linear;
  }
}
</style>
