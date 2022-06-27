package main

import (
	"app/router"
	"fmt"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	router.InitRouter(r)
	r.Use(func(c *gin.Context) {

		defer func() {
			fmt.Println(recover(), "dasffdsa ")
			if e := recover(); e != nil {
				fmt.Println("err1111111111111")
				c.AbortWithStatusJSON(400, gin.H{
					"errcode": 0,
				})
			}
		}()
	})
	err := r.Run(":2333")
	if err != nil {
		panic(err)
	}
}
