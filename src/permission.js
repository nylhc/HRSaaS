// 权限拦截 导航守卫 路由守卫
import router from './router' // 引入路由实例
import store from './store' // 引入vuex store实例,和组件中 this.$store一回事
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式

const whiteList = ['/login', '/404'] // 定义白名单  所有不受权限控制的页面
// 前置守卫
router.beforeEach((to, from, next) => {
  NProgress.start() // 开启进度条
  // 判断是否有token
  if (store.getters.token) {
    // 如果有token 继续判断是不是去登录页
    if (to.path === '/login') {
      // 去的是登录页,直接跳转到首页
      next('/')
    } else {
      // 否则直接放行
      next()
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) > -1) {
      // 如果找到了 表示在在名单里面,直接放行
      next()
    } else {
      // 否则跳转到登录页面
      next('/login')
    }
  }
  NProgress.done() // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
})

// 后置守卫
router.afterEach(() => {
  NProgress.done() // 关闭进度条
})
