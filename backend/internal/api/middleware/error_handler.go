package middleware

import (
	"net/http"

	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// ErrorHandler middleware catches panics and errors
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				c.JSON(http.StatusInternalServerError, utils.ErrorResponse(
					"INTERNAL_ERROR",
					"Internal server error occurred",
				))
				c.Abort()
			}
		}()

		c.Next()
	}
}
