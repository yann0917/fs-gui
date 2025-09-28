package utils

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"runtime"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"
	"github.com/yann0917/fs-gui/config"
)

// getWkhtmltopdfPath 获取可用的wkhtmltopdf路径
func getWkhtmltopdfPath() string {
	// 首先尝试使用配置文件中的路径
	configPath := config.Conf.Wkhtmltopdf
	if configPath != "" {
		if _, err := os.Stat(configPath); err == nil {
			return configPath
		}
		// fmt.Printf("配置的wkhtmltopdf路径不存在: %s\n", configPath)
	}

	// 如果配置的路径无效，尝试从PATH中查找
	if path, err := exec.LookPath("wkhtmltopdf"); err == nil {
		fmt.Printf("使用系统PATH中的wkhtmltopdf: %s\n", path)
		return path
	}

	// 如果都找不到，返回空字符串（让go-wkhtmltopdf库自己找）
	// fmt.Println("警告: 找不到wkhtmltopdf，将使用系统默认路径")
	return ""
}

type PdfOption struct {
	FileName  string
	CoverPath string
	PageSize  string
	Toc       bool
	Title     string
	Author    string
	Subject   string
	Keywords  string
}

func (p *PdfOption) GenPdf(buf *bytes.Buffer) (err error) {
	wkhtmltopdfPath := getWkhtmltopdfPath()
	if wkhtmltopdfPath != "" {
		fmt.Printf("设置wkhtmltopdf路径: %s\n", wkhtmltopdfPath)
		wkhtmltopdf.SetPath(wkhtmltopdfPath)
	}

	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		return fmt.Errorf("创建PDF生成器失败: %v", err)
	}

	page := wkhtmltopdf.NewPageReader(buf)
	page.FooterFontSize.Set(10)
	page.FooterRight.Set("[page]")
	page.DisableSmartShrinking.Set(true)

	page.EnableLocalFileAccess.Set(true)
	pdfg.AddPage(page)

	if p.Title != "" {
		pdfg.Title.Set(p.Title)
	}
	if p.CoverPath != "" {
		pdfg.Cover.EnableLocalFileAccess.Set(true)

		if runtime.GOOS == "windows" {
			pdfg.Cover.Input = p.CoverPath
		} else {
			pdfg.Cover.Input = "file://" + p.CoverPath
		}
	}

	pdfg.Dpi.Set(300)
	if p.Toc {
		pdfg.TOC.Include = true
		pdfg.TOC.TocHeaderText.Set("目 录")
		pdfg.TOC.HeaderFontSize.Set(18)

		pdfg.TOC.TocLevelIndentation.Set(15)
		pdfg.TOC.TocTextSizeShrink.Set(0.9)
		pdfg.TOC.DisableDottedLines.Set(false)
		pdfg.TOC.EnableTocBackLinks.Set(true)
	}

	pdfg.PageSize.Set(wkhtmltopdf.PageSizeA4)

	pdfg.MarginTop.Set(15)
	pdfg.MarginBottom.Set(15)
	pdfg.MarginLeft.Set(15)
	pdfg.MarginRight.Set(15)

	// fmt.Printf("开始生成PDF...")
	err = pdfg.Create()
	if err != nil {
		return fmt.Errorf("PDF生成失败: %v", err)
	}

	// Write buffer contents to file on disk
	err = pdfg.WriteFile(p.FileName)
	if err != nil {
		fmt.Printf("\033[31;1m%s\033[0m\n", "失败"+err.Error())
		return fmt.Errorf("写入PDF文件失败: %v", err)
	}
	fmt.Printf("\033[32;1m%s\033[0m\n", "完成")
	if p.CoverPath != "" {
		err = os.Remove(p.CoverPath)
	}
	return
}
