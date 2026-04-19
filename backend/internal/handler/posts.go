package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/impelix/blogik-backend/internal/repository"
	"github.com/impelix/blogik-backend/internal/search"
)

type PostsHandler struct {
	repo   *repository.PostRepo
	search *search.Client
}

func NewPostsHandler(repo *repository.PostRepo, sc *search.Client) *PostsHandler {
	return &PostsHandler{repo: repo, search: sc}
}

func (h *PostsHandler) List(w http.ResponseWriter, r *http.Request) {
	tag := r.URL.Query().Get("tag")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 {
		limit = 20
	}
	posts, err := h.repo.List(r.Context(), tag, limit, offset)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func (h *PostsHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	posts, err := h.repo.ListAll(r.Context())
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func (h *PostsHandler) Get(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.repo.GetBySlug(r.Context(), slug)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *PostsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in repository.CreatePostInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	post, err := h.repo.Create(r.Context(), in)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if post.Published {
		_ = h.search.IndexPost(search.PostDocument{
			ID: post.ID, Title: post.Title, Excerpt: post.Excerpt,
			Body: post.Body, Slug: post.Slug, Tags: post.Tags,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}

func (h *PostsHandler) Update(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var in repository.UpdatePostInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	post, err := h.repo.Update(r.Context(), slug, in)
	if errors.Is(err, pgx.ErrNoRows) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if post.Published {
		_ = h.search.IndexPost(search.PostDocument{
			ID: post.ID, Title: post.Title, Excerpt: post.Excerpt,
			Body: post.Body, Slug: post.Slug, Tags: post.Tags,
		})
	} else {
		_ = h.search.DeletePost(post.ID)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *PostsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.repo.GetBySlug(r.Context(), slug)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err := h.repo.Delete(r.Context(), slug); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	_ = h.search.DeletePost(post.ID)
	w.WriteHeader(http.StatusNoContent)
}

func (h *PostsHandler) View(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	views, err := h.repo.IncrementViews(r.Context(), slug)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"views": views})
}
