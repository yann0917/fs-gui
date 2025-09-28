# 樊登读书下载器 - React 版本

这是使用现代 React 技术栈开发的樊登读书内容下载工具前端界面。

## ✨ 技术栈

- **React 18** - 现代化用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具和开发服务器
- **React Router** - 客户端路由管理
- **Zustand** - 轻量级状态管理
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Shadcn/ui** - 基于 Radix UI 的组件库
- **Radix UI** - 无障碍的 headless UI 组件
- **Axios** - 强大的 HTTP 客户端
- **Lucide React** - 美观的图标库

## 🚀 快速开始

### 安装依赖

```bash
cd frontend
yarn install
```

### 开发环境

```bash
# 启动开发服务器 (端口 3000)
yarn dev

# 启动开发服务器并指定端口
yarn dev --port 3001
```

### 构建生产版本

```bash
# 构建优化后的生产版本
yarn build

# 预览构建结果
yarn preview
```

### 代码检查

```bash
# 运行 ESLint 检查
yarn lint
```

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # Shadcn/ui 基础组件
│   │   ├── button.tsx  # 按钮组件
│   │   ├── dialog.tsx  # 对话框组件
│   │   ├── input.tsx   # 输入框组件
│   │   └── ...         # 其他 UI 组件
│   ├── DataTable.tsx   # 数据表格组件
│   ├── SearchInput.tsx # 搜索输入组件
│   ├── ThemeToggle.tsx # 主题切换组件
│   └── UserNav.tsx     # 用户导航组件
├── contexts/           # React Context
│   └── NotificationContext.tsx # 通知上下文
├── hooks/              # 自定义 React Hooks
│   └── use-toast.ts    # Toast 通知 Hook
├── lib/                # 工具函数库
│   └── utils.ts        # 通用工具函数
├── router/             # 路由配置
├── services/           # API 服务层
│   └── api.ts          # API 请求封装
├── stores/             # Zustand 状态管理
│   ├── auth.ts         # 认证状态
│   └── search.ts       # 搜索状态
├── types/              # TypeScript 类型定义
│   └── index.ts        # 公共类型定义
├── views/              # 页面组件
│   ├── About.tsx       # 关于页面
│   ├── BookDetail.tsx  # 书籍详情页面
│   ├── BookList.tsx    # 书籍列表页面
│   └── CourseDetail.tsx# 课程详情页面
├── App.tsx             # 根应用组件
├── main.tsx            # 应用入口文件
├── index.css           # 全局样式
└── vite-env.d.ts       # Vite 类型声明
```

## 🎨 UI 组件库

本项目使用 **Shadcn/ui** + **Radix UI** 构建现代化界面：

### 主要组件
- **Button** - 各种样式和尺寸的按钮
- **Dialog** - 模态对话框
- **Input** - 表单输入组件
- **Select** - 下拉选择器
- **Table** - 数据表格
- **Toast** - 消息通知
- **Switch** - 开关切换
- **Card** - 卡片容器

### 设计原则
- 🎯 **可访问性优先** - 基于 Radix UI 的无障碍组件
- 🎨 **设计系统** - 统一的视觉语言和交互模式
- 📱 **响应式设计** - 移动端优先的设计策略
- 🌙 **暗黑模式** - 内置明暗主题切换

## 🔧 状态管理

使用 **Zustand** 进行全局状态管理：

### 认证状态 (`stores/auth.ts`)
```typescript
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}
```

### 搜索状态 (`stores/search.ts`)
```typescript
interface SearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  setQuery: (query: string) => void
  search: () => Promise<void>
}
```

## 🚦 路由配置

使用 **React Router v6** 进行路由管理：

```typescript
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <BookList /> },
      { path: "/books/:id", element: <BookDetail /> },
      { path: "/courses/:id", element: <CourseDetail /> },
      { path: "/about", element: <About /> }
    ]
  }
])
```

## 🔌 API 集成

### 代理配置
开发环境下通过 Vite 代理连接后端：

```typescript
// vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### API 服务
所有 API 请求通过 `services/api.ts` 统一管理：

```typescript
// 认证相关
export const authAPI = {
  login: (data: LoginData) => api.post('/api/login', data),
  logout: () => api.post('/api/logout'),
  getUser: () => api.get('/api/user')
}

// 内容相关
export const contentAPI = {
  getBooks: (params?: SearchParams) => api.get('/api/books', { params }),
  getBookDetail: (id: string) => api.get(`/api/books/${id}`),
  downloadBook: (id: string, format: string) => api.get(`/api/books/${id}/download`)
}
```

## ⚡ 性能优化

### 代码分割
使用 React.lazy 进行组件懒加载：

```typescript
const BookDetail = lazy(() => import('@/views/BookDetail'))
const CourseDetail = lazy(() => import('@/views/CourseDetail'))
```

### 内存优化
合理使用 React 性能优化 Hooks：

- **useMemo** - 缓存计算结果
- **useCallback** - 缓存函数引用
- **React.memo** - 组件记忆化

### 打包优化
Vite 自动进行：
- Tree shaking
- 代码压缩
- 资源优化
- 模块预加载

## 🎯 开发指南

### 添加新页面
1. 在 `src/views/` 创建页面组件
2. 在 `router/` 配置路由
3. 更新导航菜单

### 添加新组件
1. 如果是通用 UI 组件，添加到 `components/ui/`
2. 如果是业务组件，添加到 `components/`
3. 编写对应的 TypeScript 类型

### 添加新状态
1. 在 `stores/` 创建新的 Zustand store
2. 定义状态接口和操作方法
3. 在组件中使用 store

### 添加新 API
1. 在 `services/api.ts` 添加 API 方法
2. 在 `types/index.ts` 定义相关类型
3. 在组件中调用 API

## 🔍 开发工具

### VS Code 插件推荐
- **ES7+ React/Redux/React-Native snippets** - React 代码片段
- **Tailwind CSS IntelliSense** - Tailwind 智能提示
- **TypeScript Importer** - 自动导入
- **Auto Rename Tag** - 标签同步重命名

### 代码格式化
项目配置了 ESLint 和 Prettier：

```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  }
}
```

## 🚀 部署

### 构建
```bash
yarn build
```

### 静态部署
构建产物位于 `dist/` 目录，可部署到任何静态文件服务器：
- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages

### Docker 部署
项目根目录的 Dockerfile 包含完整的构建和部署配置。

## 🤝 贡献指南

1. 遵循现有的代码风格和架构模式
2. 确保 TypeScript 类型安全
3. 添加必要的注释和文档
4. 测试新功能和修复

---

**技术支持**: 如有问题请查看项目根目录的 README.md 或提交 Issue。 