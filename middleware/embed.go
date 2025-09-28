package middleware

import (
	"embed"
	"io/fs"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
)

const INDEX = "index.html"

type ServeFileSystem interface {
	http.FileSystem
	Exists(prefix string, path string) bool
}

type localFileSystem struct {
	http.FileSystem
	root    string
	indexes bool
}

func LocalFile(root string, indexes bool) *localFileSystem {
	return &localFileSystem{
		FileSystem: gin.Dir(root, indexes),
		root:       root,
		indexes:    indexes,
	}
}

func (l *localFileSystem) Exists(prefix string, filepath string) bool {
	if p := strings.TrimPrefix(filepath, prefix); len(p) < len(filepath) {
		name := path.Join(l.root, p)
		stats, err := os.Stat(name)
		if err != nil {
			return false
		}
		if stats.IsDir() {
			if !l.indexes {
				index := path.Join(name, INDEX)
				_, err := os.Stat(index)
				if err != nil {
					return false
				}
			}
		}
		return true
	}
	return false
}

func ServeRoot(urlPrefix, root string) gin.HandlerFunc {
	return Serve(urlPrefix, LocalFile(root, false))
}

// Static returns a middleware handler that serves static files in the given directory.
func Serve(urlPrefix string, fs ServeFileSystem) gin.HandlerFunc {
	fileserver := http.FileServer(fs)
	if urlPrefix != "" {
		fileserver = http.StripPrefix(urlPrefix, fileserver)
	}
	return func(c *gin.Context) {
		// 检查是否是API请求，API请求不应该fallback到index.html
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			return
		}

		// 获取原始请求路径
		originalPath := c.Request.URL.Path

		// 尝试提供请求的文件
		if fs.Exists(urlPrefix, originalPath) {
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
			return
		}

		// 如果文件不存在，且不是API请求，则提供index.html
		// 这样处理SPA的路由刷新问题
		indexPath := path.Join(urlPrefix, INDEX)
		if fs.Exists(urlPrefix, indexPath) {
			// 修改路径到index.html
			c.Request.URL.Path = indexPath

			// 避免设置301重定向，直接提供index.html内容
			c.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")

			// 使用普通状态码200，避免浏览器缓存重定向结果
			c.Writer.WriteHeader(http.StatusOK)

			// 提供index.html内容
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		}
	}
}

type embedFileSystem struct {
	http.FileSystem
}

func (e embedFileSystem) Exists(prefix string, path string) bool {
	_, err := e.Open(path)
	return err == nil
}

func EmbedFolder(fsEmbed embed.FS, targetPath string) ServeFileSystem {
	fsys, err := fs.Sub(fsEmbed, targetPath)
	if err != nil {
		panic(err)
	}
	return embedFileSystem{
		FileSystem: http.FS(fsys),
	}
}
