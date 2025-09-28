import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// 使用DropdownMenu替代Popover
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { InfoIcon, LogOutIcon, BellIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/contexts/NotificationContext'
import LoginDialog from './LoginDialog'
import ThemeToggle from './ThemeToggle'
import AboutDialog from './AboutDialog'
import NotificationHistory from './NotificationHistory'

export default function UserNav() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuthStore()
  const { notifications } = useNotifications()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showAboutDialog, setShowAboutDialog] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const handleAboutClick = () => {
    setShowAboutDialog(true)
  }

  // 计算通知数量 - 显示所有通知的总数
  const unreadCount = notifications.length

  return (
    <nav className="flex items-center space-x-4">
      <ThemeToggle />
      
      {/* 通知按钮 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <BellIcon className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto p-0" align="end">
          <NotificationHistory />
        </DropdownMenuContent>
      </DropdownMenu>
      
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl || ''} alt={user?.username || 'User'} />
                <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  用户ID: {user?.uid}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/about')}>
              <InfoIcon className="mr-2 h-4 w-4" />
              <span>关于</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleAboutClick}>
              <InfoIcon className="mr-2 h-4 w-4" />
              <span>使用教程</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant="outline" onClick={() => setShowLoginDialog(true)}>
            登录
          </Button>
          <Button variant="ghost" size="sm" onClick={handleAboutClick}>
            <InfoIcon className="h-4 w-4 mr-1" />
            关于
          </Button>
        </>
      )}

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      <AboutDialog open={showAboutDialog} onOpenChange={setShowAboutDialog} />
    </nav>
  )
} 