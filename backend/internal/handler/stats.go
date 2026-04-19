package handler

import (
	"encoding/json"
	"net/http"

	"github.com/impelix/blogik-backend/internal/repository"
)

type StatsHandler struct {
	repo *repository.PostRepo
}

func NewStatsHandler(repo *repository.PostRepo) *StatsHandler {
	return &StatsHandler{repo: repo}
}

func (h *StatsHandler) Get(w http.ResponseWriter, r *http.Request) {
	stats, err := h.repo.GetStats(r.Context())
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
