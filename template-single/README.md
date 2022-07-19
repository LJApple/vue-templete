# 目录结构
```
├─.env
├─.env.dev-release
├─.env.development.local
├─.env.pre-release
├─.env.production
├─.env.test
├─package.json
├─README.md
├─vue.config.js
├─src
  ├─App.vue
  ├─main.js
  ├─@public
  | ├─http
  | ├─plugins
  | ├─utils
  ├─api
  ├─assets
  | ├─logo.png
  | ├─iconfont
  | ├─images
  | | ├─freightInquiry
  | | ├─login
  | ├─style
  | | ├─jms-style
  | ├─theme
  |   ├─indexTheme.json   ──────────── echarts主题颜色配置
  |   ├─theme.scss
  ├─components
  | ├─index.js
  | ├─avuex
  | | ├─index.js
  | | ├─core
  | | ├─ele-ui
  | | | ├─crud
  | | | | ├─column-new.vue
  | | | | ├─column.vue
  | | | | ├─config.js
  | | | | ├─custom-column.vue   ──────────── 自定义列表
  | | | | ├─dialog-form.vue
  | | | | ├─dynamic-column.vue
  | | | | ├─header-search.vue
  | | | | ├─index.vue
  | | | | ├─table-infinite-scroll.js
  | | | | ├─table-page.vue
  | | | | ├─@public
  | | ├─global
  | | | ├─variable.js
  | | ├─locale
  | | ├─plugin
  | | ├─styles
  | | ├─utils
  | ├─base
  | | ├─BaseAddress.vue   ──────────── 始发地、目的地组件（addressType=1：始发地-省市；addressType=2：目的地-省市区）
  | | ├─BaseCaptcha.vue   ──────────── 登录验证码
  | | ├─BaseChartLoad.vue   ──────────── echarts加载框
  | | ├─BaseInputTag.vue
  | ├─templet   ──────────── 发送邮件样式（后端发送）、gmail手机客户端多条折叠会部分无法显示
  |   ├─forgetPassword.html   ──────────── 忘记密码邮件样式
  |   ├─mainAccountVerification.html   ──────────── 主账户激活样式
  |   ├─subAccountVerification.html   ──────────── 子账户激活样式
  ├─i18n
  ├─mixins
  ├─router
  ├─store
  | ├─index.js
  | ├─mutation-types.js
  | ├─module
  |   ├─base.js
  |   ├─common.js
  |   ├─tags.js
  ├─utils
  | ├─crypto.js
  | ├─utils.js
  ├─views
      ├─About.vue
      ├─Home.vue
      ├─index
      | ├─Demo.vue
      | ├─Index.vue
      | ├─IndexContent.vue
      | ├─indexCharts   ──────────── 首页图表
      | | ├─BillingManagement.vue
      | | ├─CostAnalysis.vue
      | | ├─MapDistribution.vue
      | | ├─PaymentToBeReceived.vue
      | | ├─StatusCharts.vue
      | | ├─TOP5destination.vue
      | | ├─WaybillGrowth.vue
      | ├─map   ──────────── 印尼地图
      | | ├─idnMap.js
      | ├─style
      |   ├─indexCommonStyle.scss
      ├─layout
      | ├─Aside.vue
      | ├─Layout.vue
      | ├─Main.vue
      | ├─MyProfile.vue    ──────────── 我的资料
      | ├─Redirect.vue
      | ├─TagBar.vue
      | ├─TopBar.vue
      ├─login
      | ├─ActiveMail.vue
      | ├─ForgetPassword.vue
      | ├─Login.vue
      ├─modules-页面模块
```

# 格式规范
## 组件命名
### 组件名为多个单词
组件名应该始终是多个单词的，这样做可以避免跟现有的以及未来的 HTML 元素相冲突，因为所有的 HTML 元素名称都是单个单词的。
应用特定样式和约定的基础组件 (也就是展示类的、无逻辑的或无状态的组件) 应该全部以一个特定的前缀开头，比如 Base、App 或 V。
```javascript
// 不推荐
components
|- MyButton.vue
|- VueTable.vue
|- Icon.vue

// 推荐
components
|- BaseButton.vue
|- BaseTable.vue
|- BaseIcon.vue

components
|- VButton.vue
|- VTable.vue
|- VIcon.vue
```
+ 单例组件名，只应该拥有单个活跃实例的组件应该以 The 前缀命名，以示其唯一性。
```javascript
// 这不意味着组件只可用于一个单页面，而是每个页面只使用一次。这些组件永远不接受任何 prop，因为它们是为你的应用定制的

// 不推荐
components
|- Heading.vue
|- MySidebar.vue

// 推荐
components
|- TheHeading.vue
|- TheSidebar.vue
```
### 紧密耦合的组件名
和父组件紧密耦合的子组件应该以父组件名作为前缀命名。

