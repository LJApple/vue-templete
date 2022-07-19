/**
 * @desc 自定义过滤器
 */
import store from '@/store';
import dayjs from 'dayjs';
import i18n from '@/i18n';
import { LANG_ELEMENT_MAP } from '@public/utils/const'
let langs = null // 国际化数据
// 国际化过滤器
export function lang(str) {
  if (window.location.href.indexOf('localhost') !== -1) {
    // if (!store.state.base.langKeyList.includes(str)) store.state.base.langKeyList.push(str)
  }
  // 区分自定义el组件的国际化
  if (str && str.indexOf('el.') > -1) {
    const messages = i18n.messages[LANG_ELEMENT_MAP[store.getters.lang]]
    return filterLangValue(str, messages)
  }
  // 自定义国际化
  langs = store.state.base.langJson || {}
  return langs[str] || str || ''
}

export function filterLangValue(str, messages) {
  const array = str.split('.')
  const len = array.length
  let index = 0
  let current = messages[array[0]]
  while (index < len - 1) {
    index++
    const key = array[index]
    current = current[key]
  }
  return current
}

// demo
export function PipeTest(data) {
  let newData = data;
  if (parseInt(data) > 3000) {
    newData += '触发管道';
  }
  return newData;
}

export function valueToLabel(value, dictList) {
  if (!value && value !== 0) {
    console.warn('id为空，请检查后端接口返回');
    return '';
  }
  if (!dictList || dictList.length === 0) {
    console.warn('字典列表为空，请检查是否传入！');
    return value;
  }
  if (!Array.isArray(dictList)) {
    console.warn('dictList必须为数组类型！');
    return value;
  }
  // value = Number(value)
  let result = '';
  dictList.forEach(item => {
    const entriesArr = Object.entries(item);
    entriesArr.forEach((item2, index2) => {
      if (value === item2[1]) {
        result = (entriesArr[index2 - 1] || entriesArr[index2 + 1])[1];
      }
    });
  });
  return result;
}

export function formatDate(val, formatStr = 'YYYY-MM-DD HH:mm:ss') {
  if (!val) {
    return '';
  }
  return dayjs(new Date(val)).format(formatStr);
}
