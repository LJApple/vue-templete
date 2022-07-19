import { post, get } from '@public/http/request'
const VUE_APP_IM_PREFIX = process.env.VUE_APP_IM_PREFIX
const moduleList = {
  indonesiaVip: VUE_APP_IM_PREFIX === 'jtdev_' ? '/vip' : '/yl-indonesia-vip/vip', // 业务接口
  indonesiaReport: '/jts-idn-vip-report-api' // 首页报表
}
//登录
export const captcha = (params) => get(`${moduleList.indonesiaVip}/captcha`)
export const login = (params) => post(`${moduleList.indonesiaVip}/login`, params)
export const getMenuList = () => post(`${moduleList.indonesiaVip}/user/getMenuList`)
// 激活邮箱
export const getActiveMail = (params) => get(`${moduleList.indonesiaVip}/user/activatEmail?checkCode=${params.checkCode}`)
// export const logout = () => post(`/${APICUS}/user/logout`)
export const logout = () => post(`${moduleList.indonesiaVip}/logout`)
// 帮助中心链接
export const commonHelp = () => get(`/yl-indonesia-vip-read/vipread/common/help`)
// 广告查询
export const commonAdvert = () => get(`/yl-indonesia-vip-read/vipread/common/advert`)
// 紧急提醒查询
export const commonWarning = () => get(`/yl-indonesia-vip-read/vipread/common/warning`)
/**
 * 广告查询、紧急提醒查询 已读回写
 * @params serialNo:流水号
 * @params advertType:广告类型
 * */  
export const commonNoticeRead = (params) => post(`${moduleList.indonesiaVip}/common/notice/read`, params)


// 忘记密码
export const ForgotPassWord = {
  forgetPassword(params) { return post(`${moduleList.indonesiaVip}/user/forgetPassword?loginCode=${params.loginCode}`) }, //验证账号
  checkCode(params) { return post(`${moduleList.indonesiaVip}/user/checkCode?loginCode=${params.loginCode}&code=${params.code}`) }, // 校验验证码
  resetPassword(params) { return post(`${moduleList.indonesiaVip}/user/resetPassword`, params) } // 重置密码
}

// 国际化接口
export const Globalization = {
  getLangJson() { return get(`${moduleList.indonesiaVip}/common/sys/lang/all`)}, // 获取所有国际化数据
  getBatchLang(params) { return post(`${moduleList.indonesiaVip}/common/sys/lang/batch`, params)} //批量获取国际化数据
}

// 首页报表
export const IndexReport = {
  getBillData(params) { return post(`${moduleList.indonesiaReport}/api/report/getBillData`, params) }, // 账单管理
  getCodData(params) { return post(`${moduleList.indonesiaReport}/api/report/getCodData`, params) }, // 代收货款统计
  getCostData(params) { return post(`${moduleList.indonesiaReport}/api/report/getCostData`, params) }, // 费用分析
  getDistributionData(params) { return post(`${moduleList.indonesiaReport}/api/report/getDistributionData`, params) }, // 运单量分布图
  getRankingData(params) { return post(`${moduleList.indonesiaReport}/api/report/getRankingData`, params) }, // TOP5目的地
  getStatusData(params) { return post(`${moduleList.indonesiaReport}/api/report/getStatusData`, params) }, // 状态圆图表
  getWayBillData(params) { return post(`${moduleList.indonesiaReport}/api/report/getWayBillData`, params) } // 运单增长量
}

// 我的资料
export const MyProfile = {
  getUserInfo(params) { return post(`${moduleList.indonesiaVip}/user/queryDetail?loginCode=${params.loginCode}`) }, // 获取用户信息
  modifyInformation(params) { return post(`${moduleList.indonesiaVip}/user/modifyInformation`, params) }, // 保存面单信息等
  bindEmail(params) { return post(`${moduleList.indonesiaVip}/user/bindEmail?mail=${params.mail}`) }, // 绑定邮箱
  changePassword(params) { return post(`${moduleList.indonesiaVip}/user/changePassword`, params) } // 修改密码
}

