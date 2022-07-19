/*
 * @desc 统一将同级目录的插件内置到Vue中使用
 * @update --
 */
import Vue from 'vue'
const files = require.context('.', true, /\.js/)
const modules = {}

files.keys().forEach(key => {
  if (key === './index.js') {
    return
  }
  modules[key.replace(/(^\.\/|\.js$)/g, '')] = files(key).default
})
export default {
  install() {
    for (const file of Object.values(modules)) {
      for (const item of Object.entries(file)) {
        //   框架、自定义插件引入
        if (item[0] === 'Element') {
          Vue.use(item[1], { size: 'small' })
        } else {
          Vue.use(item[1])
        }
      }
    }
  },
}

// 处理千分位展示
const generatingThousandthPer = num => {
  num += ''
  let num1 = num.split('.')[0],
    num2 = num.split('.')[1]
  let c = num1.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
  return num.toString().indexOf('.') !== -1 ? c + '.' + num2 : c
}
// 处理最后一位非法字符
const handlerIllegalStr = str => {
  while (!/^[0-9]+.?[0-9]*/.test(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1)
  }
  return str
}
// el-input千分位展示
Vue.directive('thousands', {
  componentUpdated: (el, binding, vnode) => {
    const key = Object.keys(binding.modifiers)[0]
    if (!key) return
    if (new RegExp('_is_thousands').test(el.className)) return
    // element
    const input = el.getElementsByClassName('el-input__inner')
    el.className += ' _is_thousands'
    // 赋值
    const assignment = (event, value, value2) => {
      binding.value[key] = value
      vnode.context.$set(vnode.context[binding.expression],key,value)
      vnode.context.$nextTick(() => {
        event.target.value = generatingThousandthPer(value2 || value)
        if (input) input[0].value = generatingThousandthPer(value2 || value)
      })
    }
    const handlerInput = event => {
      const newValue = (event.target.value = event.target.value.replace(/,/g, '').replace(/[^\d.]/g, ''))
      assignment(event, newValue)
    }
    el.addEventListener('input', handlerInput)

    if (input) {
      const val = binding.value[key] || ''
      val && vnode.context.$nextTick(() => (input[0].value = generatingThousandthPer(val)))
      input[0].addEventListener('blur', event => {
        const val = event.target.value
        if (!val || !/^[0-9]+.?[0-9]*/.test(val)) return
        assignment(event, handlerIllegalStr(val.replace(/,/g, '')))
      })
    }
  },
  update: function (el, binding, vnode, oldVnode) {
    const key = Object.keys(binding.modifiers)[0]
    const input = el.getElementsByClassName('el-input__inner')
    if (input) {
      const val = binding.value[key] || ''
      val && vnode.context.$nextTick(() => {input[0].value = generatingThousandthPer(val.replace(/,/g, ''))})
    }
  },
})
