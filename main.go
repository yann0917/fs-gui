/*
Copyright © 2024 Yann <386139859@qq.com>
*/
//go:generate goversioninfo -icon=assets/icon.ico -manifest=assets/app.manifest
package main

import (
	"embed"
	"log"
	"os/exec"
	"runtime"

	"github.com/yann0917/fs-gui/services"
)

//go:embed frontend/dist
var frontend embed.FS
var Instance *services.Service

var OutputDir = "output"

func init() {
	Instance = services.NewService()
}

func main() {
	r := InitRouter()

	// 自动打开浏览器
	go openBrowser("http://localhost:8080")

	// 启动服务器
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

func openBrowser(url string) {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default:
		cmd = "xdg-open"
	}
	args = append(args, url)
	exec.Command(cmd, args...).Start()
}
