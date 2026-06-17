// request.ts
// 判断环境：develop=开发版，trial=体验版，release=正式版
const accountInfo = wx.getAccountInfoSync()
const envVersion = accountInfo.miniProgram.envVersion
const isDevelopment = envVersion === 'develop'
const BASE_URL = !isDevelopment ? 'http://localhost:8080/api' : 'https://www.xinxinbaby.com.cn/api'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

function request<T>(url: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        const response = res.data as ApiResponse<T>
        if (response.code === 200) {
          resolve(response.data)
        } else {
          wx.showToast({
            title: response.msg || '请求失败',
            icon: 'none'
          })
          reject(new Error(response.msg))
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export const get = <T>(url: string, data?: any): Promise<T> => {
  return request<T>(url, 'GET', data)
}

export const post = <T>(url: string, data?: any): Promise<T> => {
  return request<T>(url, 'POST', data)
}