// 服务管理-快件跟踪
export const ExpressTracking = {
  reqList(params) { return post(`/yl-indonesia-vip-read/vipread/trace/list`, params) } // 查询快件
}

// 服务管理-运费查询
export const FreightInquiry = {
  reqList(params) { return post(`${moduleList.indonesiaVip}/common/freight`, params) }, // 查询运费
  getNetworkInfo() { return get(`${moduleList.indonesiaVip}/common/customer/network`)}, //获取网点信息
  getLocationOptions(params) { return get(`${moduleList.indonesiaVip}/common/search/address?searchKey=${params.searchKey.toUpperCase()}&type=2`) } // 获取目的地
}

// 服务管理-投诉建议
export const Suggestions = {
  saveSuggestions(params) { return post(`${moduleList.indonesiaVip}/complaint/save`, params) } // 保存建议
}

// 财务管理-月结对账单
export const MonthlyStatement = {
  reqList(params) { return post(`${moduleList.indonesiaVip}/monthlyBill/page`, params) }, // 获取列表
  reqExcel(params) { return post(`/yl-indonesia-vip-read/vipread/monthlyBill/exportExcel`, params, { responseType: 'arraybuffer' }) }, // 导出
  reqDetail(params) {return post(`${moduleList.indonesiaVip}/monthlyBill/detailList`, params) } // 查看列表
}

// 个人管理-我的地址设置
export const mailingAddress = {
  reqList(params) { return post(`${moduleList.indonesiaVip}/sender/address/page`, params) }, // 查询列表
  reqAdd(params) { return post(`${moduleList.indonesiaVip}/sender/address/save`, params) }, // 新增地址
  reqUpdate(params) { return post(`${moduleList.indonesiaVip}/sender/address/update`, params) }, // 编辑地址
  reqDel(params) { return post(`${moduleList.indonesiaVip}/sender/address/delete`, params) }, // 删除地址
  reqExcel(params) { return post(`/yl-indonesia-vip-read/vipread/sender/address/exportExcel`, params, { responseType: 'arraybuffer' }) }, // 导出
}

// 个人管理-收件地址设置
export const receivingAddress = {
  reqList(params) { return post(`${moduleList.indonesiaVip}/receive/address/page`, params) }, // 查询列表
  reqAdd(params) { return post(`${moduleList.indonesiaVip}/receive/address/save`, params) }, // 新增地址
  reqUpdate(params) { return post(`${moduleList.indonesiaVip}/receive/address/update`, params) }, // 编辑地址
  reqDel(params) { return post(`${moduleList.indonesiaVip}/receive/address/delete`, params) }, // 删除地址
  reqExcel(params) { return post(`/yl-indonesia-vip-read/vipread/receive/address/exportExcel`, params, { responseType: 'arraybuffer' }) }, // 导出
}

//订单录入
export const OrderController= {
  addOrder(params) { return post(`${moduleList.indonesiaVip}/order/create`, params) }, // 订单录入
  orderfreight(params) { return post(`${moduleList.indonesiaVip}/order/recFee`, params) }, // 订单运费计算
  expressType(params) { return post(`${moduleList.indonesiaVip}/common/express`, params) }, // 订单快件类型获取
  customerInfo(params) { return post(`${moduleList.indonesiaVip}/customer/info`, params) }// 客户资料
}

//寄件地址
export const SenderAddressController= {
  reqList(params) { return post(`${moduleList.indonesiaVip}/sender/address/page`, params) }, // 地址列表
  addAddressList(params) { return post(`${moduleList.indonesiaVip}/sender/address/save`, params) }, // 保存地址
  deleteAddress(params) { return post(`${moduleList.indonesiaVip}/sender/address/delete`, params) }, // 删除地址
  updateAddress(params) { return post(`${moduleList.indonesiaVip}/sender/address/update`, params) }, // 编辑地址
}

