package handlers

import (
	"net/http"

	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// LoginRequest represents the login request payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// RefreshRequest represents the refresh token request
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(
			"VALIDATION_ERROR",
			"Invalid request payload: "+err.Error(),
		))
		return
	}

	// Attempt login
	response, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		switch err {
		case service.ErrInvalidCredentials:
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
				"INVALID_CREDENTIALS",
				"Invalid email or password",
			))
		case service.ErrUserInactive:
			c.JSON(http.StatusForbidden, utils.ErrorResponse(
				"USER_INACTIVE",
				"Your account has been deactivated",
			))
		default:
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse(
				"LOGIN_FAILED",
				"Login failed: "+err.Error(),
			))
		}
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(
			"VALIDATION_ERROR",
			"Invalid request payload",
		))
		return
	}

	// Validate refresh token
	claims, err := h.authService.ValidateToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
			"INVALID_TOKEN",
			"Invalid or expired refresh token",
		))
		return
	}

	// Generate new tokens
	response, err := h.authService.RefreshToken(c.Request.Context(), claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			"REFRESH_FAILED",
			"Failed to refresh token: "+err.Error(),
		))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(response))
}

// Logout handles user logout (client-side token removal)
func (h *AuthHandler) Logout(c *gin.Context) {
	// In a stateless JWT system, logout is typically handled client-side
	// The client should remove the token from storage
	// Optionally, you could implement token blacklisting here
	
	c.JSON(http.StatusOK, utils.SuccessMessageResponse(
		"Logged out successfully",
		gin.H{"message": "Please remove the token from client storage"},
	))
}

// Me returns the current authenticated user info
func (h *AuthHandler) Me(c *gin.Context) {
	// Get user from context (set by auth middleware)
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
			"UNAUTHORIZED",
			"User not authenticated",
		))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(claims))
}
