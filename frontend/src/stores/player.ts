import { create } from 'zustand'
import type { PlaylistItem } from '@/components/SimplePlayer'

interface PlayerState {
  // 播放状态
  isPlaying: boolean
  currentIndex: number
  playlist: PlaylistItem[]
  volume: number
  muted: boolean
  loop: boolean
  shuffle: boolean
  
  // 当前播放信息
  currentItem: PlaylistItem | null
  
  // 播放器控制方法
  setPlaylist: (playlist: PlaylistItem[], startIndex?: number) => void
  addToPlaylist: (item: PlaylistItem) => void
  removeFromPlaylist: (index: number) => void
  clearPlaylist: () => void
  playNow: (item: PlaylistItem) => void
  
  // 播放控制
  play: () => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  setCurrentIndex: (index: number) => void
  
  // 音量控制
  setVolume: (volume: number) => void
  toggleMute: () => void
  
  // 播放模式
  toggleLoop: () => void
  toggleShuffle: () => void
  
  // 播放历史
  playHistory: PlaylistItem[]
  addToHistory: (item: PlaylistItem) => void
  clearHistory: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // 初始状态
  isPlaying: false,
  currentIndex: 0,
  playlist: [],
  volume: 0.8,
  muted: false,
  loop: false,
  shuffle: false,
  currentItem: null,
  playHistory: [],

  // 播放列表管理
  setPlaylist: (playlist, startIndex = 0) => {
    console.log('🎵 Store setPlaylist 被调用:', { playlist, startIndex })
    set({
      playlist,
      currentIndex: startIndex,
      currentItem: playlist[startIndex] || null
    })
    console.log('🎵 Store setPlaylist 完成，当前状态:', {
      playlist: get().playlist,
      currentIndex: get().currentIndex,
      currentItem: get().currentItem
    })
  },

  addToPlaylist: (item) => {
    set((state) => ({
      playlist: [...state.playlist, item]
    }))
  },

  removeFromPlaylist: (index) => {
    set((state) => {
      const newPlaylist = state.playlist.filter((_, i) => i !== index)
      let newCurrentIndex = state.currentIndex
      
      if (index < state.currentIndex) {
        newCurrentIndex = state.currentIndex - 1
      } else if (index === state.currentIndex) {
        newCurrentIndex = Math.min(state.currentIndex, newPlaylist.length - 1)
      }
      
      return {
        playlist: newPlaylist,
        currentIndex: newCurrentIndex,
        currentItem: newPlaylist[newCurrentIndex] || null
      }
    })
  },

  clearPlaylist: () => {
    set({
      playlist: [],
      currentIndex: 0,
      currentItem: null,
      isPlaying: false
    })
  },

  playNow: (item) => {
    console.log('🎵 Store playNow() 被调用:', item)
    const state = get()
    
    // 检查是否已经在播放列表中
    const existingIndex = state.playlist.findIndex(p => p.id === item.id)
    
    if (existingIndex >= 0) {
      // 如果已经在播放列表中，直接切换到该项目并播放
      console.log('🎵 项目已在播放列表中，切换到索引:', existingIndex)
      set({
        currentIndex: existingIndex,
        currentItem: state.playlist[existingIndex],
        isPlaying: true
      })
    } else {
      // 如果不在播放列表中，添加到播放列表末尾并播放
      console.log('🎵 添加新项目到播放列表并播放')
      const newPlaylist = [...state.playlist, item]
      const newIndex = newPlaylist.length - 1
      set({
        playlist: newPlaylist,
        currentIndex: newIndex,
        currentItem: item,
        isPlaying: true
      })
    }
    
    // 添加到历史记录
    const finalState = get()
    if (finalState.currentItem) {
      finalState.addToHistory(finalState.currentItem)
    }
  },

  // 播放控制
  play: () => {
    console.log('🎵 Store play() 被调用')
    const beforeState = get()
    console.log('🎵 play() 调用前状态:', {
      isPlaying: beforeState.isPlaying,
      currentItem: beforeState.currentItem
    })
    set({ isPlaying: true })
    const state = get()
    console.log('🎵 play() 调用后状态:', {
      isPlaying: state.isPlaying,
      currentItem: state.currentItem
    })
    if (state.currentItem) {
      state.addToHistory(state.currentItem)
    }
  },

