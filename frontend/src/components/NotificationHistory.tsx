import { useNotifications } from '@/contexts/NotificationContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function NotificationHistory() {
  const { 
    isConnected, 
    notifications, 
    clearNotifications, 
    removeNotification 
  } = useNotifications()

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  // 测试通知功能
  const testNotification = () => {
    // 模拟一个测试通知，使用completed状态避免影响未读计数
    const testNotif = {
      id: `test-${Date.now()}`,
      type: 'book' as const,
      status: 'completed' as const,
      title: '测试书籍',
      message: '这是一个测试通知',
      timestamp: Math.floor(Date.now() / 1000)
    }
    
    // 直接调用useNotifications中的逻辑来添加通知
    // 由于我们不能直接访问setNotifications，暂时保持原有方式
    // 但改为completed状态，这样不会影响未读计数
    const event = new CustomEvent('notification', {
      detail: testNotif
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="w-80 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">下载通知</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>已连接</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>已断开</span>
              </div>
            )}
            <button 
              onClick={clearNotifications}
              className="text-xs text-muted-foreground hover:text-foreground"
              disabled={notifications.length === 0}
            >
              清空
            </button>
          </div>
        </div>
        
        {/* 开发环境下显示测试按钮 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={testNotification}
              className="text-xs"
            >
              测试通知
            </Button>
          </div>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          暂无通知
        </div>
      ) : (
        <div className="divide-y">
          {notifications.map((notification) => (
            <div 
              key={`${notification.id}-${notification.timestamp}`}
              className="p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {notification.status === 'completed' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {notification.status === 'failed' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  {notification.status === 'started' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                  {notification.status === 'progress' && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{notification.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {notification.type === 'book' ? '书籍' : '课程'}
                    </Badge>
                    {notification.progress !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {notification.progress}%
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  
                  {notification.error && (
                    <div className="text-xs text-red-600 mb-2">
                      {notification.error}
                    </div>
                  )}
                  
                  {notification.progress !== undefined && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>下载进度</span>
                        <span>{notification.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${notification.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {formatTime(notification.timestamp)}
                  </div>
                </div>
                
                <button 
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground text-xs p-1"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 