package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/impelix/blogik-backend/internal/repository"
	"github.com/impelix/blogik-backend/internal/search"
)

type SearchHandler struct {
	client   *search.Client
	postRepo *repository.PostRepo
}

func NewSearchHandler(client *search.Client, postRepo *repository.PostRepo) *SearchHandler {
	return &SearchHandler{client: client, postRepo: postRepo}
}

type searchResult struct {
	ID      string   `json:"id"`
	Title   string   `json:"title"`
	Excerpt string   `json:"excerpt"`
	Slug    string   `json:"slug"`
	Tags    []string `json:"tags"`
}

func (h *SearchHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]any{})
		return
	}

	// Try Meilisearch first, fall back to DB search
	meilResults, err := h.client.Search(q)
	if err == nil && len(meilResults) > 0 {
		out := make([]searchResult, 0, len(meilResults))
		for _, m := range meilResults {
			out = append(out, searchResult{ID: m.ID, Title: m.Title, Excerpt: m.Excerpt, Slug: m.Slug, Tags: m.Tags})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(out)
		return
	}

	// DB fallback
	posts, err := h.postRepo.Search(context.Background(), q)
	if err != nil {
		http.Error(w, "search error", http.StatusInternalServerError)
		return
	}
	out := make([]searchResult, 0, len(posts))
	for _, p := range posts {
		out = append(out, searchResult{ID: p.ID, Title: p.Title, Excerpt: p.Excerpt, Slug: p.Slug, Tags: p.Tags})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}
