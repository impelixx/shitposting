package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Tag struct {
	Slug  string `json:"slug"`
	Label string `json:"label"`
}

type TagRepo struct {
	pool *pgxpool.Pool
}

func NewTagRepo(pool *pgxpool.Pool) *TagRepo {
	return &TagRepo{pool: pool}
}

func (r *TagRepo) Upsert(ctx context.Context, slug, label string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO tags (slug, label) VALUES ($1, $2)
		ON CONFLICT (slug) DO UPDATE SET label = EXCLUDED.label`,
		slug, label)
	return err
}

func (r *TagRepo) List(ctx context.Context) ([]*Tag, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT DISTINCT unnest(tags) AS slug
		FROM posts
		WHERE published = true
		ORDER BY slug
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	tags := make([]*Tag, 0)
	for rows.Next() {
		var slug string
		if err := rows.Scan(&slug); err != nil {
			return nil, err
		}
		tags = append(tags, &Tag{Slug: slug, Label: slug})
	}
	return tags, rows.Err()
}
