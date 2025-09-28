import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { NotificationProvider } from '@/contexts/NotificationContext'
import BookList from '@/views/BookList'
import BookDetail from '@/views/BookDetail'
import CourseDetail from '@/views/CourseDetail'
import About from '@/views/About'
import UserNav from '@/components/UserNav'
import GlobalPlayer from '@/components/GlobalPlayer'


function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-background transition-colors duration-300">
          {/* 导航栏 */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a href="/" className="mr-6 flex items-center space-x-2">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-400 dark:from-blue-400 dark:to-purple-400 animate-gradient text-lg">
                    樊登读书
                  </span>
                </a>
              </div>

              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                {/* 用户菜单 */}
                <UserNav />
              </div>
            </div>
          </header>

          {/* 页面内容 */}
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/books" replace />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/about" element={<About />} />

              <Route path="*" element={<Navigate to="/books" replace />} />
            </Routes>
          </main>

          {/* Toast通知 */}
          <Toaster />
          
          {/* 全局播放器 */}
          <GlobalPlayer />
        </div>
      </Router>
    </NotificationProvider>
  )
}

export default App 