<template>
	<div class="sidebar" :class="isCollapseSlider ? 'slider-mini' : '' ">
    <div class="header-left">
        <div class="logo-img" @click="goVipPage">
          <!-- <img src="@/assets/images/logo.png" :alt="$lang('极兔')"> -->
          <i class="iconfont icon-logo jt_logo" v-if="!isCollapseSlider"></i>
          <i class="iconfont icon-qita_LOGO_xiao jt_logo" v-else></i>
        </div>
      </div>
		<el-menu
      class="el-menu-vertical-demo"
      :class="isCollapseSlider ? 'slider-ul-mini' : '' "
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapseSlider"
			:unique-opened="false"
      :collapse-transition="false"
      :router="true"
			:default-active="defaultActiveName"
		>
			<template v-for="(item, index) in menuList">
				<!-- 没有子菜单 -->
        <!--menuMore暂时写死-->
				<el-menu-item
					:key="index"
					v-if="!item.childResources"
					:index="item.resourceCode"
          :class="{'el-menu-type-home': item.resourceCode === 'index'}"
				>
					<router-link :to="{ name: item.resourceCode }">
            <i v-if="item.resourceCode === 'index'" :class="[item.resourceInco]" class="iconfont menuicon"></i>
            <el-tooltip :content="$lang(item.resourceName)" v-model="item.showTooltip" class="tooltipContent" placement="right" :disabled="!item.showTooltip">
              <span @mouseenter="setTooltip($event, item)">{{ $lang(item.resourceName) }}</span>
            </el-tooltip>
					</router-link>
				</el-menu-item>
				<!-- 有子菜单 -->
        <!--menuMore暂时写死-->
				<el-submenu
            v-if="item.childResources"
					:key="index"
					:index="item.resourceCode"
          popper-class="menu-custom"
          :class="isCollapseSlider ? 'el-menu-mini' : '' "
        >
					<template slot="title">
						<i :class="[item.resourceInco]" class="iconfont"></i>
            <el-tooltip :content="$lang(item.resourceName)" v-model="item.showTooltip" class="tooltipContent" placement="right" :disabled="!item.showTooltip">
              <span @mouseenter="setTooltip($event, item)">{{ $lang(item.resourceName)}}</span>
            </el-tooltip>
					</template>
					<el-menu-item
						:key="index"
						:index="child.resourceCode"
						v-for="(child, index) in item.childResources"
          >
						<router-link :to="{ name: child.resourceCode }">
              <span>{{ $lang(child.resourceName) }}</span>
						</router-link>
					</el-menu-item>
				</el-submenu>
			</template>
		</el-menu>
	</div>
</template>

<script type="text/javascript">
import { mapGetters } from 'vuex'
export default {
  name: 'Aside',
  data() {
    return {
      isCollapseSlider: false
    }
  },
  props: ['isCollapse'],
  computed: {
    ...mapGetters(['menu', 'lang']),
    menuList() {
      return this.menu;
    },
    defaultActiveName() {
      return this.$route.name
    }
  },
  watch: {
    isCollapse(val) {
      this.isCollapseSlider = val
    }
  },
  methods: {
    setTooltip(e, item) {
      const spanWidth = e.target.scrollWidth
      const TemporaryTag = document.createElement('span')
      TemporaryTag.innerText = this.$lang(item.resourceName)
      TemporaryTag.className = 'getTextWidth'
      document.querySelector('body').appendChild(TemporaryTag)
      document.querySelector('.getTextWidth').remove()
      item.showTooltip = spanWidth > 140
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    goVipPage() {
      let langType = 'zh';
      switch (this.lang) {
        case 'CN':
          langType = 'zh'
          break;
        case 'EN':
          langType = 'en'
          break;
        case 'YN':
          langType = 'id'
          break;
      }
      window.open(`https://vipcustomer.jet.co.id/?lang=${langType}`)
    }
  }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  display: none;
}
.sidebar {
	//width: 200px;
	float: left;
	height: 100%;
  // padding-left: 10px;
  & > ul {
    padding: 10px 0;
  }
  .tooltipContent{
  font-size: 14px;
  }
}
</style>

<style lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
.sidebar {
  overflow-y: hidden;
	.el-menu {
    width: 200px;
		height: calc(100% - 68px);
    margin: 0 auto;
    background: #FFFFFF;
    border-right: 0;
    overflow-y: auto;
  }
  .el-menu-type-home {
    text-indent: 16px!important;
  }
	.el-menu-item {
    width: 200px;
    min-width: 200px;
		position: relative;
    margin: 0 auto;
		height: 40px;
		line-height: 38px;
		font-weight: 400;
		color: #61666d;
    // border-radius: 8px;
    text-indent: 46px;
    &.is-active {
			background: #FFFFFF;
			font-weight: 600;
			a {
        max-width: 200px;
        background: #e60012;
        // border-radius: 8px;
				color: $-color-white;
			}
		}
		&:hover {
      background: #ebebeb;
      color: #E60012;
		}
		a {
			position: absolute;
			top: 0;
			left: 0;
			display: block;
			width: 100%;
			height: 100%;
			color: inherit;
			text-decoration: none;
			box-sizing: border-box;
			.iconfont {
				font-weight: normal;
				margin-right: 10px;
			}
		}
	}

	//有子菜单
	.el-submenu {
		.el-menu-item {
      width: 200px;
      //min-width: auto;
			height: 40px;
			line-height: 38px;
			font-size: 14px;
			font-weight: normal;
		}
		.el-submenu__title {
      width: 200px;
      margin: 0 auto;
      text-indent: 16px;
			font-weight: 500;
			height: 48px;
			line-height: 48px;
			color: #61666d;
			font-size: 16px;
			padding-left: 0 !important;
			&:hover {
        background: #ebebeb;
        // border-radius: 8px;
			}
      i {
        text-indent: 0;
      }
			.iconfont {
				font-weight: normal;
				margin-right: 10px !important;
			}
      span{
        display: inline-block;
        margin-left: -20px;
        width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
		}
		a {
			.iconfont {
				font-size: 14px;
				margin-right: 8px;
			}
		}
		&.is-active {
			.el-submenu__title {
				color: $-color-brand;
				.iconfont,
				i.el-submenu__icon-arrow {
					color: $-color-brand;
          margin-top: -3px !important;
				}
			}
		}
	}
  .el-submenu__icon-arrow {
    margin-top: -3px;
  }
}
.slider-mini {
  padding-left: 0 !important;
  .header-left .logo-img {
    width: 72px;
  }
  .slider-ul-mini {
    width: 80px;
    .iconfont {
      font-size: 20px !important;
    }
    .el-menu-item {
      min-width: 60px;
      height: 48px;
      line-height: 48px;
      // border-radius: 8px;
      width: 60px !important;
    }
    .el-submenu__title {
      // border-radius: 8px;
      width: 60px !important;
      margin: 0 auto;
      & > a {
        line-height: 48px;
      }
    }
    .el-submenu.is-active .el-submenu__title {
      background: #e60012;
      i {
        color: #FFFFFF;
      }
    }
  }
}
 .header-left {
    height: 48px;
    cursor: pointer;
    .logo-img {
      width: 113px;
      height: 24px;
      line-height: 48px;
      margin-left: 8px;
      -moz-user-select: none; /*火狐*/
      -webkit-user-select: none; /*webkit浏览器*/
      -ms-user-select: none; /*IE10*/
      -khtml-user-select: none; /*早期浏览器*/
      user-select: none;
     .jt_logo{
        color: #e60012;
        font-size: 24px !important;
      }
    }
  }
</style>