如果一个组件只在某个父组件的场景下有意义，这层关系应该体现在其名字上。因为编辑器通常会按字母顺序组织文件，所以这样做可以把相关联的文件排在一起。
```javascript
// 不推荐
components
|- TodoList.vue
|- TodoItem.vue
|- TodoButton.vue

components
|- SearchSidebar.vue
|- NavigationForSearchSidebar.vue

// 推荐
components
|- TodoList.vue
|- TodoListItem.vue
|- TodoListItemButton.vue

components
|- SearchSidebar.vue
|- SearchSidebarNavigation.vue
```

### 完整单词的组件名
组件名应该倾向于完整单词而不是缩写。不常用的缩写尤其应该避免。

```javascript
// 不推荐
components
|- SdSettings.vue
|- UProfOpts.vue

// 推荐
components
|- StudentDashboardSettings.vue
|- UserProfileOptions.vue
```



## 书写
### template 模块
+ 超过一个属性时，属性换行对齐，v-xx指令放最前，自有属性放最后；
```Vue
<!-- 不推荐 -->
<input type="text" class="hf-input" v-if="false" placeholder="请输入验证码" v-model="form.imageCode" />
<img src="https://vuejs.org/images/logo.png" alt="Vue Logo">

<!-- 推荐 -->
<input
    v-if="false"
    v-model="form.imageCode"
    type="text"
    class="hf-input"
    placeholder="请输入验证码"
/>

<img
    src="https://vuejs.org/images/logo.png"
    alt="Vue Logo"
>
```
+ v-xx指令排序规则，控制显示 -> 控制循环 -> v-bind属性 -> v-on事件绑定；
```Vue
<!--推荐-->
<ul v-if="todos.length > 0">
    <li
      is="todo-item"
      v-for="(todo, index) in todos"
      v-bind:key="todo.id"
      v-bind:title="todo.title"
      v-on:remove="todos.splice(index, 1)"
    ></li>
  </ul>
```
### 指令缩写
指令缩写 (用 : 表示 v-bind:、用 @ 表示 v-on: 和用 # 表示 v-slot:) 应该要么都用要么都不用。

### 组件/实例的选项的顺序(推荐统一顺序)
```Txt
1.全局感知 (要求组件以外的知识)
name(组件名称)

2.模板依赖 (模板内使用的资源)
components(组件)
directives(指令)
filters(过滤器)

3.组合 (向选项里合并 property)
mixins(接收一个混入对象的数组)

4.接口 (组件的接口)
props/propsData(接收来自父组件的数据)

5.本地状态 (本地的响应式 property)
data(实例的数据对象)
computed(计算属性)

6.事件 (通过响应式事件触发的回调)
watch(监听)

7.生命周期钩子 (按照它们被调用的顺序)
beforeCreate
created
beforeMount
mounted
beforeUpdate
updated
activated
deactivated
beforeDestroy
destroyed

8.非响应式的 property (不依赖响应系统的实例 property)
methods(方法)
```

## 注释
+ 页面首行
```javascript
/**
 * @Description: 页面名称
 * @author: name
 * @Date: 2020-07-07
*/
```
+ HTML注释，在大结构块时，加入合适的注释标签，并保持良好的层级缩进
```javascript
<div>
  <!-- “导入”组件/ -->
  <div>xxx</div>
  <!-- 搜索框 -->
  <div>xxx</div>
  <!-- 网点搜索框 -->
  <div>搜索组件</div>
</div>
```
+ 方法注释(示例如下)
```javascript

/**
  * @Description: 根据标签中字数动态改变字体大小
  * @param {String} [id] - html标签id属性
  * @param {Number} [num] - 设置超出字符长度个数为多少
  * @param {Number} [size] - 超出字符长度后字体大小
  * @return {Boolean} 返回状态的设置
*/
  function resizeFont(id, num, size){
    const elem = document.getElementById(id)
    if (elem.innerHTML.length > num) {
      elem.style.fontSize = size + 'px'
    }
    return false
  }
  
```
## husky + commitlint 配置

## 安装lint-staged husky
npm i lint-staged husky -save-dev
## package.json中添加prepare脚本
npm set-script prepare "husky install"
npm run prepare
## 添加hooks
npx husky add .husky/pre-commit "npm run lint"
## 添加commit message
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"' 
## commitlint 安装
npm i @commitlint/cli @commitlint/config-conventional -D
## 配置 commitlint.config.js