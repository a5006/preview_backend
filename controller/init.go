package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"net/http"
	"os"
)

func saveBlock(name string, buf []byte) {
	save, err := os.OpenFile("./files/"+name, os.O_CREATE|os.O_RDWR, 0600)
	if err != nil {
		panic(err)
	}
	defer func() {
		err = save.Close()
		if err != nil {
			panic(err)
		}
	}()
	_, err = save.Write(buf)
	if err != nil {
		panic(err)
	}
}

func UploadFile(c *gin.Context) {
	file, head, err := c.Request.FormFile("file")
	if err != nil {
		fmt.Println("错误",err.Error())
		panic(err.Error())
	}

	//分成5片
	block := head.Size / 5
	index := 0
	for {
		buf := make([]byte, block)
		n, err := file.Read(buf)
		if err != nil && err != io.EOF {
			panic(err.Error())
		}
		if n == 0 {
			break
		}
		saveBlock(fmt.Sprintf("img_%d.png", index), buf)
		index++
	}
	c.JSON(200, gin.H{"message": "ok"})
}

func GetImgFile(c *gin.Context) {
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("Content-type", "image/png")
	for i := 0; i <= 5; i++ {
		f, _ := os.Open(fmt.Sprintf("./files/img_%d.png", i))
		b, _ := ioutil.ReadAll(f)
		_, err := c.Writer.Write(b)
		if err != nil {
			panic(err)
		}
		c.Writer.(http.Flusher).Flush()
	}
}
