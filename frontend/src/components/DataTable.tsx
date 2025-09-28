import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import DownloadFormatDialog from './DownloadFormatDialog'

interface Column {
  key: string
  title: string
  render?: (row: any) => string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  businessType?: number
  onDownload?: (payload: { id: string, type: string, format: number }) => void
  onRowClick?: (item: any) => void
}

export default function DataTable({ columns, data, businessType, onDownload, onRowClick }: DataTableProps) {
  const navigate = useNavigate()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const handleDownloadClick = (id: string) => {
    setSelectedId(id)
    setShowDownloadDialog(true)
  }

  const handleDownloadConfirm = (format: number) => {
    if (onDownload) {
      onDownload({ id: selectedId, type: 'book', format })
    }
    setShowDownloadDialog(false)
  }

  const handleRowClick = (item: any) => {
    if (onRowClick) {
      onRowClick(item)
    } else {
      // 默认行为：跳转到书籍详情页
      const url = businessType 
        ? `/books/${item.bookId}?businessType=${businessType}`
        : `/books/${item.bookId}`
      navigate(url)
    }
  }

  return (
    <div className="w-full">
      <DownloadFormatDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        onConfirm={handleDownloadConfirm}
        onCancel={() => setShowDownloadDialog(false)}
      />
      
      {/* 图片预览弹窗 */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            className="max-w-[90vw] max-h-[90vh] object-contain"
            alt="预览图片" 
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={`
                    ${column.key === 'bookId' ? 'w-16' : ''}
                    ${column.key === 'coverImg' ? 'w-24' : ''}
                    ${column.key === 'title' ? 'w-64' : ''}
                    ${column.key === 'publishTime' ? 'w-24' : ''}
                  `}
                >
                  {column.title}
                </TableHead>
              ))}
              <TableHead className="text-right w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.bookId}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.key === 'coverImg' ? (
                      <div 
                        className="h-16 w-16 overflow-hidden rounded-md cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewImage(item[column.key])
                        }}
                      >
                        <img 
                          src={item[column.key]} 
                          className="h-full w-full object-cover hover:scale-110 transition-transform"
                          alt={item.title} 
                        />
                      </div>
                    ) : (
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: column.render ? column.render(item) : item[column.key]
                        }}
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadClick(item.bookId)
                      }}
                    >
                      下载
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 