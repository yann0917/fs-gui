package main

import (
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
	"github.com/yann0917/fs-gui/config"
	"github.com/yann0917/fs-gui/middleware"
	"github.com/yann0917/fs-gui/services"
	"github.com/yann0917/fs-gui/utils"
)

func InitRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.SetTrustedProxies([]string{"127.0.0.1"})
	r.Use(gin.Recovery())
	r.Use(middleware.Serve("/", middleware.EmbedFolder(frontend, "frontend/dist")))
	// API 路由
	api := r.Group("/api")
	{
		api.POST("/login/phone", handleLoginByPhone)
		api.POST("/login/password", handleLoginByPassword)
		api.POST("/login/sms-code", handleSmsCode)
		api.POST("/logout", handleLogout)
		api.GET("/categories", handleGetCategories)
		api.GET("/user", handleGetUserInfo)
		api.GET("/notifications", handleSSENotifications)

		books := api.Group("/books")
		{
			books.GET("", handleGetBooks)
			books.GET("/:id", handleGetBookDetail)
			books.GET("/:id/module", handleGetBookModuleDetail)
			books.GET("/download", handleDownloadBook)
		}

		courses := api.Group("/courses")
		{
			courses.GET("", handleGetCourseList)
			courses.GET("/:id", handleGetCourseDetail)
			courses.GET("/:id/articles", handleGetArticleList)
			courses.GET("/download", handleDownloadCourse)
		}
	}
	return r
}

func handleSmsCode(c *gin.Context) {
	var req struct {
		Phone string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, err)
		return
	}
	phone := req.Phone
	resp, err := Instance.SmsCode(phone)
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, resp)
}

func handleLoginByPhone(c *gin.Context) {
	var req struct {
		Phone string `json:"phone"`
		Code  string `json:"code"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, err)
		return
	}
	phone := req.Phone
	code := req.Code
	resp, cookies, err := Instance.LoginByPhone(phone, code)
	if err != nil {
		Error(c, err)
		return
	}

	// 设置 cookies
	for _, cookie := range cookies {
		c.SetCookie(cookie.Name, cookie.Value, cookie.MaxAge, cookie.Path, cookie.Domain, cookie.Secure, cookie.HttpOnly)
	}

	config.UpdateToken(resp.Token)

	Success(c, resp)
}

func handleLoginByPassword(c *gin.Context) {
	// TODO: 实现登录逻辑
	var req struct {
		Phone    string `json:"phone"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, err)
		return
	}
	phone := req.Phone
	password := req.Password
	resp, cookies, err := Instance.LoginByPassword(phone, password)
	if err != nil {
		Error(c, err)
		return
	}

	// 设置 cookies
	for _, cookie := range cookies {
		c.SetCookie(cookie.Name, cookie.Value, cookie.MaxAge, cookie.Path, cookie.Domain, cookie.Secure, cookie.HttpOnly)
	}
	config.UpdateToken(resp.Token)
	Success(c, resp)
}

func handleGetCategories(c *gin.Context) {
	categories, err := Instance.BookClassify()
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, categories)
}

func handleGetUserInfo(c *gin.Context) {
	user, err := Instance.GetUserInfo()
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, user)
}

func handleGetBooks(c *gin.Context) {
	// 从 GET 参数中获取数据
	businessType, _ := strconv.Atoi(c.Query("businessType"))
	publishYear, _ := strconv.Atoi(c.Query("publishYear"))
	sortType, _ := strconv.Atoi(c.Query("sortType"))
	pageNo, _ := strconv.Atoi(c.Query("pageNo"))
	pageSize, _ := strconv.Atoi(c.Query("pageSize"))

	var classifyIds []int
	classifyIdsStr := c.QueryArray("classifyIds[]")
	if len(classifyIdsStr) > 0 {
		// 回退到字符串分割方式
		for _, idStr := range classifyIdsStr {
			if id, err := strconv.Atoi(idStr); err == nil {
				classifyIds = append(classifyIds, id)
			}
		}
	}

	// 构建参数
	params := services.ClassifyBookParam{
		BusinessType: businessType,
		ClassifyIds:  classifyIds,
		PublishYear:  publishYear,
		SortType:     sortType,
		PageNo:       pageNo,
		PageSize:     pageSize,
	}

	// 确保 pageSize 有默认值
	if params.PageSize == 0 {
		params.PageSize = 15
	}

	// 确保 pageNo 有默认值
	if params.PageNo == 0 {
		params.PageNo = 1
	}

	books, err := Instance.ClassifyBookList(params)
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, books)
}

