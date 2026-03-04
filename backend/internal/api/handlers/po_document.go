package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/VyVy-ERP/warehouse-backend/internal/models"
	"github.com/VyVy-ERP/warehouse-backend/internal/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	poUploadDir = "/app/uploads/po_documents"
)

type PODocumentHandler struct {
	db *gorm.DB
}

func NewPODocumentHandler(db *gorm.DB) *PODocumentHandler {
	return &PODocumentHandler{db: db}
}

// List returns all documents for a purchase order
func (h *PODocumentHandler) List(c *gin.Context) {
	poID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid PO ID"))
		return
	}

	var docs []models.PODocument
	if err := h.db.Where("po_id = ?", poID).
		Preload("UploadedByUser").
		Order("created_at DESC").
		Find(&docs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("FETCH_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse(docs))
}

// Upload handles multipart file upload for a purchase order
func (h *PODocumentHandler) Upload(c *gin.Context) {
	poID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid PO ID"))
		return
	}

	// Check PO exists
	var count int64
	h.db.Model(&models.PurchaseOrder{}).Where("id = ?", poID).Count(&count)
	if count == 0 {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", "Purchase order not found"))
		return
	}

	// Parse multipart
	if err := c.Request.ParseMultipartForm(maxFileSize); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("FILE_TOO_LARGE", "File size exceeds limit (20MB)"))
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("NO_FILE", "No file provided"))
		return
	}
	defer file.Close()

	if header.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("FILE_TOO_LARGE", "File size exceeds 20MB limit"))
		return
	}

	// Validate mime type
	allowedTypes := map[string]bool{
		"application/pdf": true,
		"application/msword": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
		"application/vnd.ms-excel":                                true,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
		"text/plain": true,
	}

	buf := make([]byte, 512)
	n, _ := file.Read(buf)
	mimeType := http.DetectContentType(buf[:n])
	file.Seek(0, io.SeekStart)

	ext := strings.ToLower(filepath.Ext(header.Filename))
	extMimes := map[string]string{
		".pdf":  "application/pdf",
		".doc":  "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".webp": "image/webp",
		".txt":  "text/plain",
	}
	if extMime, ok := extMimes[ext]; ok {
		mimeType = extMime
	}

	if !allowedTypes[mimeType] {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_TYPE", "File type not allowed"))
		return
	}

	// Ensure upload dir exists
	dirPath := fmt.Sprintf("%s/%d", poUploadDir, poID)
	if err := os.MkdirAll(dirPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("DIR_ERROR", "Failed to create upload directory"))
		return
	}

	// Generate unique filename
	storedName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), sanitizeFilename(strings.TrimSuffix(header.Filename, ext)), ext)
	destPath := filepath.Join(dirPath, storedName)

	dst, err := os.Create(destPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("SAVE_ERROR", "Failed to save file"))
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		os.Remove(destPath)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("SAVE_ERROR", "Failed to write file"))
		return
	}

	// Get user ID
	var uploadedBy *uint
	if val, exists := c.Get("user_id"); exists {
		uid := uint(val.(int64))
		uploadedBy = &uid
	}

	doc := models.PODocument{
		POID:         uint(poID),
		FileName:     fmt.Sprintf("%d/%s", poID, storedName),
		OriginalName: header.Filename,
		FileSize:     header.Size,
		MimeType:     mimeType,
		UploadedBy:   uploadedBy,
	}

	if err := h.db.Create(&doc).Error; err != nil {
		os.Remove(destPath)
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("DB_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse(doc))
}

// Delete removes a PO document
func (h *PODocumentHandler) Delete(c *gin.Context) {
	poID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid PO ID"))
		return
	}
	docID, err := strconv.ParseUint(c.Param("docId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("INVALID_ID", "Invalid document ID"))
		return
	}

	var doc models.PODocument
	if err := h.db.Where("id = ? AND po_id = ?", docID, poID).First(&doc).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("NOT_FOUND", "Document not found"))
		return
	}

	filePath := filepath.Join(poUploadDir, doc.FileName)
	os.Remove(filePath)

	if err := h.db.Delete(&doc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("DELETE_ERROR", err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessMessageResponse("Document deleted", nil))
}

// ServeFile serves a PO document file
func (h *PODocumentHandler) ServeFile(c *gin.Context) {
	poID := c.Param("poId")
	filename := c.Param("filename")

	if strings.Contains(filename, "..") || strings.Contains(poID, "..") {
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid path"})
		return
	}

	filePath := filepath.Join(poUploadDir, poID, filename)
	c.File(filePath)
}
