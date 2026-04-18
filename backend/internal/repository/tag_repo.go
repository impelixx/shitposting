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
	rows, err := r.pool.Query(ctx, `SELECT slug, label FROM tags ORDER BY slug`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tags []*Tag
	for rows.Next() {
		var tag Tag
		if err := rows.Scan(&tag.Slug, &tag.Label); err != nil {
			return nil, err
		}
		tags = append(tags, &tag)
	}
	return tags, rows.Err()
}
