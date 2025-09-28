import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const [activeTab, setActiveTab] = useState('about')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border shadow-lg">
        <DialogHeader>
          <DialogTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">关于</TabsTrigger>
                <TabsTrigger value="tutorial">使用教程</TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="about" className="space-y-4 text-sm text-muted-foreground">
              <p>版本：v1.0.0</p>
              <p>作者：<a href="https://github.com/yann0917" target="_blank" className="text-blue-500 hover:text-blue-600 underline">https://github.com/yann0917</a></p>
              <p>本工具用于下载已购买的课程内容（可批量下载）</p>
              <p>支持下载格式：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>MP3 音频</li>
                <li>Markdown 文档</li>
                <li>PDF 文档(需安装 
                  <a 
                    href="https://wkhtmltopdf.org/downloads.html" 
                    target="_blank" 
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    wkhtmltopdf
                  </a>)
                </li>
              </ul>
              
              <div className="border-t pt-4 mt-4">
                <p className="font-medium">免责声明</p>
                <p className="mt-2">本工具仅供个人学习使用，请勿用于商业用途。使用本工具下载的内容版权均归樊登读书所有，请遵守相关法律法规，不得进行违法传播。</p>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-medium">版权声明</p>
                <p className="mt-2">所有课程内容版权归樊登读书所有。在使用下载功能时应确保已获得相应内容的正版授权。</p>
              </div>
            </TabsContent>

            <TabsContent value="tutorial" className="space-y-4 text-sm text-muted-foreground">
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-2">1. 登录账号</p>
                  <p>点击右上角头像，登录账号</p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">2. 选择课程</p>
                  <p>在课程列表中选择需要下载的课程</p>
                </div>

                <div>
                  <p className="font-medium mb-2">3. 选择下载选项</p>
                  <p>- 选择需要下载的格式（音频/文档）</p>
                  <p>- 可选择批量下载多个课程</p>
                  <p>- PDF格式需提前安装 wkhtmltopdf，并设置环境变量</p>
                </div>

                <div>
                  <p className="font-medium mb-2">4. 开始下载</p>
                  <p>点击下载按钮，文件将保存到选择的目录中</p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">5. 注意事项</p>
                  <p>如果下载内容不完整，请重新登录账号，或检查是否已购买课程</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 