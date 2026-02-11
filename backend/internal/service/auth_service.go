package service

import (
	"context"
	"errors"

	"github.com/VyVy-ERP/warehouse-backend/internal/config"
	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/repository"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserInactive       = errors.New("user account is inactive")
)

// AuthService interface defines authentication methods
type AuthService interface {
	Login(ctx context.Context, email, password string) (*LoginResponse, error)
	ValidateToken(tokenString string) (*utils.JWTClaims, error)
	RefreshToken(ctx context.Context, userID int64) (*LoginResponse, error)
}

// authService implements AuthService
type authService struct {
	userRepo repository.UserRepository
	cfg      *config.Config
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo repository.UserRepository, cfg *config.Config) AuthService {
	return &authService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

// LoginResponse represents the response after successful login
type LoginResponse struct {
	AccessToken  string           `json:"access_token"`
	RefreshToken string           `json:"refresh_token"`
	TokenType    string           `json:"token_type"`
	ExpiresIn    int              `json:"expires_in"` // in seconds
	User         models.SafeUser  `json:"user"`
}

func (s *authService) Login(ctx context.Context, email, password string) (*LoginResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	// Check if user is active
	if user.IsActive != nil && !*user.IsActive {
		return nil, ErrUserInactive
	}

	// Verify password
	if !user.CheckPassword(password) {
		return nil, ErrInvalidCredentials
	}

	// Generate access token
	accessToken, err := utils.GenerateToken(
		user.ID,
		user.Username,
		user.Email,
		user.Role,
		s.cfg.JWT.Secret,
		s.cfg.JWT.ExpiryHours,
	)
	if err != nil {
		return nil, err
	}

	// Generate refresh token (longer expiry)
	refreshToken, err := utils.GenerateToken(
		user.ID,
		user.Username,
		user.Email,
		user.Role,
		s.cfg.JWT.Secret,
		s.cfg.JWT.RefreshExpiryHours,
	)
	if err != nil {
		return nil, err
	}

	// Update last login time
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log error but don't fail login
		// logger.Error("Failed to update last login", zap.Error(err))
	}

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    s.cfg.JWT.ExpiryHours * 3600, // convert hours to seconds
		User:         user.ToSafeUser(),
	}, nil
}

func (s *authService) ValidateToken(tokenString string) (*utils.JWTClaims, error) {
	return utils.ValidateToken(tokenString, s.cfg.JWT.Secret)
}

func (s *authService) RefreshToken(ctx context.Context, userID int64) (*LoginResponse, error) {
	// Get user by ID
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Check if user is still active
	if user.IsActive != nil && !*user.IsActive {
		return nil, ErrUserInactive
	}

	// Generate new access token
	accessToken, err := utils.GenerateToken(
		user.ID,
		user.Username,
		user.Email,
		user.Role,
		s.cfg.JWT.Secret,
		s.cfg.JWT.ExpiryHours,
	)
	if err != nil {
		return nil, err
	}

	// Generate new refresh token
	refreshToken, err := utils.GenerateToken(
		user.ID,
		user.Username,
		user.Email,
		user.Role,
		s.cfg.JWT.Secret,
		s.cfg.JWT.RefreshExpiryHours,
	)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    s.cfg.JWT.ExpiryHours * 3600,
		User:         user.ToSafeUser(),
	}, nil
}
