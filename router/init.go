package router

import (
	"app/controller"
	"github.com/gin-gonic/gin"
)

func InitRouter(r *gin.Engine) {
	r.POST("/file", controller.UploadFile)
	r.GET("/img",controller.GetImgFile)
}
