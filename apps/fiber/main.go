package main

import (
	"log"
	"os"
	"runtime"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}

	prefork := os.Getenv("PREFORK") == "true"
	// Fiber Prefork 在 Windows 上不可用，单进程下多核压测会吃亏
	if runtime.GOOS == "windows" {
		prefork = false
	}

	app := fiber.New(fiber.Config{
		Prefork:               prefork,
		DisableStartupMessage: true,
		Immutable:             false,
	})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello Backend Framework Benchmark!")
	})

	log.Fatal(app.Listen(":" + port))
}
