package services

// Knowledge 课程
type Knowledge struct {
	Author         string `json:"author"`
	BizType        int    `json:"bizType"`
	HasBuy         int    `json:"hasBuy"`
	Id             string `json:"id"`
	Introduct      string `json:"introduct"`
	PicUrl         string `json:"picUrl"`
	PlayCount      int    `json:"playCount"`
	Title          string `json:"title"`
	TotalPublishNo int    `json:"totalPublishNo"`
	WatermarkImage string `json:"watermarkImage"`
}

// CourseInfo 课程详情
type CourseInfo struct {
	ActualSaleScene []interface{} `json:"actualSaleScene"`
	AdditionCount   int           `json:"additionCount"`
	AlbumCoverUrl   string        `json:"albumCoverUrl"`
	Author          string        `json:"author"`
	AuthorIntro     string        `json:"authorIntro"`
	BizType         int           `json:"bizType"`
	BuyCount        int           `json:"buyCount"`
	CategoryName    string        `json:"categoryName"`
	CategoryNo      int           `json:"categoryNo"`
	CategoryNoList  []int         `json:"categoryNoList"`
	CounselorFlag   int           `json:"counselorFlag"`
	CouponList      []interface{} `json:"couponList"`
	CoverImage      string        `json:"coverImage"`
	Disabled        bool          `json:"disabled"`
	HasBought       bool          `json:"hasBought"`
	Id              int           `json:"id"`
	ImageText       string        `json:"imageText"`
	LearningInfo    LearningInfo  `json:"learningInfo"`
	OriginalPrice   string        `json:"originalPrice"`
	PackageList     []interface{} `json:"packageList"`
	Poster          bool          `json:"poster"`
	PublishedCount  int           `json:"publishedCount"`
	PurchaseImage   string        `json:"purchaseImage"`
	ReadCount       int           `json:"readCount"`
	ReadCountTotal  int           `json:"readCountTotal"`
	RelateChapters  int           `json:"relateChapters"`
	SellPrice       string        `json:"sellPrice"`
	Sharable        bool          `json:"sharable"`
	ShareImageUrl   string        `json:"shareImageUrl"`
	ShareLink       string        `json:"shareLink"`
	ShowType        int           `json:"showType"`
	SourceInfo      SourceInfo    `json:"sourceInfo"`
	SubTitle        string        `json:"subTitle"`
	SuitedPeople    string        `json:"suitedPeople"`
	Title           string        `json:"title"`
	TotalPublishNo  int           `json:"totalPublishNo"`
	TrialPrograms   int           `json:"trialPrograms"`
	Type            int           `json:"type"`
	UnlockNum       int           `json:"unlockNum"`
}

type LearningInfo struct {
	Finished      int    `json:"finished"`
	Learning      int    `json:"learning"`
	ShareText     string `json:"shareText"`
	TotalDuration int    `json:"totalDuration"`
}

type SourceInfo struct {
	Duration int `json:"duration"`
	Type     int `json:"type"`
}

// Program 节目
type Program struct {
	AlbumId           int          `json:"albumId"`
	AlbumName         string       `json:"albumName"`
	AudioUrl          string       `json:"audioUrl"` // 音频链接
	ChapterInfo       *ChapterInfo `json:"chapterInfo,omitempty"`
	Duration          int          `json:"duration"`
	Finished          int          `json:"finished"`
	FragmentId        int          `json:"fragmentId"`
	Free              bool         `json:"free"`
	Id                int          `json:"id"`
	IsLimitedTimeFree bool         `json:"isLimitedTimeFree"`
	MediaFilesize     int          `json:"mediaFilesize"`
	PublishTime       int64        `json:"publishTime"`
	ReadCount         int          `json:"readCount"`
	Seq               string       `json:"seq"` // 排序
	ShowType          int          `json:"showType"`
	Title             string       `json:"title"`
	TitleImageUrl     string       `json:"titleImageUrl"`
	TopFlag           int          `json:"topFlag"`
	Trial             bool         `json:"trial"`
	Unlock            bool         `json:"unlock"`
	UnlockType        int          `json:"unlockType,omitempty"`
	VideoFragmentId   int          `json:"videoFragmentId"`
}

type ChapterInfo struct {
	ChapterId   int    `json:"chapterId"`
	ChapterName string `json:"chapterName"`
	ChapterSeq  int    `json:"chapterSeq"`
	ProgramNum  int    `json:"programNum"`
}

