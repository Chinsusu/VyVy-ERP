package main

import (
	"log"

	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/database"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	admin := &models.User{
		Username: "admin",
		Email:    "admin@vyvy.com",
		FullName: "Administrator",
		Role:     "admin",
		IsActive: true,
	}
	admin.HashPassword("password123")

	// Upsert admin user
	var existing models.User
	result := db.Where("email = ?", admin.Email).First(&existing)
	if result.Error == nil {
		log.Println("Admin exists, updating password...")
		existing.PasswordHash = admin.PasswordHash
		db.Save(&existing)
	} else {
		log.Println("Admin does not exist, creating...")
		db.Create(admin)
	}

	log.Println("✅ Admin user setup completed!")
}
