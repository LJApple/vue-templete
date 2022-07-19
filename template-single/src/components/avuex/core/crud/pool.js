import fetch from '@public/http/request'
import qs from 'qs'
/*
 * 通用请求接口
 */
export default {
  reqList(url, params) {
    return fetch.get(`/${url}/page?` + qs.stringify(params)).then(res => res) 
  },
  reqDel(url, params) {
    return fetch.post(`${url}?` + qs.stringify(params)).then(res => res)
  },
  //查询详情
  reqDetail(urlWithParams) {
    return fetch.get(urlWithParams).then(res => res) 
  }, 
  reqAdd(url, reqData) {
    return fetch.post(`/${url}`, reqData).then(res => res)
  },
  getColumnConf(url, params) {
    return fetch.get(`/${url}`, params).then(res => res)
  },
  setColumnConf(url, params) {
    return fetch.post(`/${url}`, params).then(res => res)
  }
}
