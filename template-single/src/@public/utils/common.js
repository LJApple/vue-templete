/**
 * @desc:公共方法集合
 */
// import axios from 'axios'
import { lang } from './filters'
import { cacheHelper } from './cacheHelper'
import Vue from 'vue'
import store from '@/store'
import cloneDeep from 'lodash/cloneDeep'
import { INTW_TIMES, INTW_SWITCH } from '@public/utils/const'

const stringType = Object.prototype.toString

export const commonFun = {
  /**
   * @Title 是否为空判断
   * @Description TODO
   * @author xzd
   * @param val
   * @returns {Boolean} 空返回true
   */
  isEmpty(val) {
    if (typeof val === 'string' || val instanceof String) {
      val = val.replace(/\s/g, '')
    }
    if (val === null) {
      return 1
    }
    if (val === undefined || val === 'undefined') {
      return 1
    }
    if (val === '') {
      return 1
    }
    if (val.length === 0) {
      return 1
    }
    if (!/[^(^\s*)|(\s*$)]/.test(val)) {
      return 1
    }
    return 0
  },
  /**
   * @Title 判断obj对象是否没有属性
   * @Description 没有返回true
   * @param obj 只接收obj
   * @returns {boolean}
   */
  isEmptyProperty(obj) {
    let key
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        return 0 //  不为空返回false
      }
    }
    return 1 //  空返回true
  },
  /*
   * 获取数据字典
   * @author xzd
   * @param code
   */
  getDict(type, valType = 'id') {
    const { dict } = store.state.base
    let dictList = dict || []
    const dictData = []
    if (!dictList) {
      dictList = []
      console.log('数据字典无数据')
    }
    dictList.forEach(item => {
      if (item.code === type) {
        item.child.forEach(item2 => {
          dictData.push({ value: +item2[valType], label: lang(item2.localName || item2.name), name: item2.localName || item2.name, code: item2.code, id: item2.id })
        })
      }
    })
    return dictData
  },
  /*
   * 获取当前时间
   * @author xzd
   * @param code
   */
  conver(s) {
    return s < 10 ? '0' + s : s;
  },
  getCurDate() {
    const myDate = new Date();

    // 获取当前年
    const year = myDate.getFullYear();

    // 获取当前月
    const month = myDate.getMonth() + 1;

    // 获取当前日
    const date = myDate.getDate();
    const h = myDate.getHours(); // 获取当前小时数(0-23)
    const m = myDate.getMinutes(); // 获取当前分钟数(0-59)
    const s = myDate.getSeconds();

    // 获取当前时间
    const day = year + '-' + commonFun.conver(month) + '-' + commonFun.conver(date)
    const hour = commonFun.conver(h) + ':' + commonFun.conver(m) + ':' + commonFun.conver(s);
    const now = day + ' ' + hour
    return {
      dayHour: now,
      day,
      hour
    }
  },

  // 获取当天的开始与结束日期
  GetTodayDate(addDate = 0, addTime = true) {
    var dd = new Date()
    dd.setDate(dd.getDate() + addDate) // 获取第addDate天后的日期
    var y = dd.getFullYear()
    var m = dd.getMonth() + 1 < 10 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1 // 获取当前月份的日期，不足10补0
    var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate() // 获取当前几号，不足10补0
    let start = y + '-' + m + '-' + d
    addTime ? (start = start + ' ' + '00:00:00') : ''
    let end = y + '-' + m + '-' + d
    addTime ? (end = end + ' ' + '23:59:59') : ''
    return [start, end]
  },
  // 获取当前年月份
  GetYearMonth(addDate = 0) {
    var dd = new Date()
    dd.setDate(dd.getDate() + addDate) // 获取第addDate天后的日期
    var y = dd.getFullYear()
    var m = dd.getMonth() + 1 < 10 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1 // 获取当前月份的日期，不足10补0
    const start = y + '-' + m
    const end = y + '-' + m
    return [start, end]
  },
  // 获取当天日期的前7天日期
  getBeforeDate(n, type = '-') {
    const d = new Date()
    let year = d.getFullYear()
    let mon = d.getMonth() + 1
    let day = d.getDate()
    if (day <= n) {
      if (mon > 1) {
        mon = mon - 1
      } else {
        year = year - 1
        mon = 12
      }
    }
    d.setDate(d.getDate() - n)
    year = d.getFullYear()
    mon = d.getMonth() + 1
    day = d.getDate()
    const s = year + type + (mon < 10 ? '0' + mon : mon) + type + (day < 10 ? '0' + day : day)
    return s
  },
  //获取当月的第一天和最后一天
  GetMonthFirstAndEnd(){
        var date = new Date();
        date.setDate(1);
        var month = parseInt(date.getMonth()+1);
        var day = date.getDate();
        if (month < 10) {
            month = '0' + month
        }
        if (day < 10) {
            day = '0' + day
        }
        const start =  date.getFullYear() + '-' + month + '-' + day;

        var currentMonth=date.getMonth();
        var nextMonth=++currentMonth;
        var nextMonthFirstDay=new Date(date.getFullYear(),nextMonth,1);
        var oneDay=1000*60*60*24;
        var lastTime = new Date(nextMonthFirstDay-oneDay);
        var month2 = parseInt(lastTime.getMonth()+1);
        var day2 = lastTime.getDate();
        if (month2 < 10) {
            month2 = '0' + month2
        }
        if (day2 < 10) {
            day2 = '0' + day2
        }
        const end =  date.getFullYear() + '-' + month2 + '-' + day2;
        return [start,end]
  },
  //获取当月的第一天和当天
  GetMonthFirstAndCur(){ 

    var dd = new Date();
    dd.setDate(dd.getDate() - 15);// 获取p_count天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;// 获取当前月份的日期
    if (m < 10) {
      m = '0' + m;
    }
    var d = dd.getDate();
    if (d < 10) {
      d = '0' + d;
    }
    const start = y + '-' + m + '-' + d;

    var date = new Date();
    var month = parseInt(date.getMonth()+1);
    var day2 = new Date().getDate();
    if (day2 < 10) {
        day2 = '0' + day2
    }
    const end =  date.getFullYear() + '-' + month + '-' + day2;
    return [start,end]
  },
  // 获取两个时间之间的差值返回数组（天，小时） 
  getTimeDiff(startTime, endTime) {
    // 将时间转为时间戳
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    // 取时间差值
    const dateDiff = end - start
    // 取相差天数
    const dayDiff = Math.floor(dateDiff/3600/24/1000)
    // 取剩余的时间戳
    const left = dateDiff%(3600*24*1000)
    // 小时四舍五入保留一位
    const hourDiff = (left/3600/1000).toFixed(1)
    return [dayDiff, hourDiff]
  },
  // 16进制颜色转换
  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  /**
 * 返回文件path
 * @param {*} value 需要截取的数字|字符串
 * @param {*} len 截取小数后的长度
 */
  getPaths(fileList = []) {
    const paths = fileList.map(file => {
      if (file.path) {
        return file.path
      }
      if (!file.downloadUrl) {
        return file
      }
      const urlList = file.downloadUrl.split(/.com.cn\/|.com\/|.cn\/|.net\/|\?/)
      file.path = urlList[1] || file
      console.log('getPaths', file.path, file.downloadUrl)
      return file.path
    }).join(',')
    return paths
  }
}

