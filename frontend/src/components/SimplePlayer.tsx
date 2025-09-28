import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Music,
  Video
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// 播放项类型
export interface PlaylistItem {
  id: string
  title: string
  url: string
  type: 'audio' | 'video'
  duration?: number
  coverImg?: string
  author?: string
}

// 播放器属性
interface SimplePlayerProps {
  playlist: PlaylistItem[]
  currentIndex?: number
  onIndexChange?: (index: number) => void
  onPlayStateChange?: (playing: boolean) => void
  className?: string
  compact?: boolean
  autoPlay?: boolean
  loop?: boolean
  playing?: boolean // 外部控制的播放状态
  volume?: number // 外部控制的音量
  muted?: boolean // 外部控制的静音状态
  onVolumeChange?: (volume: number) => void
  onMuteChange?: (muted: boolean) => void
}

export default function SimplePlayer({
  playlist,
  currentIndex = 0,
  onIndexChange,
  onPlayStateChange,
  className,
  compact = false,
  autoPlay = false,
  loop = false,
  playing: externalPlaying,
  volume: externalVolume,
  muted: externalMuted,
  onVolumeChange,
  onMuteChange
}: SimplePlayerProps) {
  const [playing, setPlaying] = useState(externalPlaying ?? autoPlay)
  const [volume, setVolume] = useState(externalVolume ?? 0.8)
  const [muted, setMuted] = useState(externalMuted ?? false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isReady, setIsReady] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // 当前播放项
  const currentItem = playlist[currentIndex]
  const isVideo = currentItem?.type === 'video'

  // 获取当前媒体元素
  const getMediaElement = useCallback(() => {
    return isVideo ? videoRef.current : audioRef.current
  }, [isVideo])

  // 播放/暂停切换
  const togglePlay = useCallback(() => {
    const media = getMediaElement()
    if (!media) return

    if (playing) {
      media.pause()
    } else {
      media.play()
    }
  }, [playing, getMediaElement])

  // 上一首
  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      onIndexChange?.(newIndex)
    }
  }, [currentIndex, onIndexChange])

  // 下一首
  const playNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      const newIndex = currentIndex + 1
      onIndexChange?.(newIndex)
    } else if (loop) {
      onIndexChange?.(0)
    }
  }, [currentIndex, playlist.length, onIndexChange, loop])

  // 音量控制
  const toggleMute = useCallback(() => {
    const media = getMediaElement()
    if (!media) return

    const newMuted = !muted
    setMuted(newMuted)
    media.muted = newMuted
    onMuteChange?.(newMuted)
  }, [muted, getMediaElement, onMuteChange])

  // 设置音量
  const setVolumeLevel = useCallback((newVolume: number) => {
    const media = getMediaElement()
    if (!media) return

    setVolume(newVolume)
    media.volume = newVolume
    onVolumeChange?.(newVolume)
    if (newVolume > 0) {
      setMuted(false)
      media.muted = false
      onMuteChange?.(false)
    }
  }, [getMediaElement, onVolumeChange, onMuteChange])

  // 进度条点击
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progress = clickX / rect.width
    const newTime = progress * duration
    
    const media = getMediaElement()
    if (media) {
      media.currentTime = newTime
      setCurrentTime(newTime)
    }
  }, [duration, getMediaElement])

  // 音量条点击
  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return
    
    const rect = volumeRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width))
    
    setVolumeLevel(newVolume)
  }, [setVolumeLevel])

  // 格式化时间
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // 控制栏显示/隐藏
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing && isVideo && !compact) {
        setShowControls(false)
      }
    }, 3000)
  }, [playing, isVideo, compact])

  // 媒体事件处理
  const handleLoadedMetadata = useCallback(() => {
    const media = getMediaElement()
    console.log('🎵 SimplePlayer 媒体元数据加载完成:', { hasMedia: !!media })
    if (media) {
      setDuration(media.duration)
      setIsReady(true)
      console.log('🎵 SimplePlayer 设置为准备就绪')
    }
  }, [getMediaElement])

  const handleTimeUpdate = useCallback(() => {
    const media = getMediaElement()
    if (media) {
      setCurrentTime(media.currentTime)
    }
  }, [getMediaElement])

  const handlePlay = useCallback(() => {
    setPlaying(true)
    onPlayStateChange?.(true)
  }, [onPlayStateChange])

  const handlePause = useCallback(() => {
    setPlaying(false)
    onPlayStateChange?.(false)
  }, [onPlayStateChange])

  const handleEnded = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      playNext()
    } else if (loop) {
      playNext()
    } else {
      setPlaying(false)
      onPlayStateChange?.(false)
    }
  }, [currentIndex, playlist.length, loop, playNext, onPlayStateChange])

  const handleError = useCallback(() => {
    console.error('播放器错误')
    setPlaying(false)
    onPlayStateChange?.(false)
  }, [onPlayStateChange])

  // 当播放项变化时重置准备状态
  useEffect(() => {
    console.log('🎵 SimplePlayer 播放项变化，重置准备状态')
    setIsReady(false)
    setCurrentTime(0)
    setDuration(0)
  }, [currentIndex, currentItem?.url])

  // 同步外部播放状态
  useEffect(() => {
    console.log('🎵 SimplePlayer 外部播放状态变化:', externalPlaying)
    if (externalPlaying !== undefined) {
      console.log('🎵 SimplePlayer 设置内部播放状态:', externalPlaying)
      setPlaying(externalPlaying)
    }
  }, [externalPlaying])

  // 同步外部音量状态
  useEffect(() => {
    if (externalVolume !== undefined) {
      setVolume(externalVolume)
    }
  }, [externalVolume])

  // 同步外部静音状态
  useEffect(() => {
    if (externalMuted !== undefined) {
      setMuted(externalMuted)
    }
  }, [externalMuted])

  // 设置媒体元素属性
  useEffect(() => {
    const media = getMediaElement()
    if (!media) return

    media.volume = volume
    media.muted = muted
    
    // 如果应该自动播放且媒体已准备好，开始播放
    if ((autoPlay || playing) && isReady) {
      console.log('🎵 SimplePlayer 自动播放触发')
      media.play().catch((error) => {
        console.error('🎵 SimplePlayer 自动播放失败:', error)
      })
    }
  }, [volume, muted, autoPlay, playing, isReady, getMediaElement])

  // 响应播放状态变化
  useEffect(() => {
    const media = getMediaElement()
    console.log('🎵 SimplePlayer 播放状态变化:', { playing, isReady, hasMedia: !!media })
    if (!media || !isReady) {
      console.log('🎵 SimplePlayer 跳过播放控制: 媒体元素未准备好')
      return
    }

    if (playing) {
      console.log('🎵 SimplePlayer 开始播放')
      media.play().then(() => {
        console.log('🎵 SimplePlayer 播放成功')
      }).catch((error) => {
        console.error('🎵 SimplePlayer 播放失败:', error)
      })
    } else {
      console.log('🎵 SimplePlayer 暂停播放')
      media.pause()
    }
  }, [playing, getMediaElement, isReady])

  // 鼠标移动显示控制栏
  useEffect(() => {
    if (isVideo && !compact) {
      showControlsTemporarily()
    }
  }, [isVideo, compact, showControlsTemporarily])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          playPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          playNext()
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolumeLevel(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolumeLevel(Math.max(0, volume - 0.1))
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [togglePlay, playPrevious, playNext, toggleMute, setVolumeLevel, volume])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  if (!currentItem) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">没有可播放的内容</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      <CardContent className="p-0">
        <div 
          className={cn(
            'relative bg-black',
            compact ? 'aspect-video' : 'aspect-video',
            !isVideo && 'bg-gradient-to-br from-primary/20 to-secondary/20'
          )}
          onMouseMove={showControlsTemporarily}
          onMouseLeave={() => {
            if (playing && isVideo && !compact) {
              setShowControls(false)
            }
          }}
        >
          {/* 视频播放器 */}
          {isVideo && (
            <video
              ref={videoRef}
              src={currentItem.url}
              className="w-full h-full object-contain"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={handleError}
              playsInline
            />
          )}

          {/* 音频播放器 */}
          {!isVideo && (
            <>
              <audio
                ref={audioRef}
                src={currentItem.url}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleEnded}
                onError={handleError}
              />
              
              {/* 音频模式下的封面和信息 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  {currentItem.coverImg ? (
                    <img 
                      src={currentItem.coverImg} 
                      alt={currentItem.title}
                      className="w-32 h-32 object-cover rounded-lg shadow-lg mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                      <Music className="w-16 h-16 text-primary" />
                    </div>
                  )}
                  <div className="text-white">
                    <h3 className="text-lg font-semibold">{currentItem.title}</h3>
                    {currentItem.author && (
                      <p className="text-sm text-white/70">{currentItem.author}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 控制栏 */}
          <div 
            className={cn(
              'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
              showControls || !isVideo ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* 进度条 */}
            <div 
              ref={progressRef}
              className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-4"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* 上一首 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playPrevious}
                  disabled={currentIndex === 0}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                {/* 播放/暂停 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {playing ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* 下一首 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playNext}
                  disabled={currentIndex === playlist.length - 1 && !loop}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* 时间显示 */}
                <div className="text-white text-sm ml-4">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* 音量控制 */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <div 
                    ref={volumeRef}
                    className="w-16 h-1 bg-white/20 rounded-full cursor-pointer"
                    onClick={handleVolumeClick}
                  >
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-200"
                      style={{ width: `${muted ? 0 : volume * 100}%` }}
                    />
                  </div>
                </div>

                {/* 媒体类型指示器 */}
                <div className="text-white/70">
                  {isVideo ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 加载指示器 */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* 播放列表（紧凑模式下显示） */}
        {compact && playlist.length > 1 && (
          <div className="p-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">
              播放列表 ({currentIndex + 1}/{playlist.length})
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {playlist.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded cursor-pointer text-sm transition-colors',
                    index === currentIndex 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                  )}
                  onClick={() => onIndexChange?.(index)}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {index === currentIndex && playing ? (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="truncate">{item.title}</div>
                    {item.author && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.author}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.type === 'video' ? <Video className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 