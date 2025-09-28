import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Play, User, PlayCircle, Check, FileX, Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DownloadFormatDialog from '@/components/DownloadFormatDialog'
import { usePlayerStore } from '@/stores/player'
import type { PlaylistItem } from '@/components/SimplePlayer'
import type { CourseDetail, CourseArticle } from '@/types'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { isLoggedIn, user } = useAuthStore()
  const { playNow } = usePlayerStore()
  
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [articles, setArticles] = useState<CourseArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [articleLoading, setArticleLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('catalog')
  
  // 加载更多触发器的引用
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  // 获取 businessType 参数，默认为课程类型
  const currentBusinessType = searchParams.get('businessType') || '4'

  // 格式化播放次数
  const formatPlayCount = (count?: number) => {
    if (!count) return '0'
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
  }

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    }
    return `${minutes}分钟`
  }

  // 格式化日期
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-'
    const date = new Date(Number(timestamp))
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
  }

  // 加载课程详情
  const loadCourseDetail = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const courseResponse = await api.getCourseDetail(id)
      setCourse(courseResponse.data)

      // 加载第一页章节列表
      await loadArticles()
    } catch (error) {
      console.error('Failed to load course detail:', error)
      toast({
        title: '加载失败',
        description: '获取课程详情失败，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载章节列表
  const loadArticles = async (loadMore = false) => {
    if (!id || articleLoading) return
    
    setArticleLoading(true)
    try {
      const pageToLoad = loadMore ? currentPage : 1
      const response = await api.getCourseArticles(id, {
        pageNo: pageToLoad,
        pageSize: 20
      })
      
      if (loadMore) {
        setArticles(prev => [...prev, ...response.data])
        setCurrentPage(prev => prev + 1)
      } else {
        setArticles(response.data)
        setCurrentPage(2) // 下次加载第2页
      }
      
      // 检查是否还有更多数据
      setHasMore(response.data && response.data.length === 20)
    } catch (error) {
      console.error('Failed to load articles:', error)
    } finally {
      setArticleLoading(false)
    }
  }

  // 处理章节点击
  const handleArticleClick = (article: CourseArticle) => {
    if (!article.free && !isLoggedIn) {
      toast({
        title: '请先登录',
        variant: 'destructive'
      })
      return
    }
    
    if (!article.free && !user?.needPopupSevenVIP) {
      toast({
        title: '需要 VIP 权限',
        description: '开通 VIP 畅听所有课程',
        variant: 'destructive'
      })
      return
    }

    // 播放单个章节
    handlePlayArticle(article)
  }

  // 处理章节播放
  const handlePlayArticle = (article: CourseArticle) => {
    const audioUrl = article.audioUrl
    
    // 创建播放项目
    const playItem: PlaylistItem = {
      id: `course-${course?.id}-article-${article.id}`,
      title: `${article.seq} | ${article.title}`,
      url: audioUrl,
      type: 'audio',
      coverImg: article?.titleImageUrl,
      author: course?.author
    }
    
    // 使用playNow方法播放
    playNow(playItem)
  }

  // 处理下载点击
  const handleDownloadClick = () => {
    if (!isLoggedIn) {
      toast({
        title: '请先登录',
        variant: 'destructive'
      })
      return
    }

    console.log('Course data:', course) // 调试信息
    if (!course?.id) {
      console.log('Course ID is missing:', course?.id) // 调试信息
      toast({
        title: '课程ID缺失',
        description: '无法获取课程ID，请刷新页面重试',
        variant: 'destructive'
      })
      return
    }
    setShowDownloadDialog(true)
  }

  // 处理下载确认
  const handleDownloadConfirm = async (format: number) => {
    if (!course?.id) return
    
    try {
      await api.downloadContent('course', String(course.id), currentBusinessType, format)
      toast({
        title: '开始下载',
        description: '正在下载课程...'
      })
    } catch (error) {
      toast({
        title: '下载失败',
        description: '请稍后重试',
        variant: 'destructive'
      })
    }
    setShowDownloadDialog(false)
  }



  // 设置 IntersectionObserver 监听滚动加载
  useEffect(() => {
    // 只有在目录标签页才设置 observer
    if (activeTab !== 'catalog') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const trigger = entries[0]
        if (trigger.isIntersecting && 
            hasMore && 
            !articleLoading && 
            articles.length > 0) {
          loadArticles(true)
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
  }, [hasMore, articleLoading, articles.length, activeTab]) // 添加 activeTab 作为依赖项

  useEffect(() => {
    loadCourseDetail()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">课程不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* 课程基本信息 */}
        <Card className="mb-6 overflow-hidden relative">
          {/* 背景毛玻璃效果 */}
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={course.coverImage} 
              alt=""
              className="w-full h-full object-cover blur-2xl opacity-15 scale-110" 
            />
          </div>
          
          <div className="relative md:flex md:items-end">
            {/* 课程封面 */}
            <div className="md:w-80 flex-shrink-0 p-4">
              <div className="aspect-[16/9] relative overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={course.coverImage} 
                  alt={course.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            
            {/* 课程信息 */}
            <div className="flex-1 p-4">
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground leading-tight">
                    {course.title}
                  </h1>
                  {course.subTitle && (
                    <p className="text-muted-foreground mt-1">
                      {course.subTitle}
                    </p>
                  )}
                </div>

                {/* 统计信息 */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{course.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    <span>{formatPlayCount(course.readCountTotal)}次播放</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.totalPublishNo}节课程</span>
                  </div>
                </div>

                {/* 课程描述 */}
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {course.introduct}
                </p>

                {/* 操作按钮 */}
                <div className="pt-1 flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleDownloadClick}
                    className="px-6 py-3 h-12 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    下载课程
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 标签切换和内容 */}
        <Card>
          {/* 标签切换 */}
          <div className="border-b">
            <div className="flex">
              {[
                { id: 'catalog', label: '目录', count: articles.length },
                { id: 'intro', label: '简介' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.count !== undefined && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {tab.count}
                      </Badge>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <CardContent className="p-0">
            {activeTab === 'catalog' && (
              <div className="divide-y">
                {articles.map((article) => (
                  <div 
                    key={article.id}
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleArticleClick(article)}
                  >
                    {/* 播放状态 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      article.hasLearned 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-muted bg-background'
                    }`}>
                      {article.hasLearned ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Play className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* 章节信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {article.seq} | {article.title}
                        </h3>
                        {!article.free && (
                          <Badge variant="outline" className="text-xs">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>发布: {formatDate(article.publishTime)}</span>
                        <span>播放: {formatPlayCount(article.readCount)}</span>
                      </div>
                    </div>
                    
                    {/* 时长 */}
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(article.duration)}
                    </div>
                  </div>
                ))}
                
                {/* 加载更多触发器 */}
                <div 
                  ref={loadMoreTriggerRef}
                  className="h-12 flex items-center justify-center text-sm text-muted-foreground"
                >
                  {articleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span>加载中...</span>
                    </div>
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
            )}
            
            {activeTab === 'intro' && (
              <div className="p-6">
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: course.imageText || '<p class="text-muted-foreground">暂无课程简介</p>' }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 下载格式选择对话框 */}
      <DownloadFormatDialog 
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        onConfirm={handleDownloadConfirm}
        onCancel={() => setShowDownloadDialog(false)}
      />
    </div>
  )
} 