/*
 *@Description: 判断当前模块是否有对应的操作权限
 *@param {arg} moduleName type
 *@return [Boolean]
 *@Date: 2019-07-03 10:52:04
 */
export function hasPower(moduleName, type) {
  let btnList = store.state.base.btnList || []
  let power = {}
  if (btnList.indexOf(moduleName + '_' + type) > -1) {
    power[type] = true
  }
  return power[type] || false 
}

/*
 *@Description: 全局eventBus
 *@param {arg} type
 *@return [type]
 *@Date: 2019-07-11 15:51:09
 */
export const bus = new Vue()

/*
 *@Description: 将时间数组输出成两个属性并赋值给表单 编辑将两个属性合成一个数组
 *@param {arg} type
 *@return [type]
 *@Date: 2019-07-17 18:59:11
 */

export function timeRangeHandler(form, prop) {
  // 提交处理
  const reslut = form[prop]
  if (reslut) {
    if (Array.isArray(reslut)) {
      form[prop + 'StartTime'] = reslut[0]
      form[prop + 'EndTime'] = reslut[1]
      delete form[prop]
    }
  }
  // 编辑回选处理
  const start = form[prop + 'StartTime']
  const end = form[prop + 'EndTime']
  if (start && end) {
    form[prop] = [start, end]
  }
  return form
}

