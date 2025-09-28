import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Download, BookOpen, Video, Music, FileText } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* 头部横幅 */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-400 dark:from-blue-400 dark:to-purple-400">
              樊登读书下载工具
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6">
              使用教程与功能说明
            </p>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
              一个简单易用的樊登读书内容下载工具，支持音频、视频、文档等多种格式
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* 特别声明 */}
        <div className="mb-16">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ 重要声明</h3>
                <p className="text-amber-700 dark:text-amber-300 mb-2">
                  <strong>仅供个人学习使用，请尊重版权，内容版权均为帆书APP(樊登读书)所有，请勿传播内容！</strong>
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  本工具仅用于学习交流目的，不得用于商业用途。请支持正版！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 使用教程 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">📖 使用教程</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* 第零步：安装依赖 */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                      ⚠️
                    </div>
                    <div>
                      <CardTitle className="text-xl text-red-800 dark:text-red-200">重要：安装必需依赖</CardTitle>
                      <p className="text-red-700 dark:text-red-300 mt-2 font-medium">
                        为了能够下载音频和视频文件，您的电脑必须先安装ffmpeg程序：
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* ffmpeg */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Music className="w-6 h-6 text-primary" />
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">ffmpeg（用于处理音频/视频文件）</h4>
                      </div>
                      
                      {/* Windows */}
                      <div className="mb-4">
                        <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">🪟 Windows 用户：</h5>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm">
                          <p className="mb-2">1. 访问官网：<a href="https://ffmpeg.org/download.html" target="_blank" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">https://ffmpeg.org/download.html</a></p>
                          <p className="mb-2">2. 下载 Windows 版本（建议选择 "Windows builds by BtbN"）</p>
                          <p className="mb-2">3. 解压到文件夹（如：C:\ffmpeg）</p>
                          <p className="mb-2">4. 将 bin 文件夹路径添加到系统环境变量 PATH 中</p>
                          <p className="text-amber-600 dark:text-amber-400">详细设置教程可搜索"Windows ffmpeg 环境变量设置"</p>
                        </div>
                      </div>
                      
                      {/* macOS */}
                      <div className="mb-4">
                        <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">🍎 macOS 用户：</h5>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm">
                          <p className="mb-2">在终端中运行：<code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">brew install ffmpeg</code></p>
                          <p className="text-gray-600 dark:text-gray-400">如果没有 Homebrew，请先安装：<a href="https://brew.sh" target="_blank" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">https://brew.sh</a></p>
                        </div>
                      </div>
                      
                      {/* Linux */}
                      <div>
                        <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">🐧 Linux 用户：</h5>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm">
                          <p className="mb-1">Ubuntu/Debian：<code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">sudo apt-get install ffmpeg</code></p>
                          <p>CentOS/RHEL：<code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">sudo yum install ffmpeg</code></p>
                        </div>
                      </div>
                    </div>

                    {/* 验证安装 */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">验证安装是否成功</h4>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        <p className="mb-2">安装完成后，可以在命令行/终端中运行以下命令验证：</p>
                        <div className="bg-green-100 dark:bg-green-800 rounded p-2 font-mono text-xs">
                          <p>ffmpeg -version</p>
                        </div>
                        <p className="mt-2 text-xs">如果显示版本信息，说明安装成功！</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 第一步：登录 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">登录樊登读书账号</h3>
                      <p className="text-muted-foreground mb-4">
                        安装好依赖后，点击右上角的"登录"按钮，支持以下登录方式：
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-background rounded border">
                          <span className="text-green-600 dark:text-green-400">📱</span>
                          <div>
                            <div className="font-medium">手机号登录</div>
                            <div className="text-sm text-muted-foreground">输入手机号和验证码</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-background rounded border">
                          <span className="text-blue-600 dark:text-blue-400">🔑</span>
                          <div>
                            <div className="font-medium">密码登录</div>
                            <div className="text-sm text-muted-foreground">使用账号密码登录</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 第二步：浏览内容 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">浏览和搜索内容</h3>
                      <p className="text-muted-foreground mb-4">
                        登录成功后，您可以浏览樊登读书的所有内容：
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span><strong>樊登讲书：</strong>经典书籍精华解读</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span><strong>非凡精读馆：</strong>深度阅读分享</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span><strong>李蕾讲经典：</strong>文学经典解析</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Music className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          <span><strong>课程系列：</strong>专题学习课程</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 第三步：下载内容 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">选择和下载内容</h3>
                      <p className="text-muted-foreground mb-4">
                        点击您感兴趣的内容，进入详情页面，选择需要下载的格式：
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>MP3 音频文件 <span className="text-xs text-gray-500">(需要 ffmpeg)</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>MP4 视频文件 <span className="text-xs text-gray-500">(需要 ffmpeg)</span></span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>PDF 文档格式</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>Markdown 文档</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 功能特点 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">✨ 功能特点</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Download className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">多格式支持</h3>
                  <p className="text-sm text-muted-foreground">
                    支持音频、视频、PDF、Markdown 等多种格式下载
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">简单易用</h3>
                  <p className="text-sm text-muted-foreground">
                    直观的界面设计，一键登录，轻松下载
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">安全可靠</h3>
                  <p className="text-sm text-muted-foreground">
                    仅用于个人学习，不存储任何个人信息
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">⚠️ 注意事项</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium">版权声明</p>
                  <p className="text-sm text-muted-foreground">所有内容版权归樊登读书所有，仅供个人学习使用，请勿传播或商用</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium">技术要求</p>
                  <p className="text-sm text-muted-foreground">下载音频和视频文件需要先安装 ffmpeg，请按照上述教程正确安装</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium">使用限制</p>
                  <p className="text-sm text-muted-foreground">请确保您有合法的樊登读书账号，并且已购买相应的内容</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">v2.0.0</Badge>
            <span>•</span>
            <span>仅供学习交流使用</span>
            <span>•</span>
            <span>请支持正版</span>
          </div>
        </div>
      </div>
    </div>
  )
} 