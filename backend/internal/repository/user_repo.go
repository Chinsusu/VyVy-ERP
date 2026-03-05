package repository

import (
	"context"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"gorm.io/gorm"
)

// UserRepository interface defines methods for user data access
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id int64) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByUsername(ctx context.Context, username string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	UpdateLastLogin(ctx context.Context, userID int64) error
	ListAll(ctx context.Context) ([]*models.User, error)
}

// userRepository implements UserRepository
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) GetByID(ctx context.Context, id int64) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, userID int64) error {
	return r.db.WithContext(ctx).Model(&models.User{}).
		Where("id = ?", userID).
		Update("last_login_at", gorm.Expr("NOW()")).Error
}

func (r *userRepository) ListAll(ctx context.Context) ([]*models.User, error) {
	var users []*models.User
	err := r.db.WithContext(ctx).Where("is_active = true OR is_active IS NULL").Order("full_name ASC").Find(&users).Error
	return users, err
}
