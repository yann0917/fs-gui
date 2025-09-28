#!/bin/sh

# 创建Releases目录（如果不存在）
mkdir -p "Releases"

# 编译前端
echo "Building frontend..."
cd frontend
yarn install
yarn build
cd ..

# 检测UPX是否存在
UPX_EXISTS=false
if command -v upx >/dev/null 2>&1; then
    UPX_EXISTS=true
    echo "UPX found, will compress binaries after build"
else
    echo "UPX not found, skipping compression"
fi

# 检测当前设备类型
CURRENT_OS=""
case "$(uname -s)" in
    Darwin*)
        CURRENT_OS="macos"
        ;;
    Linux*)
        CURRENT_OS="linux"
        ;;
    CYGWIN*|MINGW32*|MSYS*|MINGW*)
        CURRENT_OS="windows"
        ;;
    *)
        CURRENT_OS="unknown"
        ;;
esac

# UPX压缩函数
compress_binary() {
    local binary_path="$1"
    local binary_name="$2"
    
    if [ "$UPX_EXISTS" = true ]; then
        echo "Compressing $binary_name with UPX..."
        if [ "$CURRENT_OS" = "macos" ]; then
            upx --force-macos "$binary_path"
        else
            upx "$binary_path"
        fi
        
        if [ $? -eq 0 ]; then
            echo "Successfully compressed $binary_name"
        else
            echo "Warning: Failed to compress $binary_name"
        fi
    fi
}

# 【darwin/amd64】
echo "start build darwin/amd64 >>>"
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags '-w -s' -o ./Releases/fs-darwin-amd64 .
# compress_binary "./Releases/fs-darwin-amd64" "fs-darwin-amd64"

# 【windows/amd64】
echo "start build windows/amd64 >>>"
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags '-w -s' -o ./Releases/fs-windows-amd64.exe .
# compress_binary "./Releases/fs-windows-amd64.exe" "fs-windows-amd64.exe"

# 【linux/amd64】
echo "start build linux/amd64 >>>"
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags '-w -s' -o ./Releases/fs-linux-amd64 .
# compress_binary "./Releases/fs-linux-amd64" "fs-linux-amd64"

echo "All build success!!!"
