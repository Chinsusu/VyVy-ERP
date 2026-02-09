package middleware

import (
	"net/http"
	"strings"

	"github.com/VyVy-ERP/warehouse-backend/internal/service"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware creates middleware to validate JWT tokens
func AuthMiddleware(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
				"MISSING_TOKEN",
				"Authorization header required",
			))
			c.Abort()
			return
		}

		// Check Bearer token format
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
				"INVALID_TOKEN_FORMAT",
				"Authorization header must be: Bearer {token}",
			))
			c.Abort()
			return
		}

		// Validate token
		token := parts[1]
		claims, err := authService.ValidateToken(token)
		if err != nil {
			if err == utils.ErrExpiredToken {
				c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
					"TOKEN_EXPIRED",
					"Token has expired, please refresh",
				))
			} else {
				c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
					"INVALID_TOKEN",
					"Invalid token",
				))
			}
			c.Abort()
			return
		}

		// Set user claims in context for use in handlers
		c.Set("user", claims)
		c.Set("user_id", claims.UserID)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// RequireRole creates middleware to check if user has required role
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user role from context (set by AuthMiddleware)
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, utils.ErrorResponse(
				"UNAUTHORIZED",
				"User not authenticated",
			))
			c.Abort()
			return
		}

		// Check if user has required role
		roleStr := userRole.(string)
		hasRole := false
		for _, role := range roles {
			if roleStr == role || roleStr == "admin" { // admin has access to everything
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, utils.ErrorResponse(
				"FORBIDDEN",
				"Insufficient permissions",
			))
			c.Abort()
			return
		}

		c.Next()
	}
}
