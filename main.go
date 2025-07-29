package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"backend/handlers"
	"backend/middleware"
	"backend/models"
)

func main() {
	// Initialize SQLite database
	db, err := gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database: ", err)
	}

	// Auto migrate the User model
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("failed to migrate database: ", err)
	}

	// Load JWT secret from environment variable (fallback to default)
	secret := []byte(os.Getenv("JWT_SECRET"))
	if len(secret) == 0 {
		secret = []byte("secret")
	}

	authHandler := &handlers.AuthHandler{
		DB:        db,
		JwtSecret: secret,
	}

	r := gin.Default()

	// Public routes
	r.POST("/signup", authHandler.Signup)
	r.POST("/login", authHandler.Login)

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(secret, db))
	api.GET("/profile", authHandler.Profile)

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("failed to run server: ", err)
	}
}