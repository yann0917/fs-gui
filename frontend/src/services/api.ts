import axios from 'axios'
import { getCookie } from '@/lib/utils'
import type {
  Category,
  BookResponse,
  BookDetail,
  CourseResponse,
  CourseDetailResponse,
  CourseArticleResponse
} from '@/types'

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

export const api = {
  // 认证相关
  async sendSmsCode(phone: string) {
    const res = await axios.post('/api/login/sms-code', { phone })
    return res.data
  },

  async loginByPhone(phone: string, code: string) {
    return axios.post('/api/login/phone', { phone, code })
  },

  async loginByPassword(phone: string, password: string) {
    return axios.post('/api/login/password', { phone, password })
  },

  async logout() {
    return axios.post('/api/logout')
  },

  async getUserInfo() {
    const response = await axios.get('/api/user')
    return response.data
  },

  // 分类相关
  async getCategories(): Promise<Category[]> {
    const res = await axios.get('/api/categories')
    return (res.data.data || []).map((cat: any) => ({
      businessType: cat.businessType,
      businessName: cat.businessName,
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
    const response = await axios.get('/api/books', { params })
    return response.data
  },

  async getBookDetail(id: string): Promise<{ data: BookDetail }> {
    const response = await axios.get(`/api/books/${id}`)
    return response.data
  },

  async getBookModuleDetail(id: string, fragmentId: string): Promise<{ data: BookDetail }> {
    const response = await axios.get(`/api/books/${id}/module?fragmentId=${fragmentId}`)
    return response.data
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
    const response = await axios.get('/api/courses', { params })
    return response.data
  },

  async getCourseDetail(id: string): Promise<CourseDetailResponse> {
    const response = await axios.get(`/api/courses/${id}`)
    return response.data
  },

  async getCourseArticles(courseId: string, params: {
    pageNo?: number
    pageSize?: number
  }): Promise<CourseArticleResponse> {
    const response = await axios.get(`/api/courses/${courseId}/articles`, { params })
    return response.data
  },

  // 下载相关
  async downloadContent(type: string, id: string, businessType?: string, format: number = 1) {
    if (type === 'book') {
      // 书籍下载
      const response = await axios.get('/api/books/download', {
        params: {
          id,
          businessType: businessType || '1', // 默认为樊登讲书
          downloadType: format  // 1-音频,2-视频
        }
      })
      return response.data
    } else if (type === 'course') {
      // 课程下载
      const response = await axios.get('/api/courses/download', {
        params: {
          id,
          downloadType: format  // 1-音频,2-视频
        }
      })
      return response.data
    }
    
    throw new Error('不支持的下载类型')
  },

  // 获取文章列表
  getArticleList(id: string) {
    const token = getToken()
    return axios.get(`/api/books/${id}/articles`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }
} 