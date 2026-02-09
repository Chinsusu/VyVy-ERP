package main

import (
	"fmt"
	"log"

	"github.com/VyVy-ERP/warehouse-backend/internal/api/middleware"
	"github.com/VyVy-ERP/warehouse-backend/internal/api/routes"
	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/database"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Connect to database
	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// Setup global middleware
	router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))
	router.Use(middleware.Logger())
	router.Use(middleware.ErrorHandler())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":   "healthy",
			"database": "connected",
		})
	})

	// Setup API routes
	routes.SetupRoutes(router, db, cfg)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
