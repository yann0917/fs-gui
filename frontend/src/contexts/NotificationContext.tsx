import { createContext, useContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface DownloadNotification {
  id: string
  type: 'book' | 'course'
  status: 'started' | 'progress' | 'completed' | 'failed'
  title: string
  message: string
  progress?: number
  error?: string
  timestamp: number
}

interface NotificationContextValue {
  isConnected: boolean
  notifications: DownloadNotification[]
  clearNotifications: () => void
  removeNotification: (id: string) => void
  requestNotificationPermission: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { toast } = useToast()
  
  // 状态
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<DownloadNotification[]>([])
  
  // 引用
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // 显示 Toast 通知
  const showToastNotification = useCallback((notification: DownloadNotification) => {
    let title = ''
    let description = notification.message
    let variant: 'default' | 'destructive' = 'default'

    switch (notification.status) {
      case 'started':
        title = '开始下载'
        break
      case 'progress':
        title = '下载中...'
        if (notification.progress !== undefined) {
          description = `${notification.message} (${notification.progress}%)`
        }
        break
      case 'completed':
        title = '下载完成'
        break
      case 'failed':
        title = '下载失败'
        variant = 'destructive'
        break
    }

    toast({
      title,
      description,
      variant
    })
  }, [toast])

  // 显示浏览器原生通知
  const showBrowserNotification = useCallback((notification: DownloadNotification) => {
    if (Notification.permission === 'granted') {
      let title = ''
      let body = ''
      const icon = '/favicon.ico'

      switch (notification.status) {
        case 'completed':
          title = '下载完成'
          body = `${notification.title} 已下载完成`
          break
        case 'failed':
          title = '下载失败'
          body = `${notification.title} 下载失败: ${notification.error || notification.message}`
          break
      }

      if (title) {
        new Notification(title, {
          body,
          icon,
          tag: `download-${notification.id}` // 防止重复通知
        })
      }
    }
  }, [])

  // 连接到 SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      console.log('尝试连接到 SSE...')
      eventSourceRef.current = new EventSource('/api/notifications')
      
      eventSourceRef.current.onopen = () => {
        console.log('SSE 连接已建立')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        
        // 清除重连定时器
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current)
          reconnectTimerRef.current = null
        }
      }

      eventSourceRef.current.addEventListener('connected', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE 连接成功:', data)
        } catch (error) {
          console.error('解析连接数据失败:', error)
        }
      })

      eventSourceRef.current.addEventListener('notification', (event) => {
        try {
          const notification: DownloadNotification = JSON.parse(event.data)
          console.log('收到通知:', notification)
          
          // 添加到通知列表
          setNotifications(prev => {
            const newNotifications = [notification, ...prev]
            // 限制通知数量
            return newNotifications.slice(0, 50)
          })
          
          // 显示 toast 通知
          showToastNotification(notification)
          
          // 显示浏览器原生通知
          showBrowserNotification(notification)
          
        } catch (error) {
          console.error('解析通知数据失败:', error)
        }
      })

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE 连接错误:', error)
        setIsConnected(false)
        
        // 检查连接状态
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('SSE 连接已关闭')
        }
        
        // 自动重连
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`${delay}ms 后尝试重连 (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)
          
          reconnectTimerRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else {
          console.error('达到最大重连次数，停止重连')
        }
      }
      
    } catch (error) {
      console.error('创建 SSE 连接失败:', error)
      setIsConnected(false)
    }
  }, [showToastNotification, showBrowserNotification])

  // 断开连接
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  // 请求通知权限
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        console.log('通知权限:', permission)
        return permission === 'granted'
      } catch (error) {
        console.error('请求通知权限失败:', error)
        return false
      }
    }
    return Notification.permission === 'granted'
  }, [])

  // 清除通知
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // 移除特定通知
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // 监听自定义通知事件（用于测试）
  useEffect(() => {
    const handleCustomNotification = (event: CustomEvent<DownloadNotification>) => {
      const notification = event.detail
      console.log('收到自定义通知:', notification)
      
      // 添加到通知列表
      setNotifications(prev => {
        const newNotifications = [notification, ...prev]
        // 限制通知数量
        return newNotifications.slice(0, 50)
      })
      
      // 显示 toast 通知
      showToastNotification(notification)
      
      // 显示浏览器原生通知
      showBrowserNotification(notification)
    }

    window.addEventListener('notification', handleCustomNotification as EventListener)
    
    return () => {
      window.removeEventListener('notification', handleCustomNotification as EventListener)
    }
  }, [showToastNotification, showBrowserNotification])

  // 初始化连接
  useEffect(() => {
    connect()
    requestNotificationPermission()
    
    // 组件卸载时断开连接
    return () => {
      disconnect()
    }
  }, []) // 移除依赖，只在挂载时执行一次

  const value: NotificationContextValue = {
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
    requestNotificationPermission
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 