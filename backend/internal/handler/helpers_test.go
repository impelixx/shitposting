package handler_test

import (
	"context"
	"os"
	"testing"

	"github.com/impelix/blogik-backend/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/require"
)

func setupTestPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	_ = godotenv.Load("../../.env")
	dsn := os.Getenv("DATABASE_URL")
	require.NotEmpty(t, dsn, "DATABASE_URL must be set for integration tests")
	pool, err := db.NewPool(context.Background(), dsn)
	require.NoError(t, err)
	t.Cleanup(pool.Close)
	return pool
}
