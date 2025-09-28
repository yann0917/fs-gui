package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

var Conf Config
var Viper *viper.Viper

type Config struct {
	AesKey      string
	AppID       string
	Token       string
	Wkhtmltopdf string
	Ffmpeg      string
}

func init() {
	var err error
	Viper, err = InitConfig()
	if err != nil {
		log.Printf("Failed to initialize config: %v", err)
		// 创建一个新的 viper 实例作为后备
		Viper = viper.New()
		Viper.SetConfigType("yaml")
		Viper.SetConfigName("config")
		Viper.AddConfigPath(GetExecutablePath())
	}
}

// 获取可执行文件所在目录
func GetExecutablePath() string {
	ex, err := os.Executable()
	if err != nil {
		log.Printf("Failed to get executable path: %v", err)
		return "."
	}
	return filepath.Dir(ex)
}

func UpdateToken(token string) error {
	if Viper == nil {
		return fmt.Errorf("viper instance is not initialized")
	}
	Conf.Token = token
	Viper.Set("token", token)
	// 使用完整路径保存配置
	configPath := filepath.Join(GetExecutablePath(), "config.yaml")
	return Viper.WriteConfigAs(configPath)
}

func InitConfig() (*viper.Viper, error) {
	v := viper.New()
	execPath := GetExecutablePath()
	v.AddConfigPath(execPath)
	v.SetConfigType("yaml")
	v.SetConfigName("config.yaml")

	if err := v.ReadInConfig(); err != nil {
		// 如果配置文件不存在，创建一个新的
		configPath := filepath.Join(execPath, "config.yaml")
		if err := v.SafeWriteConfigAs(configPath); err != nil {
			return nil, fmt.Errorf("failed to create config file: %w", err)
		}
		log.Printf("Created new config file at: %s", configPath)
	}

	v.WatchConfig()

	v.OnConfigChange(func(e fsnotify.Event) {
		fmt.Println("config file changed:", e.Name)
		if err := v.Unmarshal(&Conf); err != nil {
			fmt.Println(err)
		}
	})
	if err := v.Unmarshal(&Conf); err != nil {
		fmt.Println(err)
	}
	return v, nil
}
