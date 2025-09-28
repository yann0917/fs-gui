package utils

import (
	"bufio"
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
	"unsafe"
)

const TimeFormat = "2006-01-02 15:04:05"
const DateFormat = "2006-01-02"
const MAXLENGTH = 80

// FileName filter invalid string
func FileName(name, ext string) string {
	rep := strings.NewReplacer("\n", " ", "/", " ", "|", "-", ": ", "：", ":", "：", "'", "’", "\t", " ")
	name = rep.Replace(name)

	if runtime.GOOS == "windows" {
		rep = strings.NewReplacer("\"", " ", "?", " ", "*", " ", "\\", " ", "<", " ", ">", " ", ":", " ", "：", " ")
		name = rep.Replace(name)
	}

	name = strings.TrimSpace(name)

	limitedName := LimitLength(name, MAXLENGTH)
	if ext != "" {
		return fmt.Sprintf("%s.%s", limitedName, ext)
	}
	return limitedName
}

// LimitLength cut string
func LimitLength(s string, length int) string {
	ellipses := "..."

	str := []rune(s)
	if len(str) > length {
		s = string(str[:length-len(ellipses)]) + ellipses
	}

	return s
}

// CurrentDir CurrentDir
func CurrentDir(joinPath ...string) (string, error) {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		return "", err
	}
	p := strings.Replace(dir, "\\", "/", -1)
	whole := filepath.Join(joinPath...)
	whole = filepath.Join(p, whole)
	return whole, nil
}

func CheckFileExist(filename string) bool {
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		return false
	}
	return true
}

// Mkdir mkdir path
func Mkdir(elem ...string) (string, error) {
	path := filepath.Join(elem...)

	err := os.MkdirAll(path, os.ModePerm)

	return path, err
}

// FileSize return the file size of the specified path file
func FileSize(filePath string) (int, bool, error) {
	file, err := os.Stat(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return 0, false, nil
		}
		return 0, false, err
	}
	return int(file.Size()), true, nil
}

// FilePath gen valid file path
func FilePath(name, ext string, escape bool) (string, error) {
	var outputPath string

	fileName := name
	if escape {
		fileName = FileName(name, ext)
	} else {
		if ext != "" {
			fileName = fmt.Sprintf("%s.%s", name, ext)
		}
	}
	outputPath = filepath.Join(fileName)
	return outputPath, nil
}

// ResolveURL parse url
func ResolveURL(u *url.URL, p string) string {
	if strings.HasPrefix(p, "https://") || strings.HasPrefix(p, "http://") {
		return p
	}
	var baseURL string
	if strings.Index(p, "/") == 0 {
		baseURL = u.Scheme + "://" + u.Host
	} else {
		tU := u.String()
		baseURL = tU[0:strings.LastIndex(tU, "/")]
	}
	return baseURL + path.Join("/", p)
}

// Unix2String 时间戳[转换为]字符串 eg:(2019-09-09 09:09:09)
func Unix2String(stamp int64) string {
	str := time.Unix(stamp, 0).Format(TimeFormat)
	return str
}

// UnixMilli2String 时间戳[转换为]字符串 eg:(2019-09-09 09:09:09)
func UnixMilli2String(stamp int64) string {
	str := time.UnixMilli(stamp).Format(TimeFormat)
	return str
}

func UnixMilli2DateString(stamp int64) string {
	str := time.UnixMilli(stamp).Format(DateFormat)
	return str
}

func Int2String(val int) string {
	return strconv.Itoa(val)
}

func Int64String(val int64) string {
	return strconv.FormatInt(val, 10)
}

func String2Int(val string) int {
	result, _ := strconv.Atoi(val)
	return result
}
func Bool2String(val bool) string {
	return strconv.FormatBool(val)
}

func Float2String(val float64) string {
	return strconv.FormatFloat(val, 'f', 2, 64)
}

// FormatSeconds 格式化为 时:分:秒
func FormatSeconds(seconds int) string {
	hours := seconds / 3600
	minutes := (seconds % 3600) / 60
	seconds = seconds % 60

	if hours > 0 {
		// 如果超过一个小时，格式化为 时:分:秒
		return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
	}
	// 否则，格式化为 分:秒
	return fmt.Sprintf("%02d:%02d", minutes, seconds)
}

// Contains int in array
func Contains(s []int, n int) bool {
	for _, a := range s {
		if a == n {
			return true
		}
	}
	return false
}

func StringToBytes(s string) []byte {
	return *(*[]byte)(unsafe.Pointer(
		&struct {
			string
			Cap int
		}{s, len(s)},
	))
}

func BytesToString(b []byte) string {
	return *(*string)(unsafe.Pointer(&b))
}

func WriteFileWithTrunc(filename, content string) (err error) {

	var f *os.File
	if CheckFileExist(filename) {
		f, err = os.OpenFile(filename, os.O_RDWR|os.O_TRUNC|os.O_CREATE, 0666)

		if err != nil {
			return
		}
	} else {
		f, err = os.Create(filename)
		if err != nil {
			return
		}
	}
	defer f.Close()
	_, err = io.WriteString(f, content)
	if err != nil {
		return
	}

	err = f.Sync()
	return

}

func MD5str(s string) string {
	return fmt.Sprintf("%x", md5.Sum([]byte(s)))
}

func TimeCost(start time.Time) {
	tc := time.Since(start)
	fmt.Printf("time cost = %v\n", tc)
}

// ValidUTF8Reader implements a Reader which reads only bytes that constitute valid UTF-8
type ValidUTF8Reader struct {
	buffer *bufio.Reader
}

// Function Read reads bytes in the byte array b. n is the number of bytes read.
func (rd ValidUTF8Reader) Read(b []byte) (n int, err error) {
	for {
		var r rune
		var size int
		r, size, err = rd.buffer.ReadRune()
		if err != nil {
			return
		}
		if r == unicode.ReplacementChar && size == 1 {
			continue
		} else if n+size < len(b) {
			utf8.EncodeRune(b[n:], r)
			n += size
		} else {
			rd.buffer.UnreadRune()
			break
		}
	}
	return
}

// M3u8URLs get all ts urls from m3u8 url
func M3u8URLs(uri string) (urls []string, err error) {
	if len(uri) == 0 {
		return nil, errors.New("m3u8地址为空")
	}
	resp, err := http.Get(uri)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	bodyString := strings.TrimSpace(string(bodyBytes))
	lines := strings.Split(bodyString, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" && !strings.HasPrefix(line, "#") {
			if strings.HasPrefix(line, "http") {
				urls = append(urls, line)
			} else {
				base, err := url.Parse(uri)
				if err != nil {
					continue
				}
				u, err := url.Parse(line)
				if err != nil {
					continue
				}
				urls = append(urls, base.ResolveReference(u).String())
			}
		}
	}
	return
}

func GetUrlExt(rawURL string) (ext string, err error) {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return
	}
	// 获取路径部分
	urlPath := parsedURL.Path
	// 获取文件的扩展名
	ext = path.Ext(urlPath)
	return
}

// NewValidUTF8Reader constructs a new ValidUTF8Reader that wraps an existing io.Reader
func NewValidUTF8Reader(rd io.Reader) ValidUTF8Reader {
	return ValidUTF8Reader{bufio.NewReader(rd)}
}

func Md5(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}
