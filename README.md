# FS-GUI - 樊登读书 Web 版下载工具

<div align="center">

![GitHub release](https://img.shields.io/github/release/yann0917/fs-gui.svg)
![GitHub license](https://img.shields.io/github/license/yann0917/fs-gui.svg)
![Go version](https://img.shields.io/github/go-mod/go-version/yann0917/fs-gui.svg)

一个现代化的樊登读书内容下载工具，提供直观的 Web 界面和强大的下载功能。

[特性](#特性) • [安装](#安装) • [使用方法](#使用方法) • [开发](#开发) • [许可证](#许可证)

</div>

## ⚠️ 特别声明

**仅供个人学习使用，请尊重版权，内容版权均为帆书APP(樊登读书)所有，请勿传播内容！**

本工具仅用于学习交流目的，不得用于商业用途。请在下载后24小时内删除，支持正版！

## ✨ 特性

### 🎯 内容支持
- ✅ **樊登讲书** - 音频、文稿、思维导图下载
- ✅ **非凡精读馆** - 完整内容下载支持  
- ✅ **李蕾讲经典** - 经典解读内容下载
- ✅ **课程系列** - 体系化课程内容下载

### 🖥️ 用户界面
- ✅ **现代化 Web 界面** - 基于 React 18 + Tailwind CSS
- ✅ **响应式设计** - 完美支持桌面和移动端
- ✅ **暗黑模式** - 护眼的深色主题
- ✅ **实时搜索** - 快速找到想要的内容
- ✅ **分类浏览** - 按主题分类浏览内容
- ✅ **组件化设计** - 基于 Shadcn/ui + Radix UI

### 📥 下载功能
- ✅ **多格式支持** - MP3音频、视频、PDF
- ✅ **思维导图** - JPEG格式思维导图下载
- ✅ **批量下载** - 支持多个内容同时下载
- ✅ **断点续传** - 网络中断后可继续下载
- ✅ **自动分类** - 下载内容自动分类整理

### 🔐 账户功能
- ✅ **手机号登录** - 短信验证码登录
- ✅ **密码登录** - 传统账号密码登录
- ✅ **登录状态保持** - 自动保存登录状态
- ✅ **用户信息** - 显示账户详情和权限

## 📦 安装

### 方式一：下载预编译版本（推荐）

前往 [Releases](https://github.com/yann0917/fs-gui/releases) 页面下载对应系统的预编译版本：

- **Windows**: `fs-gui-windows-amd64.exe`
- **macOS**: `fs-gui-darwin-amd64` / `fs-gui-darwin-arm64`
- **Linux**: `fs-gui-linux-amd64`

下载后直接运行即可，程序会自动在浏览器中打开 Web 界面。

### 方式二：使用 Go 安装

确保已安装 Go 1.21 或更高版本：

```bash
go install github.com/yann0917/fs-gui@latest
```

### 方式三：从源码构建

```bash
git clone https://github.com/yann0917/fs-gui.git
cd fs-gui
make build
```

## 🔧 依赖安装

根据需要下载的内容格式，安装对应依赖：

### PDF 下载依赖
```bash
# 安装 wkhtmltopdf (用于生成PDF)
# macOS
brew install wkhtmltopdf

# Ubuntu/Debian
sudo apt-get install wkhtmltopdf

# Windows
# 1. 下载安装包：https://wkhtmltopdf.org/downloads.html
# 2. 安装到默认目录（通常是 C:\Program Files\wkhtmltopdf\bin）
# 3. 添加环境变量：
#    - 打开"系统属性" -> "高级" -> "环境变量"
#    - 在"系统变量"中找到"Path"，点击"编辑"
#    - 添加路径：C:\Program Files\wkhtmltopdf\bin
#    - 重启命令行窗口验证：wkhtmltopdf --version
```

### 视频下载依赖
```bash
# 安装 ffmpeg (用于处理音视频)
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# 1. 下载安装包：https://ffmpeg.org/download.html
# 2. 解压到指定目录（例如：C:\ffmpeg）
# 3. 添加环境变量：
#    - 打开"系统属性" -> "高级" -> "环境变量"
#    - 在"系统变量"中找到"Path"，点击"编辑"
#    - 添加路径：C:\ffmpeg\bin
#    - 重启命令行窗口验证：ffmpeg -version
```

## 🚀 使用方法

### 1. 启动应用

```bash
./fs-gui
```

程序启动后会自动打开浏览器访问 `http://localhost:8080`

### 2. 配置登录信息

#### 方式一：Web 界面登录（推荐）
- 在 Web 界面点击登录按钮
- 输入手机号和验证码/密码进行登录

#### 方式二：配置文件登录
1. 复制配置模板：
   ```bash
   cp config.simple.yaml config.yaml
   ```

2. 编辑 `config.yaml` 文件，填入必要信息：
   ```yaml
   token: "your_token_here"
   aesKey: "your_aes_key_here"
   ```

### 3. 开始使用

- 🔍 **浏览内容**: 在首页浏览不同分类的内容
- 📱 **搜索**: 使用搜索功能快速找到想要的内容  
- 📖 **查看详情**: 点击内容卡片查看详细信息
- ⬇️ **下载**: 选择下载格式并开始下载
- 📁 **查看文件**: 下载完成的文件保存在 `output` 目录

## 🛠️ 开发

### 技术栈

**后端**:
- Go 1.21+
- Gin Web Framework (v1.10.0)
- Viper (配置管理)
- Resty (HTTP客户端)

**前端**:
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS + Shadcn/ui
- Radix UI (组件基础)
- Zustand (状态管理)
- React Router (路由管理)

### 开发环境搭建

1. **克隆项目**
   ```bash
   git clone https://github.com/yann0917/fs-gui.git
   cd fs-gui
   ```

2. **安装前端依赖**
   ```bash
   cd frontend
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   # 后端开发服务器 (端口 8080)
   go run main.go router.go

   # 前端开发服务器 (新终端，端口 3000)
   cd frontend
   yarn dev
   ```

4. **构建生产版本**
   ```bash
   make build
   ```

### 项目结构

```
fs-gui/
├── frontend/           # React 18 前端应用
│   ├── src/
│   │   ├── components/ # UI组件 (Shadcn/ui)
│   │   ├── views/      # 页面组件
│   │   ├── stores/     # Zustand状态管理
│   │   ├── hooks/      # React Hooks
│   │   ├── services/   # API服务
│   │   └── types/      # TypeScript类型
│   └── dist/          # 构建产物
├── services/          # 后端业务逻辑
├── config/           # 配置文件处理
├── utils/            # 工具函数
├── middleware/       # 中间件
├── output/           # 下载文件存储
├── main.go          # 主程序入口
├── router.go        # 路由定义
└── config.yaml      # 配置文件
```

## 📖 API 文档

### 认证相关
- `POST /api/login/phone` - 手机号登录
- `POST /api/login/password` - 密码登录
- `POST /api/login/sms-code` - 发送验证码
- `POST /api/logout` - 退出登录
- `GET /api/user` - 获取用户信息

### 内容相关
- `GET /api/categories` - 获取分类列表
- `GET /api/books` - 获取书籍列表
- `GET /api/books/:id` - 获取书籍详情
- `GET /api/books/:id/module` - 获取书籍模块内容
- `GET /api/courses` - 获取课程列表
- `GET /api/courses/:id` - 获取课程详情

### 下载相关
- `GET /api/books/download` - 下载书籍内容
- `GET /api/courses/download` - 下载课程内容

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 此项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证。

## 🙏 致谢

- 感谢 [樊登读书](https://www.dushu365.com/) 提供优质内容

---
