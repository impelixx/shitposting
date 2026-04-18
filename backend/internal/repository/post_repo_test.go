package repository_test

import (
	"context"
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/impelix/blogik-backend/internal/db"
	"github.com/impelix/blogik-backend/internal/repository"
)

func setupPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	_ = godotenv.Load("../../.env")
	dsn := os.Getenv("DATABASE_URL")
	require.NotEmpty(t, dsn, "DATABASE_URL must be set")
	pool, err := db.NewPool(context.Background(), dsn)
	require.NoError(t, err)
	t.Cleanup(func() { pool.Close() })
	return pool
}

func TestPostRepo_CreateAndGet(t *testing.T) {
	pool := setupPool(t)
	repo := repository.NewPostRepo(pool)
	ctx := context.Background()

	input := repository.CreatePostInput{
		Title:     "Test Post",
		Slug:      "test-post-createandget",
		Body:      "Hello world",
		Excerpt:   "Hello",
		Tags:      []string{"test"},
		Published: true,
	}
	post, err := repo.Create(ctx, input)
	require.NoError(t, err)
	assert.Equal(t, input.Title, post.Title)
	assert.Equal(t, input.Slug, post.Slug)
	t.Cleanup(func() { _ = repo.Delete(ctx, post.Slug) })

	got, err := repo.GetBySlug(ctx, post.Slug)
	require.NoError(t, err)
	assert.Equal(t, post.ID, got.ID)
}

func TestPostRepo_List(t *testing.T) {
	pool := setupPool(t)
	repo := repository.NewPostRepo(pool)
	ctx := context.Background()

	post, err := repo.Create(ctx, repository.CreatePostInput{
		Title: "List Test", Slug: "list-test-repo",
		Body: "body", Excerpt: "exc", Tags: []string{"x"}, Published: true,
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = repo.Delete(ctx, post.Slug) })

	posts, err := repo.List(ctx, "", 10, 0)
	require.NoError(t, err)
	assert.NotEmpty(t, posts)
}

func TestPostRepo_Update(t *testing.T) {
	pool := setupPool(t)
	repo := repository.NewPostRepo(pool)
	ctx := context.Background()

	post, err := repo.Create(ctx, repository.CreatePostInput{
		Title: "Original", Slug: "update-test-repo",
		Body: "body", Excerpt: "exc", Tags: []string{}, Published: false,
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = repo.Delete(ctx, post.Slug) })

	updated, err := repo.Update(ctx, post.Slug, repository.UpdatePostInput{
		Title: "Updated", Slug: post.Slug, Body: "new body",
		Excerpt: "new exc", Tags: []string{"updated"}, Published: true,
	})
	require.NoError(t, err)
	assert.Equal(t, "Updated", updated.Title)
	assert.True(t, updated.Published)
}
