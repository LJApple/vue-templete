/*
 * @Description: 常量定义
 */
const { VUE_APP_ENV, VUE_APP_API_URL, VUE_APP_API_URL_GW, VUE_APP_GATEWAY = '', VUE_APP_JMS_PLATFORM_SETUP = '' } = process.env

const img_url = '/file/file/upload'

//  基本请求
export const BASE_URL = VUE_APP_API_URL

//  图片上传
export const IMG_URL = VUE_APP_API_URL + img_url

//  公共请求
export const GW_URL = VUE_APP_API_URL_GW


// 后端接口返回的状态码常量
export const RESPONSE_CODE = {
  SUCCESS: 1, // 成功
  SUCCESS_COPY: 1, // 成功 临时使用
  EXPIRED: '000002' // token过期
}

/**
 * 关联平台名
 * 未使用
 */
export const PLATFORM_NAME = ['yljms', 'ylappbc', 'yljmsapplets', 'ylofficial', 'yljmsdelphiopt']

export const INTERRUPT = 'INTERRUPT' // 请求中断标识
 
// 应用的环境变量
export const APP_ENV = VUE_APP_ENV


// 网关标识
export const GATEWAY = VUE_APP_GATEWAY

// /lmdm
export const MODULE_LMDM = ''


// /oms
export const MODULE_OMS = ''












