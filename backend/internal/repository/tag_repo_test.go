package repository_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/impelix/blogik-backend/internal/repository"
)

func TestTagRepo_UpsertAndList(t *testing.T) {
	pool := setupPool(t)
	repo := repository.NewTagRepo(pool)
	ctx := context.Background()

	err := repo.Upsert(ctx, "rust", "Rust")
	require.NoError(t, err)

	tags, err := repo.List(ctx)
	require.NoError(t, err)
	assert.NotEmpty(t, tags)

	found := false
	for _, tag := range tags {
		if tag.Slug == "rust" {
			found = true
		}
	}
	assert.True(t, found)
}
