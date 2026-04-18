package handler

import (
	"encoding/json"
	"net/http"

	"github.com/impelix/blogik-backend/internal/search"
)

type SearchHandler struct {
	client *search.Client
}

func NewSearchHandler(client *search.Client) *SearchHandler {
	return &SearchHandler{client: client}
}

func (h *SearchHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]any{})
		return
	}
	results, err := h.client.Search(q)
	if err != nil {
		http.Error(w, "search error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
