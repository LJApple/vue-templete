/*
 * @Author: Lj
 * @Date: 2021-07-14 14:20:06
 * @Description: file content
 * @LastEditTime: 2022-07-14 19:37:21
 */
import axios from 'axios'
import localeEN from 'element-ui/lib/locale/lang/en'
import localeID from 'element-ui/lib/locale/lang/id'
import localeCN from 'element-ui/lib/locale/lang/zh-CN'
import ElementUI from 'element-ui';
import Drawer from 'element-ui';
const authToken = localStorage.getItem('JT_TOKEN') || ''
export const Util = {
  ArrayIsEqual(arr1, arr2) {
    if (arr1 && arr2) {
      if (arr1 === arr2) {
        return true;
      } else {
        if (arr1.length !== arr2.length) {
          return false;
        } else {
          for (const i in arr1) {
            if (arr1[i] !== arr2[i]) {
              return false;
            }
          }
          return true;
        }
      }
    }
  },
  async showPDF(param, discountPrint) {
    let data = ''
    await axios({
      method: 'GET',
      headers: {
        authToken
      },
      url: `${process.env.VUE_APP_API_URL}/yl-indonesia-vip/vip/api/label/print/${param.style}/${param.id}?type=${param.type}`,
      params: { discountPrint },
      responseType: 'blob'
    }).then(res => {
      data = res
    }).catch(err => {
      console.log(err)
    })
    return data
  },
  async fastPrintPDF(param, discountPrint) {
    let data = ''
    await axios({
      method: 'GET',
      headers: {
        authToken
      },
      url: `${process.env.VUE_APP_API_URL}/yl-indonesia-vip/vip/api/label/printNoCod/${param.style}/${param.id}?type=${param.type}`,
      params: { discountPrint },
      // responseType: 'blob'
    }).then(res => {
      data = res.data
    }).catch(err => {
      console.log(err)
    })
    return data
  },

  async showPDFList(param) {
    let data = ''
    await axios({
      method: 'POST',
      headers: {
        authToken: localStorage.getItem('JT_TOKEN') || ''
      },
      url: `${process.env.VUE_APP_API_URL}/yl-indonesia-vip/vip/api/label/printBatch`,
      data: param,
      responseType: 'blob'
    }).then(res => {
      data = res
    }).catch(err => {
      console.log(err)
    })
    return data
  },
  async setElVersion(store, Vue) {
    const locale = store.state.base.lang
    const langList = [{ lang: 'CN', locale: localeCN }, { lang: 'EN', locale: localeEN }, { lang: 'YN', locale: localeID }]
    const obj = langList.find(item => item.lang === locale)
    if (obj) Vue.use(ElementUI, {locale: obj.locale}, Drawer)
  }
}