func handleGetBookDetail(c *gin.Context) {
	id := c.Param("id")
	bookId, _ := strconv.Atoi(id)
	book, err := Instance.BookContent(bookId)
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, book)
}

func handleGetBookModuleDetail(c *gin.Context) {
	id := c.Param("id")
	bookId, _ := strconv.Atoi(id)
	fragmentId, _ := strconv.Atoi(c.Query("fragmentId"))
	book, err := Instance.BookModuleContent(bookId, fragmentId)
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, book)
}

func handleGetCourseList(c *gin.Context) {
	pageNo := c.Query("pageNo")
	pageSize := c.Query("pageSize")
	sortType := c.Query("sortType")

	var classifyIds []int
	// 首先尝试获取数组格式的参数
	classifyIdsStr := c.QueryArray("classifyIds[]")
	if len(classifyIdsStr) > 0 {
		// 解析数组格式的参数
		for _, idStr := range classifyIdsStr {
			if id, err := strconv.Atoi(idStr); err == nil {
				classifyIds = append(classifyIds, id)
			}
		}
	}

	var params services.CourseListParam
	params.Page.PageNo, _ = strconv.Atoi(pageNo)
	params.Page.PageSize, _ = strconv.Atoi(pageSize)
	params.SortType, _ = strconv.Atoi(sortType)
	params.Platform = 3
	params.BusinessZone = 2
	params.ClassifyIds = classifyIds

	list, err := Instance.CourseList(params)
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, list)
}

func handleGetCourseDetail(c *gin.Context) {
	id := c.Param("id")
	courseId, _ := strconv.Atoi(id)
	var params services.CourseInfoParam
	params.CourseId = courseId
	course, err := Instance.CourseInfo(params)
	if err != nil {
		Error(c, err)
		return
	}
	// 手动设置课程ID，因为API返回的id字段可能为0
	course.Id = courseId
	Success(c, course)
}

func handleGetArticleList(c *gin.Context) {
	id := c.Param("id")
	pageNo := c.Query("pageNo")
	pageSize := c.Query("pageSize")
	courseId, _ := strconv.Atoi(id)
	var params services.ProgramListParam
	params.Page.PageNo, _ = strconv.Atoi(pageNo)
	params.Page.PageSize, _ = strconv.Atoi(pageSize)
	params.CourseId = courseId
	list, err := Instance.ProgramList(params)
	if err != nil {
		Error(c, err)
		return
	}
	Success(c, list)
}

func handleDownloadBook(c *gin.Context) {
	id := c.Query("id")
	businessType := c.Query("businessType")
	downloadType := c.Query("downloadType")
	bookId, _ := strconv.Atoi(id)
	businessTypeInt, _ := strconv.Atoi(businessType)
	downloadTypeInt, _ := strconv.Atoi(downloadType)
	// 调用下载方法
	go Download(bookId, businessTypeInt, downloadTypeInt)
	Success(c, nil)

}

func handleDownloadCourse(c *gin.Context) {
	id := c.Query("id")
	courseId, _ := strconv.Atoi(id)
	downloadType := c.Query("downloadType")
	downloadTypeInt, _ := strconv.Atoi(downloadType)
	go DownloadCourse(courseId, downloadTypeInt)
	Success(c, nil)
}

