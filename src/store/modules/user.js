import { setToken, getToken, removeToken } from '@/utils/auth'
import { login, getUserInfo } from '@/api/user'
// import router from '@/router'
import router, { constantRoutes, resetRouter } from '@/router'

const state = {
  token: getToken() || '', // 从缓存中读取初始值
  userInfo: {}, // 存储用户基本资料状态
  routes: [...constantRoutes] // 静态路由的数组
}

const mutations = {
  setUserInfo(state, payload) {
    state.userInfo = payload
  },
  setToken(state, payload) {
    state.token = payload
    // 持久化存储token
    setToken(payload)
  },
  removeToken(state) {
    state.token = ''
    removeToken()
  },
  setRoutes(state, filterRoutes) {
    state.routes = [...constantRoutes, ...filterRoutes] // 静态路由 + 动态路由
  }
}

const actions = {
  logout(ctx) {
    ctx.commit('removeToken')
    ctx.commit('setUserInfo', {})
    // 重置路由
    resetRouter()
    router.push('/login')
  },
  async getUserInfo(ctx) {
    const userInfo = await getUserInfo()
    ctx.commit('setUserInfo', userInfo)
    return userInfo
  },
  async login(ctx, payload) {
    // 这里发起异步请求，获取token，具体逻辑暂时省略
    const token = await login(payload)
    ctx.commit('setToken', token)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

