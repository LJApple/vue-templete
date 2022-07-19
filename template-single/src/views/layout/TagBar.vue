<template>
	<div class="tags-view-container" ref="tagsContainer">
		<el-tabs
			:value="activeRoute"
			type="card"
			@contextmenu.prevent.native="openMenu($event)"
			@tab-remove="removeTag"
			@tab-click="gotoRuter"
		>
			<el-tab-pane
				ref="tag"
				:closable="tag.name !== 'index' && visitedViews.length !== 1"
				stretch="true"
				v-for="tag in visitedViews"
				:key="tag.meta.title"
				:label="$lang(tag.meta.title)"
				:name="tag.name"
				:to="{
					path: tag.path,
					query: tag.query,
					fullPath: tag.fullPath,
				}"
			>
			</el-tab-pane>
		</el-tabs>
		<ul
			v-show="visible"
			:style="{ left: left + 'px', top: top + 'px' }"
			class="contextmenu"
		>
			<!-- <li @click="refreshSelectedTag">{{$lang('刷新')}}</li> -->
			<li
				v-if="!(selectedTag.meta && selectedTag.meta.affix)"
				@click="closeSelectedTag(selectedTag)"
			>
				{{$lang('关闭')}}
			</li>
			<li @click="closeOthersTags">{{$lang('关闭其他')}}</li>
			<li @click="closeAllTags">{{$lang('关闭所有')}}</li>
		</ul>
	</div>
</template>

<script type="text/javascript">
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'TagBar',
  props: {},
  components: {},
  data() {
    return {
      activeRoute: '',
      visible: false,
      top: 110,
      left: 65,
      selectedTag: {}
    }
  },
  computed: {
    ...mapGetters({
      visitedViews: 'tags/visitedViews'
    })
  },
  watch: {
    $route() {
      this.addTags()
      this.activeRoute = this.$route.name
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },

  created() {
    this.activeRoute = this.$route.name
  },
  mounted() {
    this.addTags()
    console.log('########', this.visitedViews)
  },
  methods: {
    ...mapActions({
      addView: 'tags/addView',
      delView: 'tags/delView',
      delCachedView: 'tags/delCachedView',
      delOthersViews: 'tags/delOthersViews',
      delAllViews: 'tags/delAllViews'
    }),
    /**
		 * @description 标签删除
		 */
    removeTag(targetName) {
      const tabs = this.visitedViews
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          this.closeSelectedTag(tabs[index])
        }
      })
    },
    /**
		 * @description 标签删除2
		 */
    closeSelectedTag(view) {
      this.delView(view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    // tag为活动
    isActive(route) {
      return route.path === this.$route.path
    },
    //
    toLastView(visitedViews) {
      const latestView = visitedViews.pop()
      // 设置了首页不可能删除 所以latestView一直存在
      if (latestView) {
        this.$router.push(latestView)
      } else {
        this.$router.push({ path: '/' })
      }
    },
    /**
		 * @description 标签点击 路由跳转
		 */
    gotoRuter(view) {
      this.$router.push({
        path: view.$attrs.to.path,
        query: view.$attrs.to.query || {}
      })
    },
    /**
		 * @description 右键
		 */
    openMenu(e) {
      if (e.target.getAttribute('role') === 'tab') {
        const id = e.target.id
        const name = id.replace('tab-', '')
        const menuMinWidth = 15
        const offsetWidth = this.$el.offsetWidth
        const maxLeft = offsetWidth - menuMinWidth
        const wd = 200
        const left = e.clientX - wd
        if (left > maxLeft) {
          this.left = maxLeft
        } else {
          this.left = left
        }
        this.top = e.clientY + 20
        this.visible = true
        const tabs = this.visitedViews
        tabs.forEach((tab) => {
          if (tab.name === name) {
            this.selectedTag = tab
          }
        })
      }
    },
    /**
		 * @description 添加标签
		 */
    addTags($route) {
      const route = $route || this.$route
      if (route.name) {
        this.addView(route)
      }
    },
    closeMenu() {
      this.visible = false
    },
    /**
		 * @description 刷新
		 */
    refreshSelectedTag() {
      const { fullPath } = this.selectedTag
      this.$nextTick(() => {
        this.$router.push({ path: '/redirect' + fullPath })
      })
    },
    /**
		 * @description 关闭其他
		 */
    closeOthersTags() {
      this.$router.push(this.selectedTag)
      this.delOthersViews(this.selectedTag).then(() => {})
    },
    /**
		 * @description 关闭所有
		 */
    closeAllTags() {
      this.delAllViews().then((visitedViews) => {
        this.toLastView(visitedViews)
      })
    }
  }
}
</script>
<style lang="scss">
.tags-view-container {
  .el-tabs--card>.el-tabs__header .el-tabs__item:first-child{
    border-left: 1px solid #DCDEE1;
  }
  .el-tabs--card>.el-tabs__header .el-tabs__item:last-child{
    border-right: 1px solid #DCDEE1;
  }
  .el-tabs--card>.el-tabs__header .is-scrollable{
    .el-tabs__item:first-child{
      border-left: none;
    }
    .el-tabs__item:last-child{
      border-right: none;
    }
  }
	position: relative;
	.contextmenu {
		margin: 0;
		background: #fff;
		z-index: 3000;
		position: absolute;
		list-style-type: none;
		padding: 5px 0;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 400;
		color: #333;
		box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
		li {
			margin: 0;
			padding: 7px 16px;
			cursor: pointer;
			&:hover {
				background: #eee;
			}
		}
	}
}
</style>

<style lang="scss">
$tag-height: 48px;
.tags-view-container {
	width: 100%;
	height: $tag-height;
	.el-tabs .el-tabs__header {
    border-bottom: none;
    .el-tabs__nav-wrap {
      padding: 0 0 0 24px;
    }
    .el-tabs__nav-wrap.is-scrollable{
      padding: 0 24px;
    }
		.el-tabs__nav-wrap .el-tabs__nav-scroll .el-tabs__nav {
			border: none;
			overflow: hidden;
			border-top-left-radius: 4px;
			border-top-right-radius: 4px;
			.el-tabs__item {
				height: 48px;
				font-size: 14px;
				line-height: 48px;
				padding: 0 20px;
				border-bottom: none;
				font-weight: 400;
				text-align: center;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				color: #9499a3;
				background-color: #fff;
				.el-icon-close {
					position: absolute;
					top: 16px;
					right: 3px;
					&:hover {
						background: red;
					}
				}
				&.is-active {
					color: #fff;
					padding-right: 30px;
					font-weight: bold;
					color: $-color-brand;
          border-top: 2px solid  $-color-brand;
				}
			}
		}
    .el-tabs__nav-next, .el-tabs__nav-prev {
      line-height: 48px !important;
    }
    .el-tabs__nav-prev {
      margin-left: 4px;
    }
    .el-tabs__nav-next {
      margin-right: 4px;
    }
    .el-icon-arrow-left, .el-icon-arrow-right{
      //  width: 16px;
      // height: 32px;
      padding: 0 2px;
      background: #edeef3;
      border-radius: 4px;
      line-height: 32px;
      font-weight: 500;
      color: #61666D;
    }
	}
}
</style>
