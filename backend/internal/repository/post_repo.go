package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Post struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Slug      string    `json:"slug"`
	Body      string    `json:"body"`
	Excerpt   string    `json:"excerpt"`
	Tags      []string  `json:"tags"`
	Published bool      `json:"published"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreatePostInput struct {
	Title     string   `json:"title"`
	Slug      string   `json:"slug"`
	Body      string   `json:"body"`
	Excerpt   string   `json:"excerpt"`
	Tags      []string `json:"tags"`
	Published bool     `json:"published"`
}

type UpdatePostInput struct {
	Title     string   `json:"title"`
	Slug      string   `json:"slug"`
	Body      string   `json:"body"`
	Excerpt   string   `json:"excerpt"`
	Tags      []string `json:"tags"`
	Published bool     `json:"published"`
}

type PostRepo struct {
	pool *pgxpool.Pool
}

func NewPostRepo(pool *pgxpool.Pool) *PostRepo {
	return &PostRepo{pool: pool}
}

func (r *PostRepo) Create(ctx context.Context, in CreatePostInput) (*Post, error) {
	var p Post
	err := r.pool.QueryRow(ctx, `
		INSERT INTO posts (title, slug, body, excerpt, tags, published)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, title, slug, body, excerpt, tags, published, created_at, updated_at`,
		in.Title, in.Slug, in.Body, in.Excerpt, in.Tags, in.Published,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.Published, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}

func (r *PostRepo) GetBySlug(ctx context.Context, slug string) (*Post, error) {
	var p Post
	err := r.pool.QueryRow(ctx, `
		SELECT id, title, slug, body, excerpt, tags, published, created_at, updated_at
		FROM posts WHERE slug = $1`, slug,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.Published, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepo) List(ctx context.Context, tag string, limit, offset int) ([]*Post, error) {
	var query string
	var args []any
	if tag != "" {
		query = `SELECT id, title, slug, body, excerpt, tags, published, created_at, updated_at
		          FROM posts WHERE published = true AND $1 = ANY(tags)
		          ORDER BY created_at DESC LIMIT $2 OFFSET $3`
		args = []any{tag, limit, offset}
	} else {
		query = `SELECT id, title, slug, body, excerpt, tags, published, created_at, updated_at
		          FROM posts WHERE published = true
		          ORDER BY created_at DESC LIMIT $1 OFFSET $2`
		args = []any{limit, offset}
	}
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	posts := make([]*Post, 0)
	for rows.Next() {
		var p Post
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.Published, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &p)
	}
	return posts, rows.Err()
}

func (r *PostRepo) ListAll(ctx context.Context) ([]*Post, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, title, slug, body, excerpt, tags, published, created_at, updated_at
		FROM posts ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	posts := make([]*Post, 0)
	for rows.Next() {
		var p Post
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.Published, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &p)
	}
	return posts, rows.Err()
}

func (r *PostRepo) Update(ctx context.Context, slug string, in UpdatePostInput) (*Post, error) {
	var p Post
	err := r.pool.QueryRow(ctx, `
		UPDATE posts SET title=$1, slug=$2, body=$3, excerpt=$4, tags=$5, published=$6, updated_at=now()
		WHERE slug=$7
		RETURNING id, title, slug, body, excerpt, tags, published, created_at, updated_at`,
		in.Title, in.Slug, in.Body, in.Excerpt, in.Tags, in.Published, slug,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.Published, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}

func (r *PostRepo) Delete(ctx context.Context, slug string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM posts WHERE slug = $1`, slug)
	return err
}
