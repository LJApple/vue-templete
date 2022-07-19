
<template>
  <div class="input-tag-container"
       :class="{'input-tag-container--active': isInputActive, 'customer-input-tag': prefixIcon}">
    <!-- <i class="iconfont iconwuliao-shanchu color-alert" v-if="clearBtnVisible" @click="clearFn"></i> -->
    <div @click.stop="focusNewTag"
         :class="{
        'read-only': readOnly,
        'vue-input-tag-wrapper--active': isInputActive,
        'none-select': isShift
      }"
         :style="{height: inputHeight, maxHeight}"
         class="vue-input-tag-wrapper"
         @scroll="scrollFn">
      <div v-for="(tag, index) in innerTags"
           :key="index"
           :data-index="index"
           class="input-tag-item">
        <span @click="changeActive(index)"
              :class="{'input-tag-active': selectIndexArr.includes(index) || activeIndex === index || index === editIndex, 'input-tag-error': validateTag(tag)}"
              class="input-tag">
          <span @click.stop="changeEdit(index)"
                :title="tag"
                :data-index="index"
                v-if="index !== editIndex">{{ tag }}</span>
          <input type="text"
                 class="edit-tag"
                 ref="input"
                 v-if="index === editIndex"
                 :value="tag"
                 @blur="modifyTag"
                 @keydown.stop
                 @keyup.esc.stop="notModify(tag)"
                 @keyup.enter.stop="modifyTag">
          <a v-if="!readOnly"
             @click.prevent.stop="remove(index)"
             class="remove">
            <slot name="remove-icon" />
          </a>
        </span>
      </div>
      <span v-show="newTag.length && isInputActive && clearBtnVisible || innerTags.length && isInputActive && clearBtnVisible"
            class="del-btn"
            @click="clearFn"
            :style="{top: scrollTop + 'px', bottom: -scrollTop + 'px'}">
        <span class="icon-container">
          <i v-show="clearBtnVisible"
             class="iconfont icon-qita_ico_qingchu"></i>
          <!-- <br />
          <i class="iconfont iconjiesuanpingtai-fuzhi" @click="copyText"></i> -->
        </span>
      </span>
      <span v-if="hasPrefixIcon"
            :class="prefixIcon"
            class="search-icon"></span>
      <input v-if="!readOnly && !isLimit"
             ref="inputtag"
             :placeholder="computedPlaceholder"
             type="text"
             v-model="newTag"
             @paste="pasteFn"
             @keydown.delete.stop="removeLastTag"
             @keydown.stop="handleInputKeydown"
             @blur="handleInputBlur"
             @focus="handleInputFocus"
             class="new-tag" />
    </div>
  </div>
</template>

