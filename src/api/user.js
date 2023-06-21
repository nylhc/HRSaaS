import http from '@/utils/request'

// 登录
export function login(data) {
  return http({
    url: '/sys/login',
    method: 'POST',
    data
  })
}

// 获取基本用户信息
export function getUserInfo() {
  return http({
    method: 'GET',
    url: '/sys/profile'
  })
}

/**
 * 更新密码
 * **/
export function updatePassword(data) {
  return http({
    url: '/sys/user/updatePass',
    method: 'put',
    data
  })
}
