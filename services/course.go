package services

// Course 课程结构体
type Course struct {
	BizType        int    `json:"bizType"`        // 业务类型，例如：4
	CourseId       int    `json:"courseId"`       // 课程ID
	HasBuy         int    `json:"hasBuy"`         // 是否已购买，2-未购买
	Introduct      string `json:"introduct"`      // 课程简介
	PicUrl         string `json:"picUrl"`         // 图片URL
	PlayCount      int    `json:"playCount"`      // 播放次数
	PublishTime    int64  `json:"publishTime"`    // 发布时间（时间戳）
	SpeakerName    string `json:"speakerName"`    // 讲师名称
	Title          string `json:"title"`          // 课程标题
	TotalPublishNo int    `json:"totalPublishNo"` // 总发布数量
	WatermarkImage string `json:"watermarkImage"` // 水印图片URL
}
