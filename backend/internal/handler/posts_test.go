package handler_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/impelix/blogik-backend/internal/handler"
	"github.com/impelix/blogik-backend/internal/repository"
	"github.com/impelix/blogik-backend/internal/search"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPostsHandler_List(t *testing.T) {
	pool := setupTestPool(t)
	postRepo := repository.NewPostRepo(pool)
	searchClient := search.NewClient("http://localhost:7700", "masterKey")
	h := handler.NewPostsHandler(postRepo, searchClient)

	post, err := postRepo.Create(context.Background(), repository.CreatePostInput{
		Title: "Handler Test", Slug: "handler-test-list",
		Body: "body", Excerpt: "exc", Tags: []string{}, Published: true,
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = postRepo.Delete(context.Background(), post.Slug) })

	req := httptest.NewRequest(http.MethodGet, "/api/posts", nil)
	w := httptest.NewRecorder()
	h.List(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp []map[string]any
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.NotEmpty(t, resp)
}

func TestPostsHandler_Get(t *testing.T) {
	pool := setupTestPool(t)
	postRepo := repository.NewPostRepo(pool)
	searchClient := search.NewClient("http://localhost:7700", "masterKey")
	h := handler.NewPostsHandler(postRepo, searchClient)

	post, err := postRepo.Create(context.Background(), repository.CreatePostInput{
		Title: "Get Test", Slug: "handler-test-get",
		Body: "body", Excerpt: "exc", Tags: []string{}, Published: true,
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = postRepo.Delete(context.Background(), post.Slug) })

	r := chi.NewRouter()
	r.Get("/api/posts/{slug}", h.Get)
	req := httptest.NewRequest(http.MethodGet, "/api/posts/"+post.Slug, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]any
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, post.Slug, resp["slug"])
}
