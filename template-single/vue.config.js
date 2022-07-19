/*
 * @Description: 配置文件
 * @ComponentAuthor: lj
 * @Date: 2021-07-14
 */
const port = 8080; // dev port
const path = require('path');
const resolve = dir => path.resolve(__dirname, dir);
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' // 是否生产环境
const cdnBaseUrl = process.env.VUE_APP_CDN_DOMAIN //  process.env.VUE_APP_CDN_DOMAIN
const proxyUrl = process.env.VUE_APP_API_URL // 配置反向代理
/**
 * CDN配置
 * name 模块名称
 * scope UMD模块对应的全局对象key
 * js js的CDN路径
 * css css的CDN路径
 * usePrefetch 使用预读取 初始页面用不到的文件可以使用预读取属性 （不兼容低版本浏览器）
 */
const externalConfig = [
    { name: 'vue', scope: 'Vue', usePrefetch: false, js: cdnBaseUrl + '/static/vue/2.6.10/dist/vue.min.js' },
    { name: 'vue-i18n', scope: 'VueI18n', usePrefetch: false, js: cdnBaseUrl + '/static/vue-i18n/8.15.0/dist/vue-i18n.min.js' },
    { name: 'vue-router', scope: 'VueRouter', usePrefetch: false, js: cdnBaseUrl + '/static/vue-router/3.5.4/vue-router.min.js' },
    { name: 'vuex', scope: 'Vuex', usePrefetch: false, js: cdnBaseUrl + '/static/vuex/3.0.1/dist/vuex.min.js' },
    { name: 'axios', scope: 'axios', usePrefetch: false, js: cdnBaseUrl + '/static/axios/0.19.0/dist/axios.min.js' },
    { name: 'lodash', scope: '_', usePrefetch: false, js: cdnBaseUrl + '/static/lodash/4.17.15/lodash.min.js' },
    { name: 'vue-monoplasty-slide-verify', usePrefetch: true, scope: 'SlideVerify', js: cdnBaseUrl + '/static/vue-monoplasty-slide-verify/1.0.5/dist/slide-verify.js' },
    // { name: 'element-ui', scope: 'ELEMENT', usePrefetch: false, js: cdnBaseUrl + '/static/element-ui/2.10.1.jms/lib/index.js' },
    { name: 'html2canvas', scope: 'html2canvas', usePrefetch: true, js: cdnBaseUrl + '/static/html2canvas/1.0.0-rc.5/dist/html2canvas.min.js' },
    { name: 'nprogress', scope: 'NProgress', usePrefetch: false, js: cdnBaseUrl + '/static/nprogress/0.2.0/nprogress.js', css: cdnBaseUrl + '/static/nprogress/0.2.0/nprogress.css' },
  ]
module.exports = {
    publicPath: './',
    //  关闭生产环境的 source map
    productionSourceMap: false,
    devServer: {
        host: '0.0.0.0',
        port,
        https: false,
        disableHostCheck: true,
        overlay: {
          warnings: false,
          errors: true
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
      proxy: {
        '/proxyUrl': {
          target: proxyUrl,
          ws: true,
          changeOrigin: true,
          pathRewrite: {
            '^/proxyUrl': ''
          }
        },
      }
    },
    // 默认在生成的静态资源文件名中包含hash以控制缓存
    filenameHashing: true,
    // 如果你不需要使用eslint，把lintOnSave设为false即可
    lintOnSave: true,
    // 自定义webpack配置
    configureWebpack:config => {
        // 设置webpack别名
        config.resolve.alias = Object.assign(config.resolve.alias,{
            '@': resolve('src'),
            '@views': '@/views',
            '@public': '@/@public',
            '@store': '@/store',
            '@scss': '@/assets/style',
            'element-ui': 'jms-element-ui',
        })
        // 设置项目的输出
        const filename = 'js/[name].[hash:8].js'
        config.output = Object.assign(config.output,{
            filename: filename,
            chunkFilename:filename, 
        })
        //优化配置项
        config.optimization = Object.assign(config.optimization || {}, {
            splitChunks:{
                cacheGroups:{
                     // 分离node_modules到公共文件vendor
                    vendor: {
                        chunks: 'all', // 包括同步异步
                        test: /node_modules/, // 校验规则
                        name: 'vendor', // 分离后的chunk名称
                        minChunks: 1, // 最小的复用次数
                        maxInitialRequests: 5, // 最大的初始请求数
                        minSize: 0, // 最小的复用次数
                        priority: 10, // 优先级
                    },
                    // 分离项目中被引用了2次及2次以上的文件到公共文件common
                    common: {
                        chunks: 'all', // 包括同步异步
                        name: 'common', // 分离后的chunk名称
                        minChunks: 2, // 最小的复用次数
                    },
                }
            }
        })
        // 生产环境 忽略打包配置 配合静态资源CDN
        if (!IS_DEVELOPMENT) {
            const externals = {}
            externalConfig.forEach(item => (externals[item.name] = item.scope))
            config.externals = externals
        }
        // 生产环境-压缩设置为真
        if (!IS_DEVELOPMENT && config.optimization.minimizer) {
            config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
            config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
            config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
            config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log'];// 移除console
          }
    },
     // 新增webpack插件
  chainWebpack: config => {
    // 生产环境-html插件配置调整
    config
      .plugin('html')
      .tap(args => {
        //  如果是开发环境则不载入cdn
        args[0].cdnConfig = IS_DEVELOPMENT ? [] : externalConfig
        return args
      })
    config
    .module
    .rule('images')
    .use('url-loader')
    .tap(options => {
      options.limit = 10 * 1024
      return options
    })
    // 生产环境-可视化的环境变量存在
    if (!IS_DEVELOPMENT && process.env.ANALYZER) {
      config
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
  },
  css: {
        extract: false,
        loaderOptions: { 
          sass: {
            prependData: `
              @import "src/assets/style/element-variables.scss";
              @import "src/assets/theme/theme.scss";
              @import "src/assets/style/jms-style/mixins.scss";
            `
          }
        }
      }
}
