const RouterArr = [
    {
        path: '/index',
        name: 'index',
        component: () => import('@/views/index/Index.vue'),
        meta: { icon: 'iconcaidan-shouye', title: '首页', affix: true}
    },
    {
        path: '/demo',
        name: 'demo',
        component: () => import('@/views/index/Demo.vue'),
        meta: {title: 'demo', keepAlive: true }
    },
    // 我的订单-模块
    {
        path: '/orderEntry',
        name: 'orderEntry',
        component: () => import('@/views/modules/MyOrder/orderEntry.vue'),
        meta: { title: '订单录入', keepAlive: true }
    },
    {
        path: '/orderImport',
        name: 'orderImport',
        component: () => import('@/views/modules/MyOrder/orderImport.vue'),
        meta: { title: '订单导入', keepAlive: true }
    },
    {
        path: '/orderManagement',
        name: 'orderManagement',
        component: () => import('@/views/modules/MyOrder/orderManagement.vue'),
        meta: { title: '订单管理', keepAlive: true }
    },
    {
        path: '/myWaybill',
        name: 'myWaybill',
        component: () => import('@/views/modules/MyOrder/myWaybill.vue'),
        meta: { title: '我的运单', keepAlive: true }
    },
    {
        path: '/fastPrinting',
        name: 'fastPrinting',
        component: () => import('@/views/modules/MyOrder/fastPrinting.vue'),
        meta: { title: '快速打印', keepAlive: true }
    },

    // 服务管理-模块

    {
        path: '/expressTracking',
        name: 'expressTracking',
        component: () => import('@/views/modules/ServiceManagement/expressTracking.vue'),
        meta: { title: '快件跟踪', keepAlive: true}
    },
    {
        path: '/freightInquiry',
        name: 'freightInquiry',
        component: () => import('@/views/modules/ServiceManagement/freightInquiry.vue'),
        meta: { title: '运费查询', keepAlive: true }
    },
    {
        path: '/suggestions',
        name: 'suggestions',
        component: () => import('@/views/modules/ServiceManagement/suggestions.vue'),
        meta: { title: '投诉建议', keepAlive: true }
    },
    // 财务管理-模块

    {
        path: '/monthlyStatement',
        name: 'monthlyStatement',
        component: () => import('@/views/modules/FinancialManagement/monthlyStatement.vue'),
        meta: { title: '月结对账单', keepAlive: true}
    },

    // 个人管理-模块

    {
        path: '/mailingAddress',
        name: 'mailingAddress',
        component: () => import('@/views/modules/PersonalManagement/mailingAddress.vue'),
        meta: { title: '我的地址设置', keepAlive: true}
    },
    {
        path: '/receivingAddress',
        name: 'receivingAddress',
        component: () => import('@/views/modules/PersonalManagement/receivingAddress.vue'),
        meta: { title: '收件地址设置', keepAlive: true}
    },

    // 权限管理-模块

    {
        path: '/authoritySetting',
        name: 'authoritySetting',
        component: () => import('@/views/modules/Authority/authorityManagement.vue'),
        meta: { title: '权限管理设置', keepAlive: true}
    },
]
export default RouterArr
