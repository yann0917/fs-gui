import axios from 'axios'
import { getCookie } from '@/lib/utils'
import type {
  User,
  Category,
  BookResponse,
  BookDetail,
  CourseResponse,
  CourseDetailResponse,
  CourseArticleResponse
} from '@/types'

// API响应接口
interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
}

// 自定义错误类
class ApiError extends Error {
  code: number
  msg: string

  constructor(code: number, msg: string) {
    super(msg)
    this.name = 'ApiError'
    this.code = code
    this.msg = msg
  }
}

function getToken(): string {
  try {
    const userCookie = getCookie('user')
    if (userCookie) {
      const userData = JSON.parse(decodeURIComponent(userCookie))
      return userData.token || ''
    }
  } catch (error) {
    console.error('Error getting token:', error)
  }
  return ''
}

// 统一处理API响应的函数
function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.code === 0) {
    return response.data
  } else {
    throw new ApiError(response.code, response.msg)
  }
}

// 创建axios实例并添加响应拦截器
const apiClient = axios.create({
  timeout: 30000, // 30秒超时
})

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response) => {
    // 检查业务状态码
    const data = response.data as ApiResponse
    if (data.code !== 0) {
      throw new ApiError(data.code, data.msg)
    }
    return response
  },
  (error) => {
    // 处理网络错误或其他HTTP错误
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status
      let message = '请求失败'
      
      switch (status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败 (${status})`
      }
      
      throw new ApiError(status, message)
    } else if (error.request) {
      // 网络错误
      throw new ApiError(-1, '网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      throw new ApiError(-1, error.message || '未知错误')
    }
  }
)

export const api = {
  // 认证相关
  async sendSmsCode(phone: string) {
    const res = await apiClient.post('/api/login/sms-code', { phone })
    return handleApiResponse(res.data)
  },

  async loginByPhone(phone: string, code: string): Promise<User> {
    const res = await apiClient.post('/api/login/phone', { phone, code })
    return handleApiResponse<User>(res.data)
  },

  async loginByPassword(phone: string, password: string): Promise<User> {
    const res = await apiClient.post('/api/login/password', { phone, password })
    return handleApiResponse<User>(res.data)
  },

  async logout() {
    const res = await apiClient.post('/api/logout')
    return handleApiResponse(res.data)
  },

  async getUserInfo(): Promise<User> {
    const response = await apiClient.get('/api/user')
    return handleApiResponse<User>(response.data)
  },

  // 分类相关
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get('/api/categories')
    const data = handleApiResponse<Category[]>(res.data)
    return (data || []).map((cat: any) => ({
      businessType: cat.businessType,
      businessName: cat.businessName,
      businessZone: cat.businessZone || 0, // 添加缺失的businessZone字段
      cates: cat.cates || [],
      years: cat.years || []
    }))
  },

  // 书籍相关
  async getBooks(params: {
    businessType: number
    classifyIds?: number[]
    publishYear?: number
    sortType: number
    pageNo?: number
    pageSize?: number
  }): Promise<BookResponse> {
    const response = await apiClient.get('/api/books', { params })
    return handleApiResponse(response.data)
  },

  async getBookDetail(id: string): Promise<{ data: BookDetail }> {
    const response = await apiClient.get(`/api/books/${id}`)
    return handleApiResponse(response.data)
  },

  async getBookModuleDetail(id: string, fragmentId: string): Promise<{ data: BookDetail }> {
    const response = await apiClient.get(`/api/books/${id}/module?fragmentId=${fragmentId}`)
    return handleApiResponse(response.data)
  },

  // 课程相关
  async getCourses(params: {
    sortType?: number
    classifyIds?: number[]
    pageNo?: number
    pageSize?: number
    platform?: number
    businessZone?: number
  }): Promise<CourseResponse> {
    const response = await apiClient.get('/api/courses', { params })
    return handleApiResponse(response.data)
  },

  async getCourseDetail(id: string): Promise<CourseDetailResponse> {
    const response = await apiClient.get(`/api/courses/${id}`)
    return handleApiResponse(response.data)
  },

  async getCourseArticles(courseId: string, params: {
    pageNo?: number
    pageSize?: number
  }): Promise<CourseArticleResponse> {
    const response = await apiClient.get(`/api/courses/${courseId}/articles`, { params })
    return handleApiResponse(response.data)
  },

  // 下载相关
  async downloadContent(type: string, id: string, businessType?: string, format: number = 1) {
    if (type === 'book') {
      // 书籍下载
      const response = await apiClient.get('/api/books/download', {
        params: {
          id,
          businessType: businessType || '1', // 默认为樊登讲书
          downloadType: format  // 1-音频,2-视频
        }
      })
      return handleApiResponse(response.data)
    } else if (type === 'course') {
      // 课程下载
      const response = await apiClient.get('/api/courses/download', {
        params: {
          id,
          downloadType: format  // 1-音频,2-视频
        }
      })
      return handleApiResponse(response.data)
    }
    
    throw new ApiError(-1, '不支持的下载类型')
  },

  // 获取文章列表
  async getArticleList(id: string) {
    const token = getToken()
    const response = await apiClient.get(`/api/books/${id}/articles`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return handleApiResponse(response.data)
  }
}

// 导出ApiError类供外部使用
export { ApiError } 