//收件地址
export const ReceiveAddressController= {
  reqList(params) { return post(`${moduleList.indonesiaVip}/receive/address/page`, params) }, // 地址列表
  addAddressList(params) { return post(`${moduleList.indonesiaVip}/receive/address/save`, params) }, // 保存地址
  deleteAddress(params) { return post(`${moduleList.indonesiaVip}/receive/address/delete`, params) }, // 删除地址
  updateAddress(params) { return post(`${moduleList.indonesiaVip}/receive/address/update`, params) }, // 编辑地址
}

// 权限管理
export const authorityManagement= {
  reqList: (params) => post(`${moduleList.indonesiaVip}/user/page`, params),
  getMenuList: (params) => post(`${moduleList.indonesiaVip}/user/getMenuList`, params),
  getNewAccount: (params) => post(`${moduleList.indonesiaVip}/user/getNewAccount`, params),
  reqSaveOrUpdate: (params) => post(`${moduleList.indonesiaVip}/user/saveOrUpdate`, params),
  reqResetPass: (params) => post(`${moduleList.indonesiaVip}/user/accessControlResetPassword`, params),
  reqQueryDetail: (params) => post(`${moduleList.indonesiaVip}/user/queryDetail?${params}`),
  reqDel: (params) => post(`${moduleList.indonesiaVip}/user/delete?loginCode=${params}`),
}

//面单打印
export const LabelController= {
  printeExpress(params,discountPrint) { return get(`${moduleList.indonesiaVip}/api/label/print/${params.style}/${params.id}`,discountPrint,{ responseType: 'arraybuffer' })}, // 打印面单
  printeExpressList(params) { return post(`${moduleList.indonesiaVip}/api/label/printBatch`, params,{ responseType: 'arraybuffer' }) }, // 批量打印面单
  printeqrCode(params) { return get(`${moduleList.indonesiaVip}/api/label/qrCode`, params) },
}

//订单管理
export const OrderManageController= {
  reqList(params) { return post(`yl-indonesia-vip-read/vipread/manage/order/queryPage`, params) }, // 订单列表查询
  reqExcel(params) { return post(`yl-indonesia-vip-read/vipread/manage/order/export`, params,{ responseType: 'arraybuffer' }) }, // 订单列表导出
  countOrder(params) { return post(`yl-indonesia-vip-read/vipread/manage/order/count`, params) }, // 订单列表总数获取
  cancelOrder(params) { return post(`${moduleList.indonesiaVip}/manage/order/cancel`, params) }, // 订单取消
  exportOrder(params) { return post(`yl-indonesia-vip-read/vipread/manage/order/etAddr/export`, params,{ responseType: 'arraybuffer' }) }, // 快件跟踪地址导出
  sellerType(params) { return get(`${moduleList.indonesiaVip}/common/customer/orderSource`, params) }, // 客户销售员查询
}

//我的运单
export const MyOrder= {
  reqList(params) { return post(`yl-indonesia-vip-read/vipread/waybill/page`, params) }, // 运单列表查询
  reqExcel(params) { return post(`yl-indonesia-vip-read/vipread/waybill/export`, params, { responseType: 'arraybuffer' }) }, // 运单列表导出
  countOrder(params) { return post(`yl-indonesia-vip-read/vipread/waybill/count`, params) }, // 运单列表总数获取
}

//快速打印
export const fastPrinte= {
  query(params) { return post(`yl-indonesia-vip-read/vipread/manage/order/quick/print/query`, params) }, // 订单查询
  update(params) { return post(`${moduleList.indonesiaVip}/manage/order/print/num/update`, params) }, // 订单打印次数更新
}

//订单导入
export const OrderImport= {
  reqExcel(params) { return post(`${moduleList.indonesiaVip}/import/order/destination`, params, { responseType: 'arraybuffer' }) }, // 下载地区信息
  validateOrder(params){return post(`${moduleList.indonesiaVip}/import/order/validateOrder?isFilterRepeat=${params.isFilterRepeat}`, params)}, // 批量上传解析文件
  insertOrder(params){return post(`${moduleList.indonesiaVip}/import/order/insertOrder`, params, { timeout: 1000 * 60 * 5 })}, // 批量上传
  fileLog(params) { return post(`${moduleList.indonesiaVip}/import/order/fileLog`, params) } // 文件下载url上传
}
