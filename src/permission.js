import router from '@/router'
import store from '@/store'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import { asyncRoutes } from '@/router'

const whiteList = ['/404', '/login']

// 前置导航
router.beforeEach(async(to, from, next) => {
  nprogress.start()
  if (store.state.user.token) {
    if (to.path === '/login') {
      // 注意，如果next调用时，传了个具体路径，会使得后置导航的那个回调函数不会被调用
      // 此时，那个进度动画不会消失
      next('/')
      nprogress.done()
    } else {
      // 这里执行说明此时有token，并且访问的是鉴权类的页面
      // 另外，如果发现userInfo有值，就没必须继续获取用户信息了
      if (!store.state.user.userInfo.userId) {
        const { roles } = await store.dispatch('user/getUserInfo')
        const filterRoutes = asyncRoutes.filter(item => {
          // return true/false
          return roles.menus.includes(item.children[0].name)
        })
        console.log(filterRoutes)
        store.commit('user/setRoutes', filterRoutes)
        router.addRoutes([...filterRoutes, { path: '*', redirect: '/404', hidden: true }]) // 添加动态路由信息到路由表
        // router添加动态路由之后 需要转发一下
        next(to.path) // 目的是让路由拥有信息 router的已知缺陷
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
      nprogress.done()
    }
  }
})

// 后置导航
router.afterEach(() => {
  // 页面跳转完成后会执行该回调
  nprogress.done()
})
