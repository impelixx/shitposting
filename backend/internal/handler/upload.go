package handler

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/impelix/blogik-backend/internal/storage"
)

type UploadHandler struct {
	r2 *storage.R2Client
}

func NewUploadHandler(r2 *storage.R2Client) *UploadHandler {
	return &UploadHandler{r2: r2}
}

func (h *UploadHandler) Upload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "file too large", http.StatusBadRequest)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "missing file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]string{".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
	contentType, ok := allowed[ext]
	if !ok {
		http.Error(w, "unsupported file type", http.StatusBadRequest)
		return
	}
	key := fmt.Sprintf("uploads/%d%s", time.Now().UnixNano(), ext)
	url, err := h.r2.Upload(context.Background(), key, contentType, io.Reader(file))
	if err != nil {
		http.Error(w, "upload failed", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"url":%q}`, url)
}