export const debounce = (fn, delay) => {
  let timer
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const renameKeys = (keysMap = {}, obj) => {
  return Object.keys(obj).reduce((acc, val) => {
    return {
      ...acc,
      [keysMap[val] || val]: obj[val]
    }
  }, {})
}

export const difference = (a, b) => {
  const arr1 = new Set(a)
  const arr2 = new Set(b)
  return [...b.filter(x => !arr1.has(x)), ...a.filter(x => !arr2.has(x))]
}

/*
 *@Description: 将表单字段的值从对象变为 xxxName xxxCode xxxId
 *@param {arg} form =>要转换的表单; exclude =>不需要转换的字段
 *@return [type] Object
 *@Date: 2019-08-21 16:25:12
 */

export function deconstrucForm(form, exclude = []) {
  const data = cloneDeep(form)
  Object.keys(data).forEach(prop => {
    const value = data[prop]
    const has$ = prop.substr(0, 1) === '$'
    if (stringType.call(value) === '[object Object]' && !has$ && !exclude.includes(prop)) {
      data[prop + 'Code'] = value.code
      data[prop + 'Name'] = value.name
      data[prop + 'Id'] = value.id
      delete data[prop]
    }
    if (has$) {
      delete data[prop]
    }
  })
  return data
}

export function resolveForm(form, resolveProps = []) {
  const data = {}
  Object.keys(form).forEach(prop => {
    const value = form[prop]
    const has$ = prop.substr(0, 1) === '$'
    if (stringType.call(value) === '[object Object]' && !has$ && resolveProps.includes(prop)) {
      data[prop + 'Code'] = value.code
      data[prop + 'Name'] = value.name
      data[prop + 'Id'] = value.id
      delete data[prop]
    }
  })
  return data
}

/*
 *@Description: 将 xxCode xxName xxId 组装成{code,name,id}对象
*/
export function combineForm(form, props = []) {
  const data = cloneDeep(form)
  props.forEach(prop => {
    data[prop] = {
      name: data[prop + 'Name'],
      code: data[prop + 'Code'],
      id: data[prop + 'Id']
    }
    delete data[prop + 'Name']
    delete data[prop + 'Code']
    delete data[prop + 'Id']
  })
  return data
}

/**
 * 根据id查找tree中【匹配的元素
 * @param { Array } list 目标列表 必填
 * @param { any } id 查找标识 -唯一 必填
 * @param { String } key 目标列表的匹配键值 默认为id
 */
export const findEleForTreeByKey = (list, id, key = 'id') => {
  if (!list || !Array.isArray(list)) throw new Error('type of list is error!')
  if (id === undefined || id === null || id === '') throw new Error('id can not empty!')
  let stack = [] // 数据栈列表
  let item = null // 当前栈数据
  let result = null // 符合条件的结果
  if (!list || !list.length) return // 初始数据不存在则返回
  // 将第一层节点放入栈
  stack = [...list]
  // 遍历
  while (stack.length) {
    item = stack.shift() // 取出第一个栈数据
    const child = item.children // 当前栈数据的子节点
    // 符合条件则赋值给result，同时中断循环
    if (item[key] === id) {
      result = item
      break
    }
    // 如果子节点存在，则添加到数据栈
    if (child && child.length) {
      stack = stack.concat(child)
    }
  }
  // 返回结果
  return result
}

/*
 *@Description: 判断是否为空
 *@param {arg} any
 *@return [type] 空值返回真 其他返回假
 *@Date: 2019-06-21 16:01:51
 */
export function validatenull(val) {
  if (typeof val === 'boolean') {
    return false
  }
  if (typeof val === 'number') {
    return false
  }
  if (val instanceof Array) {
    if (val.length === 0) return true
  } else if (val instanceof Object) {
    if (JSON.stringify(val) === '{}') return true
  } else {
    if (val === 'null' || val == null || val === 'undefined' || val === undefined || val === '') {
      return true
    }
    return false
  }
  return false
}

/**
 * 转换名称首个字母为大写
 * @param { String } name 需要转换的名称
 */
export const nameToUpperCase = name => name.charAt(0).toUpperCase() + name.substr(1)

/**
 * 截取浮点数的小数后几位
 * @param {*} value 需要截取的数字|字符串
 * @param {*} len 截取小数后的长度
 */
export const floatNumSub = (value, len = 2) => {
  if (!value && value !== 0) return console.warn('floatNumSub::warb', '请传入正确参数');
  const type = typeof value
  if (type === 'string') {
    value = Number(value)
    const v = value.toFixed(len)
    return parseFloat(v)
  } else if (type === 'number') {
    const v = value.toFixed(len)
    return parseFloat(v)
  } else {
    return value
  }
}

/**
 * 当天时间范围
 * @param {*} monthStart xxxx-xx-xx 00:00:00
 * @param {*} start xxxx-xx-xx 00:00:00
 * @param {*} end xxxx-xx-xx 23:59:59
 */
export const taday = {
  // 当月开始时间
  get monthStart() {
    const now = new Date()
    const month = now.getMonth() + 1
    const nowMounth = month < 10 ? '0' + month : month
    return `${now.getFullYear()}-${nowMounth}-01 00:00:00`
  },
  // 当月结束时间
  get monthEnd() {
    const now = new Date()
    const year = now.getFullYear();
    const month = now.getMonth() + 1
    const nowMounth = month < 10 ? '0' + month : month
    const lastDay = new Date(year, nowMounth, 0).getDate()
    return `${year}-${nowMounth}-${lastDay} 23:59:59`
  },
  // 当天开始时间
  get start() {
    return new Date().toJSON().split('T')[0] + ' 00:00:00'
  },
  // 当天结束时间
  get end() {
    return new Date().toJSON().split('T')[0] + ' 23:59:59'
  }
}

/**
 * 获取最近N个月的开始和结束时间
 * @param {Number} n 最近N月，默认3
 */
export const recentMonth = (n = 3) => {
  const start = new Date()
  const end = new Date()
  if (n === 'thisYear') {
    start.setMonth(0)
  } else {
    start.setMonth(start.getMonth() - n + 1)
  }
  const startMonth = formatDate(start, 'YYYY-MM')
  const endMonth = formatDate(end, 'YYYY-MM')
  return [startMonth, endMonth]
}

/*
 * @Description: 对应跳转路由
 * @param {arg} type
 * @param {arg} operationType 对应
 */
export const routeDefs = (moduleName, operationType = '', params = {}) => ({ name: `${moduleName}${operationType}`, params })

/**
 * 时间格式化
 * @param { String|Date } time 时间，可以是时间字符串，也可以是时间对象，如果传入为空，则默认使用当前时间
 * @param { String } formats 格式化类型 默认值YYYY-MM-DD
 * @return { String } 返回格式化后的时间字符串
 * 在vue实例里面可以如下使用 this.$common.formatDate('2019/9/11 11:22:44', 'YYYY-MM-DD HH:mm:ss')
 */
export const formatDate = (time, formats = 'YYYY-MM-DD') => {
  // 转Date对象
  time = time ? new Date(time) : new Date()
  // 小于10添加0前缀
  const zero = value => value < 10 ? '0' + value : value
  // 年
  const year = time.getFullYear()
  // 月
  const month = zero(time.getMonth() + 1)
  // 日
  const day = zero(time.getDate())
  // 时
  const hours = zero(time.getHours())
  // 分
  const minutes = zero(time.getMinutes())
  // 秒
  const millisecon = zero(time.getSeconds())
  // map
  const timeMap = {
    YYYY: year,
    MM: month,
    DD: day,
    HH: hours,
    mm: minutes,
    ss: millisecon
  }
  return formats.replace(/YYYY|MM|DD|HH|mm|ss/g, matches => timeMap[matches])
}

/**
 * 接口定时延迟方法
 * @param { Funciton } fn 需要延迟执行的函数
 * @param { Number } delay 定时器间隔
 * @return { Number } 定时器的实例，用于取消定时器
 */
export const interfaceWaitHandle = (fn, delay = INTW_TIMES) => {
  if (INTW_SWITCH) {
    console.log('进入1秒延迟！');
    return setTimeout(fn, delay)
  } else {
    return fn()
  }
}

// element组件对应的confirm类型，添加自定义回调定时
export const confirmBeforeClose = (action, instance, done) => {
  if (action === 'confirm') {
    instance.confirmButtonLoading = true
    setTimeout(() => {
      instance.confirmButtonLoading = false
      done()
    }, INTW_TIMES)
  } else {
    done()
  }
}

/**
 * 获取应用环境
 * pro 生产
 * uat 预发布
 * test 测试
 * dev 开发联调
 * local 本地
 * 注：如果域名有调整，需要针对调整域名相关的代码
 */
export const getAppEnv = () => {
  const host = location.host
  const hostMap = {
    'jms.jtexpress.com.cn': 'pro',
    'uat-jms.jtexpress.com.cn': 'uat',
    'test.jms.com': 'test',
    'dev.jms.com': 'dev'
  }
  return hostMap[host] || 'local'
}
