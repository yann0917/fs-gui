import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { FileX } from 'lucide-react'

import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'

import type { Book, Category, Course } from '@/types'

// 创建状态缓存
const stateCache = {
  books: [] as Book[],
  courses: [] as Course[],
  categories: [] as Category[],
  currentBusinessType: 0,
  currentCategoryId: null as number | null,
  currentCateIds: [] as number[],
  currentYear: null as number | null,
  currentPage: 1,
  hasMore: true,
  lastUpdated: 0
}

export default function BookList() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const { toast } = useToast()
  
  // 从缓存或初始化状态
  const [allBooks, setAllBooks] = useState<Book[]>(stateCache.books)
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(stateCache.books)
  const [allCourses, setAllCourses] = useState<Course[]>(stateCache.courses)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(stateCache.courses)
  const [categories, setCategories] = useState<Category[]>(stateCache.categories)
  
  // 初始化businessType，优先级：URL参数 > localStorage > 缓存 > 默认值
  const getInitialBusinessType = () => {
    const urlBusinessType = searchParams.get('businessType')
    if (urlBusinessType) return parseInt(urlBusinessType)
    
    const savedBusinessType = localStorage.getItem('lastBusinessType')
    if (savedBusinessType) return parseInt(savedBusinessType)
    
    return stateCache.currentBusinessType || 0
  }
  
  const [currentBusinessType, setCurrentBusinessType] = useState<number>(getInitialBusinessType())
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(stateCache.currentCategoryId)
  const [currentCateIds, setCurrentCateIds] = useState<number[]>(stateCache.currentCateIds)
  const [currentYear, setCurrentYear] = useState<number | null>(stateCache.currentYear)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(stateCache.currentPage)
  const [hasMore, setHasMore] = useState(stateCache.hasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // 加载更多触发器的引用
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)
  
  // 是否从详情页返回的标记
  const isFromDetail = useRef(false)


  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  // 格式化播放次数
  const formatPlayCount = (count: number) => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
  }

  // 保存状态到缓存
  const saveStateToCache = () => {
    stateCache.books = allBooks
    stateCache.courses = allCourses
    stateCache.categories = categories
    stateCache.currentBusinessType = currentBusinessType
    stateCache.currentCategoryId = currentCategoryId
    stateCache.currentCateIds = currentCateIds
    stateCache.currentYear = currentYear
    stateCache.currentPage = currentPage
    stateCache.hasMore = hasMore
    stateCache.lastUpdated = Date.now()
    
    // 同时保存到localStorage
    if (currentBusinessType !== 0) {
      localStorage.setItem('lastBusinessType', String(currentBusinessType))
    }
  }

  // 检查缓存是否有效（5分钟内）
  const isCacheValid = () => {
    return Date.now() - stateCache.lastUpdated < 5 * 60 * 1000
  }

  // 获取分类数据
  const fetchCategories = async () => {
    // 如果缓存有效且有数据，直接使用缓存
    if (isCacheValid() && stateCache.categories.length > 0) {
      setCategories(stateCache.categories)
      return
    }
    
    try {
      const response = await api.getCategories()
      setCategories(response)
      
      // 设置默认的 businessType
      const businessTypeParam = searchParams.get('businessType')
      if (businessTypeParam) {
        const businessType = parseInt(businessTypeParam)
        setCurrentBusinessType(businessType)
      } else if (response.length > 0 && currentBusinessType === 0) {
        const defaultBusinessType = response[0].businessType
        setCurrentBusinessType(defaultBusinessType)
        navigate(`/books?businessType=${defaultBusinessType}`, { replace: true })
      }
    } catch (error) {
      toast({
        title: '获取分类失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    }
  }

  // 从当前数据中搜索
  const searchInCurrentData = (query: string) => {
    if (!query.trim()) {
      if (currentBusinessType === 4) {
        setFilteredCourses(allCourses)
      } else {
        setFilteredBooks(allBooks)
      }
      return
    }
    
    if (currentBusinessType === 4) {
      const filtered = allCourses.filter((course: Course) => 
        course.title?.toLowerCase().includes(query.toLowerCase()) ||
        (course.author?.toLowerCase().includes(query.toLowerCase()) || 
         course.speakerName?.toLowerCase().includes(query.toLowerCase()))
      )
      setFilteredCourses(filtered)
    } else {
      const filtered = allBooks.filter((book: Book) => 
        book.title?.toLowerCase().includes(query.toLowerCase()) ||
        book.speakerName?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredBooks(filtered)
    }
  }

  // 获取书籍数据
  const fetchBooks = async (loadMore = false) => {
    if (currentBusinessType === 0) return
    
    // 如果是从详情页返回且缓存有效，直接使用缓存
    if (isFromDetail.current && isCacheValid() && stateCache.books.length > 0 && !loadMore) {
      setAllBooks(stateCache.books)
      setFilteredBooks(stateCache.books)
      setCurrentPage(stateCache.currentPage)
      setHasMore(stateCache.hasMore)
      isFromDetail.current = false
      return
    }
    
    // 防止重复加载
    if ((loadMore && isLoadingMore) || (!loadMore && loading)) {
      return
    }
    
    if (loadMore) {
      setIsLoadingMore(true)
    } else {
      setLoading(true)
      setCurrentPage(1)
      setAllBooks([])
      setHasMore(true)
    }
    
    try {
      const params = {
        businessType: currentBusinessType,
        classifyIds: currentCateIds.length > 0 ? currentCateIds : undefined,
        publishYear: currentYear || undefined,
        sortType: 1,
        pageNo: loadMore ? currentPage : 1,
        pageSize: 15
      }
      
      const response = await api.getBooks(params)
      const books = response.data || []
      
      if (loadMore && books.length > 0) {
        setAllBooks(prevBooks => [...prevBooks, ...books])
        setCurrentPage(prev => prev + 1)
      } else if (!loadMore) {
        setAllBooks(books)
        setCurrentPage(2) // 下一页是第2页
      }
      
      setHasMore(books.length === 15)
      
    } catch (error) {
      toast({
        title: '获取书籍失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  // 获取课程数据
  const fetchCourses = async (loadMore = false) => {
    if (currentBusinessType === 0) return
    
    // 如果是从详情页返回且缓存有效，直接使用缓存
    if (isFromDetail.current && isCacheValid() && stateCache.courses.length > 0 && !loadMore) {
      setAllCourses(stateCache.courses)
      setFilteredCourses(stateCache.courses)
      setCurrentPage(stateCache.currentPage)
      setHasMore(stateCache.hasMore)
      isFromDetail.current = false
      return
    }
    
    // 防止重复加载
    if ((loadMore && isLoadingMore) || (!loadMore && loading)) {
      return
    }
    
    if (loadMore) {
      setIsLoadingMore(true)
    } else {
      setLoading(true)
      setCurrentPage(1)
      setAllCourses([])
      setHasMore(true)
    }
    
    try {
      const params = {
        sortType: 1,
        platform: 3,
        businessZone: 2,
        classifyIds: currentCateIds.length > 0 ? currentCateIds : undefined,
        pageNo: loadMore ? currentPage : 1,
        pageSize: 15
      }
      
      const response = await api.getCourses(params)
      const courses = response.data || []
      
      if (loadMore && courses.length > 0) {
        setAllCourses(prevCourses => [...prevCourses, ...courses])
        setCurrentPage(prev => prev + 1)
      } else if (!loadMore) {
        setAllCourses(courses)
        setCurrentPage(2) // 下一页是第2页
      }
      
      setHasMore(courses.length === 15)
      
    } catch (error) {
      toast({
        title: '获取课程失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  // 处理下载
  const handleDownload = async (payload: { id: string, type: string, format: number }) => {
    try {
      const businessType = currentBusinessType.toString()
      
      if (payload.type === 'course') {
        // 课程下载
        await api.downloadContent('course', payload.id, businessType, payload.format)
      } else {
        // 书籍下载
        await api.downloadContent('book', payload.id, businessType, payload.format)
      }
      
      toast({
        title: '开始下载',
        description: `正在下载${payload.type === 'book' ? '书籍' : '课程'}...`
      })
    } catch (error) {
      toast({
        title: '下载失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    }
  }

  // 处理分类切换
  const handleBusinessTypeChange = (businessType: number) => {
    setCurrentBusinessType(businessType)
    setCurrentCategoryId(null)
    setCurrentCateIds([])
    setCurrentYear(null)
    setIsSearchMode(false)
    setSearchQuery('')
    setCurrentPage(1)
    setHasMore(true)
    navigate(`/books?businessType=${businessType}`)
  }

  // 处理子分类切换
  const handleCategoryChange = (cateId: number, cateIds: number[]) => {
    setCurrentCategoryId(cateId)
    setCurrentCateIds(cateIds)
    setIsSearchMode(false)
    setSearchQuery('')
    setCurrentPage(1)
    setHasMore(true)
  }

  // 处理年份切换
  const handleYearChange = (year: number | null) => {
    setCurrentYear(year)
    setIsSearchMode(false)
    setSearchQuery('')
    setCurrentPage(1)
    setHasMore(true)
  }

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchMode(false)
    if (currentBusinessType === 4) {
      setFilteredCourses(allCourses)
    } else {
      setFilteredBooks(allBooks)
    }
    navigate(`/books?businessType=${currentBusinessType}`)
  }

  // 处理课程点击
  const handleCourseClick = (courseId: number) => {
    // 保存当前状态到缓存
    saveStateToCache()
    navigate(`/courses/${courseId}?businessType=${currentBusinessType}`)
  }

  // 获取当前分类的子分类和年份
  const currentCategory = categories.find(cat => cat.businessType === currentBusinessType)
  const currentCates = currentCategory?.cates || []
  const currentYears = currentCategory?.years || []

  // 设置 IntersectionObserver 监听滚动加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const trigger = entries[0]
        if (trigger.isIntersecting && 
            hasMore && 
            !isLoadingMore && 
            ((currentBusinessType === 4 && allCourses.length > 0) || 
             (currentBusinessType !== 4 && allBooks.length > 0))) {
          if (currentBusinessType === 4) {
            fetchCourses(true)
          } else {
            fetchBooks(true)
          }
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoadingMore, currentBusinessType, allCourses.length, allBooks.length])

  // 检测是否从详情页返回
  useEffect(() => {
    const state = location.state as any
    if (state?.from === 'detail') {
      isFromDetail.current = true
    }
  }, [location.state])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (currentBusinessType === 4) {
      fetchCourses()
    } else {
      fetchBooks()
    }
  }, [currentBusinessType, currentCateIds, currentYear])

  // 当数据更新时，应用搜索过滤
  useEffect(() => {
    if (isSearchMode && searchQuery) {
      searchInCurrentData(searchQuery)
    } else {
      if (currentBusinessType === 4) {
        setFilteredCourses(allCourses)
      } else {
        setFilteredBooks(allBooks)
      }
    }
  }, [allBooks, allCourses, isSearchMode, searchQuery, currentBusinessType])

  // 处理搜索参数
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
      setIsSearchMode(true)
      searchInCurrentData(search)
    } else {
      setIsSearchMode(false)
      setSearchQuery('')
      if (currentBusinessType === 4) {
        setFilteredCourses(allCourses)
      } else {
        setFilteredBooks(allBooks)
      }
    }
  }, [searchParams, allBooks, allCourses])

  // 保存状态到缓存（当状态变化时）
  useEffect(() => {
    saveStateToCache()
  }, [allBooks, allCourses, categories, currentBusinessType, currentCategoryId, currentCateIds, currentYear, currentPage, hasMore])



  return (
    <div className="relative">
      {/* 搜索结果提示 */}
      {isSearchMode && (
        <div className="sticky top-[56px] z-10 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="container mx-auto py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  搜索结果："{searchQuery}"
                </span>
                <span className="text-sm text-muted-foreground">
                  在当前分类中找到 {currentBusinessType === 4 ? filteredCourses.length : filteredBooks.length} 个结果
                </span>
              </div>
              <button
                onClick={clearSearch}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                清除搜索
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分类筛选栏 */}
      {!isSearchMode && (
        <div className="sticky top-[56px] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto py-4">
            {/* 主分类 */}
            <div className="flex gap-4 mb-4">
              {categories.map((category) => (
                <button
                  key={category.businessType}
                  onClick={() => handleBusinessTypeChange(category.businessType)}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 ${
                    currentBusinessType === category.businessType 
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md border-2 border-black dark:border-white' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {category.businessName}
                </button>
              ))}
            </div>

            {/* 子分类 */}
            {currentCates.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {currentCates.map((cate) => (
                  <button
                    key={cate.id}
                    onClick={() => handleCategoryChange(cate.id, cate.cateIds)}
                    className={`inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 ${
                      currentCategoryId === cate.id
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {cate.name}
                  </button>
                ))}
              </div>
            )}

            {currentYears.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="text-sm text-muted-foreground self-center mr-2">年份:</span>
                {currentYears.map((year) => (
                  <button
                    key={year.year}
                    onClick={() => handleYearChange(year.year === 0 ? null : year.year)}
                    className={`inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 ${
                      (year.year === 0 && currentYear === null) || currentYear === year.year
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {year.yearName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">
          {isSearchMode ? '搜索结果' : (currentBusinessType === 4 ? '课程列表' : '书籍列表')}
        </h1>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : currentBusinessType === 4 ? (
          // 课程卡片布局
          <>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isSearchMode ? '在当前分类中没有找到相关课程' : '暂无课程数据'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.courseId}
                    className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 flex overflow-hidden h-[140px]"
                    onClick={() => handleCourseClick(course.courseId)}
                  >
                    <div className="relative w-[105px] h-full shrink-0">
                      <div className="h-full w-full overflow-hidden">
                        <img
                          src={course.picUrl}
                          alt={course.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                          style={{ imageRendering: 'crisp-edges', WebkitBackfaceVisibility: 'hidden' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="p-3 flex-1 flex flex-col overflow-hidden">
                      <h3 className="text-sm font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-2 flex-1">
                        {course.introduct}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs mt-auto">
                        <span className="text-xs px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary truncate max-w-[90px]">
                          {course.author || course.speakerName}
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{course.totalPublishNo}节</span>
                          <span>{formatPlayCount(course.playCount)}</span>
                          <button 
                            className="ml-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload({id: String(course.courseId), type: 'course', format: 1})
                            }}
                          >
                            下载
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // 书籍卡片布局
          <>
            {filteredBooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isSearchMode ? '在当前分类中没有找到相关内容' : '暂无数据'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBooks.map((book) => (
                  <div
                    key={book.bookId}
                    className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 flex overflow-hidden h-[140px]"
                    onClick={() => {
                      // 保存当前状态到缓存
                      saveStateToCache()
                      navigate(`/books/${book.bookId}?businessType=${currentBusinessType}`)
                    }}
                  >
                    <div className="relative w-[105px] h-full shrink-0">
                      <div className="h-full w-full overflow-hidden">
                        <img
                          src={book.coverImg}
                          alt={book.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                          style={{ imageRendering: 'crisp-edges', WebkitBackfaceVisibility: 'hidden' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                    
                    <div className="p-3 flex-1 flex flex-col overflow-hidden">
                      <h3 className="text-sm font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-2 flex-1">
                        {book.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs mt-auto">
                        <span className="text-xs px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary truncate max-w-[90px]">
                          {book.speakerName}
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{formatDate(book.publishTime)}</span>
                          {book.playCount && <span>{formatPlayCount(book.playCount)}次播放</span>}
                          <button 
                            className="ml-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload({id: String(book.bookId), type: 'book', format: 1})
                            }}
                          >
                            下载
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* 加载更多触发器 */}
        <div 
          ref={loadMoreTriggerRef}
          className="h-4 my-6 flex items-center justify-center text-sm text-muted-foreground"
        >
          {isLoadingMore ? (
            <p>加载中...</p>
          ) : hasMore ? (
            <p>向下滚动加载更多</p>
          ) : (
            <div className="flex items-center gap-2">
              <FileX className="w-4 h-4" />
              <span>没有更多数据了</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 