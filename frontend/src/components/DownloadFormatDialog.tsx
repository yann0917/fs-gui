import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DownloadFormatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (format: number) => void
  onCancel: () => void
}

export default function DownloadFormatDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  onCancel 
}: DownloadFormatDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState(1) // 默认选择音频格式

  // 每次打开对话框时重置为默认选择
  useEffect(() => {
    if (open) {
      setSelectedFormat(1)
    }
  }, [open])

  const handleCancel = () => {
    onOpenChange(false)
    onCancel()
  }

  const handleConfirm = () => {
    if (selectedFormat) {
      onConfirm(selectedFormat)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>选择下载格式</DialogTitle>
          <DialogDescription>
            请选择您需要下载的内容格式
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <label 
              className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                selectedFormat === 1 ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <input 
                type="radio" 
                checked={selectedFormat === 1}
                onChange={() => setSelectedFormat(1)}
                className="sr-only" 
              />
              <div className={`flex items-center justify-center w-5 h-5 border-2 rounded-full transition-colors ${
                selectedFormat === 1 ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {selectedFormat === 1 && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <div>
                  <div className="font-medium">音频格式</div>
                  <div className="text-sm text-muted-foreground">MP3 音频文件，适合听书学习</div>
                </div>
              </div>
            </label>

            <label 
              className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                selectedFormat === 2 ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <input 
                type="radio" 
                checked={selectedFormat === 2}
                onChange={() => setSelectedFormat(2)}
                className="sr-only" 
              />
              <div className={`flex items-center justify-center w-5 h-5 border-2 rounded-full transition-colors ${
                selectedFormat === 2 ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {selectedFormat === 2 && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎬</span>
                <div>
                  <div className="font-medium">视频格式</div>
                  <div className="text-sm text-muted-foreground">视频文件，完整观看体验</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedFormat}>
            确认下载
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 