func handleLogout(c *gin.Context) {
	// 清除所有 cookies
	for _, cookie := range c.Request.Cookies() {
		c.SetCookie(cookie.Name, "", -1, cookie.Path, cookie.Domain, cookie.Secure, cookie.HttpOnly)
	}

	Success(c, struct{}{})
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{"code": 0, "data": data, "msg": "success"})
}

func Error(c *gin.Context, err error) {
	c.JSON(200, gin.H{"code": 1, "data": nil, "msg": err.Error()})
}

func Download(bookID, businessType, downloadType int) (err error) {
	detail, err := Instance.BookContent(bookID)
	if err != nil {
		return
	}

	bookName := strings.TrimSpace(detail.BookInfo.Title)
	bookIDStr := utils.Int2String(bookID)

	// 发送下载开始通知
	SendDownloadStarted(bookIDStr, "book", bookName)

	subDir := getSubDir(businessType)
	fileSuffix := getFileSuffix(downloadType)
	filePath, err := utils.Mkdir(OutputDir, utils.FileName(subDir, ""))
	if err != nil {
		SendDownloadFailed(bookIDStr, "book", bookName, err.Error())
		return
	}

	fileName := filepath.Join(filePath, utils.FileName(utils.Int2String(bookID)+"."+bookName, fileSuffix))
	if utils.CheckFileExist(fileName) {
		fmt.Printf("【\033[37;1m%s\033[0m】已存在\n", fileName)
		SendDownloadCompleted(bookIDStr, "book", bookName)
		return
	}

	articleFragmentId, thinkFragmentId := 0, 0
	for _, article := range detail.Articles {
		if article.ModuleCode == "articles" {
			articleFragmentId = article.FragmentId
		}
		if article.ModuleCode == "think" {
			thinkFragmentId = article.FragmentId
		}
	}

	// 执行下载逻辑
	defer func() {
		if err != nil {
			SendDownloadFailed(bookIDStr, "book", bookName, err.Error())
		} else {
			SendDownloadCompleted(bookIDStr, "book", bookName)
		}
	}()

	switch downloadType {
	case 1:
		// 获取封面图
		var coverBytes []byte
		if detail.AudioInfo.MediaCoverUrl != "" {
			cover, err1 := http.Get(detail.AudioInfo.MediaCoverUrl)
			if err1 != nil {
				err = err1
				return
			}
			defer cover.Body.Close()
			coverBytes, err = io.ReadAll(cover.Body)
			if err != nil {
				return
			}
		}
		rawURL := detail.AudioInfo.MediaUrl
		if rawURL != "" {
			ext, _ := utils.GetUrlExt(rawURL)
			switch ext {
			case ".mp3":
				var opt utils.ID3Options
				opt.Artist = detail.BookInfo.SpeakerName
				opt.Title = bookName
				opt.Album = getSubDir(detail.BookInfo.BusinessType)
				opt.Cover = coverBytes
				err = utils.DownloadAudio(fileName, rawURL, opt)
			case ".m3u8":
				err = utils.MergeAudioAndVideo([]string{rawURL}, fileName)
				if err != nil {
					fmt.Println(rawURL)
					fmt.Println(err)
				}

			default:
				fmt.Println(rawURL)
			}
		}
	case 2:
		rawURL := detail.VideoInfo.MediaUrl
		err = utils.MergeAudioAndVideo([]string{rawURL}, fileName)
		if err != nil {
			fmt.Println(rawURL)
			fmt.Println(err)
		}
	case 3:
		if articleFragmentId > 0 {
			module, err1 := Instance.BookModuleContent(bookID, articleFragmentId)
			if err1 != nil {
				return err1
			}
			res := utils.Html2Md(module.Content)
			err = utils.SaveFile(fileName, res)
		} else {
			fmt.Printf("【\033[31;1m%s\033[0m】无解读文稿\n", bookName)
		}

	case 4:
		if articleFragmentId > 0 {
			module, err1 := Instance.BookModuleContent(bookID, articleFragmentId)
			if err1 != nil {
				return err1
			}
			doc, _ := goquery.NewDocumentFromReader(strings.NewReader(module.Content))
			text := doc.Find("div.rich_media_content").Map(func(i int, s *goquery.Selection) string {
				s.Find("section").Each(func(i int, item *goquery.Selection) {
					replaceLetterSpacing(item)
				})
				s.Find("p").Each(func(index int, item *goquery.Selection) {
					replaceLetterSpacing(item)
				})
				s.Find("span").Each(func(index int, item *goquery.Selection) {
					replaceLetterSpacing(item)
				})
				res, _ := s.Html()
				return res
			})
			err = utils.Html2Pdf(fileName, bookName, text[0])
			if err != nil {
				return err
			}
		} else {
			fmt.Printf("【\033[31;1m%s\033[0m】无解读文稿\n", bookName)
		}
	case 5:
		if thinkFragmentId > 0 {
			module, err1 := Instance.BookModuleContent(bookID, thinkFragmentId)
			if err1 != nil {
				return err1
			}
			doc, _ := goquery.NewDocumentFromReader(strings.NewReader(module.Content))
			name := utils.Int2String(bookID) + "." + bookName
			doc.Find("img").Each(func(i int, selection *goquery.Selection) {
				if i > 0 {
					fileName = filepath.Join(filePath, utils.FileName(name+"_"+utils.Int2String(i), fileSuffix))
				} else {
					fileName = filepath.Join(filePath, utils.FileName(name, fileSuffix))
				}
				if src, ok := selection.Attr("src"); ok {
					err = utils.Download(fileName, src)
				}
			})
		} else {
			fmt.Printf("【\033[31;1m%s\033[0m】无思维导图\n", bookName)
		}
	}

	return
}