  pause: () => {
    set({ isPlaying: false })
  },

  togglePlay: () => {
    const state = get()
    if (state.isPlaying) {
      state.pause()
    } else {
      state.play()
    }
  },

  next: () => {
    const state = get()
    if (state.playlist.length === 0) return
    
    let nextIndex: number
    
    if (state.shuffle) {
      // 随机播放
      do {
        nextIndex = Math.floor(Math.random() * state.playlist.length)
      } while (nextIndex === state.currentIndex && state.playlist.length > 1)
    } else {
      // 顺序播放
      nextIndex = state.currentIndex + 1
      if (nextIndex >= state.playlist.length) {
        if (state.loop) {
          nextIndex = 0
        } else {
          return // 已经是最后一首且不循环
        }
      }
    }
    
    set({
      currentIndex: nextIndex,
      currentItem: state.playlist[nextIndex]
    })
  },

  previous: () => {
    const state = get()
    if (state.playlist.length === 0) return
    
    let prevIndex: number
    
    if (state.shuffle) {
      // 随机播放时，从历史记录中获取上一首
      // 这里简化处理，直接随机选择
      do {
        prevIndex = Math.floor(Math.random() * state.playlist.length)
      } while (prevIndex === state.currentIndex && state.playlist.length > 1)
    } else {
      // 顺序播放
      prevIndex = state.currentIndex - 1
      if (prevIndex < 0) {
        if (state.loop) {
          prevIndex = state.playlist.length - 1
        } else {
          return // 已经是第一首且不循环
        }
      }
    }
    
    set({
      currentIndex: prevIndex,
      currentItem: state.playlist[prevIndex]
    })
  },

  setCurrentIndex: (index) => {
    const state = get()
    if (index >= 0 && index < state.playlist.length) {
      console.log('🎵 Store setCurrentIndex() 被调用，索引:', index)
      set({
        currentIndex: index,
        currentItem: state.playlist[index],
        isPlaying: true // 切换歌曲时自动开始播放
      })
      // 添加到历史记录
      const newState = get()
      if (newState.currentItem) {
        newState.addToHistory(newState.currentItem)
      }
    }
  },

  // 音量控制
  setVolume: (volume) => {
    const newVolume = Math.max(0, Math.min(1, volume))
    set({ 
      volume: newVolume,
      // 如果设置了音量且大于0，自动取消静音
      muted: newVolume === 0 ? true : false
    })
  },

  toggleMute: () => {
    set((state) => ({ muted: !state.muted }))
  },

  // 播放模式
  toggleLoop: () => {
    set((state) => ({ loop: !state.loop }))
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }))
  },

  // 播放历史
  addToHistory: (item) => {
    set((state) => {
      const newHistory = [item, ...state.playHistory.filter(h => h.id !== item.id)]
      return {
        playHistory: newHistory.slice(0, 50) // 最多保留50条历史记录
      }
    })
  },

  clearHistory: () => {
    set({ playHistory: [] })
  }
}))

// 持久化播放器状态到 localStorage
if (typeof window !== 'undefined') {
  const savedState = localStorage.getItem('player-state')
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState)
      usePlayerStore.setState({
        volume: parsed.volume || 0.8,
        muted: parsed.muted || false,
        loop: parsed.loop || false,
        shuffle: parsed.shuffle || false,
        playHistory: parsed.playHistory || []
      })
    } catch (error) {
      console.error('Failed to load player state from localStorage:', error)
    }
  }

  // 监听状态变化并保存到 localStorage
  usePlayerStore.subscribe((state) => {
    const stateToSave = {
      volume: state.volume,
      muted: state.muted,
      loop: state.loop,
      shuffle: state.shuffle,
      playHistory: state.playHistory
    }
    localStorage.setItem('player-state', JSON.stringify(stateToSave))
  })
} 