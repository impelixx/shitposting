package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/impelix/blogik-backend/internal/repository"
)

type CommentsHandler struct {
	postRepo    *repository.PostRepo
	commentRepo *repository.CommentRepo
}

func NewCommentsHandler(pr *repository.PostRepo, cr *repository.CommentRepo) *CommentsHandler {
	return &CommentsHandler{postRepo: pr, commentRepo: cr}
}

func (h *CommentsHandler) List(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.postRepo.GetBySlug(r.Context(), slug)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	comments, err := h.commentRepo.ListByPostID(r.Context(), post.ID)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func (h *CommentsHandler) Create(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.postRepo.GetBySlug(r.Context(), slug)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	var in repository.CreateCommentInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	if in.Author == "" || in.Body == "" {
		http.Error(w, "author and body are required", http.StatusBadRequest)
		return
	}
	comment, err := h.commentRepo.Create(r.Context(), post.ID, in)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}