<script>
import { removeRepeat, copyText } from '../avuex/utils/util'
const validators = {
  email: new RegExp(/^(([^<>()[\]\\.,:\s@\"]+(\.[^<>()[\]\\.,:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
  url: new RegExp(/^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i),
  text: new RegExp(/^[a-zA-Z]+$/),
  digits: new RegExp(/^[\d() \.\:\-\+#]+$/),
  isodate: new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/),
  codeName: /^([a-zA-Z0-9_]{1,20})$/,
  orderName: /^([a-zA-Z0-9_]{1,19})$/,
  isOrderNumber: /^([0-9]{1,19})$/,
  isNumber: /^([0-9_]{1,20})$/,
  dingcangCode: /^([0-9]{1,10})$/,
  hkzdCode: /^(.{1,30})$/
}
const keyBoard = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  comma: 188
}
export default {
  name: 'BaseInputTag',
  props: {
    value: {
      type: [Array, String],
      default: () => []
    },
    prefixIcon: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default() {
        return this.$lang('最多可查询500条，以逗号、空格或回车键隔开')
      }
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    validate: {
      type: [String, Function, Object],
      default: 'codeName'
    },
    addTagOnKeys: {
      type: Array,
      default: function () {
        const { enter, comma, tab, space } = keyBoard
        return [
          enter, // Return
          comma, // Comma ','
          tab, // Tab
          space // black space
        ]
      }
    },
    addTagOnBlur: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: -1
    },
    allowDuplicates: {
      type: Boolean,
      default: false
    },
    beforeAdding: {
      type: Function
    },
    maxHeight: {
      type: String,
      default: '180px'
    },
    height: {
      type: String,
      default: '28px'
    },
    clearBtnVisible: {
      type: Boolean,
      default: true
    },
    inView: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      newTag: '',
      innerTags: [...this.value],
      selectIndexArr: [],
      isInputActive: false,
      activeIndex: -1,
      editIndex: -1,
      isFocus: false,
      isCtrl: false,
      isShift: false,
      scrollTop: 0,
      timer: null
    }
  },
  computed: {
    isLimit() {
      return this.limit > 0 && Number(this.limit) === this.innerTags.length
    },
    computedPlaceholder() {
      if (!this.innerTags.length) {
        return this.placeholder
      }
      return ''
    },
    inputHeight() {
      const wrapperDom = document.querySelector('.vue-input-tag-wrapper')
      if (this.isInputActive && wrapperDom.clientHeight < 100 && !this.innerTags.length) {
        return '100px'
      }
      if (!this.isInputActive) {
        return this.height
      }
      return 'auto'
    },
    hasPrefixIcon() {
      return this.prefixIcon && !this.innerTags.length
    }
  },
  watch: {
    value(nval, oval) {
      this.innerTags = [...this.value]
      // 如果tag列表为空，则把输入框的清空
      if (!nval || (nval && !nval.length)) {
        this.newTag = ''
      }
    },
    selectIndexArr(newVal) {
      if (newVal.length > 1) {
        this.activeIndex = -1
      }
    },
    activeIndex(newVal) {
      if (newVal !== -1) {
        this.selectIndexArr = []
      }
    },
    newTag(newVal, oldVal) {
      if ((newVal.indexOf(' ') !== -1 && newVal.split(' ').length < 1 || newVal.indexOf(',') !== -1) && newVal.split(',').length < 1) {
        this.newTag = oldVal
      }
    }
  },
  methods: {
    scrollToViewport() {
      if (this.inView) {
        this.$nextTick(() => {
          const inputTagActiveEl = document.querySelector('.input-tag-active')
          if (inputTagActiveEl) {
            const { height } = inputTagActiveEl.getBoundingClientRect()
            document.querySelector('.vue-input-tag-wrapper').scrollTop = (height + 4) * this.activeIndex
          }
        })
      }
    },
    scrollFn(e) {
      this.scrollTop = e.target.scrollTop
    },
    clearFn() {
      this.innerTags = []
      this.newTag = ''
      this.tagChange()
    },
    changeEdit(index) {
      this.editIndex = index
      setTimeout(() => {
        const editTagDom = document.querySelector('.edit-tag')
        if (editTagDom) {
          editTagDom.focus()
          // editTagDom.select()
        }
      }, 300)
    },
    async modifyTag() {
      const value = document.querySelector('.edit-tag').value
      const isValid = await this.validateIfNeeded(value)
      if (isValid && this.editIndex !== -1) {
        this.innerTags[this.editIndex] = value
        this.tagChange()
        this.editIndex = -1
        // this.focusNewTag()
      }
    },
    notModify() {
      this.editIndex = -1
    },
    selectTag(index) {
      if (this.selectIndexArr.includes(index)) {
        const arr = this.selectIndexArr.filter(item => index !== item)
        this.selectIndexArr = arr
      } else {
        this.selectIndexArr.push(index)
      }
      if (this.activeIndex !== -1) {
        this.selectIndexArr.push(this.activeIndex)
      }
      this.selectIndexArr = this.selectIndexArr.sort((a, b) => a - b)
      this.activeIndex = -1
      this.isFocus = true
      if (!this.isInputActive) {
        this.isInputActive = true
      }
    },
    changeActive(index) {
      if (this.isCtrl || this.isShift) return
      this.selectIndexArr = []
      this.activeIndex = index
      this.isFocus = true
      if (!this.isInputActive) {
        this.isInputActive = true
      }
    },
    refrushInit() {
      this.innerTags.forEach(async element => {
        const isValid = await this.validateIfNeeded(element)
        // element = this.fixedCodeName(element, true)
        if (isValid) {
          this.innerTags = removeRepeat([...this.innerTags.map(element => this.fixedCodeName(element))])
          if (this.limit > 0) {
            this.innerTags = this.innerTags.splice(0, this.limit)
          }
          this.tagChange()
          this.newTag = ''
          console.log(this.innerTags)
        }
      })
    },
    pasteFn(e) {
      clearTimeout(this.timer)
      this.timer = setTimeout(async () => {
        const value = e.target.value
        if (value) {
          let tags = value.split(' ')
          tags = tags.join(',').split(',')
          tags = tags.join('，').split('，')
          tags.forEach(async element => {
            const isValid = await this.validateIfNeeded(element)
            if (isValid) {
              element = this.fixedCodeName(element, true)
              this.innerTags = removeRepeat([...this.innerTags, element])
              if (this.limit > 0) {
                this.innerTags = this.innerTags.splice(0, this.limit)
              }
              this.tagChange()
              e.target.value = ''
              this.newTag = ''
            }
          })
        }
      }, 100)
    },
    focusNewTag(e) {
      if (e && e.target.className === 'edit-tag') return
      this.isInputActive = true
      const generateIndex = (start, end) => {
        for (let i = start; i < end; i++) {
          this.selectIndexArr.push(i)
        }
      }
      if (e && e.target) {
        const dataIndex = e.target.getAttribute('data-index')
        if (this.isCtrl && dataIndex) {
          this.selectTag(Number(dataIndex))
        }
        if (this.isShift && this.activeIndex !== -1) {
          if (this.activeIndex < dataIndex) {
            generateIndex(Number(this.activeIndex), Number(dataIndex) + 1)
          } else {
            generateIndex(Number(dataIndex), Number(this.activeIndex) + 1)
          }
        }
        if (dataIndex) {
          return
        }
      }
      this.isFocus = true
      // if (this.readOnly || !this.$el.querySelector('.new-tag')) {
      //   return
      // }
      const newTagEl = this.$el.querySelector('.new-tag')
      newTagEl && newTagEl.focus()
    },
    blurTag() {
      this.isFocus = false
      this.isInputActive = false
    },
    handleInputFocus() {
      this.activeIndex = -1
      this.selectIndexArr = []
      this.isInputActive = true
    },
    handleInputBlur(e) {
      this.addNew(e)
    },
    copyText() {
      if (this.activeIndex !== -1) {
        return copyText(this.innerTags[this.activeIndex])
      }
      const arr = this.innerTags.filter((item, index) => this.selectIndexArr.includes(index))
      copyText(arr.join(' '))
    },
    handleInputKeydown(e) {
      this.fixedCodeName(undefined, undefined, e)
      this.addNew(e)
    },
    async addNew(e) {
      // ctrl + c 复制
      if (e.keyCode === 67 && e.ctrlKey) {
        this.copyText()
      }
      // ctrl + a 权限
      if (e.keyCode === 65 && e.ctrlKey) {
        this.selectIndexArr = this.innerTags.map((item, index) => index)
        this.$nextTick(() => {
          e && e.preventDefault()
          this.$el.querySelector('.new-tag').blur()
        })
      }
      // 左键改变选择项
      if (e.keyCode === keyBoard.left && !this.newTag) {
        this.activeIndex = this.innerTags.length - 1
        this.$refs.inputtag.blur()
      }

      const keyShouldAddTag = e ? this.addTagOnKeys.indexOf(e.keyCode) !== -1 : true

      const typeIsNotBlur = e && e.type !== 'blur'
      if ((!keyShouldAddTag && (typeIsNotBlur || !this.addTagOnBlur)) || this.isLimit) {
        return
      }
      // 添加标签
      const tag = this.beforeAdding ? await this.beforeAdding(this.newTag) : this.newTag.trim()
      // tag = this.fixedCodeName(tag)
      const isValid = await this.validateIfNeeded(tag)
      if (tag && isValid && (this.allowDuplicates || this.innerTags.indexOf(tag) === -1)) {
        this.innerTags.push(tag)
        this.newTag = ''
        this.tagChange()
        this.activeIndex = -1
        e && e.preventDefault()
        this.$nextTick(() => {
          document.querySelector('.vue-input-tag-wrapper').scrollTop = 1000
        })
      }
      if (e.keyCode === 13 && this.innerTags.length) {
        this.$emit('handlerEnter', this.innerTags)
      }
    },
    validateTag(tag) {
      // if (this.validate) {
      //   return !validators[this.validate].test(tag)
      // }
      if (this.validate) {
        if (typeof this.validate === 'function') {
          return !this.validate(tag)
        }
        if (typeof this.validate === 'string' && Object.keys(validators).indexOf(this.validate) > -1) {
          return !validators[this.validate].test(tag)
        }
      }
      return false
    },
    fixedCodeName(value, frompaste, ev) {
      if (ev && ev.keyCode === 86 && ev.ctrlKey) { return }
      if ((typeof this.validate === 'string' && this.validate === 'codeName') || this.validate === '' || this.validate === undefined) {
        const reg = frompaste ? /(^\d{13}$)|^(jt|Jt|jT)/ : /^(\d+)|(jt|Jt|jT)/
        // const res = (value || this.newTag).replace(/^(\d+)|(jt|Jt|jT)/, 'JT$1')
        const res = (value || this.newTag).replace(reg, 'JT$1')
        if (!value) this.newTag = res
        return res
      }
      return value
    },
    validateIfNeeded(tagValue) {
      if (this.validate === '' || this.validate === undefined) {
        return true
      }

      if (typeof this.validate === 'function') {
        return this.validate(tagValue)
      }

      if (typeof this.validate === 'string' && Object.keys(validators).indexOf(this.validate) > -1) {
        return validators[this.validate].test(tagValue)
      }

      if (typeof this.validate === 'object' && this.validate.test !== undefined) {
        return this.validate.test(tagValue)
      }
      return true
    },
    changeTag(e) {
      // ctrl + c 复制
      // e.preventDefault()
      if (e.keyCode === 67 && e.ctrlKey) {
        this.copyText()
      }
      if (this.isFocus) {
        if (e.shiftKey) {
          if (this.activeIndex !== -1) {
            this.cacheActiveIndex = this.activeIndex
          }
          switch (e.keyCode) {
            case keyBoard.left: // left
              if (!this.selectIndexArr.length) {
                this.selectIndexArr.push(this.activeIndex - 1)
                this.selectIndexArr.push(this.activeIndex)
              } else {
                this.selectIndexArr.unshift(this.selectIndexArr[0] - 1)
              }
              break
            case keyBoard.right: // right
              if (this.selectIndexArr.length) {
                this.selectIndexArr.shift()
                if (!this.selectIndexArr.length) {
                  this.focusNewTag()
                }
              }
              break
          }
          return
        }
        switch (e.keyCode) {
          case 13: // enter
            this.changeEdit(this.activeIndex)
            break
          case 8: // delete
          case 46: // delete
            if (this.activeIndex !== -1) {
              this.innerTags.splice(this.activeIndex, 1)
            } else {
              const tags = this.innerTags.filter((item, index) => !this.selectIndexArr.includes(index))
              this.innerTags = tags
            }
            this.selectIndexArr = []
            if (!this.innerTags.length || this.activeIndex === this.innerTags.length) {
              this.focusNewTag()
            }
            if (this.activeIndex === this.innerTags.length) {
              this.activeIndex = -1
            }
            break
          case keyBoard.left: // left
            if (this.selectIndexArr.length) {
              const firstIndex = this.selectIndexArr[0]
              if (firstIndex > 0) {
                this.activeIndex = firstIndex - 1
                return
              }
              this.activeIndex = 0
              return
            }
            this.activeIndex > 0 && this.activeIndex--
            break
          case keyBoard.right: // right
            if (this.selectIndexArr.length) {
              const lastIndex = this.selectIndexArr[this.selectIndexArr.length - 1]
              if (lastIndex === this.innerTags.length) {
                this.activeIndex = -1
                return this.focusNewTag()
              }
              this.activeIndex = lastIndex
            }
            if (this.activeIndex < this.innerTags.length - 1) {
              this.activeIndex++
              this.scrollToViewport()
              return
            }
            this.activeIndex = -1
            this.focusNewTag()
            break
        }
        this.scrollToViewport()
        this.tagChange()
      }
    },
    remove(index) {
      this.innerTags.splice(index, 1)
      this.activeIndex = -1
      this.tagChange()
    },
    removeLastTag() {
      if (this.newTag) {
        return
      }
      this.$refs.inputtag.blur()
      if (this.activeIndex === -1) {
        this.activeIndex = this.innerTags.length - 1
        return
      }
      // this.innerTags.pop()
      this.remove(this.activeIndex)
      this.activeIndex--
      this.tagChange()
    },
    tagChange() {
      this.$emit('update:tags', this.innerTags)
      this.$emit('input', this.innerTags)
    },
    keydownMounted(e) {
      if ((e.keyCode === 17 && this.isWin) || (e.keyCode === 91 && this.isMac)) {
        this.isCtrl = true
      }
      if (e.keyCode === 16) {
        this.isShift = true
      }
    },
    keyupMounted(e) {
      if ((e.keyCode === 17 && this.isWin) || (e.keyCode === 91 && this.isMac)) {
        this.isCtrl = false
      }
      if (e.keyCode === 16) {
        this.isShift = false
      }
    }
  },
  mounted() {
    console.log(444444444555555);
    document.addEventListener('keydown', this.changeTag)
    document.addEventListener('click', this.blurTag)
    this.isWin = navigator.platform === 'Win32' || navigator.platform === 'Windows'
    this.isMac = navigator.platform === 'Mac68K' || navigator.platform === 'MacPPC' || navigator.platform === 'Macintosh' || navigator.platform === 'MacIntel'
    document.addEventListener('keydown', this.keydownMounted)
    document.addEventListener('keyup', this.keyupMounted)
  },
  destroyed() {
    document.removeEventListener('keydown', this.changeTag)
    document.removeEventListener('click', this.blurTag)
    document.removeEventListener('keydown', this.keydownMounted)
    document.removeEventListener('keyup', this.keyupMounted)
  }
}
</script>

<style lang="scss">
@import "@/assets/style/variable.scss";
@import "@/assets/style/jms-style/mixins.scss";

$bg: rgba(0, 0, 0, 0.1);
$bgTxt: rgba(0, 0, 0, 0.4);
$blackTextColor: #999999;
// 主题色透明背景
@mixin placeholder-color(){
  @each $themename , $theme in $component-themes {
    [data-theme = '#{$themename}'] & {
      color: map-get($map: $theme, $key: text-color-routine) !important;
    }
  }
}
.none-select {
  user-select: none;
}
.vue-input-tag-wrapper {
  // background-color: #fff;
  // @include bg-color('pop');
  border: 1px solid #DCDEE1;
  @include bg-color("main");
  border-radius: $radius-base;
  overflow-y: auto;
  padding: 1px 10px;
  cursor: text;
  text-align: left;
  // -webkit-appearance: textfield;
  // display: flex;
  // align-content: flex-start;
  // flex-wrap: wrap;
  transition: all 0.3s;
  max-height: 100px;
  z-index: 1;
  position: relative;
  // ::-webkit-input-placeholder {
  //   // color:  red !important;
  //   @include placeholder-color();
  // }

  // ::-moz-placeholder {
  //   @include placeholder-color();
  // }

  // :-ms-input-placeholder {
  //   @include placeholder-color();
  // }
  &:hover {
    border-color: $-color-brand;
  }
  .input-tag-item {
    line-height: 32px;
    width: 100%;
  }
  .input-tag {
    border-radius: 2px;
    display: inline-block;
    font-size: 13px;
    width: 100%;
    // margin-bottom: 3px;
    // margin-right: 6px;
    padding: 4px 8px;
    // background: rgba(221, 221, 221, 0.1);
    // @include bg-color("base");
    border-radius: 4px;
    border: 1px solid;
    // @include border-color('lighter');
    box-sizing: border-box;
    height: 24px;
    line-height: 1;
    // margin-top: 1px;
    cursor: default;
    background-color: transparent;
    @include text-color('routine');
    @include border-color('light');
    &:hover {
      color: $-color-brand;
      border-color: $-color-brand;
    }
    .remove {
      display: inline-block;
      cursor: pointer;
      // color: $c-fc-3;
      padding-left: 0;
      position: relative;
      top: 0;
      width: 14px;
      height: 14px;
      border-radius: 14px;
      text-align: center;
      &:hover {
        color: $-color-white;
        text-decoration: none;
        background-color: $-color-brand;
      }
      &:empty::before {
        position: absolute;
        top: -1px;
        left: 4px;
        content: "x";
      }
    }
    span {
      width: calc(100% - 16px);
      overflow: hidden;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  // .input-tag::after{
  //   display: block;
  //   content: '';
  //   clear: both;
  // }
  .input-tag-error {
    border-color: #ff6a69;
    background: rgba(255, 106, 105, 0.1);
    color: #ff6a69;
    .remove {
      color: #ff6a69;
    }
  }
  .new-tag {
    background: transparent;
    border: 0;
    // color: #999;
    @include text-color("routine");
    font-size: 12px;
    font-weight: 400;
    // margin-bottom: 3px;
    outline: none;
    padding: 2px;
    padding-left: 0;
    flex-grow: 1;
    width: 100%;
    height: 28px;
    line-height: 28px;
    vertical-align: top;
    box-sizing: border-box;
  }
  .edit-tag {
    position: relative;
    top: -2px;
    background: transparent;
    border: 0;
    color: $-color-brand;
    font-size: 13px;
    font-weight: 400;
    margin-bottom: 3px;
    outline: none;
    padding: 2px;
    padding-left: 0;
    flex-grow: 1;
    width: calc(100% - 20px);
    height: 14px;
    vertical-align: top;
  }
  .input-tag-active {
    // @include base-color("clr");
    // @include theme-hover();
    color: $-color-brand !important;
    border: 1px solid $-color-brand !important;
  }
}
.vue-input-tag-wrapper.read-only {
  cursor: default;
}
.input-tag-container {
  position: relative;
  border-radius: 5px;
  height: 32px;
  width: 200px;
  .search-icon {
    margin: 10px 0 10px 2px;
    color: #999999;
  }
  .color-alert {
    position: absolute;
    cursor: pointer;
    top: -28px;
    right: 7px;
    color: #f56c6c;
  }
  .del-btn {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 20px;
    text-align: center;
    vertical-align: middle;
    display: table-cell;
    @include base-color("clr");
    @include theme-hover();
    cursor: pointer;
    .icon-container {
      font-size: 12px;
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translate(0, -50%);
    }
  }
}
.input-tag-container--active {
  height: 32px;
  position: relative;
  z-index: 100;
  .input-tag-item {
    width: calc(100% - 22px);
  }
}
.vue-input-tag-wrapper.vue-input-tag-wrapper--active {
  position: relative;
  transition: all 0.3s;
  border-color: $-color-brand;
  box-sizing: border-box;
  width: 100%;
  min-height: 100px;
  left: 0;
  top: 0;
}
.customer-input-tag {
  border: none;
  .new-tag {
    margin-top: 4px;
  }
  .vue-input-tag-wrapper--active {
    border: none;
  }
  .vue-input-tag-wrapper {
    border: none;
    box-shadow: 0px 1px 4px 0px rgba(238, 241, 246, 1);
  }
}
// ::-webkit-scrollbar {
//   width: 5px;
//   height: 5px;
// }
// /*滚动条小方块*/
// ::-webkit-scrollbar-thumb {
//   background-color: $bg;
//   -webkit-border-radius: 5px; /* Safari 和 Chrome */
//   -moz-border-radius: 5px; /* Firefox */
//   -o-border-radius: 5px; /* Opera */
//   border-radius: 5px;
// }
// /*滚动轨道两端按钮*/
// ::-webkit-scrollbar-button {
//   -webkit-box-shadow: inset 0 0 5px $bg;
//   /*border-radius: 10px;*/
//   background-color: $bg;
// }
// /*滚动轨道 内阴影*/
// ::-webkit-scrollbar-track {
//   -webkit-box-shadow: inset 0 0 5px $bg;
//   /*border-radius: 10px;*/
//   background-color: $bg;
// }
</style>
