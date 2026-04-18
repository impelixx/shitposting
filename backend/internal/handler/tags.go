package handler

import (
	"encoding/json"
	"net/http"

	"github.com/impelix/blogik-backend/internal/repository"
)

type TagsHandler struct {
	repo *repository.TagRepo
}

func NewTagsHandler(repo *repository.TagRepo) *TagsHandler {
	return &TagsHandler{repo: repo}
}

func (h *TagsHandler) List(w http.ResponseWriter, r *http.Request) {
	tags, err := h.repo.List(r.Context())
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}
