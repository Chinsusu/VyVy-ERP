package main

import (
	"log"

	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/database"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Executing surgical schema fixes...")

	// Materials
	if err := db.Exec("ALTER TABLE materials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP").Error; err != nil {
		log.Printf("Warning: Failed to add deleted_at to materials: %v", err)
	} else {
		log.Println("✅ materials.deleted_at checked/added")
	}

	// Finished Products
	if err := db.Exec("ALTER TABLE finished_products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP").Error; err != nil {
		log.Printf("Warning: Failed to add deleted_at to finished_products: %v", err)
	} else {
		log.Println("✅ finished_products.deleted_at checked/added")
	}

	log.Println("✅ Surgical schema fixes completed successfully!")
}
