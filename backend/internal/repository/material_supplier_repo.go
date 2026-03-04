package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type MaterialSupplierRepository interface {
	UpsertByMaterialID(materialID int64, suppliers []models.MaterialSupplier) error
	DeleteByMaterialID(materialID int64) error
	ListByMaterialID(materialID int64) ([]models.MaterialSupplier, error)
}

type materialSupplierRepository struct {
	db *gorm.DB
}

func NewMaterialSupplierRepository(db *gorm.DB) MaterialSupplierRepository {
	return &materialSupplierRepository{db: db}
}

// UpsertByMaterialID replaces all suppliers for a material
func (r *materialSupplierRepository) UpsertByMaterialID(materialID int64, suppliers []models.MaterialSupplier) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete existing
		if err := tx.Where("material_id = ?", materialID).Delete(&models.MaterialSupplier{}).Error; err != nil {
			return err
		}
		if len(suppliers) == 0 {
			return nil
		}
		// Set material_id on all entries
		for i := range suppliers {
			suppliers[i].MaterialID = materialID
			suppliers[i].ID = 0 // reset PK so GORM inserts new rows
		}
		return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&suppliers).Error
	})
}

// DeleteByMaterialID deletes all suppliers for a material
func (r *materialSupplierRepository) DeleteByMaterialID(materialID int64) error {
	return r.db.Where("material_id = ?", materialID).Delete(&models.MaterialSupplier{}).Error
}

// ListByMaterialID fetches all suppliers for a material ordered by priority
func (r *materialSupplierRepository) ListByMaterialID(materialID int64) ([]models.MaterialSupplier, error) {
	var result []models.MaterialSupplier
	err := r.db.Preload("Supplier").
		Where("material_id = ?", materialID).
		Order("priority ASC").
		Find(&result).Error
	return result, err
}