// DownloadCourse 下载课程音频
func DownloadCourse(courseID, downloadType int) (err error) {
	courseIDStr := utils.Int2String(courseID)

	cParam := services.CourseInfoParam{
		CourseId: courseID,
	}
	detail, err := Instance.CourseInfo(cParam)
	if err != nil {
		SendDownloadFailed(courseIDStr, "course", "未知课程", err.Error())
		return err
	}

	albumName := detail.Title

	// 发送下载开始通知
	SendDownloadStarted(courseIDStr, "course", albumName)

	// 执行下载逻辑，确保在函数结束时发送完成或失败通知
	defer func() {
		if err != nil {
			SendDownloadFailed(courseIDStr, "course", albumName, err.Error())
		} else {
			SendDownloadCompleted(courseIDStr, "course", albumName)
		}
	}()

	titleImageUrl := detail.AlbumCoverUrl

	param := services.ProgramListParam{
		Page: services.ProgramPage{
			PageNo: 1, PageSize: 1000,
		},
		CourseId: courseID,
	}
	list, err := Instance.ProgramList(param)
	if err != nil {
		return err
	}

	// 获取封面图
	var coverBytes []byte
	if titleImageUrl != "" {
		cover, err1 := http.Get(titleImageUrl)
		if err1 != nil {
			return err1
		}
		defer cover.Body.Close()
		coverBytes, err = io.ReadAll(cover.Body)
		if err != nil {
			return err
		}
	}

	subDir := getSubDir(4)
	fileSuffix := getFileSuffix(downloadType)
	filePath, err := utils.Mkdir(OutputDir, utils.FileName(subDir, ""), utils.FileName(albumName, ""))
	if err != nil {
		fmt.Println(err)
		return err
	}

	// 统计总数和已完成数
	totalItems := len(list)
	completedItems := 0

	// 先统计已存在的文件
	for _, program := range list {
		seq := program.Seq
		if program.ChapterInfo != nil {
			seq = utils.Int2String(program.ChapterInfo.ChapterSeq) + "-" + program.Seq
		}
		title := strings.TrimSpace(program.Title)
		fileName := filepath.Join(filePath, utils.FileName(seq+"."+title, fileSuffix))
		if utils.CheckFileExist(fileName) {
			completedItems++
		}
	}

	for _, program := range list {
		seq := program.Seq
		if program.ChapterInfo != nil {
			seq = utils.Int2String(program.ChapterInfo.ChapterSeq) + "-" + program.Seq
		}
		title := strings.TrimSpace(program.Title)
		fileName := filepath.Join(filePath, utils.FileName(seq+"."+title, fileSuffix))

		if utils.CheckFileExist(fileName) {
			fmt.Printf("【\033[37;1m%s\033[0m】已存在\n", fileName)
			continue
		}

		var rawURL string
		if downloadType == 1 {
			rawURL = program.AudioUrl
		} else if downloadType == 2 {
			programDetail, err := Instance.ProgramDetail(services.ProgramDetailParam{
				AlbumId:    courseID,
				ProgramId:  program.Id,
				FragmentId: program.FragmentId,
			})
			if err != nil {
				fmt.Println(err)
				return err
			}
			rawURL = programDetail.VideoInfo.MediaUrl
		}

		if rawURL != "" {
			// 获取文件的扩展名
			ext, _ := utils.GetUrlExt(rawURL)
			var downloadErr error

			switch ext {
			case ".mp3":
				var opt utils.ID3Options
				opt.Artist = detail.Author
				opt.Title = title
				opt.Album = albumName
				opt.Cover = coverBytes
				downloadErr = utils.DownloadAudio(fileName, rawURL, opt)
			case ".m3u8":
				downloadErr = utils.MergeAudioAndVideo([]string{rawURL}, fileName)
				if downloadErr != nil {
					fmt.Println(rawURL)
					fmt.Println(downloadErr)
				}
			default:
				fmt.Println(rawURL)
			}

			// 如果单个文件下载成功，发送进度通知
			if downloadErr == nil {
				completedItems++
				// 发送单节下载完成通知
				SendCourseItemCompleted(courseIDStr, "course", albumName, title, completedItems, totalItems)

				fmt.Printf("【\033[32;1m%s\033[0m】下载完成 (%d/%d)\n", title, completedItems, totalItems)
			} else {
				// 如果单个文件下载失败，记录错误但继续下载其他文件
				fmt.Printf("【\033[31;1m%s\033[0m】下载失败: %v\n", title, downloadErr)
			}
		}
	}
	return
}

