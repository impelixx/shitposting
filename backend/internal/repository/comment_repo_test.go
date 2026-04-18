package repository_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/impelix/blogik-backend/internal/repository"
)

func TestCommentRepo_CreateAndList(t *testing.T) {
	pool := setupPool(t)
	postRepo := repository.NewPostRepo(pool)
	commentRepo := repository.NewCommentRepo(pool)
	ctx := context.Background()

	post, err := postRepo.Create(ctx, repository.CreatePostInput{
		Title: "For comments", Slug: "for-comments-test",
		Body: "body", Excerpt: "exc", Tags: []string{}, Published: true,
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = postRepo.Delete(ctx, post.Slug) })

	comment, err := commentRepo.Create(ctx, post.ID, repository.CreateCommentInput{
		Author: "Alice",
		Body:   "Great post!",
	})
	require.NoError(t, err)
	assert.Equal(t, "Alice", comment.Author)

	comments, err := commentRepo.ListByPostID(ctx, post.ID)
	require.NoError(t, err)
	assert.Len(t, comments, 1)
	assert.Equal(t, "Great post!", comments[0].Body)
}
