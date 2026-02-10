package main

import (
	"flag"
	"io/ioutil"
	"log"
	"path/filepath"
	"sort"
	"strings"

	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/database"
)

func main() {
	dir := flag.String("dir", "migrations", "directory containing .sql files")
	flag.Parse()

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Get underlying SQL DB
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}

	files, err := ioutil.ReadDir(*dir)
	if err != nil {
		log.Fatal("Failed to read directory:", err)
	}

	suffix := ".sql"
	if *dir == "migrations" {
		suffix = ".up.sql"
	}

	var sqlFiles []string
	for _, f := range files {
		if strings.HasSuffix(f.Name(), suffix) {
			sqlFiles = append(sqlFiles, f.Name())
		}
	}
	sort.Strings(sqlFiles)

	for _, fileName := range sqlFiles {
		log.Printf("Applying SQL file: %s/%s", *dir, fileName)
		content, err := ioutil.ReadFile(filepath.Join(*dir, fileName))
		if err != nil {
			log.Fatalf("Failed to read file %s: %v", fileName, err)
		}

		_, err = sqlDB.Exec(string(content))
		if err != nil {
			log.Printf("Warning: Failed to execute %s: %v (skipping...)", fileName, err)
		}
	}

	log.Printf("✅ All SQL files in %s processed successfully!", *dir)
}
