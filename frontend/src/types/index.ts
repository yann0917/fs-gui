// 用户相关类型
export interface User {
  avatarUrl: string
  beginnerVipPopup: {
    needPopup: boolean
    needPopupSevenVIP: boolean
  }
  encryptedUid: string
  firstLogin: boolean
  joinNewcomerZone: boolean
  needPopupSevenVIP: boolean
  newUser: boolean
  token: string
  uid: number
  username: string
}

// 分类相关类型
export interface Category {
  businessName: string
  businessType: number
  businessZone: number
  cates: Cate[]
  years?: Year[]
}

export interface Cate {
  cateIds: number[]
  id: number
  name: string
}

export interface Year {
  year: number
  yearName: string
}

// 书籍相关类型
export interface Book {
  id?: string
  bookId?: string
  title?: string
  coverImg?: string
  speakerName?: string
  businessType?: number
  publishTime?: string
  score?: number
  summary?: string
  playCount?: number
}

export interface BookResponse {
  data: Book[]
}

export interface BookParams {
  businessType?: number
  sort?: '1' | '2'
  page?: number
  pageSize?: number
  publishYear?: number
}

export interface Author {
  name: string
  summary: string
  tags: string[]
}

export interface AudioInfo {
  duration: number
  fragmentId: number
  mediaCoverUrl: string
  mediaFilesize: number
  mediaUrl: string
  trialDuration: number
}

export interface Article {
  fragmentId: number
  moduleCode: string
  moduleName: string
}

export interface BookDetail {
  content?: string
  acquire: {
    intros: string[]
  }
  articles: Article[]
  audioInfo: AudioInfo
  authors: Author[]
  bookInfo: {
    bookId: number
    businessType: number
    coverImg: string
    playCount: number
    publishTime: number
    score: string
    speakerName: string
    summary: string
    title: string
  }
  bookRights: {
    free: boolean
    rightType: number
    trial: boolean
  }
  extract: {
    infos: Array<{
      intro: string
      page: string
    }>
  }
  recommendBook: Book[]
  recommendVO?: {
    recommendInfo: string
    recommendName: string
  }
  speakers: Array<{
    headerImageUrl: string
    name: string
    summary: string
  }>
}

// 课程相关类型
export interface Course {
  courseId: number
  title: string
  introduct: string
  summary?: string
  author?: string
  speakerName?: string
  picUrl: string
  playCount: number
  publishTime: number
  totalPublishNo: number
  hasBuy: number
  bizType: number
  watermarkImage?: string
}

export interface CourseResponse {
  data: Course[]
}

export interface CourseArticle {
  id: number
  title: string
  seq: string
  summary?: string
  duration: number
  free: boolean
  hasLearned?: boolean
  audioUrl: string
  albumId: number
  albumName: string
  chapterInfo: {
    chapterId: number
    chapterName: string
    chapterSeq: number
    programNum: number
  }
  finished: number
  fragmentId: number
  isLimitedTimeFree: boolean
  mediaFilesize: number
  publishTime: number
  readCount: number
  showType: number
  titleImageUrl: string
  topFlag: number
  trial: boolean
  unlock: boolean
  unlockType: number
  videoFragmentId: number
}

export interface CourseArticleResponse {
  data: CourseArticle[]
}

export interface CourseDetail {
  id: number
  title: string
  subTitle: string
  albumCoverUrl: string
  coverImage: string
  introduct: string
  author: string
  readCountTotal: number
  totalPublishNo: number
  hasBought: boolean
  type: number
  imageText: string
}

export interface CourseDetailResponse {
  data: CourseDetail
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'book' | 'course'
  status: 'started' | 'completed' | 'failed' | 'progress'
  timestamp: number
  progress?: number
  error?: string
} 