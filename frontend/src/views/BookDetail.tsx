import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Play, Download } from 'lucide-react'

import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import DownloadFormatDialog from '@/components/DownloadFormatDialog'
import { usePlayerStore } from '@/stores/player'
import type { PlaylistItem } from '@/components/SimplePlayer'
import type { BookDetail } from '@/types'

interface Tab {
  fragmentId: number
  moduleCode: string
  moduleName: string
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { } = useAuthStore()
  const { playNow } = usePlayerStore()
  
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('intro')
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [moduleContent, setModuleContent] = useState<string>('')
  const moduleContentCache = useRef<Record<string, string>>({})
  const [dominantColor, setDominantColor] = useState<string>('#3b82f6') // 默认蓝色

  // 获取 businessType 参数
  const currentBusinessType = searchParams.get('businessType') || '1'

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

  // 格式化时长
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    }
    return `${minutes}分钟`
  }

  // 提取图片主色调
  const extractDominantColor = (imageUrl: string) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const colorCount: { [key: string]: number } = {}

        // 采样像素点 (每10个像素采样一次以提高性能)
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const alpha = data[i + 3]

          // 跳过透明像素和过于接近白色/黑色的像素
          if (alpha < 125 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
            continue
          }

          // 将颜色量化到较少的色彩空间以便统计
          const quantizedR = Math.floor(r / 32) * 32
          const quantizedG = Math.floor(g / 32) * 32
          const quantizedB = Math.floor(b / 32) * 32
          const colorKey = `${quantizedR},${quantizedG},${quantizedB}`

          colorCount[colorKey] = (colorCount[colorKey] || 0) + 1
        }

        // 找到出现次数最多的颜色
        let maxCount = 0
        let dominantColorRgb = '59,130,246' // 默认蓝色
        
        for (const [color, count] of Object.entries(colorCount)) {
          if (count > maxCount) {
            maxCount = count
            dominantColorRgb = color
          }
        }

        const [r, g, b] = dominantColorRgb.split(',').map(Number)
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        setDominantColor(hexColor)
      } catch (error) {
        console.error('Failed to extract dominant color:', error)
      }
    }
    img.onerror = () => {
      console.error('Failed to load image for color extraction')
    }
    img.src = imageUrl
  }

  // 加载书籍详情
  const loadBookDetail = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const response = await api.getBookDetail(id)
      setBook(response.data)
      
      // 清空模块内容缓存（新书籍时清理）
      moduleContentCache.current = {}
      setModuleContent('')
      
      // 设置 tabs
      if (response.data.articles?.length) {
        setTabs(response.data.articles.map((article: any) => ({
          fragmentId: article.fragmentId,
          moduleCode: article.moduleCode,
          moduleName: article.moduleName
        })))
      }
      
      // 提取封面图片主色调
      if (response.data.bookInfo?.coverImg) {
        extractDominantColor(response.data.bookInfo.coverImg)
      }
      
      // 默认选择简介 tab
      setCurrentTab('intro')
    } catch (error) {
      toast({
        title: '加载失败',
        description: '获取书籍详情失败，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载模块内容
  const loadModuleContent = async () => {
    if (!id || !currentTab || currentTab === 'intro') return
    
    // 检查缓存
    if (moduleContentCache.current[currentTab]) {
      setModuleContent(moduleContentCache.current[currentTab])
      return
    }
    
    const currentTabInfo = tabs.find(tab => tab.moduleCode === currentTab)
    if (!currentTabInfo) return
    
    setTabLoading(true)
    try {
      // 使用 setTimeout 延迟加载，避免阻塞渲染
      setTimeout(async () => {
        try {
          const response = await api.getBookModuleDetail(id, String(currentTabInfo.fragmentId))
          const content = response.data.content || ''
          
          // 过滤掉动态注入的CSS链接，防止全局样式污染
          const cleanContent = content.replace(/<link[^>]*>/gi, '')
          
          // 缓存清理后的结果
          moduleContentCache.current[currentTab] = cleanContent
          setModuleContent(cleanContent)
        } catch (error) {
          toast({
            title: '加载失败',
            description: '获取模块内容失败，请稍后重试',
            variant: 'destructive'
          })
        } finally {
          setTabLoading(false)
        }
      }, 100) // 延迟100ms，让UI先渲染完成
    } catch (error) {
      setTabLoading(false)
    }
  }

  // 处理下载
  const handleDownloadClick = () => {
    if (!book?.bookInfo.bookId) return
    setShowDownloadDialog(true)
  }

  const handleDownloadConfirm = (format: number) => {
    if (!book?.bookInfo.bookId) return
    
    try {
      api.downloadContent('book', String(book.bookInfo.bookId), currentBusinessType, format)
      toast({
        title: '开始下载',
        description: '正在下载书籍...'
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

  // 处理推荐书籍点击
  const handleRecommendClick = (bookId: string) => {
    navigate(`/books/${bookId}?businessType=${currentBusinessType}`)
  }

  // 处理播放
  const handlePlayBook = () => {
    console.log('🎵 BookDetail handlePlayBook 被调用')
    if (!book?.bookInfo) {
      console.log('❌ 书籍信息不存在')
      return
    }
    
    const audioUrl = book.audioInfo?.mediaUrl
    console.log('🎵 音频URL:', audioUrl)
    
    // 创建播放项目
    const playItem: PlaylistItem = {
      id: `book-${book.bookInfo.bookId}`,
      title: book.bookInfo.title || '',
      url: audioUrl,
      type: 'audio',
      coverImg: book.bookInfo.coverImg,
      author: book.bookInfo.speakerName
    }
    
    console.log('🎵 创建的播放项目:', playItem)
    
    // 使用playNow方法播放
    playNow(playItem)
    
    // toast({
    //   title: '开始播放',
    //   description: `正在播放：${book.bookInfo.title}`
    // })
  }



  // 所有 tabs（包括简介）
  const allTabs = [
    { fragmentId: 0, moduleCode: 'intro', moduleName: '简介' },
    ...tabs
  ]

  useEffect(() => {
    loadBookDetail()
  }, [id])

  useEffect(() => {
    if (currentTab !== 'intro') {
      // 先清空内容，避免闪烁
      setModuleContent('')
      // 延迟加载模块内容
      loadModuleContent()
    }
  }, [currentTab])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">书籍不存在</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 基本信息带毛玻璃效果 - 完全独立的区域 */}
      <div className="fixed-header-wrapper">
        <div className="book-detail-header relative mb-8 bg-background h-[320px]">
          <div className="absolute inset-0 overflow-hidden">
            {book.bookInfo.coverImg && (
              <img 
                src={book.bookInfo.coverImg} 
                className="w-full h-full object-cover blur-2xl opacity-30 scale-110" 
                alt=""
              />
            )}
          </div>
          
          <div className="relative container mx-auto max-w-5xl h-full flex items-center">
            <div className="flex gap-8 w-full items-center">
              {/* 左侧：纯图片 */}
              <div className="w-48 h-64 shrink-0 overflow-hidden rounded-xl shadow-2xl">
                {book.bookInfo.coverImg && (
                  <img 
                    src={book.bookInfo.coverImg} 
                    alt={book.bookInfo.title}
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              
              {/* 右侧：所有信息和按钮 */}
              <div className="flex-1 flex flex-col justify-between h-64">
                <div className="space-y-3">
                <h1 className="text-2xl font-bold">{book.bookInfo.title}</h1>
                  <div className="text-muted-foreground space-y-1.5 text-base">
                  <p>讲书人：{book.bookInfo.speakerName}</p>
                  <p>播放次数：{book.bookInfo.playCount}</p>
                  <p>发布时间：{formatDate(book.bookInfo.publishTime)}</p>
                  <p>评分：{book.bookInfo.score}</p>
                  <p>时长：{formatDuration(book.audioInfo?.duration)}</p>
                </div>
                </div>
                
                {/* 按钮区域 */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handlePlayBook}
                    disabled={!book.bookInfo.bookId}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 h-12 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    播放
                  </Button>
                  <Button 
                    onClick={handleDownloadClick}
                    disabled={!book.bookInfo.bookId}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 h-12 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 占位元素，保持布局一致 */}
      <div className="h-[320px] mb-8"></div>

      {/* Tab 导航和内容 - 完全独立的区域 */}
      <div className="tab-section">
        <div className="container mx-auto max-w-5xl">
          <div className="border-b">
            <nav className="-mb-px flex gap-6">
              {allTabs.map((tab) => (
                <button 
                  key={tab.moduleCode}
                  onClick={() => setCurrentTab(tab.moduleCode)}
                  className={`pb-4 font-medium text-sm border-b-2 transition-colors ${
                    currentTab === tab.moduleCode 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  {tab.moduleName}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab 内容 - 使用条件渲染代替 v-show */}
          <div className="tab-content-wrapper">
            {/* 所有 Tab 内容都保持在 DOM 中，只是通过条件渲染控制显示/隐藏 */}
            
            {/* 简介 Tab */}
            <div className={`intro-tab space-y-8 ${currentTab === 'intro' ? 'block' : 'hidden'}`}>
              <div>
                <h2 className="text-xl font-semibold mb-4 relative pl-4">
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-primary rounded-sm"></span>
                  内容简介
                </h2>
                <p>{book.bookInfo.summary}</p>
              </div>

              {/* 推荐信息 */}
              {book.recommendVO && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 relative pl-4">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-primary rounded-sm"></span>
                    {book.recommendVO.recommendName || '荐语'}
                  </h2>
                  <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30 relative overflow-hidden">
                    {/* 装饰性引号 */}
                    <div className="absolute top-4 left-4 text-amber-300 dark:text-amber-600 opacity-50">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                    
                    {/* 推荐内容 */}
                    <div className="relative pl-12">
                      <p className="text-amber-900 dark:text-amber-100 leading-relaxed text-base font-medium italic">
                        {book.recommendVO.recommendInfo}
                      </p>
                    </div>
                    
                    {/* 底部装饰 */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-200/30 to-transparent dark:from-amber-700/20 rounded-full transform translate-x-16 translate-y-16"></div>
                  </div>
                </div>
              )}

              {book.extract?.infos?.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6 relative pl-4">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-primary rounded-sm"></span>
                    精彩片段
                  </h2>
                  
                  {/* 响应式网格容器 */}
                  <div className="relative">
                    <div className={`grid gap-4 ${
                      book.extract.infos.length === 1 ? 'grid-cols-1' :
                      book.extract.infos.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                      book.extract.infos.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                      book.extract.infos.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                      book.extract.infos.length >= 5 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {book.extract.infos.map((info: any, index: number) => (
                        <div 
                          key={index}
                          className="group relative bg-gradient-to-br from-card to-card/50 rounded-xl border border-border/30 transition-all duration-300 hover:shadow-lg overflow-hidden"
                          style={{
                            '--dynamic-color': dominantColor,
                            borderColor: `${dominantColor}30`
                          } as React.CSSProperties}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${dominantColor}60`
                            e.currentTarget.style.boxShadow = `0 10px 25px -3px ${dominantColor}20, 0 4px 6px -2px ${dominantColor}10`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${dominantColor}30`
                            e.currentTarget.style.boxShadow = ''
                          }}
                        >
                          {/* 装饰性元素 */}
                          <div 
                            className="absolute top-0 left-0 w-full h-1"
                            style={{
                              background: `linear-gradient(to right, ${dominantColor}cc, ${dominantColor}66, transparent)`
                            }}
                          ></div>
                          
                          {/* 引用装饰 */}
                          <div 
                            className="absolute top-6 left-6 transition-colors duration-300"
                            style={{
                              color: `${dominantColor}33`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = `${dominantColor}4d`
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = `${dominantColor}33`
                            }}
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                            </svg>
                          </div>
                          
                          <div className="p-6 pt-12 h-full flex flex-col">
                            <blockquote className="relative flex-1">
                              <p className="text-foreground/90 leading-relaxed text-base font-medium italic">
                                "{info.intro}"
                              </p>
                            </blockquote>
                            
                            {/* 底部装饰线 */}
                            <div className="mt-6 flex items-center justify-between">
                              <div 
                                className="flex-1 h-px"
                                style={{
                                  background: `linear-gradient(to right, ${dominantColor}4d, transparent)`
                                }}
                              ></div>
                              <div className="px-3 text-xs text-muted-foreground font-medium">
                                片段 {index + 1}
                              </div>
                              <div 
                                className="flex-1 h-px"
                                style={{
                                  background: `linear-gradient(to left, ${dominantColor}4d, transparent)`
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* 悬浮效果装饰 */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                              background: `linear-gradient(135deg, ${dominantColor}0d, transparent)`
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {book.authors?.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 relative pl-4">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-primary rounded-sm"></span>
                    作者简介
                  </h2>
                  {book.authors.map((author: any, index: number) => (
                    <div 
                      key={index} 
                      className="p-5 bg-card rounded-lg border border-border/50 space-y-3"
                    >
                      <h3 className="font-medium text-lg">{author.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{author.summary}</p>
                      {author.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {author.tags.map((tag: string, tagIndex: number) => (
                            <span 
                              key={tagIndex}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 其他 Tab 内容 */}
            <div className={`other-tab-content ${currentTab !== 'intro' ? 'block' : 'hidden'}`}>
              {tabLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="module-content-container">
                  <div 
                    className="prose dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" 
                    dangerouslySetInnerHTML={{ __html: moduleContent }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 推荐书籍 */}
        {book.recommendBook?.length > 0 && (
          <div className="mt-16 space-y-4 container mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold">相关推荐</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {book.recommendBook.map((item: any) => (
                <div 
                  key={item.bookId}
                  className="group cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleRecommendClick(item.bookId)}
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-lg mb-2">
                    <img 
                      src={item.coverImg} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 下载格式选择对话框 */}
      <DownloadFormatDialog 
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        onConfirm={handleDownloadConfirm}
        onCancel={() => setShowDownloadDialog(false)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t bg-muted/30">
        <div className="container mx-auto max-w-5xl py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>感谢您的阅读</p>
            <p className="mt-2">保持学习，持续成长</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 