// replaceLetterSpacing
func replaceLetterSpacing(s *goquery.Selection) {
	if style, exists := s.Attr("style"); exists {
		styles := strings.Split(style, ";")
		// letter-spacing 导致 wkhtmltopdf 文字被截断
		for i, s := range styles {
			keyValue := strings.Split(s, ":")
			if len(keyValue) == 2 {
				key := strings.TrimSpace(keyValue[0])
				value := strings.TrimSpace(keyValue[1])
				if key == "letter-spacing" {
					value = "0.3px"
					styles[i] = fmt.Sprintf("%s: %s", key, value)
					break
				}
			}
		}
		// 重建style字符串
		newStyle := strings.Join(styles, ";")
		if !strings.HasSuffix(newStyle, ";") {
			newStyle += ";" // 确保以分号结尾
		}
		s.SetAttr("style", newStyle)
	}
}

func getSubDir(bType int) string {
	list := map[int]string{
		1: "樊登讲书",
		2: "非凡精读",
		3: "李蕾讲经典",
		4: "课程",
	}
	if t, ok := list[bType]; ok {
		return t
	} else {
		return "樊登讲书"
	}
}

func getFileSuffix(dType int) string {
	list := map[int]string{
		1: "mp3",
		2: "mp4",
		3: "md",
		4: "pdf",
		5: "jpeg",
	}
	return list[dType]
}
