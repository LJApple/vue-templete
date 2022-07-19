/*
 * @Author: your name
 * @Date: 2021-07-07 11:39:39
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-02-28 16:42:04
 * @Description: 公用字典
 */
import { lang } from './filters'

export const DICT = {
  publishStatus : [
    { value: 0, label: '待发布', name: '待发布' },
    { value: 1, label:'已发布', name: '已发布' },
    { value: 2, label:'已下线', name: '已下线' },
    { value: 3, label:'已删除', name: '已删除' }
  ],
  enbStatus: [
    { value: 1, label: lang('启用'), name: lang('启用') },
    { value: 2, label: lang('禁用'), name: lang('禁用') }
  ],
  enbStatusAuth: [
    { value: 1, label: lang('启用'), name: lang('启用') },
    { value: 0, label: lang('禁用'), name: lang('禁用') }
  ],
  switchStatus : [
    { value: '1', label: lang('是'), name: lang('是') },
    { value: '0', label: lang('否'), name: lang('否') }
  ],
  paymentStatus : [
    {value: '1', label: lang('已付款'), name: lang('已付款')},
    {value: '0', label: lang('未付款'), name: lang('未付款')}
  ],
  commonMonthOption : [
    {value: 1, label: lang('三个月内'), name: lang('三个月内')},
    {value: 2, label: lang('半年内'), name: lang('半年内')},
    {value: 3, label: lang('今年内'), name: lang('今年内')},
    {value: 4, label: lang('自定义月份'), name: lang('自定义月份')}
  ],
  orderList : [
    {value: 1, label: lang('订单编号'), name: lang('订单编号')},
    {value: 2, label: lang('运单编号'), name: lang('运单编号')},
    {value: 3, label: lang('电商订单号'), name: lang('电商订单号')}
  ],
  printLogo : [
    {value: 1, label: lang('已打印'), name: lang('已打印')},
    {value: 2, label: lang('未打印'), name: lang('未打印')}
  ],
  countFlag : [
    {value: 0, label: lang('没有折扣'), name: lang('没有折扣')},
    {value: 1, label: lang('有折扣'), name: lang('有折扣')},
  ],
  // 我的资料面单字典
  profileFaceFormatOptions : [
    {value: '0', label: lang('不默认面单格式'), name: lang('不默认面单格式')},
    {value: '1', label: lang('一联面单'), name: lang('一联面单')},
    {value: '2', label: lang('二联面单'), name: lang('二联面单')}
    // {value: '3', label: lang('三联面单'), name: lang('三联面单')}
  ],
  
  // 打印机
  profilePrinterOptions : [
    {value: '0', label: lang('不默认打印机'), name: lang('不默认打印机')},
    {value: '1', label: lang('其他'), name: lang('其他')}
  ],
  // 折扣
  profileDiscountInformationOptions : [
    {value: '0', label: lang('不默认折扣信息'), name: lang('不默认折扣信息')},
    {value: '1', label: lang('显示折扣金额'), name: lang('显示折扣金额')},
    {value: '2', label: lang('不显示折扣金额'), name: lang('不显示折扣金额')}
  ]
}
