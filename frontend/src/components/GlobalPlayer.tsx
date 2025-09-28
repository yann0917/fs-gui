import { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  List,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player'
import SimplePlayer from '@/components/SimplePlayer'

export default function GlobalPlayer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  
  const {
    playlist,
    currentIndex,
    currentItem,
    isPlaying,
    volume,
    muted,
    loop,
    shuffle,
    togglePlay,
    next,
    previous,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    setCurrentIndex,
    clearPlaylist
  } = usePlayerStore()

  // 调试日志
  useEffect(() => {
    console.log('🎵 GlobalPlayer 状态更新:', {
      isPlaying,
      currentIndex,
      playlistLength: playlist.length,
      currentItem: currentItem?.title,
      hasPlaylist: playlist.length > 0,
      isExpanded,
      showPlaylist
    })
  }, [isPlaying, currentIndex, playlist.length, currentItem, isExpanded, showPlaylist])

  // 如果没有播放列表，不显示播放器
  if (!currentItem || playlist.length === 0) {
    console.log('🎵 GlobalPlayer 隐藏: 无播放列表或当前项')
    return null
  }



  return (
    <>
      {/* 全屏播放器 */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1">
            <SimplePlayer
              playlist={playlist}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              onPlayStateChange={(playing) => {
                console.log('🎵 展开SimplePlayer播放状态变化:', playing)
                if (playing) {
                  usePlayerStore.getState().play()
                } else {
                  usePlayerStore.getState().pause()
                }
              }}
              playing={isPlaying}
              autoPlay={isPlaying}
              loop={loop}
              volume={volume}
              muted={muted}
              onVolumeChange={setVolume}
              onMuteChange={(_newMuted) => {
                usePlayerStore.getState().toggleMute()
              }}
            />
          </div>
          
          {/* 关闭按钮 */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 播放列表侧边栏 */}
      {showPlaylist && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowPlaylist(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-96 bg-background border-l shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">播放列表</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlaylist(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {playlist.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      index === currentIndex 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted'
                    )}
                    onClick={() => {
                      console.log('🎵 播放列表点击，切换到索引:', index, '当前索引:', currentIndex)
                      console.log('🎵 播放列表点击，isExpanded:', isExpanded)
                      setCurrentIndex(index)
                      // 确保播放状态同步
                      setTimeout(() => {
                        const state = usePlayerStore.getState()
                        console.log('🎵 播放列表点击后状态:', {
                          isPlaying: state.isPlaying,
                          currentIndex: state.currentIndex,
                          currentItem: state.currentItem?.title
                        })
                      }, 100)
                    }}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {index === currentIndex && isPlaying ? (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    
                    {item.coverImg && (
                      <img 
                        src={item.coverImg} 
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      {item.author && (
                        <div className="text-sm text-muted-foreground truncate">
                          {item.author}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 隐藏的音频播放器 - 用于迷你播放器的实际播放 */}
      {!isExpanded && currentItem && (
        <div className="hidden">
          <SimplePlayer
            playlist={playlist}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            onPlayStateChange={(playing) => {
              console.log('🎵 隐藏SimplePlayer播放状态变化:', playing)
              if (playing) {
                usePlayerStore.getState().play()
              } else {
                usePlayerStore.getState().pause()
              }
            }}
            playing={isPlaying}
            autoPlay={isPlaying}
            loop={loop}
            compact={true}
            volume={volume}
            muted={muted}
            onVolumeChange={setVolume}
            onMuteChange={(_newMuted) => {
              usePlayerStore.getState().toggleMute()
            }}
          />
        </div>
      )}

      {/* 迷你播放器 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            {/* 歌曲信息 */}
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              {currentItem.coverImg && (
                <img 
                  src={currentItem.coverImg} 
                  alt={currentItem.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{currentItem.title}</div>
                {currentItem.author && (
                  <div className="text-sm text-muted-foreground truncate">
                    {currentItem.author}
                  </div>
                )}
              </div>
            </div>

            {/* 播放控制 */}
            <div className="flex items-center gap-2">
              {/* 随机播放 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleShuffle}
                className={cn(
                  'hidden sm:flex',
                  shuffle && 'text-primary'
                )}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              {/* 上一首 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={previous}
                disabled={currentIndex === 0 && !loop}
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* 播放/暂停 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="w-10 h-10"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              {/* 下一首 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={next}
                disabled={currentIndex === playlist.length - 1 && !loop}
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* 循环播放 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLoop}
                className={cn(
                  'hidden sm:flex',
                  loop && 'text-primary'
                )}
              >
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            {/* 音量控制 */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <div 
                className="w-20 h-1 bg-muted rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const newVolume = Math.max(0, Math.min(1, clickX / rect.width))
                  setVolume(newVolume)
                }}
              >
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${muted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            {/* 播放列表 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlaylist(true)}
              className="hidden sm:flex"
            >
              <List className="w-4 h-4" />
            </Button>

            {/* 展开/收起 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>

            {/* 关闭播放器 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPlaylist}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
} 