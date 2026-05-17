package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.GET("/", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/plain; charset=utf-8", []byte("Hello Backend Framework Benchmark!"))
	})

	_ = router.Run(":" + port)
}
