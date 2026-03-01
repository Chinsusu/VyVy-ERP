package repository

import (
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// ProductFormulaRepository defines data access for product formulas (BOM)
type ProductFormulaRepository interface {
	GetByProductID(productID uint) ([]*models.ProductFormula, error)
	GetByID(id uint) (*models.ProductFormula, error)
	Create(formula *models.ProductFormula) error
	Update(formula *models.ProductFormula) error
	Delete(id uint) error
	DeleteItems(formulaID uint) error
}

type productFormulaRepository struct {
	db *gorm.DB
}

// NewProductFormulaRepository creates a new ProductFormulaRepository
func NewProductFormulaRepository(db *gorm.DB) ProductFormulaRepository {
	return &productFormulaRepository{db: db}
}

func (r *productFormulaRepository) GetByProductID(productID uint) ([]*models.ProductFormula, error) {
	var formulas []*models.ProductFormula
	err := r.db.
		Where("finished_product_id = ?", productID).
		Preload("Items.Material").
		Order("created_at ASC").
		Find(&formulas).Error
	return formulas, err
}

func (r *productFormulaRepository) GetByID(id uint) (*models.ProductFormula, error) {
	var formula models.ProductFormula
	err := r.db.
		Preload("Items.Material").
		First(&formula, id).Error
	if err != nil {
		return nil, err
	}
	return &formula, nil
}

func (r *productFormulaRepository) Create(formula *models.ProductFormula) error {
	return r.db.Create(formula).Error
}

func (r *productFormulaRepository) Update(formula *models.ProductFormula) error {
	return r.db.Save(formula).Error
}

func (r *productFormulaRepository) Delete(id uint) error {
	return r.db.Delete(&models.ProductFormula{}, id).Error
}

func (r *productFormulaRepository) DeleteItems(formulaID uint) error {
	return r.db.Where("formula_id = ?", formulaID).Delete(&models.ProductFormulaItem{}).Error
}
