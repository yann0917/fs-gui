package utils

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"

	"github.com/yann0917/fs-gui/config"
)

// getFfmpegPath 获取可用的ffmpeg路径
func getFfmpegPath() string {
	// 首先尝试使用配置文件中的路径
	configFfmpeg := config.Conf.Ffmpeg
	if configFfmpeg != "" {
		if _, err := os.Stat(configFfmpeg); err == nil {
			return configFfmpeg
		}
		// fmt.Printf("配置的ffmpeg路径不存在: %s\n", configFfmpeg)
	}

	// 如果配置的路径无效，尝试从PATH中查找
	if path, err := exec.LookPath("ffmpeg"); err == nil {
		fmt.Printf("使用系统PATH中的ffmpeg: %s\n", path)
		return path
	}

	// 如果都找不到，返回默认值
	// fmt.Println("警告: 找不到ffmpeg，使用默认路径")
	return "ffmpeg"
}

func runMergeCmd(cmd *exec.Cmd, paths []string, mergeFilePath string) error {
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	// fmt.Printf("执行命令: %s %v\n", cmd.Path, cmd.Args)

	err := cmd.Run()
	if err != nil {
		return fmt.Errorf("ffmpeg执行失败: %s\n错误输出: %s", err, stderr.String())
	}

	if mergeFilePath != "" {
		if err = os.Remove(mergeFilePath); err != nil {
			return fmt.Errorf("%s\n%s", err, stderr.String())
		}
	}
	// remove parts
	for _, path := range paths {
		os.Remove(path) // nolint
	}
	return nil
}

// MergeAudio merge audio
func MergeAudio(paths []string, mergedFilePath string) error {
	ffmpegPath := getFfmpegPath()
	cmds := []string{
		"-y",
	}
	for _, path := range paths {
		cmds = append(cmds, "-i", path)
	}
	cmds = append(cmds, "-c:v", "copy", mergedFilePath)
	return runMergeCmd(exec.Command(ffmpegPath, cmds...), paths, "")
}

// MergeAudioAndVideo merge audio and video
func MergeAudioAndVideo(paths []string, mergedFilePath string) error {
	ffmpegPath := getFfmpegPath()
	cmds := []string{
		"-y",
	}
	for _, path := range paths {
		cmds = append(cmds, "-i", path)
	}
	cmds = append(cmds, "-c:v", "copy", "-c:a", "copy", mergedFilePath)
	return runMergeCmd(exec.Command(ffmpegPath, cmds...), paths, "")
}

// MergeToMP4 merges video parts to an MP4 file.
func MergeToMP4(paths []string, mergedFilePath string, filename string) error {
	ffmpegPath := getFfmpegPath()
	mergeFilePath := filename + ".txt" // merge list file should be in the current directory
	// write ffmpeg input file list
	mergeFile, _ := os.Create(mergeFilePath)
	for _, path := range paths {
		_, _ = mergeFile.Write([]byte(fmt.Sprintf("file '%s'\n", path))) // nolint
	}
	err := mergeFile.Close() // nolint
	if err != nil {
		return err
	}

	cmd := exec.Command(
		ffmpegPath, "-y", "-f", "concat", "-safe", "-1",
		"-i", mergeFilePath, "-c", "copy", "-bsf:a", "aac_adtstoasc", mergedFilePath,
	)
	return runMergeCmd(cmd, paths, mergeFilePath)
}
