package main

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// DownloadNotification 下载通知结构
type DownloadNotification struct {
	ID        string `json:"id"`
	Type      string `json:"type"`   // "book" | "course"
	Status    string `json:"status"` // "started" | "progress" | "completed" | "failed"
	Title     string `json:"title"`
	Message   string `json:"message"`
	Progress  int    `json:"progress,omitempty"`
	Error     string `json:"error,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// NotificationManager 通知管理器
type NotificationManager struct {
	clients map[string]chan DownloadNotification
	mutex   sync.RWMutex
}

// 全局通知管理器实例
var notificationManager = &NotificationManager{
	clients: make(map[string]chan DownloadNotification),
}

// AddClient 添加客户端连接
func (nm *NotificationManager) AddClient(clientID string) chan DownloadNotification {
	nm.mutex.Lock()
	defer nm.mutex.Unlock()

	client := make(chan DownloadNotification, 10)
	nm.clients[clientID] = client

	log.Printf("客户端 %s 已连接，当前连接数: %d", clientID, len(nm.clients))
	return client
}

// RemoveClient 移除客户端连接
func (nm *NotificationManager) RemoveClient(clientID string) {
	nm.mutex.Lock()
	defer nm.mutex.Unlock()

	if client, exists := nm.clients[clientID]; exists {
		close(client)
		delete(nm.clients, clientID)
		log.Printf("客户端 %s 已断开，当前连接数: %d", clientID, len(nm.clients))
	}
}

// SendNotification 发送通知给所有客户端
func (nm *NotificationManager) SendNotification(notification DownloadNotification) {
	nm.mutex.RLock()
	defer nm.mutex.RUnlock()

	notification.Timestamp = time.Now().Unix()

	for clientID, client := range nm.clients {
		select {
		case client <- notification:
			// 成功发送
		default:
			// 客户端通道已满，跳过
			log.Printf("客户端 %s 通道已满，跳过通知", clientID)
		}
	}

	log.Printf("通知已发送给 %d 个客户端: %s - %s", len(nm.clients), notification.Title, notification.Status)
}

// SendDownloadStarted 发送下载开始通知
func SendDownloadStarted(id, downloadType, title string) {
	notification := DownloadNotification{
		ID:      id,
		Type:    downloadType,
		Status:  "started",
		Title:   title,
		Message: "开始下载...",
	}
	notificationManager.SendNotification(notification)
}

// SendDownloadCompleted 发送下载完成通知
func SendDownloadCompleted(id, downloadType, title string) {
	notification := DownloadNotification{
		ID:      id,
		Type:    downloadType,
		Status:  "completed",
		Title:   title,
		Message: "下载完成！",
	}
	notificationManager.SendNotification(notification)
}

// SendDownloadFailed 发送下载失败通知
func SendDownloadFailed(id, downloadType, title, errorMsg string) {
	notification := DownloadNotification{
		ID:      id,
		Type:    downloadType,
		Status:  "failed",
		Title:   title,
		Message: "下载失败",
		Error:   errorMsg,
	}
	notificationManager.SendNotification(notification)
}

// SendDownloadProgress 发送下载进度通知
func SendDownloadProgress(id, downloadType, title string, current, total int) {
	progress := int((float64(current) / float64(total)) * 100)
	notification := DownloadNotification{
		ID:       id,
		Type:     downloadType,
		Status:   "progress",
		Title:    title,
		Message:  fmt.Sprintf("已下载 %d/%d 节", current, total),
		Progress: progress,
	}
	notificationManager.SendNotification(notification)
}

// SendCourseItemCompleted 发送课程单节下载完成通知
func SendCourseItemCompleted(courseID, downloadType, courseTitle, itemTitle string, current, total int) {
	notification := DownloadNotification{
		ID:       courseID,
		Type:     downloadType,
		Status:   "progress",
		Title:    courseTitle,
		Message:  fmt.Sprintf("「%s」下载完成 (%d/%d)", itemTitle, current, total),
		Progress: int((float64(current) / float64(total)) * 100),
	}
	notificationManager.SendNotification(notification)
}

// handleSSENotifications 处理 SSE 连接
func handleSSENotifications(c *gin.Context) {
	// 设置 SSE 响应头
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Headers", "Cache-Control")

	// 生成客户端ID
	clientID := fmt.Sprintf("client_%d", time.Now().UnixNano())

	// 添加客户端
	clientChan := notificationManager.AddClient(clientID)
	defer notificationManager.RemoveClient(clientID)

	// 发送连接成功消息
	c.SSEvent("connected", map[string]interface{}{
		"message":   "连接成功",
		"clientId":  clientID,
		"timestamp": time.Now().Unix(),
	})
	c.Writer.Flush()

	// 监听通知并发送给客户端
	for {
		select {
		case notification, ok := <-clientChan:
			if !ok {
				return
			}

			// 将通知转换为 JSON
			data, err := json.Marshal(notification)
			if err != nil {
				log.Printf("序列化通知失败: %v", err)
				continue
			}

			// 发送 SSE 事件
			c.SSEvent("notification", string(data))
			c.Writer.Flush()

		case <-c.Request.Context().Done():
			// 客户端断开连接
			return
		}
	}
}
