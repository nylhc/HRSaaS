import axios from 'axios'
import store from '@/store'
import { Message, Loading } from 'element-ui'

// 封装axios的作用
// 1，统一基础配置
// 对于复杂项目来说，请求的基准路径不止一个，
// 而 axios 同时只能配置一个基准路径
// axios.defaults.baseURL = 'www.baidu.com/api'
// axios.defaults.baseURL = 'www.qq.com/api'

// 通过实例对象的方式，可以配置不同的基准路径而不会相互影响
// console.log(123, process.env)
const http = axios.create({
  // 场景：当开发时，基准路径为 /api 没问题，但是当开发完成后，需要上线部署时，
  // 基准路径必须切换到生产环境对应的路径,比如 /prod-api
  // 问题：频繁切换基准路径容易出错
  // 需求：如果是开发模式，基准路径自动为 /api ; 如果是生产模式，基准路径自动为 /prod-api
  // 当前的模板，如果运行 npm run dev 此时是开发环境，通过 process.env.NODE_ENV 得到 'development'
  // 当前的模板，如果运行 npm run buid:prod 此时是生产环境，通过 process.env.NODE_ENV 得到 'production'
  baseURL: process.env.VUE_APP_BASE_API, // 基准路径
  timeout: 5000 // 超时时间
})

// 2，统一对请求进行配置
// 发现几乎每一个请求都需要设置请求头，携带token
// 如果每一个单独配置，太繁琐
// 可以在请求发起前拦截（为请求配置请求头即可）
// 通过请求拦截器对请求进行拦截
let loadingIns
let loadingTick
http.interceptors.request.use((config) => {
  const isHideLoading = config.url.includes('hideloading=1')
  if (!isHideLoading) {
    loadingIns = Loading.service({
      fullscreen: true,
      // background: 'transparent'
      background: 'rgba(0,0,0,0.5)'
    })
  }

  const token = store.state.user.token
  config.headers.Authorization = `Bearer ${token}`
  // config 一定要返回出去，否则，请求发不出去
  return config
}, (err) => {
  // return new Promise((resolve, reject) => { reject(err) })
  return Promise.reject(err)
})

// 3，统一对响应进行配置（如：返回最核心的数据, 统一处理异常）
// 有了响应拦截器，之后每次发请求就不用关心错误的相关处理
// 第一个回调是成功的回调
// 这里的成功仅仅表示【成功】得到了服务器的响应（状态码是2xx），
// 至于是不是我们要的那个数据，需要【进一步】判断

// 如果请求状态码200以外的，默认走第二个失败的回调
http.interceptors.response.use((res) => {
  clearTimeout(loadingTick)
  loadingTick = setTimeout(() => {
    loadingIns.close()
  }, 200)
  // axios默认包裹了data
  // 判断是不是Blob
  if (res.data instanceof Blob) return res.data // 返回了Blob对象
  const { data: { data, success, message, code }} = res
  if (success) {
    return data
  } else {
    if (code === 10000) {
      store.dispatch('user/logout')
    }
    Message({
      type: 'error',
      message
    })
    return Promise.reject(new Error(message))
  }
}, (err) => {
  clearTimeout(loadingTick)
  loadingTick = setTimeout(() => {
    loadingIns.close()
  }, 200)

  console.log('err')
  console.dir(err)
  // ?. 可选链操作符
  // 判断token失效的情况
  if (err?.response?.status === 401) {
    store.dispatch('user/logout')
  }
  Message({
    type: 'error',
    message: err.message
  })
  return Promise.reject(err)
})

export default http