// ProgramDetail 节目详情
type ProgramDetail struct {
	AlbumAuthorName                string                    `json:"albumAuthorName"`
	AlbumCoverUrl                  string                    `json:"albumCoverUrl"`
	AlbumId                        int                       `json:"albumId"`
	AlbumName                      string                    `json:"albumName"`
	AlbumReadCount                 int                       `json:"albumReadCount"`
	AudioInfo                      ProgramAudioInfo          `json:"audioInfo"`
	AudioLoudnessNormalizationInfo LoudnessNormalizationInfo `json:"audioLoudnessNormalizationInfo"`
	AuthorName                     string                    `json:"authorName"`
	BeAndAfProgramVO               BeAndAfProgramVO          `json:"beAndAfProgramVO"`
	BizType                        int                       `json:"bizType"`
	CategoryName                   string                    `json:"categoryName"`
	CategoryNo                     int                       `json:"categoryNo"`
	CategoryType                   int                       `json:"categoryType"`
	CommentCount                   int                       `json:"commentCount"`
	Content                        string                    `json:"content"`
	CourseTitle                    string                    `json:"courseTitle"`
	Disabled                       bool                      `json:"disabled"`
	Duration                       int                       `json:"duration"`
	FragmentId                     int                       `json:"fragmentId"`
	Free                           bool                      `json:"free"`
	IsBuyed                        bool                      `json:"isBuyed"`
	IsLiked                        bool                      `json:"isLiked"`
	IsLimitedTimeFree              bool                      `json:"isLimitedTimeFree"`
	LikeCount                      int                       `json:"likeCount"`
	MediaFilesize                  int                       `json:"mediaFilesize"`
	MediaUrls                      []string                  `json:"mediaUrls"`
	OriginalPrice                  string                    `json:"originalPrice"`
	OtherProgramContents           []OtherProgramContent     `json:"otherProgramContents"`
	ProgramId                      int                       `json:"programId"`
	ProgramList                    []ProgramListItem         `json:"programList"`
	ProgramPublishTime             int64                     `json:"programPublishTime"`
	ProgramReadCount               int                       `json:"programReadCount"`
	PublishTime                    int64                     `json:"publishTime"`
	SellPrice                      string                    `json:"sellPrice"`
	Seq                            string                    `json:"seq"`
	ShareImageUrl                  string                    `json:"shareImageUrl"`
	ShowType                       int                       `json:"showType"`
	Title                          string                    `json:"title"`
	TitleImageUrl                  string                    `json:"titleImageUrl"`
	TotalNum                       int                       `json:"totalNum"`
	TotalPublishNo                 int                       `json:"totalPublishNo"`
	Trial                          bool                      `json:"trial"`
	TrialDuration                  int                       `json:"trialDuration"`
	TrialPrograms                  int                       `json:"trialPrograms"`
	Type                           int                       `json:"type"`
	Unlock                         bool                      `json:"unlock"`
	UnlockNum                      int                       `json:"unlockNum"`
	UnlockType                     int                       `json:"unlockType"`
	VideoInfo                      ProgramVideoInfo          `json:"videoInfo"`
	VideoLoudnessNormalizationInfo LoudnessNormalizationInfo `json:"videoLoudnessNormalizationInfo"`
	WatermarkImage                 string                    `json:"watermarkImage"`
}

// ProgramAudioInfo 节目音频信息
type ProgramAudioInfo struct {
	Duration      int    `json:"duration"`
	FragmentId    int    `json:"fragmentId"`
	MediaFilesize int    `json:"mediaFilesize"`
	MediaUrl      string `json:"mediaUrl"`
}

// ProgramVideoInfo 节目视频信息
type ProgramVideoInfo struct {
	Duration      int    `json:"duration"`
	FragmentId    int    `json:"fragmentId"`
	MediaFilesize int    `json:"mediaFilesize"`
	MediaUrl      string `json:"mediaUrl"`
}

// LoudnessNormalizationInfo 响度标准化信息
type LoudnessNormalizationInfo struct {
	GainValue float64 `json:"gainValue"`
	LufsValue float64 `json:"lufsValue"`
}

// BeAndAfProgramVO 前后节目信息
type BeAndAfProgramVO struct {
	AfFragmentId      int  `json:"afFragmentId"`
	AfFreeFlag        bool `json:"afFreeFlag"`
	AfProgramId       int  `json:"afProgramId"`
	AfUnlockFlag      bool `json:"afUnlockFlag"`
	AfVideoFragmentId int  `json:"afVideoFragmentId"`
	BeFragmentId      int  `json:"beFragmentId"`
	BeFreeFlag        bool `json:"beFreeFlag"`
	BeProgramId       int  `json:"beProgramId"`
	BeUnlockFlag      bool `json:"beUnlockFlag"`
	BeVideoFragmentId int  `json:"beVideoFragmentId"`
}

// OtherProgramContent 其他节目内容
type OtherProgramContent struct {
	FragmentId int `json:"fragmentId"`
	Type       int `json:"type"`
}

// ProgramListItem 节目列表项
type ProgramListItem struct {
	CourseId          int    `json:"courseId"`
	FragmentId        int    `json:"fragmentId"`
	Free              bool   `json:"free"`
	IsLimitedTimeFree bool   `json:"isLimitedTimeFree"`
	ProgramId         int    `json:"programId"`
	Seq               string `json:"seq"`
	Title             string `json:"title"`
	Unlock            bool   `json:"unlock"`
	UnlockType        int    `json:"unlockType,omitempty"`
}
