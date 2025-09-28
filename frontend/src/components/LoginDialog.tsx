import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [loginType, setLoginType] = useState<'phone' | 'password'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  
  const { toast } = useToast()
  const { loginByPhone, loginByPassword } = useAuthStore()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendCode = async () => {
    try {
      if (!phone) {
        toast({
          title: '发送失败',
          description: '请输入手机号',
          variant: 'destructive'
        })
        return
      }

      await api.sendSmsCode(phone)
      setCountdown(60)
      toast({
        title: '发送成功',
        description: '验证码已发送到您的手机'
      })
    } catch (error: any) {
      toast({
        title: '发送验证码失败',
        description: error.response?.data?.msg || error.response?.data?.error || '发送失败，请稍后重试',
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!phone) {
        toast({
          title: '登录失败',
          description: '请输入手机号',
          variant: 'destructive'
        })
        return
      }

      if (loginType === 'phone' && !code) {
        toast({
          title: '登录失败',
          description: '请输入验证码',
          variant: 'destructive'
        })
        return
      }

      if (loginType === 'password' && !password) {
        toast({
          title: '登录失败',
          description: '请输入密码',
          variant: 'destructive'
        })
        return
      }

      if (loginType === 'phone') {
        await loginByPhone(phone, code)
      } else {
        await loginByPassword(phone, password)
      }
      
      toast({
        title: '登录成功',
        description: '欢迎回来！'
      })
      
      onOpenChange(false)
      setTimeout(() => window.location.reload(), 500)
    } catch (error: any) {
      toast({
        title: '登录失败',
        description: error.response?.data?.msg || error.response?.data?.error || '登录失败，请稍后重试',
        variant: 'destructive'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">登录</DialogTitle>
          <div className="flex space-x-4 border-b mt-4">
            <button 
              onClick={() => setLoginType('phone')}
              className={`px-4 py-2 -mb-px ${
                loginType === 'phone' 
                  ? 'border-b-2 border-primary font-medium' 
                  : 'text-muted-foreground'
              }`}
            >
              手机验证码登录
            </button>
            <button 
              onClick={() => setLoginType('password')}
              className={`px-4 py-2 -mb-px ${
                loginType === 'password' 
                  ? 'border-b-2 border-primary font-medium' 
                  : 'text-muted-foreground'
              }`}
            >
              密码登录
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>手机号</Label>
            <Input 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="text" 
              placeholder="请输入手机号" 
            />
          </div>

          {loginType === 'phone' ? (
            <div className="space-y-2">
              <Label>验证码</Label>
              <div className="flex gap-2">
                <Input 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  type="text" 
                  placeholder="请输入验证码" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={countdown > 0}
                  onClick={sendCode}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>密码</Label>
              <Input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password" 
                placeholder="请输入密码" 
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            登录
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 